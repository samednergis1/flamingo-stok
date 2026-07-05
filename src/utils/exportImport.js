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
  const headers = ['Tarih', 'Kategori', 'Çeşit', 'Adet'];
  const rows = [];

  for (const sale of sales) {
    for (const item of sale.items) {
      rows.push([
        new Date(sale.timestamp).toLocaleString('tr-TR'),
        item.categoryName,
        item.variationName,
        item.quantity,
      ]);
    }
  }

  const csv =
    '\uFEFF' +
    [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flamingo-bar-satislar-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.categories || !Array.isArray(data.categories)) {
          reject(new Error('Geçersiz yedek dosyası: kategori bilgisi bulunamadı'));
          return;
        }
        resolve({
          categories: data.categories,
          sales: Array.isArray(data.sales) ? data.sales : [],
          theme: data.theme === 'dark' ? 'dark' : 'light',
        });
      } catch {
        reject(new Error('Geçersiz JSON dosyası'));
      }
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsText(file, 'UTF-8');
  });
}

export function analyzeSales(filteredSales) {
  let totalItems = 0;
  const byCategory = {};
  const byVariation = {};

  for (const sale of filteredSales) {
    for (const item of sale.items) {
      totalItems += item.quantity;
      byCategory[item.categoryName] = (byCategory[item.categoryName] || 0) + item.quantity;

      if (!byVariation[item.categoryName]) {
        byVariation[item.categoryName] = {};
      }
      byVariation[item.categoryName][item.variationName] =
        (byVariation[item.categoryName][item.variationName] || 0) + item.quantity;
    }
  }

  const categoryBreakdown = Object.entries(byCategory)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const variationBreakdown = Object.entries(byVariation).map(([categoryName, variations]) => {
    const categoryTotal = Object.values(variations).reduce((s, v) => s + v, 0);
    const items = Object.entries(variations)
      .map(([name, count]) => ({
        name,
        count,
        percentage: categoryTotal > 0 ? Math.round((count / categoryTotal) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return { categoryName, categoryTotal, items };
  });

  return { totalItems, categoryBreakdown, variationBreakdown, saleCount: filteredSales.length };
}
