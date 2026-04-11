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
 *   3) render-food-renderer.js
 *   4) render-food.js (this file)
 *
 * DOMContentLoaded
 *   └─ renderFoodAndJumbotron(container, lang)
 *        ├─ resolvePageContext(container)
 *        ├─ loadMenuData({ jsonFilePath, googleSheetUrl }) via render-food-data.js
 *        └─ (on final data)
 *             ├─ reportSheetLoadWarnings(sheetApplied, sheetResult)
 *             ├─ menuRenderer.renderJumbotron(data, lang)
 *             └─ menuRenderer.renderMenuCategories(container, data, lang, pageContext)
 *                   └─ for each category in data.categories:
 *                         └─ menuRenderer.renderCategory(category, lang, pageContext)
 *                         └─ for each subcategory in category.subcategories:
 *                               └─ menuRenderer.renderSubcategory(subcat, lang, pageContext)
 *                                     └─ for each item in subcat.items:
 *                                           └─ menuRenderer.renderFoodItem(item, lang, pageContext)
 *
 * Architecture schema:
 *
 *   [render-food-config.js]
 *      - createPageContext
 *      - templateSelectors / labels
 *                 |
 *                 v
 *   [render-food.js] (orchestrator)
 *      - DOMContentLoaded
 *      - detectLanguage
 *      - reportSheetLoadWarnings
 *      - wires dependencies into renderer
 *        |                     |
 *        |                     v
 *        |          [render-food-renderer.js]
 *        |             - DOM creation only
 *        |             - renderJumbotron / categories / items
 *        v
 *   [render-food-data.js]
 *      - loadMenuData(JSON structure + Google Sheet items)
 *      - loadSheetMappedItems
 *      - buildMenuDataFromSheet
 *
 * Key behavior:
 *   - Google Sheet URL is required as item source.
 *   - Drinks and formules reuse the same renderer with page flags.
 *   - Drinks pages reuse the same food-title / food-name / food-price classes.
 *   - The drinks exception is layout only: no image column and details take col-md-12.
 *   - Formules pages reuse the same renderer with OU highlight handling and formule-title.
 */

const {
  createPageContext,
  ouTextByLang,
  templateSelectors
} = window.renderFoodConfig || {};

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

if (!templateSelectors) {
  console.error('[render-food] Missing template selectors in config. Ensure render-food-config.js exports templateSelectors.');
}

if (!ouTextByLang) {
  console.error('[render-food] Missing ouTextByLang in config. Ensure render-food-config.js exports localized OU labels.');
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
      ouTextByLang
    })
  : {
      renderFoodItem: () => document.createElement('div'),
      renderSubcategory: () => document.createElement('div'),
      renderCategory: () => document.createElement('div'),
      renderMenuCategories: () => {},
      renderJumbotron: () => {}
    };

document.addEventListener("DOMContentLoaded", () => {
  const foodContainer = document.querySelector('[id^="food-container"]');
  if (!foodContainer) {
    console.error("Error: No food container element found.");
    return;
  }

  const currentLang = detectLanguage();
  renderFoodAndJumbotron(foodContainer, currentLang);
});


async function renderFoodAndJumbotron(foodContainer, currentLang) {
  const pageContext = createPageContext ? createPageContext(foodContainer) : null;
  if (!pageContext) {
    console.error("Error: data-json attribute not set on container:", foodContainer.id);
    return;
  }

  if (!pageContext.googleSheetUrl) {
    console.error("Error: data-google-sheet-url attribute not set on container:", foodContainer.id);
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