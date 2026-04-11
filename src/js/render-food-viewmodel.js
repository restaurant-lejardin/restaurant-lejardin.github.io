/**
 * Function call tree for render-food-viewmodel.js
 *
 * Role:
 *   - Build renderer-ready view models from raw menu data.
 *   - Keep data shaping out of DOM rendering code.
 *
 * initRenderFoodViewModelUtils(window)
 *   ├─ buildJumbotronViewModel({ data, currentLang, getLocalizedText, templateDataset })
 *   │    ├─ build default srcset from template dataset values
 *   │    ├─ normalize source object and srcset values
 *   │    └─ return renderer-ready jumbotron view model
 *   ├─ buildMenuCategoriesViewModel({ data, currentLang, getLocalizedText, pageContext, ouTextByLang })
 *   │    ├─ normalize categories/subcategories arrays
 *   │    ├─ pre-localize category description/special title
 *   │    ├─ pre-localize subcategory title
 *   │    └─ pre-localize item fields (name/description/special title/price/ou)
 *   └─ registers public API at window.renderFoodViewModelUtils
 */

(function initRenderFoodViewModelUtils(global) {
  function buildJumbotronViewModel(options) {
    const opts = options && typeof options === 'object' ? options : {};
    const source = opts.data && typeof opts.data === 'object' ? opts.data : {};
    const currentLang = opts.currentLang || 'fr';
    const getLocalizedText = typeof opts.getLocalizedText === 'function'
      ? opts.getLocalizedText
      : function(textObj) { return typeof textObj === 'string' ? textObj : ''; };

    const templateAttrs = opts.templateDataset && typeof opts.templateDataset === 'object'
      ? opts.templateDataset
      : {};

    const defaultBackgroundImage = templateAttrs.defaultBg || '';
    const defaultSrcsetBase = templateAttrs.defaultSrcsetBase || '';
    const defaultSrcsetId = templateAttrs.defaultSrcsetId || '';
    const defaultSrcsetWidths = (templateAttrs.defaultSrcsetWidths || '')
      .split(',')
      .map(function(w) { return w.trim(); })
      .filter(Boolean);

    const defaultSrcset = defaultSrcsetWidths
      .map(function(w) { return `${defaultSrcsetBase},w_${w}/${defaultSrcsetId} ${w}w`; })
      .join(',');

    const srcsetValue = (Array.isArray(source.srcset) && source.srcset.length > 0)
      ? source.srcset.join(',')
      : source.srcset;

    return {
      titleText: getLocalizedText(source.title, currentLang) || source.title || source.id || '',
      backgroundImage: source.backgroundImage || defaultBackgroundImage,
      srcset: srcsetValue || defaultSrcset,
      categories: source.subCategories || (Array.isArray(source.categories) ? source.categories : [])
    };
  }

  function buildMenuCategoriesViewModel(options) {
    const opts = options && typeof options === 'object' ? options : {};
    const source = opts.data && typeof opts.data === 'object' ? opts.data : {};
    const currentLang = opts.currentLang || 'fr';
    const pageContext = opts.pageContext && typeof opts.pageContext === 'object' ? opts.pageContext : {};
    const ouTextByLang = opts.ouTextByLang && typeof opts.ouTextByLang === 'object'
      ? opts.ouTextByLang
      : { fr: 'OU', en: 'OR', zh: '或' };
    const getLocalizedText = typeof opts.getLocalizedText === 'function'
      ? opts.getLocalizedText
      : function(textObj) { return typeof textObj === 'string' ? textObj : ''; };

    const categories = Array.isArray(source.categories) ? source.categories : [];
    return categories.map(function(category) {
      const subcategories = Array.isArray(category.subcategories) ? category.subcategories : [];
      return {
        ...category,
        descriptionText: category.description ? getLocalizedText(category.description, currentLang) : '',
        specialTitleText: category.specialTitle ? getLocalizedText(category.specialTitle, currentLang) : '',
        subcategories: subcategories.map(function(subcat) {
          const items = Array.isArray(subcat.items) ? subcat.items : [];
          return {
            ...subcat,
            titleText: getLocalizedText(subcat.title, currentLang),
            items: items.map(function(item) {
              return {
                ...item,
                nameText: getLocalizedText(item.name, currentLang),
                descriptionText: item.description ? getLocalizedText(item.description, currentLang) : '',
                specialTitleText: item.specialTitle ? getLocalizedText(item.specialTitle, currentLang) : '',
                priceText: item.price ? `${item.price}€` : '',
                showOuHighlight: !!(pageContext.isFormulesPage && item['ou-highlight']),
                ouLabelText: ouTextByLang[currentLang] || ouTextByLang.fr
              };
            })
          };
        })
      };
    });
  }

  global.renderFoodViewModelUtils = {
    buildJumbotronViewModel,
    buildMenuCategoriesViewModel
  };
})(window);
