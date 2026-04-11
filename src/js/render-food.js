/**
 * Function call tree for render-food.js
 *
 * Role:
 *   - Page coordinator/orchestrator only.
 *   - Resolves page context, loads data, reports warnings, delegates rendering.
 *
 * Dependencies (load order):
 *   1) render-food-data.js
 *   2) render-food-config.js
 *   3) render-food-viewmodel.js
 *   4) render-food-renderer.js
 *   5) render-food.js (this file)
 *
 * DOMContentLoaded
 *   └─ renderFoodAndJumbotron(container, lang)
 *        ├─ resolvePageContext(container)
 *        │    ├─ normalize jsonFilePath from data-json
 *        │    ├─ read googleSheetUrl from data-google-sheet-url
 *        │    └─ compute isDrinksPage / isFormulesPage flags
 *        ├─ loadMenuData({ jsonFilePath, googleSheetUrl }) via render-food-data.js
 *        │    ├─ fetchJsonData(jsonFilePath)
 *        │    ├─ if googleSheetUrl: loadSheetMappedItems(sheetUrl)
 *        │    └─ return final render data + sheetResult status
 *        └─ (on final data)
 *             ├─ reportSheetLoadWarnings(sheetApplied, sheetResult)
 *             ├─ menuRenderer.renderJumbotron(data, lang)
 *             │    ├─ buildJumbotronViewModel(...) via render-food-viewmodel.js
 *             │    ├─ clone #jumbotron-template and populate title/background
 *             │    └─ iterate categories/subcategories to createMenuIcon(...)
 *             └─ menuRenderer.renderMenuCategories(container, data, lang, pageContext)
 *                   ├─ buildMenuCategoriesViewModel(...) via render-food-viewmodel.js
 *                   │    └─ includes pre-localized item fields (name/description/special title/price/ou)
 *                   └─ for each category in categories view model:
 *                         ├─ clone #category-special-title-template when specialTitle exists
 *                         └─ menuRenderer.renderCategory(category, lang, pageContext)
 *                         ├─ clone #food-category-template and populate id/description
 *                         └─ for each subcategory in category.subcategories:
 *                               └─ menuRenderer.renderSubcategory(subcat, lang, pageContext)
 *                                     ├─ clone #food-subcategory-template and populate title/id
 *                                     └─ for each item in subcat.items:
 *                                           ├─ append item separator when item.showHr
 *                                           ├─ append item.specialTitle when present
 *                                           └─ menuRenderer.renderFoodItem(item, lang, pageContext)
 *                                                 ├─ clone #food-item-template row shell
 *                                                 ├─ if pageContext.isFormulesPage and item['ou-highlight']:
 *                                                 │    └─ render OU / OR / 或 label
 *                                                 ├─ else if not pageContext.isDrinksPage:
 *                                                 │    └─ createFoodImageCol(item.image)
 *                                                 ├─ createVeganIndicator(item.veganType)
 *                                                 ├─ create details column
 *                                                 │    └─ createFoodTitle(item, lang, isFormule)
 *                                                 │         └─ uses food-title or formule-title
 *                                                 └─ append description when item.description
 *
 * Notes:
 *   - Data loading is delegated to render-food-data.js via loadMenuData().
 *   - Shared constants/context are delegated to render-food-config.js.
 *   - View-model shaping is delegated to render-food-viewmodel.js.
 *   - DOM rendering is delegated to render-food-renderer.js via createMenuRenderer().
 *   - Sheet mode builds final subcategory items from Google Sheet rows.
 *   - If sheet fetch fails, falls back to JSON items (non-blocking)
 *   - Drinks pages reuse the same food-title / food-name / food-price classes.
 *   - The drinks exception is layout only: no image column and details take col-md-12.
 *   - Formules pages reuse the same renderer with OU highlight handling and formule-title.
 *
 * Local helpers in this file: detectLanguage, getLocalizedText, createEl,
 *                             getTemplateRefs,
 *                             reportSheetLoadWarnings.
 * Data parsing/sheet mapping helpers are provided by render-food-data.js.
 * Shared config/page-context helpers are provided by render-food-config.js.
 * View-model builders are provided by render-food-viewmodel.js.
 * DOM tree construction helpers are provided by render-food-renderer.js.
 */

const {
  createPageContext,
  ouTextByLang = { fr: 'OU', en: 'OR', zh: '或' },
  templateSelectors = {
    foodTitle: '#food-title-template',
    foodItem: '#food-item-template',
    foodSubcategory: '#food-subcategory-template',
    foodCategory: '#food-category-template',
    categorySpecialTitle: '#category-special-title-template',
    jumbotron: '#jumbotron-template',
    menuIcon: '#menu-icon-template'
  }
} = window.renderFoodConfig || {};

const {
  buildJumbotronViewModel,
  buildMenuCategoriesViewModel
} = window.renderFoodViewModelUtils || {};

let templateRefsCache = null;

function getTemplateRefs() {
  if (templateRefsCache) return templateRefsCache;
  templateRefsCache = {
    foodTitle: document.querySelector(templateSelectors.foodTitle),
    foodItem: document.querySelector(templateSelectors.foodItem),
    foodSubcategory: document.querySelector(templateSelectors.foodSubcategory),
    foodCategory: document.querySelector(templateSelectors.foodCategory),
    categorySpecialTitle: document.querySelector(templateSelectors.categorySpecialTitle),
    jumbotron: document.querySelector(templateSelectors.jumbotron),
    menuIcon: document.querySelector(templateSelectors.menuIcon)
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
  loadMenuData
} = window.renderFoodDataUtils || {};

if (!loadMenuData) {
  console.error('[render-food] Missing data utils. Ensure /js/render-food-data.js is loaded before /js/render-food.js');
}

if (!createPageContext) {
  console.error('[render-food] Missing config utils. Ensure /js/render-food-config.js is loaded before /js/render-food.js');
}

const { createMenuRenderer } = window;

if (!createMenuRenderer) {
  console.error('[render-food] Missing renderer utils. Ensure /js/render-food-renderer.js is loaded before /js/render-food.js');
}

const menuRenderer = createMenuRenderer
  ? createMenuRenderer({
      getTemplateRefs,
      getLocalizedText,
      createEl,
      ouTextByLang,
      buildJumbotronViewModel,
      buildMenuCategoriesViewModel
    })
  : {
      renderFoodItem: () => document.createElement('div'),
      renderSubcategory: () => document.createElement('div'),
      renderCategory: () => document.createElement('div'),
      renderMenuCategories: () => {},
      renderJumbotron: () => {}
    };

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
  const pageContext = createPageContext ? createPageContext(foodContainer) : null;
  if (!pageContext) {
    console.error("Error: data-json attribute not set on container:", foodContainer.id);
    return;
  }

  try {
    const { data, sheetApplied, sheetResult } = await loadMenuData({
      jsonFilePath: pageContext.jsonFilePath,
      googleSheetUrl: pageContext.googleSheetUrl
    });

    reportSheetLoadWarnings(sheetApplied, sheetResult);

    menuRenderer.renderJumbotron(data, currentLang);
    if (!data.categories) {
      console.error("[render-food] No categories found in data:", data);
      return;
    }

    menuRenderer.renderMenuCategories(foodContainer, data, currentLang, pageContext);
  } catch (error) {
    console.error("Error loading food data:", error);
  }
}

function reportSheetLoadWarnings(sheetApplied, sheetResult) {
  if (!sheetApplied) return;
  if (sheetResult.totalItems === 0) {
    console.warn('[render-food] Sheet loaded but no valid item rows found. All subcategory items are empty.');
  }
  if (sheetResult.unknownSubcategories.length > 0) {
    console.warn('[render-food] Sheet contains unknown subcategory_id values:', sheetResult.unknownSubcategories.join(', '));
  }
}

if (window.initAnimations) window.initAnimations();