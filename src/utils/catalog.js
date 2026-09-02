import catalogSeed from '../../public/catalog.json';

export const FALLBACK_CATALOG = catalogSeed;

export function mainProductId(categoryId) {
  return `${categoryId}-main`;
}

export async function fetchCatalog() {
  try {
    const res = await fetch('/catalog.json');
    if (res.ok) {
      const data = await res.json();
      if (data?.categories?.length) {
        return { categories: normalizeCatalogCategories(data.categories) };
      }
    }
  } catch {
    /* offline */
  }
  return { categories: normalizeCatalogCategories(FALLBACK_CATALOG.categories) };
}

export function normalizeCatalogCategories(categories) {
  return (categories || []).map((cat) => {
    if (cat.products?.length) return cat;
    if (!cat.variations?.length) return cat;

    return {
      id: cat.id,
      name: cat.name,
      products: cat.variations.map((variation) => ({
        id: variation.id,
        name: variation.name,
        varieties: [{ id: variation.id, name: variation.name }],
      })),
    };
  });
}

export function parseMoney(value) {
  if (value === '' || value == null) return null;
  const num = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(num) && num >= 0 ? num : null;
}

function applyVariationMeta(variation, stockMap, variationMeta = {}) {
  const meta = variationMeta[variation.id] || {};
  return {
    id: variation.id,
    name: meta.name ?? variation.name,
    stock: stockMap[variation.id] ?? 0,
    price: meta.price ?? variation.price ?? null,
    cost: meta.cost ?? variation.cost ?? null,
    active: meta.active !== false,
    custom: variation.custom === true || String(variation.id).startsWith('custom-var-'),
  };
}

function buildVariationsForProduct(
  catalogVariations,
  categoryId,
  productId,
  stockMap,
  variationMeta,
  customVariations
) {
  const base = (catalogVariations || []).map((v) =>
    applyVariationMeta(v, stockMap, variationMeta)
  );

  const extras = (customVariations || [])
    .filter((v) => v.categoryId === categoryId && v.productId === productId)
    .map((v) => ({
      id: v.id,
      name: v.name,
      stock: stockMap[v.id] ?? 0,
      price: v.price ?? null,
      cost: v.cost ?? null,
      active: v.active !== false,
      custom: true,
    }));

  return [...base, ...extras];
}

function buildProduct(
  productDef,
  categoryId,
  stockMap,
  variationMeta,
  customVariations,
  productMeta
) {
  const meta = productMeta?.[productDef.id] || {};
  return {
    id: productDef.id,
    name: meta.name ?? productDef.name,
    group: meta.group ?? productDef.group ?? null,
    active: meta.active !== false && productDef.active !== false,
    custom: productDef.custom === true,
    varieties: buildVariationsForProduct(
      productDef.varieties || productDef.variations || [],
      categoryId,
      productDef.id,
      stockMap,
      variationMeta,
      customVariations
    ),
  };
}

function normalizeCustomCategory(cat, stockMap, customVariations) {
  if (cat.products?.length) {
    return {
      id: cat.id,
      name: cat.name,
      custom: true,
      active: cat.active !== false,
      products: cat.products.map((p) =>
        buildProduct(p, cat.id, stockMap, {}, customVariations, {})
      ),
    };
  }

  const productId = mainProductId(cat.id);
  return {
    id: cat.id,
    name: cat.name,
    custom: true,
    active: cat.active !== false,
    products: [
      {
        id: productId,
        name: cat.name,
        active: true,
        custom: true,
        varieties: (cat.variations || []).map((v) => ({
          id: v.id,
          name: v.name,
          stock: stockMap[v.id] ?? v.stock ?? 0,
          price: v.price ?? null,
          cost: v.cost ?? null,
          active: v.active !== false,
          custom: true,
        })),
      },
    ],
  };
}

export function buildCategories(
  catalogCategories,
  stockMap = {},
  customCategories = [],
  variationMeta = {},
  customProducts = [],
  customVariations = [],
  productMeta = {}
) {
  const catalogMerged = normalizeCatalogCategories(catalogCategories).map((cat) => {
    const extraProducts = (customProducts || [])
      .filter((p) => p.categoryId === cat.id)
      .map((p) =>
        buildProduct(
          { ...p, varieties: p.varieties || [] },
          cat.id,
          stockMap,
          variationMeta,
          customVariations,
          productMeta
        )
      );

    if (cat.products?.length) {
      const catalogProducts = cat.products.map((p) =>
        buildProduct(
          { ...p, varieties: p.varieties || p.variations || [] },
          cat.id,
          stockMap,
          variationMeta,
          customVariations,
          productMeta
        )
      );

      return {
        id: cat.id,
        name: cat.name,
        custom: false,
        active: true,
        products: [...catalogProducts, ...extraProducts],
      };
    }

    return {
      id: cat.id,
      name: cat.name,
      custom: false,
      active: true,
      products: [...extraProducts],
    };
  });

  const customMerged = (customCategories || []).map((cat) =>
    normalizeCustomCategory(cat, stockMap, customVariations)
  );

  return [...catalogMerged, ...customMerged];
}

export function extractStock(categories) {
  const stock = {};
  for (const cat of categories) {
    for (const product of cat.products || []) {
      for (const v of product.varieties || []) {
        stock[v.id] = v.stock;
      }
    }
  }
  return stock;
}

export function extractCustomCategories(categories) {
  return categories
    .filter((c) => c.custom)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      active: cat.active !== false,
      products: (cat.products || []).map((p) => ({
        id: p.id,
        name: p.name,
        active: p.active !== false,
        varieties: (p.varieties || []).map((v) => ({
          id: v.id,
          name: v.name,
          price: v.price ?? null,
          cost: v.cost ?? null,
          active: v.active !== false,
        })),
      })),
    }));
}

export function extractCustomProducts(categories) {
  const items = [];
  for (const cat of categories) {
    if (cat.custom) continue;
    for (const product of cat.products || []) {
      if (product.custom && product.id !== mainProductId(cat.id)) {
        items.push({
          categoryId: cat.id,
          id: product.id,
          name: product.name,
          active: product.active !== false,
          varieties: [],
        });
      }
    }
  }
  return items;
}

export function extractCustomVariations(categories) {
  const items = [];
  for (const cat of categories) {
    for (const product of cat.products || []) {
      for (const v of product.varieties || []) {
        if (v.custom) {
          items.push({
            categoryId: cat.id,
            productId: product.id,
            id: v.id,
            name: v.name,
            price: v.price ?? null,
            cost: v.cost ?? null,
            active: v.active !== false,
          });
        }
      }
    }
  }
  return items;
}

export function extractVariationMeta(catalogCategories, categories) {
  const catalogNames = new Map();
  for (const cat of catalogCategories) {
    if (cat.products?.length) {
      for (const product of cat.products) {
        for (const v of product.varieties || product.variations || []) {
          catalogNames.set(v.id, v.name);
        }
      }
    } else {
      for (const v of cat.variations || []) {
        catalogNames.set(v.id, v.name);
      }
    }
  }

  const meta = {};
  for (const cat of categories) {
    if (cat.custom) continue;
    for (const product of cat.products || []) {
      if (product.custom) continue;
      for (const v of product.varieties || []) {
        if (v.custom || !catalogNames.has(v.id)) continue;
        const originalName = catalogNames.get(v.id);
        const entry = {};
        if (originalName && v.name !== originalName) entry.name = v.name;
        if (v.price != null) entry.price = v.price;
        if (v.cost != null) entry.cost = v.cost;
        if (v.active === false) entry.active = false;
        if (Object.keys(entry).length) meta[v.id] = entry;
      }
    }
  }
  return meta;
}

export function extractProductMeta(categories) {
  const meta = {};
  for (const cat of categories) {
    if (cat.custom) continue;
    for (const product of cat.products || []) {
      if (!product.custom) continue;
      meta[product.id] = {
        name: product.name,
        active: product.active !== false,
        ...(product.group ? { group: product.group } : {}),
      };
    }
  }
  return meta;
}

export function findVariation(categories, categoryId, productId, variationId) {
  const category = categories.find((c) => c.id === categoryId);
  const product = category?.products?.find((p) => p.id === productId);
  return product?.varieties.find((v) => v.id === variationId) ?? null;
}

export function findProduct(categories, categoryId, productId) {
  const category = categories.find((c) => c.id === categoryId);
  return category?.products?.find((p) => p.id === productId) ?? null;
}

export function getSellableProducts(category) {
  return (category?.products || [])
    .filter((p) => p.active !== false)
    .map((p) => ({
      ...p,
      varieties: (p.varieties || []).filter((v) => v.active !== false),
    }))
    .filter((p) => p.varieties.length > 0);
}

export function getPosCategories(categories) {
  return (categories || []).filter((c) => {
    if (c.active === false) return false;
    if (c.custom) return true;
    return getSellableProducts(c).length > 0;
  });
}

export function getActiveCategories(categories) {
  return getPosCategories(categories).map((c) => ({
    ...c,
    products: getSellableProducts(c),
  }));
}

export function countCategoryStock(category) {
  return (category.products || []).reduce(
    (sum, p) => sum + (p.varieties || []).reduce((s, v) => s + v.stock, 0),
    0
  );
}

export function countCategoryVarieties(category) {
  return (category.products || []).reduce((sum, p) => sum + (p.varieties || []).length, 0);
}

function normalizeCatalogName(value) {
  return String(value ?? '').trim().toLocaleLowerCase('tr');
}

export function getPrimaryVariety(product) {
  const varieties = product?.varieties || [];
  return varieties.find((v) => v.active !== false) ?? varieties[0] ?? null;
}

export function isMultiVarietyProduct(product) {
  const varieties = product?.varieties || [];
  if (varieties.length === 0) return false;
  const active = varieties.filter((v) => v.active !== false);
  if (active.length > 1) return true;
  if (active.length === 1) {
    return normalizeCatalogName(active[0].name) !== normalizeCatalogName(product?.name);
  }
  return varieties.length > 1;
}

export function countCategoryProducts(category) {
  return (category.products || []).length;
}

export function applyCatalogRemovals(
  categories,
  { removedCategories = [], removedProducts = [], removedVariations = [] } = {}
) {
  const removedCategorySet = new Set(removedCategories);
  const removedProductSet = new Set(removedProducts);
  const removedVariationSet = new Set(removedVariations);

  return categories
    .filter((cat) => !removedCategorySet.has(cat.id))
    .map((cat) => ({
      ...cat,
      products: (cat.products || [])
        .filter((product) => !removedProductSet.has(product.id))
        .map((product) => ({
          ...product,
          varieties: (product.varieties || []).filter(
            (variety) => !removedVariationSet.has(variety.id)
          ),
        }))
        .filter((product) => (product.varieties || []).length > 0),
    }))
    .filter((cat) => (cat.products || []).length > 0);
}

export function getVariationLabel(item) {
  if (item.productName && item.productName !== item.categoryName) {
    return `${item.productName} – ${item.variationName}`;
  }
  if (item.productName) {
    return `${item.productName} – ${item.variationName}`;
  }
  return item.variationName;
}

export function getProductGroups(products) {
  const groups = [...new Set((products || []).map((p) => p.group).filter(Boolean))];
  return groups.length ? groups : null;
}

export function filterProductsByGroup(products, group) {
  if (!group) return products || [];
  return (products || []).filter((p) => p.group === group);
}

const LEGACY_STOCK_ID_MAP = {
  'icecek-espresso': 'icecek-espresso-standart',
  'icecek-americano': 'icecek-americano-standart',
  'icecek-latte': 'icecek-latte-standart',
  'icecek-portakal-suyu': 'icecek-portakal-suyu-standart',
};

const RESTORED_STOCK_ID_MAP = {
  'icecek-espresso-standart': 'icecek-espresso',
  'icecek-americano-standart': 'icecek-americano',
  'icecek-latte-standart': 'icecek-latte',
  'icecek-portakal-suyu-standart': 'icecek-portakal-suyu',
};

export function migrateStockMap(stock = {}, fromVersion = 0) {
  const next = { ...stock };

  if (fromVersion < 6) {
    for (const [oldId, newId] of Object.entries(LEGACY_STOCK_ID_MAP)) {
      if (Object.prototype.hasOwnProperty.call(next, oldId) && !Object.prototype.hasOwnProperty.call(next, newId)) {
        next[newId] = next[oldId];
        delete next[oldId];
      }
    }
  }

  if (fromVersion < 7) {
    for (const [temporaryId, restoredId] of Object.entries(RESTORED_STOCK_ID_MAP)) {
      if (!Object.prototype.hasOwnProperty.call(next, temporaryId)) continue;
      next[restoredId] = (next[restoredId] ?? 0) + next[temporaryId];
      delete next[temporaryId];
    }
  }

  return next;
}

function flattenLegacyMainProductItem(item) {
  if (!item?.categoryId || !item?.variationId) return item;
  if (item.productId !== mainProductId(item.categoryId)) return item;

  return {
    ...item,
    productId: item.variationId,
    productName: item.variationName ?? item.productName,
  };
}

export function migrateFlatCatalogTransactions(records = [], fromVersion = 0) {
  if (fromVersion >= 8) return records;

  return (records || []).map((record) => ({
    ...record,
    items: (record.items || []).map(flattenLegacyMainProductItem),
  }));
}

function indexCatalogVariations(catalogCategories, idByName) {
  for (const cat of catalogCategories) {
    if (cat.products?.length) {
      for (const product of cat.products) {
        for (const v of product.varieties || product.variations || []) {
          idByName.set(`${cat.name}::${product.name}::${v.name}`, v.id);
          idByName.set(`${cat.name}::${v.name}`, v.id);
        }
      }
    } else {
      for (const v of cat.variations || []) {
        idByName.set(`${cat.name}::${v.name}`, v.id);
      }
    }
  }
}

export function migrateStockFromLegacy(legacyCategories, catalogCategories) {
  const stock = {};
  const idByName = new Map();

  indexCatalogVariations(catalogCategories, idByName);

  for (const cat of legacyCategories || []) {
    if (cat.products?.length) {
      for (const product of cat.products) {
        for (const v of product.varieties || product.variations || []) {
          const mappedId =
            idByName.get(`${cat.name}::${product.name}::${v.name}`) ||
            idByName.get(`${cat.name}::${v.name}`) ||
            LEGACY_STOCK_ID_MAP[v.id];
          if (mappedId) stock[mappedId] = v.stock;
        }
      }
    } else {
      for (const v of cat.variations || []) {
        const mappedId = idByName.get(`${cat.name}::${v.name}`) || LEGACY_STOCK_ID_MAP[v.id];
        if (mappedId) stock[mappedId] = v.stock;
      }
    }
  }

  return stock;
}

export function migrateCustomCategoriesLegacy(cats) {
  return (cats || []).map((cat) => {
    if (cat.products?.length) return cat;
    return normalizeCustomCategory(cat, {}, []);
  });
}
