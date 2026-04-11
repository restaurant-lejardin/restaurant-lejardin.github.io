(function initRenderFoodDataUtils(global) {
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
    const fr = getRowValue(row, [field + '_fr', shortKey + '_fr']);
    const en = getRowValue(row, [field + '_en', shortKey + '_en']);
    const zh = getRowValue(row, [field + '_zh', shortKey + '_zh']);
    if (!fr && !en && !zh) return null;
    return { fr, en, zh };
  }

  function mapSheetRowToItem(row) {
    const subcategoryId = getRowValue(row, ['subcategory_id', 'subcategory', 'subcat_id']);
    if (!subcategoryId) return null;

    const name = buildLocalizedField(row, 'name');
    if (!name) return null;

    const item = { name };

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

    const csvUrl = new URL('https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/export');
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
      throw new Error('[render-food] Failed to fetch sheet CSV. status: ' + response.status);
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
    mappedItems.forEach(function(entry) {
      if (!itemsBySubcategory.has(entry.subcategoryId)) {
        itemsBySubcategory.set(entry.subcategoryId, []);
      }
      itemsBySubcategory.get(entry.subcategoryId).push(entry.item);
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

  global.renderFoodDataUtils = {
    loadSheetMappedItems,
    mergeSheetItemsIntoData
  };
})(window);
