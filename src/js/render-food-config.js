/**
 * Function call tree for render-food-config.js
 *
 * Role:
 *   - Shared configuration and page-context helpers for menu rendering.
 *   - Central source for data keys, localized labels, and template selectors.
 *
 * initRenderFoodConfig(window)
 *   ├─ resolveJsonFilePath(rawPath)
 *   ├─ createPageContext(foodContainer)
 *   │    ├─ read data-json
 *   │    ├─ normalize json path
 *   │    ├─ read data-google-sheet-url
 *   │    └─ compute page flags from data keys
 *   └─ registers public API at window.renderFoodConfig
 */

(function initRenderFoodConfig(global) {
  const config = {
    dataKeys: {
      drinks: 'drinks-data',
      formules: 'formules-data'
    },
    ouTextByLang: { fr: 'OU', en: 'OR', zh: '或' },
    templateSelectors: {
      foodTitle: '#food-title-template',
      foodItem: '#food-item-template',
      foodSubcategory: '#food-subcategory-template',
      foodCategory: '#food-category-template',
      categorySpecialTitle: '#category-special-title-template',
      jumbotron: '#jumbotron-template',
      menuIcon: '#menu-icon-template'
    }
  };

  function resolveJsonFilePath(rawPath) {
    if (!rawPath) return '';
    return rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  }

  function createPageContext(foodContainer) {
    const rawJsonPath = foodContainer.getAttribute('data-json');
    const jsonFilePath = resolveJsonFilePath(rawJsonPath);
    if (!jsonFilePath) return null;

    return {
      jsonFilePath,
      googleSheetUrl: foodContainer.getAttribute('data-google-sheet-url') || '',
      isDrinksPage: jsonFilePath.includes(config.dataKeys.drinks),
      isFormulesPage: jsonFilePath.includes(config.dataKeys.formules)
    };
  }

  global.renderFoodConfig = {
    ...config,
    resolveJsonFilePath,
    createPageContext
  };
})(window);
