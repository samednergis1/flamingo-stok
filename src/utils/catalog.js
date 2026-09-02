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

export async function fetchCatalog() {
  try {
    const res = await fetch('/catalog.json');
    if (res.ok) {
      const data = await res.json();
      if (data?.categories?.length) return data;
    }
  } catch {
    /* offline veya hata — yedek katalog */
  }
  return FALLBACK_CATALOG;
}

function parseMoney(value) {
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
  };
}

export function buildCategories(
  catalogCategories,
  stockMap = {},
  customCategories = [],
  variationMeta = {}
) {
  const catalogMerged = catalogCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    custom: false,
    variations: cat.variations.map((v) => applyVariationMeta(v, stockMap, variationMeta)),
  }));

  const customMerged = (customCategories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    custom: true,
    variations: (cat.variations || []).map((v) => ({
      id: v.id,
      name: v.name,
      stock: stockMap[v.id] ?? v.stock ?? 0,
      price: v.price ?? null,
      cost: v.cost ?? null,
    })),
  }));

  return [...catalogMerged, ...customMerged];
}

/** @deprecated use buildCategories */
export function mergeCatalogWithStock(catalogCategories, stockMap = {}) {
  return buildCategories(catalogCategories, stockMap, [], {});
}

export function extractStock(categories) {
  const stock = {};
  for (const cat of categories) {
    for (const v of cat.variations) {
      stock[v.id] = v.stock;
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
      variations: cat.variations.map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price ?? null,
        cost: v.cost ?? null,
      })),
    }));
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
    for (const v of cat.variations) {
      const originalName = catalogNames.get(v.id);
      const entry = {};
      if (originalName && v.name !== originalName) entry.name = v.name;
      if (v.price != null) entry.price = v.price;
      if (v.cost != null) entry.cost = v.cost;
      if (Object.keys(entry).length) meta[v.id] = entry;
    }
  }
  return meta;
}

export function findVariation(categories, categoryId, variationId) {
  const category = categories.find((c) => c.id === categoryId);
  return category?.variations.find((v) => v.id === variationId) ?? null;
}

export { parseMoney };

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
      if (mappedId) {
        stock[mappedId] = v.stock;
      }
    }
  }

  return stock;
}
