/**
 * Function call tree for render-food.js
 *
 * Role:
 *   - Page coordinator/orchestrator only.
 *   - Resolves page context, loads data, reports warnings, delegates rendering.
 *
 * Dependencies (load order):
 *   1) render-food-data.js
 *   2) render-food-renderer.js
 *   3) render-food.js (this file)
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
 *             │    ├─ prepareJumbotronViewModel(data, lang, template)
 *             │    ├─ clone #jumbotron-template and populate title/background
 *             │    └─ iterate categories/subcategories to createMenuIcon(...)
 *             └─ menuRenderer.renderMenuCategories(container, data, lang, pageContext)
 *                   └─ for each category in data.categories:
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
 *   - DOM rendering is delegated to render-food-renderer.js via createMenuRenderer().
 *   - Sheet mode builds final subcategory items from Google Sheet rows.
 *   - If sheet fetch fails, falls back to JSON items (non-blocking)
 *   - Drinks pages reuse the same food-title / food-name / food-price classes.
 *   - The drinks exception is layout only: no image column and details take col-md-12.
 *   - Formules pages reuse the same renderer with OU highlight handling and formule-title.
 *
 * Local helpers in this file: detectLanguage, getLocalizedText, createEl,
 *                             getTemplateRefs, resolvePageContext,
 *                             reportSheetLoadWarnings.
 * Data parsing/sheet mapping helpers are provided by render-food-data.js.
 * DOM tree construction helpers are provided by render-food-renderer.js.
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
  loadMenuData
} = window.renderFoodDataUtils || {};

if (!loadMenuData) {
  console.error('[render-food] Missing data utils. Ensure /js/render-food-data.js is loaded before /js/render-food.js');
}

function resolvePageContext(foodContainer) {
  let jsonFilePath = foodContainer.getAttribute('data-json');
  if (!jsonFilePath) return null;

  jsonFilePath = jsonFilePath.startsWith('/') ? jsonFilePath : `/${jsonFilePath}`;
  return {
    jsonFilePath,
    googleSheetUrl: foodContainer.getAttribute('data-google-sheet-url') || '',
    isDrinksPage: jsonFilePath.includes(DRINKS_DATA_KEY),
    isFormulesPage: jsonFilePath.includes(FORMULES_DATA_KEY)
  };
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
      ouTextByLang: OU_TEXT_BY_LANG
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
  const pageContext = resolvePageContext(foodContainer);
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