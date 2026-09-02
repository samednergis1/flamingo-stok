export const FALLBACK_CATALOG = {
  categories: [
    {
      id: 'pankek',
      name: 'Pankek',
      variations: [
        { id: 'pankek-antep-fistikli', name: 'Antep Fıstıklı' },
        { id: 'pankek-blueberry', name: 'Blueberry' },
        { id: 'pankek-vanilya', name: 'Vanilya' },
        { id: 'pankek-red-velvet', name: 'Red Velvet' },
        { id: 'pankek-double-ciko', name: 'Double Çiko' },
        { id: 'pankek-ciko', name: 'Çiko' },
        { id: 'pankek-cilekli', name: 'Çilekli' },
        { id: 'pankek-cookies-cream', name: 'Cookies Cream' },
        { id: 'pankek-lotus', name: 'Lotus' },
        { id: 'pankek-karamel', name: 'Karamel' },
      ],
    },
    {
      id: 'waffle',
      name: 'Waffle',
      variations: [
        { id: 'waffle-visne', name: 'Vişne' },
        { id: 'waffle-cikolata', name: 'Çikolata' },
        { id: 'waffle-tiramisu', name: 'Tiramisu' },
        { id: 'waffle-findik', name: 'Fındık' },
      ],
    },
    {
      id: 'multipower-bar',
      name: 'Multipower Bar',
      variations: [
        { id: 'mp-layer-yer-fistigi-karamelli', name: 'Layer Yer Fıstıklı Karamelli' },
        { id: 'mp-beyaz-cikolata-cilek', name: 'Beyaz Çikolata Çilek' },
        { id: 'mp-50-bar', name: '%50 Bar' },
        { id: 'mp-xxl-bar', name: 'XXL Bar' },
      ],
    },
    {
      id: 'grenade-bar',
      name: 'Grenade Bar',
      variations: [
        { id: 'grenade-fudged-up-cikolatali', name: 'Fudged Up Çikolatalı' },
        { id: 'grenade-salted-karamel', name: 'Salted Karamel' },
        { id: 'grenade-birthday-cake', name: 'Birthday Cake' },
        { id: 'grenade-beyaz-cikolatali-cookie', name: 'Beyaz Çikolatalı Cookie' },
      ],
    },
    {
      id: 'snck-bar',
      name: 'SNCK Bar',
      variations: [
        { id: 'snck-karamel', name: 'Karamel' },
        { id: 'snck-cikolata', name: 'Çikolata' },
      ],
    },
    {
      id: 'clean-powders-bar',
      name: 'Clean Powders Bar',
      variations: [
        { id: 'cp-cikolata-karamel', name: 'Çikolata Karamel' },
        { id: 'cp-beyaz-cikolata-kurabiye', name: 'Beyaz Çikolata Kurabiye' },
        { id: 'cp-cikolata', name: 'Çikolata' },
      ],
    },
    {
      id: 'protein-ocean-bar',
      name: 'Protein Ocean Bar',
      variations: [
        { id: 'po-tiramisu', name: 'Tiramisu' },
        { id: 'po-oreo', name: 'Oreo' },
        { id: 'po-coconut', name: 'Coconut' },
        { id: 'po-cikolata', name: 'Çikolata' },
        { id: 'po-birthday-cake', name: 'Birthday Cake' },
        { id: 'po-strawberry-cheesecake', name: 'Strawberry Cheesecake' },
        { id: 'po-choco-nut', name: 'Choco Nut' },
        { id: 'po-salted-karamel', name: 'Salted Karamel' },
      ],
    },
    {
      id: 'trio-move-bar',
      name: 'Trio Move Bar',
      variations: [
        { id: 'trio-cilek', name: 'Çilek' },
        { id: 'trio-biskuvi', name: 'Bisküvi' },
        { id: 'trio-muz', name: 'Muz' },
        { id: 'trio-mango', name: 'Mango' },
        { id: 'trio-findik', name: 'Fındık' },
      ],
    },
    {
      id: 'bigjoy-bar',
      name: 'BigJoy Bar',
      variations: [
        { id: 'bigjoy-brownie', name: 'Brownie' },
        { id: 'bigjoy-oreo', name: 'Oreo' },
      ],
    },
    {
      id: 'icecekler',
      name: 'İçecekler',
      variations: [
        { id: 'icecek-espresso', name: 'Espresso' },
        { id: 'icecek-americano', name: 'Americano' },
        { id: 'icecek-latte', name: 'Latte' },
        { id: 'icecek-portakal-suyu', name: 'Portakal Suyu' },
      ],
    },
  ],
};

export function mainProductId(categoryId) {
  return `${categoryId}-main`;
}

export async function fetchCatalog() {
  try {
    const res = await fetch('/catalog.json');
    if (res.ok) {
      const data = await res.json();
      if (data?.categories?.length) return data;
    }
  } catch {
    /* offline */
  }
  return FALLBACK_CATALOG;
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
  const catalogMerged = catalogCategories.map((cat) => {
    const mainId = mainProductId(cat.id);
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

    const mainProduct = buildProduct(
      {
        id: mainId,
        name: cat.name,
        custom: false,
        varieties: cat.variations,
      },
      cat.id,
      stockMap,
      variationMeta,
      customVariations,
      productMeta
    );

    return {
      id: cat.id,
      name: cat.name,
      custom: false,
      active: true,
      products: [mainProduct, ...extraProducts],
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
    for (const v of cat.variations) {
      catalogNames.set(v.id, v.name);
    }
  }

  const meta = {};
  for (const cat of categories) {
    if (cat.custom) continue;
    const mainId = mainProductId(cat.id);
    for (const product of cat.products || []) {
      if (product.id !== mainId && !product.custom) continue;
      for (const v of product.varieties || []) {
        if (v.custom) continue;
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
      if (product.id === mainProductId(cat.id)) continue;
      meta[product.id] = {
        name: product.name,
        active: product.active !== false,
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

export function getActiveCategories(categories) {
  return categories
    .filter((c) => c.active !== false)
    .map((c) => ({
      ...c,
      products: (c.products || [])
        .filter((p) => p.active !== false)
        .map((p) => ({
          ...p,
          varieties: (p.varieties || []).filter((v) => v.active !== false),
        }))
        .filter((p) => p.varieties.length > 0),
    }))
    .filter((c) => c.products.length > 0);
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

export function getVariationLabel(item) {
  if (item.productName && item.productName !== item.categoryName) {
    return `${item.productName} – ${item.variationName}`;
  }
  if (item.productName) {
    return `${item.productName} – ${item.variationName}`;
  }
  return item.variationName;
}

export function migrateStockFromLegacy(legacyCategories, catalogCategories) {
  const stock = {};
  const idByName = new Map();

  for (const cat of catalogCategories) {
    for (const v of cat.variations) {
      idByName.set(`${cat.name}::${v.name}`, v.id);
    }
  }

  for (const cat of legacyCategories || []) {
    for (const v of cat.variations || []) {
      const mappedId = idByName.get(`${cat.name}::${v.name}`);
      if (mappedId) stock[mappedId] = v.stock;
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
