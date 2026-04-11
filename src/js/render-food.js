/**
 * Function call tree for render-food.js
 *
 * DOMContentLoaded
 *   └─ renderFoodAndJumbotron(container, lang)
 *        ├─ detect page mode from data-json
 *        │    └─ isDrinksPage = jsonFilePath.includes('drinks-data')
 *        ├─ fetch(jsonFilePath) → JSON structure
 *        ├─ if googleSheetUrl:
 *        │    ├─ buildGoogleSheetCsvUrl(googleSheetUrl) → CSV export URL
 *        │    ├─ loadSheetMappedItems(csvUrl)
 *        │    │    ├─ fetch(csvUrl, cache: 'no-store')
 *        │    │    ├─ parseCsv(csvText) → rows
 *        │    │    └─ for each row: mapSheetRowToItem(row) → (subcategoryId, item)
 *        │    └─ mergeSheetItemsIntoData(data, mappedItems)
 *        │         └─ replace category.subcategories[*].items with sheet items
 *        └─ (on merged data)
 *             ├─ renderJumbotron(container, data, lang)
 *             └─ for each category in data.categories:
 *                   ├─ createEl (for specialTitle, etc)
 *                   └─ renderCategory(category, lang, jsonFilePath, isDrinksPage)
 *                         ├─ append category description when present
 *                         └─ for each subcategory in category.subcategories:
 *                               └─ renderSubcategory(subcat, lang, jsonFilePath, isDrinksPage)
 *                                     ├─ render banner title + separator
 *                                     └─ for each item in subcat.items:
 *                                           ├─ append item separator when item.showHr
 *                                           ├─ append item.specialTitle when present
 *                                           └─ renderFoodItem(item, lang, jsonFilePath, isDrinksPage)
 *                                                 ├─ if formules-data and item['ou-highlight']:
 *                                                 │    └─ render OU / OR / 或 label
 *                                                 ├─ else if not drinks page:
 *                                                 │    └─ createFoodImageCol(item.image)
 *                                                 ├─ createVeganIndicator(item.veganType)
 *                                                 ├─ create details column
 *                                                 │    └─ createFoodTitle(item, lang, isFormule)
 *                                                 │         └─ uses food-title or formule-title
 *                                                 └─ append description when item.description
 *
 * Notes:
 *   - Hybrid data model: static JSON structure + optional dynamic Google Sheet items
 *   - Sheet items replace JSON items for given subcategories (preserves row order)
 *   - If sheet fetch fails, falls back to JSON items (non-blocking)
 *   - Drinks pages reuse the same food-title / food-name / food-price classes.
 *   - The drinks exception is layout only: no image column and details take col-md-12.
 *   - Formules pages reuse the same renderer with OU highlight handling and formule-title.
 *
 * Helper functions: detectLanguage, getLocalizedText, createEl, createFoodImageCol, createVeganIndicator, createFoodTitle,
 *                   buildGoogleSheetCsvUrl, loadSheetMappedItems, parseCsv, mapSheetRowToItem, mergeSheetItemsIntoData,
 *                   parseBoolean, normalizeColumnName, getRowValue, buildLocalizedField
 */

const DRINKS_DATA_KEY = 'drinks-data';
const FORMULES_DATA_KEY = 'formules-data';
const OU_TEXT_BY_LANG = { fr: '<u>OU</u>', en: '<u>OR</u>', zh: '<u>或</u>' };

function detectLanguage() {
  if (window.location.pathname.includes('/en/')) return 'en';
  if (document.documentElement.lang === 'en') return 'en';
  return 'fr';
}

function getLocalizedText(textObj, lang) {
  if (typeof textObj === 'string') return textObj;
  if (!textObj || typeof textObj !== 'object' || !(lang in textObj)) return '';
  return textObj[lang] ||  "";
}

function createEl(tag, classList = [], content = null, attrs = {}) {
  const el = document.createElement(tag);
  if (Array.isArray(classList)) el.classList.add(...classList);
  if (content !== null) el.innerHTML = content;
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'y';
}

function normalizeColumnName(name) {
  return (name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i += 1;
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

function getRowValue(row, keys) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
  }
  return '';
}

function buildLocalizedField(row, field) {
  const shortKey = field.replace(/_/g, '');
  const fr = getRowValue(row, [`${field}_fr`, `${shortKey}_fr`]);
  const en = getRowValue(row, [`${field}_en`, `${shortKey}_en`]);
  const zh = getRowValue(row, [`${field}_zh`, `${shortKey}_zh`]);
  if (!fr && !en && !zh) return null;
  return { fr, en, zh };
}

function mapSheetRowToItem(row) {
  // Required field: subcategory_id and name (at least in one language)
  const subcategoryId = getRowValue(row, ['subcategory_id', 'subcategory', 'subcat_id']);
  if (!subcategoryId) return null;

  const name = buildLocalizedField(row, 'name');
  if (!name) return null;

  const item = { name };

  // Optional fields:
  const specialTitle = buildLocalizedField(row, 'special_title');
  if (specialTitle) item.specialTitle = specialTitle;

  const description = buildLocalizedField(row, 'description');
  if (description) item.description = description;

  const price = getRowValue(row, ['price']);
  if (price) item.price = price;

  const image = getRowValue(row, ['image', 'image_url']);
  if (image) item.image = image;

  const veganType = getRowValue(row, ['vegan_type', 'vegantype']);
  if (veganType) item.veganType = veganType;

  const showHrRaw = getRowValue(row, ['show_hr', 'showhr']);
  if (showHrRaw && parseBoolean(showHrRaw)) item.showHr = true;

  const ouHighlightRaw = getRowValue(row, ['ou_highlight', 'ouhighlight']);
  if (ouHighlightRaw && parseBoolean(ouHighlightRaw)) item['ou-highlight'] = true;

  return { subcategoryId, item };
}

function buildGoogleSheetCsvUrl(rawUrl) {
  if (!rawUrl) return '';
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (error) {
    console.warn('[render-food] Invalid google sheet URL:', rawUrl, error);
    return '';
  }

  const isGoogleSheet = parsed.hostname.includes('docs.google.com') && parsed.pathname.includes('/spreadsheets/');
  if (!isGoogleSheet) return rawUrl;

  if (parsed.searchParams.get('output') === 'csv' || parsed.searchParams.get('format') === 'csv') {
    return rawUrl;
  }

  const idMatch = parsed.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
  if (!idMatch) return '';
  const spreadsheetId = idMatch[1];

  let gid = parsed.searchParams.get('gid') || '';
  if (!gid && parsed.hash) {
    const hashMatch = parsed.hash.match(/gid=([0-9]+)/);
    if (hashMatch) gid = hashMatch[1];
  }

  const csvUrl = new URL(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export`);
  csvUrl.searchParams.set('format', 'csv');
  csvUrl.searchParams.set('gid', gid || '0');
  return csvUrl.toString();
}

async function loadSheetMappedItems(sheetUrl) {
  if (!sheetUrl) return [];
  const csvUrl = buildGoogleSheetCsvUrl(sheetUrl);
  if (!csvUrl) return [];

  const response = await fetch(csvUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`[render-food] Failed to fetch sheet CSV. status: ${response.status}`);
  }

  const csvText = await response.text();
  const rows = parseCsv(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeColumnName);
  const mapped = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const rowValues = rows[rowIndex];
    const isEmptyRow = rowValues.every(cell => !cell || cell.trim() === '');
    if (isEmptyRow) continue;

    const rowObj = {};
    headers.forEach((header, colIndex) => {
      rowObj[header] = rowValues[colIndex] || '';
    });

    const mappedRow = mapSheetRowToItem(rowObj);
    if (mappedRow) mapped.push(mappedRow);
  }

  return mapped;
}

function mergeSheetItemsIntoData(data, mappedItems) {
  if (!Array.isArray(data.categories)) {
    return { totalItems: 0, unknownSubcategories: [] };
  }

  // Sheet-first mode: once a sheet is configured and fetched, JSON items are ignored.
  data.categories.forEach(category => {
    if (!Array.isArray(category.subcategories)) return;
    category.subcategories.forEach(subcat => {
      subcat.items = [];
    });
  });

  if (!Array.isArray(mappedItems) || mappedItems.length === 0) {
    return { totalItems: 0, unknownSubcategories: [] };
  }

  const itemsBySubcategory = new Map();
  mappedItems.forEach(({ subcategoryId, item }) => {
    if (!itemsBySubcategory.has(subcategoryId)) {
      itemsBySubcategory.set(subcategoryId, []);
    }
    itemsBySubcategory.get(subcategoryId).push(item);
  });

  const seenSubcategories = new Set();
  data.categories.forEach(category => {
    if (!Array.isArray(category.subcategories)) return;
    category.subcategories.forEach(subcat => {
      const subcatId = subcat.id;
      if (!subcatId) return;
      if (itemsBySubcategory.has(subcatId)) {
        subcat.items = itemsBySubcategory.get(subcatId);
        seenSubcategories.add(subcatId);
      }
    });
  });

  const unknownSubcategories = [];
  itemsBySubcategory.forEach((_, subcatId) => {
    if (!seenSubcategories.has(subcatId)) unknownSubcategories.push(subcatId);
  });

  return { totalItems: mappedItems.length, unknownSubcategories };
}


function createVeganIndicator(veganType) {
  const indicatorTag = veganType ? 'a' : 'div';
  const indicatorAttrs = veganType ? {
    href: '#menu-legend',
    'aria-label': 'Go to menu legend'
  } : {};
  const veganIndicatorCol = createEl(indicatorTag, ['col-md-1', 'vegan-indicator', 'text-right'], null, indicatorAttrs);
  if (veganType) {
    const veganLogo = document.createElement('img');
    veganLogo.classList.add('vegan-logo');
    veganLogo.src = veganType === 'vege' ? '/media/vg.png' : '/media/vg_pos.png';
    veganLogo.alt = veganType === 'vege' ? 'Végétarien' : 'Végétarien Possible';
    veganIndicatorCol.appendChild(veganLogo);
  }
  return veganIndicatorCol;
}

function createFoodImageCol(image) {
  const imgCol = createEl('div', ['col-md-2', 'food-image']);
  if (image) {
    const img = document.createElement('img');
    img.classList.add('rounded-circle', 'lazyload');
    img.setAttribute('data-src', image);
    imgCol.appendChild(img);
  }
  return imgCol;
}

function createFoodTitle(item, currentLang, isFormule) {
  const foodTitle = createEl('h3', [isFormule ? 'formule-title' : 'food-title']);
  foodTitle.innerHTML = `
    <span class="food-name">${getLocalizedText(item.name, currentLang)}</span>
    ${item.price ? `<span class="food-price">${item.price}€</span>` : ""}
  `;
  return foodTitle;
}

function renderFoodItem(item, currentLang, jsonFilePath, isDrinksPage) {
  const isFormulesPage = jsonFilePath.includes(FORMULES_DATA_KEY);
  const row = createEl('div', ['row', 'align-items-center', 'menu-item', 'animate-on-scroll'], null, { 'data-animate': 'fadeInUp' });
  if (isFormulesPage && item['ou-highlight']) {
    const ouTextDiv = createEl('div', ['col-md-2', 'menu-OU-text']);
    ouTextDiv.innerHTML = OU_TEXT_BY_LANG[currentLang] || OU_TEXT_BY_LANG.fr;
    row.appendChild(ouTextDiv);
  } else if (!isDrinksPage) {
    row.appendChild(createFoodImageCol(item.image));
  }
  const veganIndicatorCol = createVeganIndicator(item.veganType);
  if (veganIndicatorCol) row.appendChild(veganIndicatorCol);
  const detailsCol = createEl('div', [isDrinksPage ? 'col-md-12' : 'col-md-9']);
  detailsCol.appendChild(createFoodTitle(item, currentLang, isFormulesPage));
  if (item.description) {
    const description = createEl('p', ['food-ingredients'], getLocalizedText(item.description, currentLang));
    detailsCol.appendChild(description);
  }
  row.appendChild(detailsCol);
  return row;
}

function renderSubcategory(subcat, currentLang, jsonFilePath, isDrinksPage) {
  const subcatDiv = createEl('div', ['food-subcategory']);
  subcatDiv.id = subcat.id;
  const subcatTitle = createEl('h2', ['banner', 'subcategory-title'], getLocalizedText(subcat.title, currentLang));
  subcatDiv.appendChild(subcatTitle);
  subcatDiv.appendChild(createEl('hr', ['food-horizontal-rule']));
  if (Array.isArray(subcat.items)) {
    subcat.items.forEach(item => {
      if (item.showHr) subcatDiv.appendChild(createEl('hr', ['food-horizontal-rule']));
      if (item.specialTitle) subcatDiv.appendChild(createEl('h3', ['special-title-4'], getLocalizedText(item.specialTitle, currentLang)));
      subcatDiv.appendChild(renderFoodItem(item, currentLang, jsonFilePath, isDrinksPage));
    });
  }
  return subcatDiv;
}

function renderCategory(category, currentLang, jsonFilePath, isDrinksPage) {
  const categoryDiv = createEl('div', ['food-category']);
  categoryDiv.id = category.id;
  if (category.description) {
    categoryDiv.appendChild(createEl('p', ['category-description'], getLocalizedText(category.description, currentLang)));
  }
  category.subcategories.forEach(subcat => {
    categoryDiv.appendChild(renderSubcategory(subcat, currentLang, jsonFilePath, isDrinksPage));
  });
  return categoryDiv;
}

document.addEventListener("DOMContentLoaded", () => {
  const foodContainers = document.querySelectorAll('[id^="food-container"]');
  if (foodContainers.length === 0) {
    console.error("Error: No food container elements found.");
    return;
  }
  const currentLang = detectLanguage();
  foodContainers.forEach(container => {
    renderFoodAndJumbotron(container, currentLang);
  });
});


async function renderFoodAndJumbotron(foodContainer, currentLang) {
  let jsonFilePath = foodContainer.getAttribute("data-json");
  if (!jsonFilePath) {
    console.error("Error: data-json attribute not set on container:", foodContainer.id);
    return;
  }
  jsonFilePath = jsonFilePath.startsWith('/') ? jsonFilePath : `/${jsonFilePath}`;
  const isDrinksPage = jsonFilePath.includes(DRINKS_DATA_KEY);
  const googleSheetUrl = foodContainer.getAttribute("data-google-sheet-url") || '';

  try {
    const response = await fetch(jsonFilePath);
    if (!response.ok) throw new Error(`[render-food] HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (googleSheetUrl) {
      try {
        const mappedItems = await loadSheetMappedItems(googleSheetUrl);
        const mergeResult = mergeSheetItemsIntoData(data, mappedItems);
        if (mergeResult.totalItems === 0) {
          console.warn('[render-food] Sheet loaded but no valid item rows found. All subcategory items are empty.');
        }
        if (mergeResult.unknownSubcategories.length > 0) {
          console.warn('[render-food] Sheet contains unknown subcategory_id values:', mergeResult.unknownSubcategories.join(', '));
        }
      } catch (sheetError) {
        console.warn('[render-food] Failed to load Google Sheet items, falling back to JSON items:', sheetError);
      }
    }

    renderJumbotron(foodContainer, data, currentLang);
    if (!data.categories) {
      console.error("[render-food] No categories found in data:", data);
      return;
    }

    data.categories.forEach(category => {
      if (category.specialTitle) {
        foodContainer.appendChild(createEl('hr', ['food-horizontal-separation']));
        foodContainer.appendChild(createEl('h2', ['special-title-3'], getLocalizedText(category.specialTitle, currentLang)));
      }
      foodContainer.appendChild(renderCategory(category, currentLang, jsonFilePath, isDrinksPage));
    });
  } catch (error) {
    console.error("Error loading food data:", error);
  }
}


function renderJumbotron(foodContainer, data, currentLang) {
  const jumbotronPlaceholder = document.getElementById("jumbotron-placeholder");
  const defaultBackgroundImage = jumbotronPlaceholder?.dataset.defaultBg || "";
  const defaultSrcsetBase = jumbotronPlaceholder?.dataset.defaultSrcsetBase || "";
  const defaultSrcsetId = jumbotronPlaceholder?.dataset.defaultSrcsetId || "";
  const defaultSrcsetWidths = (jumbotronPlaceholder?.dataset.defaultSrcsetWidths || "")
    .split(',')
    .map(w => w.trim())
    .filter(Boolean);
  const defaultSrcset = defaultSrcsetWidths
    .map(w => `${defaultSrcsetBase},w_${w}/${defaultSrcsetId} ${w}w`)
    .join(',');

  const title = getLocalizedText(data.title, currentLang) || data.title || data.id || "";
  const backgroundImage = data.backgroundImage;
  const srcset = (Array.isArray(data.srcset) && data.srcset.length > 0) ? data.srcset.join(",") : data.srcset;
  if (jumbotronPlaceholder) {
    jumbotronPlaceholder.innerHTML = `
      <div class="food-jumbotron dark-overlay text-white">
        <img
          src="${backgroundImage || defaultBackgroundImage}"
          srcset="${srcset || defaultSrcset}"
          alt=""
          class="food-jumbotron-bg section-bg-cover"
        >
        <div class="food-jumbotron-caption container">
          <h1 id="title-1" class="special-title-2 animate-on-scroll" data-animate="fadeInDown">${title}</h1>
          <div id="menu-icons" class="animate-on-scroll" data-animate="fadeInUp"></div>
        </div>
      </div>
    `;
    // Render menu icons if present
    const menuIconsContainer = document.getElementById("menu-icons");
    const categories = data.subCategories || (Array.isArray(data.categories) ? data.categories : null);
    if (menuIconsContainer && Array.isArray(categories) && categories.length > 0) {
      const categoriesHtml = categories.map(category => {
        const subtitle = getLocalizedText(category.subTitle || category.subtitle, currentLang) || "";
        const categoryHtml = Array.isArray(category.subcategories)
          ? category.subcategories.map(subcat => {
              const text = getLocalizedText(subcat.title, currentLang) || subcat.id || "";
              return `
              <div class="col">
                <a href="#${subcat.id}" class="smooth-scroll">
                  <img class="menu-icon" src="/${subcat.icon}" alt="${text}">
                  <h6 class="menu-icon-text mt-3 mb-0">${text}</h6>
                </a>
              </div>
            `;
            }).join("")
          : "";
        return `
          ${subtitle ? `<h2 class=\"special-title-3\">${subtitle}</h2>` : ""}
          <div class="row">
            ${categoryHtml}
          </div><br>
        `;
      }).join("");
      menuIconsContainer.innerHTML = categoriesHtml;
    }
  }
}

if (window.initAnimations) window.initAnimations();