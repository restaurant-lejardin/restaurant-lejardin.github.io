/**
 * Function call tree for render-food-renderer.js
 *
 * Role:
 *   - Pure-ish DOM renderer module for menu pages.
 *   - Receives dependencies from render-food.js through createMenuRenderer(deps).
 *
 * initRenderFoodRenderer(window)
 *   └─ createMenuRenderer(deps)
 *        ├─ helper creators:
 *        │    ├─ createVeganIndicator(veganType)
 *        │    ├─ createFoodImageCol(image)
 *        │    ├─ createFoodTitle(item, lang, isFormule)
 *        │    └─ createMenuIcon(iconTemplate, subcat, lang)
 *        ├─ renderFoodItem(item, lang, pageContext)
 *             ├─ specific behavior if isFormulesPage
 *             ├─ specific behavior if isDrinksPage
 *        ├─ renderSubcategory(subcat, lang, pageContext)
 *        ├─ renderCategory(category, lang, pageContext)
 *        ├─ renderMenuCategories(container, data, lang, pageContext)
 *        │    └─ render categories/subcategories/items directly from raw data
 *        └─ renderJumbotron(data, lang)
 *
 * Public API:
 *   - window.createMenuRenderer(deps) -> renderer instance:
 *       { renderFoodItem, renderSubcategory, renderCategory,
 *         renderMenuCategories, renderJumbotron }
 *
 * Expected deps contract:
 *   - getTemplateRefs(): returns required <template> nodes
 *   - getLocalizedText(textObj, lang): resolves localized strings
 *   - createEl(tag, classList, content, attrs): shared element helper
 *   - ouTextByLang: localized labels for OU/OR/或
 *   - No external view-model layer required: renderer derives display values directly.
 */

(function initRenderFoodRenderer(global) {
  function resolveMenuTitle(pageId, currentLang) {
    const navData = Array.isArray(global.menuNavigationData) ? global.menuNavigationData : []; // menuNavigationData is menu_navigation.yml processed by Jekyll
    const navItem = navData.find(item => item && item.page === pageId);
    if (!navItem || !navItem.title || typeof navItem.title !== 'object') return '';
    return getLocalizedText(navItem.title, currentLang);
  }

  function createMenuRenderer(deps) {
    const {
      getTemplateRefs,
      getLocalizedText,
      createEl,
      ouTextByLang
    } = deps || {};
    const ouLabels = ouTextByLang || {};

    function stripBrTags(text) {
      if (typeof text !== 'string') return text;
      return text.replace(/<br\s*\/?>/gi, '');
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

    function createMenuIcon(iconTemplate, subcat, currentLang) {
      const icon = iconTemplate.content.cloneNode(true);
      const link = icon.querySelector('a');
      const iconImg = icon.querySelector('img');
      const h6 = icon.querySelector('h6');
      const subcatTitle = getLocalizedText(subcat.title, currentLang) || subcat.id || '';
      link.href = `#${subcat.id}`;
      iconImg.src = `/${subcat.icon}`;
      iconImg.alt = subcatTitle;
      h6.innerHTML = `<div>${subcatTitle}</div>`
      return icon;
    }

    function renderFoodItem(item, currentLang, pageContext) {
      const { foodItem } = getTemplateRefs();
      const row = foodItem.content.cloneNode(true).querySelector('.menu-item');
      if (pageContext.isFormulesPage && item['ou-highlight']) {
        const ouTextDiv = createEl('div', ['col-md-2', 'menu-OU-text']);
        const underlined = document.createElement('u');
        underlined.textContent = item.ouLabelText || ouLabels[currentLang] || ouLabels.fr || 'OU';
        ouTextDiv.appendChild(underlined);
        row.appendChild(ouTextDiv);
      } else if (!pageContext.isDrinksPage) {
        row.appendChild(createFoodImageCol(item.image));
      }
      row.appendChild(createVeganIndicator(item.veganType));
      const detailsCol = createEl('div', [pageContext.isDrinksPage ? 'col-md-12' : 'col-md-9']);
      detailsCol.appendChild(createFoodTitle(item, currentLang, pageContext.isFormulesPage));
      if (item.descriptionText || item.description) {
        detailsCol.appendChild(createEl('p', ['food-ingredients'], item.descriptionText || getLocalizedText(item.description, currentLang)));
      }
      row.appendChild(detailsCol);
      return row;
    }

    function renderSubcategory(subcat, currentLang, pageContext) {
      const { foodSubcategory } = getTemplateRefs();
      const subcatDiv = foodSubcategory.content.cloneNode(true).querySelector('.food-subcategory');
      subcatDiv.id = subcat.id;
      const subcatTitle = getLocalizedText(subcat.title, currentLang);
      subcatDiv.querySelector('.subcategory-title').textContent = stripBrTags(subcatTitle);
      if (Array.isArray(subcat.items)) {
        subcat.items.forEach(item => {
          if (item.showHr) subcatDiv.appendChild(createEl('hr', ['food-horizontal-rule']));
          if (item.specialTitle) {
            subcatDiv.appendChild(createEl('h3', ['special-title-4'], getLocalizedText(item.specialTitle, currentLang)));
          }
          subcatDiv.appendChild(renderFoodItem(item, currentLang, pageContext));
        });
      }
      return subcatDiv;
    }

    function renderCategory(category, currentLang, pageContext) {
      const { foodCategory } = getTemplateRefs();
      const categoryDiv = foodCategory.content.cloneNode(true).querySelector('.food-category');
      categoryDiv.id = category.id;
      const description = categoryDiv.querySelector('.category-description');
      if (category.descriptionText || category.description) {
        description.textContent = category.descriptionText || getLocalizedText(category.description, currentLang);
      }
      else description.remove();
      category.subcategories.forEach(subcat => {
        categoryDiv.appendChild(renderSubcategory(subcat, currentLang, pageContext));
      });
      return categoryDiv;
    }

    function renderMenuCategories(foodContainer, data, currentLang, pageContext) {
      const { categorySpecialTitle } = getTemplateRefs();
      const categories = Array.isArray(data.categories) ? data.categories : [];

      categories.forEach(category => {
        if (category.specialTitle) {
          const specialBlock = categorySpecialTitle.content.cloneNode(true);
          specialBlock.querySelector('.special-title-3').textContent = getLocalizedText(category.specialTitle, currentLang);
          foodContainer.appendChild(specialBlock);
        }
        foodContainer.appendChild(renderCategory(category, currentLang, pageContext));
      });
    }

    function renderJumbotron(data, currentLang) {
      const jumbotronPlaceholder = document.getElementById('jumbotron-placeholder');
      const { jumbotron: jumbotronTemplate, menuIcon: iconTemplate } = getTemplateRefs();
      if (!jumbotronPlaceholder || !jumbotronTemplate) return;

      const source = data && typeof data === 'object' ? data : {};
      const templateAttrs = jumbotronTemplate.dataset || {};
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
      const sourceSrcset = (Array.isArray(source.srcset) && source.srcset.length > 0)
        ? source.srcset.join(',')
        : source.srcset;
      const navTitle = resolveMenuTitle(source.id, currentLang);
      const jumbotronTitle = navTitle || getLocalizedText(source.title, currentLang);
      const jumbotronBackgroundImage = source.backgroundImage || defaultBackgroundImage;
      const jumbotronSrcset = sourceSrcset || defaultSrcset;
      const jumbotronCategories = source.subCategories || (Array.isArray(source.categories) ? source.categories : []);

      const jumbotron = jumbotronTemplate.content.cloneNode(true);
      const img = jumbotron.querySelector('img');
      const h1 = jumbotron.querySelector('h1');
      const menuIconsContainer = jumbotron.querySelector('#menu-icons');

      img.src = jumbotronBackgroundImage;
      img.srcset = jumbotronSrcset;
      h1.textContent = jumbotronTitle;

      if (iconTemplate && Array.isArray(jumbotronCategories) && jumbotronCategories.length > 0) {
        jumbotronCategories.forEach(category => {
          const subtitle = getLocalizedText(category.subtitle, currentLang);
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
            row.appendChild(createMenuIcon(iconTemplate, subcat, currentLang));
          });

          menuIconsContainer.appendChild(row);
          menuIconsContainer.appendChild(document.createElement('br'));
        });
      }

      jumbotronPlaceholder.appendChild(jumbotron);
    }

    return {
      renderFoodItem,
      renderSubcategory,
      renderCategory,
      renderMenuCategories,
      renderJumbotron
    };
  }

  global.createMenuRenderer = createMenuRenderer;
})(window);
