import { extractStock } from './catalog';

export function exportDataAsJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flamingo-bar-yedek-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSalesAsCsv(sales) {
  const headers = ['Tarih', 'Durum', 'Kategori', 'Ürün', 'Çeşit', 'Adet'];
  const rows = [];

  for (const sale of sales) {
    for (const item of sale.items) {
      rows.push([
        new Date(sale.timestamp).toLocaleString('tr-TR'),
        sale.status === 'cancelled' ? 'İptal' : 'Tamamlandı',
        item.categoryName,
        item.productName || item.categoryName,
        item.variationName,
        item.quantity,
      ]);
    }
  }

  writeCsv(`flamingo-bar-satislar-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

export function exportIkramsAsCsv(ikrams) {
  const headers = ['Tarih', 'Kişi', 'Kategori', 'Ürün', 'Çeşit', 'Adet', 'Not', 'Personel'];
  const rows = [];

  for (const ikram of ikrams) {
    for (const item of ikram.items) {
      rows.push([
        new Date(ikram.timestamp).toLocaleString('tr-TR'),
        ikram.recipient || '',
        item.categoryName,
        item.productName || item.categoryName,
        item.variationName,
        item.quantity,
        ikram.note || '',
        ikram.username || '',
      ]);
    }
  }

  writeCsv(`flamingo-bar-ikramlar-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

function writeCsv(filename, headers, rows) {
  const csv =
    '\uFEFF' +
    [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.stock && typeof data.stock === 'object') {
          resolve(normalizeImport(data));
          return;
        }

        if (data.categories && Array.isArray(data.categories)) {
          resolve({
            ...normalizeImport(data),
            stock: extractStock(data.categories),
          });
          return;
        }

        reject(new Error('Geçersiz yedek dosyası'));
      } catch {
        reject(new Error('Geçersiz JSON dosyası'));
      }
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsText(file, 'UTF-8');
  });
}

function normalizeImport(data) {
  return {
    stock: data.stock ?? {},
    sales: Array.isArray(data.sales) ? data.sales : [],
    ikrams: Array.isArray(data.ikrams) ? data.ikrams : [],
    ikramRecipients: Array.isArray(data.ikramRecipients) ? data.ikramRecipients : [],
    customCategories: Array.isArray(data.customCategories) ? data.customCategories : [],
    customProducts: Array.isArray(data.customProducts) ? data.customProducts : [],
    customVariations: Array.isArray(data.customVariations) ? data.customVariations : [],
    variationMeta:
      data.variationMeta && typeof data.variationMeta === 'object' ? data.variationMeta : {},
    productMeta: data.productMeta && typeof data.productMeta === 'object' ? data.productMeta : {},
    theme: data.theme === 'dark' ? 'dark' : 'light',
  };
}

function itemLabel(item) {
  const product = item.productName || item.categoryName;
  return `${product} – ${item.variationName}`;
}

function aggregateItems(records) {
  let totalItems = 0;
  const byCategory = {};
  const byProductVariety = {};

  for (const record of records) {
    for (const item of record.items) {
      totalItems += item.quantity;
      byCategory[item.categoryName] = (byCategory[item.categoryName] || 0) + item.quantity;

      const label = itemLabel(item);
      if (!byProductVariety[item.categoryName]) {
        byProductVariety[item.categoryName] = {};
      }
      byProductVariety[item.categoryName][label] =
        (byProductVariety[item.categoryName][label] || 0) + item.quantity;
    }
  }

  const categoryBreakdown = Object.entries(byCategory)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const variationBreakdown = Object.entries(byProductVariety).map(([categoryName, labels]) => {
    const categoryTotal = Object.values(labels).reduce((s, v) => s + v, 0);
    const items = Object.entries(labels)
      .map(([name, count]) => ({
        name,
        count,
        percentage: categoryTotal > 0 ? Math.round((count / categoryTotal) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return { categoryName, categoryTotal, items };
  });

  return { totalItems, categoryBreakdown, variationBreakdown, recordCount: records.length };
}

export function getActiveSales(sales) {
  return sales.filter((s) => s.status !== 'cancelled');
}

export function analyzeSales(filteredSales) {
  const active = getActiveSales(filteredSales);
  const result = aggregateItems(active);
  return {
    totalItems: result.totalItems,
    categoryBreakdown: result.categoryBreakdown,
    variationBreakdown: result.variationBreakdown,
    saleCount: result.recordCount,
  };
}

export function analyzeIkrams(filteredIkrams) {
  const result = aggregateItems(filteredIkrams);
  return {
    totalItems: result.totalItems,
    categoryBreakdown: result.categoryBreakdown,
    variationBreakdown: result.variationBreakdown,
    ikramCount: result.recordCount,
  };
}

export function computeSalesRevenue(filteredSales, categories) {
  const priceMap = buildPriceMap(categories);
  let total = 0;

  for (const sale of getActiveSales(filteredSales)) {
    for (const item of sale.items) {
      const unitPrice =
        item.unitPrice ??
        priceMap.get(`${item.categoryId}::${item.productId || ''}::${item.variationId}`) ??
        priceMap.get(`${item.categoryId}::::${item.variationId}`) ??
        0;
      total += unitPrice * item.quantity;
    }
  }

  return total;
}

export function computeIkramCost(filteredIkrams, categories) {
  const costMap = buildCostMap(categories);
  let total = 0;

  for (const ikram of filteredIkrams) {
    for (const item of ikram.items) {
      const unitCost =
        item.unitCost ??
        costMap.get(`${item.categoryId}::${item.productId || ''}::${item.variationId}`) ??
        costMap.get(`${item.categoryId}::::${item.variationId}`) ??
        0;
      total += unitCost * item.quantity;
    }
  }

  return total;
}

function buildPriceMap(categories) {
  const map = new Map();
  for (const cat of categories) {
    for (const p of cat.products || []) {
      for (const v of p.varieties || []) {
        map.set(`${cat.id}::${p.id}::${v.id}`, v.price ?? 0);
        map.set(`${cat.id}::::${v.id}`, v.price ?? 0);
      }
    }
  }
  return map;
}

function buildCostMap(categories) {
  const map = new Map();
  for (const cat of categories) {
    for (const p of cat.products || []) {
      for (const v of p.varieties || []) {
        map.set(`${cat.id}::${p.id}::${v.id}`, v.cost ?? 0);
        map.set(`${cat.id}::::${v.id}`, v.cost ?? 0);
      }
    }
  }
  return map;
}

export function formatMoney(amount) {
  if (!amount) return '—';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
