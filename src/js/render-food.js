/**
 * Function call tree for render-food.js
 *
 * DOMContentLoaded
 *   └─ renderFoodAndJumbotron(container, lang)
 *        ├─ fetch(jsonFilePath)
 *        └─ (on data)
 *             ├─ renderJumbotron(container, data, lang)
 *             └─ for each category in data.categories:
 *                   ├─ createEl (for specialTitle, etc)
 *                   └─ renderCategory(category, lang, jsonFilePath, isDrinksPage)
 *                         ├─ for each subcategory in category.subcategories:
 *                         │     └─ renderSubcategory(subcat, lang, jsonFilePath, isDrinksPage)
 *                         │           └─ for each item in subcat.items:
 *                         │                 └─ renderFoodItem(item, lang, jsonFilePath, isDrinksPage)
 *                         │                       ├─ createFoodImageCol
 *                         │                       ├─ createVeganIndicator
 *                         │                       └─ createFoodTitle
 *                         └─ for each item in category.items:
 *                               └─ renderFoodItem(...)
 *
 * Helper functions: detectLanguage, getLocalizedText, createEl
 */

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

function createEl(tag, classList = [], content = null) {
  const el = document.createElement(tag);
  if (Array.isArray(classList)) el.classList.add(...classList);
  if (content !== null) el.innerHTML = content;
  return el;
}

function createVeganIndicator(veganType) {
  const veganIndicatorCol = createEl('div', ['col-md-1', 'vegan-indicator', 'text-right']);
  veganIndicatorCol.style.flex = "0 0 auto";
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
  const row = createEl('div', ['row', 'align-items-center', 'menu-item']);
  if (jsonFilePath.includes('formules-data') && item['ou-highlight']) {
    const ouTextDiv = createEl('div', ['col-md-2', 'menu-OU-text']);
    const ouText = { fr: '<u>OU</u>', en: '<u>OR</u>', zh: '<u>或</u>' };
    ouTextDiv.innerHTML = ouText[currentLang] || ouText['fr'];
    row.appendChild(ouTextDiv);
  } else if (!isDrinksPage) {
    row.appendChild(createFoodImageCol(item.image));
  }
  const veganIndicatorCol = createVeganIndicator(item.veganType);
  if (veganIndicatorCol) row.appendChild(veganIndicatorCol);
  const detailsCol = createEl('div', [isDrinksPage ? 'col-md-12' : 'col-md-9']);
  detailsCol.appendChild(createFoodTitle(item, currentLang, jsonFilePath.includes('formules-data')));
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
  if (Array.isArray(category.subcategories)) {
    category.subcategories.forEach(subcat => {
      categoryDiv.appendChild(renderSubcategory(subcat, currentLang, jsonFilePath, isDrinksPage));
    });
  } else if (Array.isArray(category.items)) {
    category.items.forEach(item => {
      if (item.showHr) categoryDiv.appendChild(createEl('hr', ['food-horizontal-rule']));
      if (item.specialTitle) categoryDiv.appendChild(createEl('h3', ['special-title-4'], getLocalizedText(item.specialTitle, currentLang)));
      categoryDiv.appendChild(renderFoodItem(item, currentLang, jsonFilePath, isDrinksPage));
    });
  }
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


function renderFoodAndJumbotron(foodContainer, currentLang) {
  let jsonFilePath = foodContainer.getAttribute("data-json");
  if (!jsonFilePath) {
    console.error("Error: data-json attribute not set on container:", foodContainer.id);
    return;
  }
  if (!jsonFilePath.startsWith('/')) {
    jsonFilePath = '/' + jsonFilePath;
  }
  const isDrinksPage = jsonFilePath.includes("drinks-data");
  fetch(jsonFilePath)
    .then((response) => {
      if (!response.ok) throw new Error(`[render-food] HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      // Render jumbotron
      renderJumbotron(foodContainer, data, currentLang);
      // Render food categories
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
    })
    .catch((error) => console.error("Error loading food data:", error));
}




function renderJumbotron(foodContainer, data, currentLang) {
  const defaultBackgroundImage = "https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2500/v1609326356/Autres/bamboo2_iaabt7.jpg";
  const defaultSrcset = `
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_300/v1609326356/Autres/bamboo2_iaabt7.jpg 300w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_400/v1609326356/Autres/bamboo2_iaabt7.jpg 400w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_600/v1609326356/Autres/bamboo2_iaabt7.jpg 600w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_700/v1609326356/Autres/bamboo2_iaabt7.jpg 700w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_800/v1609326356/Autres/bamboo2_iaabt7.jpg 800w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_900/v1609326356/Autres/bamboo2_iaabt7.jpg 900w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1000/v1609326356/Autres/bamboo2_iaabt7.jpg 1000w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1100/v1609326356/Autres/bamboo2_iaabt7.jpg 1100w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1200/v1609326356/Autres/bamboo2_iaabt7.jpg 1200w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1300/v1609326356/Autres/bamboo2_iaabt7.jpg 1300w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1400/v1609326356/Autres/bamboo2_iaabt7.jpg 1400w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1500/v1609326356/Autres/bamboo2_iaabt7.jpg 1500w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1600/v1609326356/Autres/bamboo2_iaabt7.jpg 1600w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1700/v1609326356/Autres/bamboo2_iaabt7.jpg 1700w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1800/v1609326356/Autres/bamboo2_iaabt7.jpg 1800w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_1900/v1609326356/Autres/bamboo2_iaabt7.jpg 1900w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2000/v1609326356/Autres/bamboo2_iaabt7.jpg 2000w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2100/v1609326356/Autres/bamboo2_iaabt7.jpg 2100w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2200/v1609326356/Autres/bamboo2_iaabt7.jpg 2200w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2300/v1609326356/Autres/bamboo2_iaabt7.jpg 2300w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2400/v1609326356/Autres/bamboo2_iaabt7.jpg 2400w,
    https://res.cloudinary.com/lejardin/image/upload/c_scale,f_auto,q_auto,w_2500/v1609326356/Autres/bamboo2_iaabt7.jpg 2500w
  `;
  const jumbotronPlaceholder = document.getElementById("jumbotron-placeholder");
  jumbotronData = {
    title: getLocalizedText(data.title, currentLang) || data.title || data.id || "",
    backgroundImage: data.backgroundImage,
    srcset: (Array.isArray(data.srcset) && data.srcset.length > 0) ? data.srcset.join(",") : data.srcset
  };
  if (jumbotronPlaceholder) {
    const { title, backgroundImage, srcset } = jumbotronData;
    jumbotronPlaceholder.innerHTML = `
      <div class="food-jumbotron dark-overlay text-white">
        <img
          src="${backgroundImage || defaultBackgroundImage}"
          srcset="${srcset || defaultSrcset}"
          alt=""
          class="food-jumbotron-bg"
        >
        <div class="food-jumbotron-caption container">
          <h1 id="title-1" class="special-title-2">${title}</h1>
          <div id="menu-icons"></div>
        </div>
      </div>
    `;
    // Render menu icons if present
    const menuIconsContainer = document.getElementById("menu-icons");
    let groups = data.menuGroups || data.subCategories;
    if (!groups && Array.isArray(data.categories)) groups = data.categories;
    if (menuIconsContainer && Array.isArray(groups) && groups.length > 0) {
      const groupsHtml = groups.map(group => {
        const subtitle = getLocalizedText(group.subTitle, currentLang) || "";
        let groupHtml = '';
        if (Array.isArray(group.subcategories)) {
          groupHtml = group.subcategories.map(subcat => {
            const text = getLocalizedText(subcat.title, currentLang) || subcat.id || "";
            return `
              <div class="col">
                <a href="#${subcat.id}" class="smooth-scroll">
                  <img class="menu-icon" src="/${subcat.icon}" alt="${text}">
                </a>
                <h6 class="menu-icon-text mt-3 mb-0">${text}</h6>
              </div>
            `;
          }).join("");
        } else if (Array.isArray(group.items)) {
          groupHtml = group.items.map(item => {
            const text = getLocalizedText(item.text, currentLang) || item.id || "";
            return `
              <div class="col">
                <a href="#${item.id}" class="smooth-scroll">
                  <img class="menu-icon" src="/${item.icon}" alt="${text}">
                </a>
                <h6 class="menu-icon-text mt-3 mb-0">${text}</h6>
              </div>
            `;
          }).join("");
        }
        return `
          ${subtitle ? `<h2 class=\"special-title-3\">${subtitle}</h2>` : ""}
          <div class="row">
            ${groupHtml}
          </div><br>
        `;
      }).join("");
      menuIconsContainer.innerHTML = groupsHtml;
    }
  }
}