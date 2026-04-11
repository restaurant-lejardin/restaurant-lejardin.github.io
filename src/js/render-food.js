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
 *             ├─ renderJumbotron(data, lang)
 *             │    ├─ clone #jumbotron-template and populate title/background
 *             │    └─ iterate categories/subcategories to clone #menu-icon-template
 *             └─ for each category in data.categories:
 *                   ├─ clone #category-special-title-template when specialTitle exists
 *                   └─ renderCategory(category, lang, jsonFilePath, isDrinksPage)
 *                         ├─ clone #food-category-template and populate id/description
 *                         └─ for each subcategory in category.subcategories:
 *                               └─ renderSubcategory(subcat, lang, jsonFilePath, isDrinksPage)
 *                                     ├─ clone #food-subcategory-template and populate title/id
 *                                     └─ for each item in subcat.items:
 *                                           ├─ append item separator when item.showHr
 *                                           ├─ append item.specialTitle when present
 *                                           └─ renderFoodItem(item, lang, jsonFilePath, isDrinksPage)
 *                                                 ├─ clone #food-item-template row shell
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
 * Helper functions: detectLanguage, getLocalizedText, createEl, getTemplateRefs, createFoodImageCol, createVeganIndicator, createFoodTitle.
 * Data parsing/sheet mapping helpers are provided by render-food-data.js.
 */

const DRINKS_DATA_KEY = 'drinks-data';
const FORMULES_DATA_KEY = 'formules-data';
const OU_TEXT_BY_LANG = { fr: 'OU', en: 'OR', zh: '或' };

let templateRefsCache = null;

function getTemplateRefs() {
  if (templateRefsCache) return templateRefsCache;
  templateRefsCache = {
    foodTitle: document.querySelector('#food-title-template'),
    foodItem: document.querySelector('#food-item-template'),
    foodSubcategory: document.querySelector('#food-subcategory-template'),
    foodCategory: document.querySelector('#food-category-template'),
    categorySpecialTitle: document.querySelector('#category-special-title-template'),
    jumbotron: document.querySelector('#jumbotron-template'),
    menuIcon: document.querySelector('#menu-icon-template')
  };
  return templateRefsCache;
}

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
  if (content !== null) el.textContent = content;
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

const {
  loadSheetMappedItems,
  mergeSheetItemsIntoData
} = window.renderFoodDataUtils || {};

if (!loadSheetMappedItems || !mergeSheetItemsIntoData) {
  console.error('[render-food] Missing data utils. Ensure /js/render-food-data.js is loaded before /js/render-food.js');
}


function createVeganIndicator(veganType) {
  if (!veganType) return createEl('div', ['col-md-1', 'vegan-indicator', 'text-right']);
  const veganLogo = document.createElement('img');
  veganLogo.className = 'vegan-logo';
  veganLogo.src = veganType === 'vege' ? '/media/vg.png' : '/media/vg_pos.png';
  veganLogo.alt = veganType === 'vege' ? 'Végétarien' : 'Végétarien Possible';
  const col = createEl('a', ['col-md-1', 'vegan-indicator', 'text-right'], null, {
    href: '#menu-legend',
    'aria-label': 'Go to menu legend'
  });
  col.appendChild(veganLogo);
  return col;
}

function createFoodImageCol(image) {
  const imgCol = createEl('div', ['col-md-2', 'food-image']);
  if (image) {
    const img = document.createElement('img');
    img.className = 'rounded-circle lazyload';
    img.dataset.src = image;
    imgCol.appendChild(img);
  }
  return imgCol;
}

function createFoodTitle(item, currentLang, isFormule) {
  const { foodTitle } = getTemplateRefs();
  const titleNode = foodTitle.content.cloneNode(true).querySelector('h3');
  titleNode.className = isFormule ? 'formule-title' : 'food-title';
  titleNode.querySelector('.food-name').textContent = getLocalizedText(item.name, currentLang);
  const priceNode = titleNode.querySelector('.food-price');
  if (item.price) {
    priceNode.textContent = `${item.price}€`;
  } else {
    priceNode.remove();
  }
  return titleNode;
}

function renderFoodItem(item, currentLang, jsonFilePath, isDrinksPage) {
  const isFormulesPage = jsonFilePath.includes(FORMULES_DATA_KEY);
  const { foodItem } = getTemplateRefs();
  const row = foodItem.content.cloneNode(true).querySelector('.menu-item');
  if (isFormulesPage && item['ou-highlight']) {
    const ouTextDiv = createEl('div', ['col-md-2', 'menu-OU-text']);
    const underlined = document.createElement('u');
    underlined.textContent = OU_TEXT_BY_LANG[currentLang] || OU_TEXT_BY_LANG.fr;
    ouTextDiv.appendChild(underlined);
    row.appendChild(ouTextDiv);
  } else if (!isDrinksPage) {
    row.appendChild(createFoodImageCol(item.image));
  }
  row.appendChild(createVeganIndicator(item.veganType));
  const detailsCol = createEl('div', [isDrinksPage ? 'col-md-12' : 'col-md-9']);
  detailsCol.appendChild(createFoodTitle(item, currentLang, isFormulesPage));
  if (item.description) {
    detailsCol.appendChild(createEl('p', ['food-ingredients'], getLocalizedText(item.description, currentLang)));
  }
  row.appendChild(detailsCol);
  return row;
}

function renderSubcategory(subcat, currentLang, jsonFilePath, isDrinksPage) {
  const { foodSubcategory } = getTemplateRefs();
  const subcatDiv = foodSubcategory.content.cloneNode(true).querySelector('.food-subcategory');
  subcatDiv.id = subcat.id;
  subcatDiv.querySelector('.subcategory-title').textContent = getLocalizedText(subcat.title, currentLang);
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
  const { foodCategory } = getTemplateRefs();
  const categoryDiv = foodCategory.content.cloneNode(true).querySelector('.food-category');
  categoryDiv.id = category.id;
  const description = categoryDiv.querySelector('.category-description');
  if (category.description) description.textContent = getLocalizedText(category.description, currentLang);
  else description.remove();
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

    renderJumbotron(data, currentLang);
    if (!data.categories) {
      console.error("[render-food] No categories found in data:", data);
      return;
    }

    const { categorySpecialTitle } = getTemplateRefs();
    data.categories.forEach(category => {
      if (category.specialTitle) {
        const specialBlock = categorySpecialTitle.content.cloneNode(true);
        specialBlock.querySelector('.special-title-3').textContent = getLocalizedText(category.specialTitle, currentLang);
        foodContainer.appendChild(specialBlock);
      }
      foodContainer.appendChild(renderCategory(category, currentLang, jsonFilePath, isDrinksPage));
    });
  } catch (error) {
    console.error("Error loading food data:", error);
  }
}


function renderJumbotron(data, currentLang) {
  // Template lookup and guards
  const jumbotronPlaceholder = document.getElementById("jumbotron-placeholder");
  const { jumbotron: jumbotronTemplate, menuIcon: iconTemplate } = getTemplateRefs();
  if (!jumbotronPlaceholder || !jumbotronTemplate) return;

  // Default image/srcset config from template attributes
  const templateAttrs = jumbotronTemplate.dataset;
  const defaultBackgroundImage = templateAttrs.defaultBg || "";
  const defaultSrcsetBase = templateAttrs.defaultSrcsetBase || "";
  const defaultSrcsetId = templateAttrs.defaultSrcsetId || "";
  const defaultSrcsetWidths = (templateAttrs.defaultSrcsetWidths || "")
    .split(',')
    .map(w => w.trim())
    .filter(Boolean);
  const defaultSrcset = defaultSrcsetWidths
    .map(w => `${defaultSrcsetBase},w_${w}/${defaultSrcsetId} ${w}w`)
    .join(',');

  // Clone templates and resolve target nodes
  const jumbotron = jumbotronTemplate.content.cloneNode(true);
  const img = jumbotron.querySelector('img');
  const h1 = jumbotron.querySelector('h1');
  const menuIconsContainer = jumbotron.querySelector('#menu-icons');

  // Populate top-level jumbotron data
  const titleText = getLocalizedText(data.title, currentLang) || data.title || data.id || "";
  const backgroundImage = data.backgroundImage;
  const srcset = (Array.isArray(data.srcset) && data.srcset.length > 0) ? data.srcset.join(",") : data.srcset;

  img.src = backgroundImage || defaultBackgroundImage;
  img.srcset = srcset || defaultSrcset;
  h1.textContent = titleText;

  // Populate menu icons from category/subcategory lists
  const categories = data.subCategories || (Array.isArray(data.categories) ? data.categories : null);
  if (iconTemplate && Array.isArray(categories) && categories.length > 0) {
    categories.forEach(category => {
      const subtitle = getLocalizedText(category.subTitle || category.subtitle, currentLang) || "";
      if (subtitle) {
        const h2 = document.createElement('h2');
        h2.className = 'special-title-3';
        h2.textContent = subtitle;
        menuIconsContainer.appendChild(h2);
      }

      const row = document.createElement('div');
      row.className = 'row';
      if (!Array.isArray(category.subcategories)) {
        menuIconsContainer.appendChild(row);
        menuIconsContainer.appendChild(document.createElement('br'));
        return;
      }

      category.subcategories.forEach(subcat => {
        const icon = iconTemplate.content.cloneNode(true);
        const link = icon.querySelector('a');
        const iconImg = icon.querySelector('img');
        const h6 = icon.querySelector('h6');
        const text = getLocalizedText(subcat.title, currentLang) || subcat.id || "";
        link.href = `#${subcat.id}`;
        iconImg.src = `/${subcat.icon}`;
        iconImg.alt = text;
        h6.textContent = text;
        row.appendChild(icon);
      });

      menuIconsContainer.appendChild(row);
      menuIconsContainer.appendChild(document.createElement('br'));
    });
  }

  // Mount jumbotron in DOM
  jumbotronPlaceholder.appendChild(jumbotron);
}

if (window.initAnimations) window.initAnimations();