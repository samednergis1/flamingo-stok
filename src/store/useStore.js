import { create } from 'zustand';
import { loadFromStorage, saveToStorage, DATA_VERSION } from '../utils/storage';
import { generateId } from '../utils/mockData';
import { getSession, saveSession, clearSession, validateLogin } from '../utils/auth';
import {
  fetchCatalog,
  buildCategories,
  extractStock,
  extractCustomCategories,
  extractCustomProducts,
  extractCustomVariations,
  extractVariationMeta,
  extractProductMeta,
  migrateStockFromLegacy,
  migrateCustomCategoriesLegacy,
  findVariation,
  findProduct,
  mainProductId,
  parseMoney,
  FALLBACK_CATALOG,
} from '../utils/catalog';

let cachedCatalog = null;

function persist(state) {
  saveToStorage({
    stock: extractStock(state.categories),
    sales: state.sales,
    ikrams: state.ikrams,
    customCategories: extractCustomCategories(state.categories),
    customProducts: extractCustomProducts(state.categories),
    customVariations: extractCustomVariations(state.categories),
    variationMeta: cachedCatalog
      ? extractVariationMeta(cachedCatalog.categories, state.categories)
      : state._variationMeta ?? {},
    productMeta: cachedCatalog
      ? extractProductMeta(state.categories)
      : state._productMeta ?? {},
    theme: state.theme,
  });
}

function mapCategoriesStock(categories, mapper) {
  return categories.map((c) => ({
    ...c,
    products: (c.products || []).map((p) => ({
      ...p,
      varieties: (p.varieties || []).map(mapper(c, p)),
    })),
  }));
}

function deductStockFromCategories(categories, cartItems) {
  return mapCategoriesStock(categories, (c, p) => (v) => {
    const cartItem = cartItems.find(
      (ci) =>
        ci.categoryId === c.id &&
        ci.productId === p.id &&
        ci.variationId === v.id
    );
    return cartItem ? { ...v, stock: v.stock - cartItem.quantity } : v;
  });
}

function restoreStockToCategories(categories, cartItems) {
  return mapCategoriesStock(categories, (c, p) => (v) => {
    const cartItem = cartItems.find(
      (ci) =>
        ci.categoryId === c.id &&
        ci.productId === p.id &&
        ci.variationId === v.id
    );
    return cartItem ? { ...v, stock: v.stock + cartItem.quantity } : v;
  });
}

function validateCartStock(categories, cartItems) {
  for (const item of cartItems) {
    const variation = findVariation(
      categories,
      item.categoryId,
      item.productId,
      item.variationId
    );
    if (!variation || variation.stock < item.quantity) {
      return {
        success: false,
        message: `${item.variationName} için yetersiz stok (mevcut: ${variation?.stock ?? 0})`,
      };
    }
  }
  return { success: true };
}

function buildCartItemSnapshot(categories, item) {
  const variation = findVariation(
    categories,
    item.categoryId,
    item.productId,
    item.variationId
  );
  const product = findProduct(categories, item.categoryId, item.productId);
  return {
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    productId: item.productId,
    productName: product?.name ?? item.productName,
    variationId: item.variationId,
    variationName: item.variationName,
    quantity: item.quantity,
    unitPrice: variation?.price ?? null,
    unitCost: variation?.cost ?? null,
  };
}

const useStore = create((set, get) => ({
  categories: [],
  sales: [],
  ikrams: [],
  theme: 'light',
  catalogLoaded: false,
  _variationMeta: {},
  _productMeta: {},
  ...hydrateAuth(),

  activeTab: 'inventory',

  setActiveTab: (tab) => set({ activeTab: tab }),

  initCatalog: async () => {
    try {
      const catalog = await fetchCatalog();
      cachedCatalog = catalog;
      const stored = loadFromStorage();

      let stock = stored?.stock ?? {};
      let sales = stored?.sales ?? [];
      let ikrams = stored?.ikrams ?? [];
      let customCategories = migrateCustomCategoriesLegacy(stored?.customCategories ?? []);
      let customProducts = stored?.customProducts ?? [];
      let customVariations = stored?.customVariations ?? [];
      let variationMeta = stored?.variationMeta ?? {};
      let productMeta = stored?.productMeta ?? {};
      const theme = stored?.theme ?? 'light';

      if (stored?.dataVersion !== DATA_VERSION && stored?.categories?.length) {
        stock = migrateStockFromLegacy(stored.categories, catalog.categories);
        sales = stored.sales ?? [];
        ikrams = stored.ikrams ?? [];
      }

      sales = (sales || []).map((s) => ({ status: 'completed', ...s }));

      const categories = buildCategories(
        catalog.categories,
        stock,
        customCategories,
        variationMeta,
        customProducts,
        customVariations,
        productMeta
      );

      saveToStorage({
        stock,
        sales,
        ikrams,
        customCategories,
        customProducts,
        customVariations,
        variationMeta,
        productMeta,
        theme,
      });
      document.documentElement.classList.toggle('dark', theme === 'dark');
      set({
        categories,
        sales,
        ikrams,
        theme,
        _variationMeta: variationMeta,
        _productMeta: productMeta,
        catalogLoaded: true,
      });
    } catch {
      cachedCatalog = FALLBACK_CATALOG;
      const categories = buildCategories(FALLBACK_CATALOG.categories, {}, [], {}, [], [], {});
      set({
        categories,
        sales: [],
        ikrams: [],
        theme: 'light',
        catalogLoaded: true,
      });
    }
  },

  login: (password, username = '') => {
    if (!validateLogin(password)) return false;
    saveSession(username);
    set({ isAuthenticated: true, username: username.trim() || null });
    return true;
  },

  logout: () => {
    clearSession();
    set({ isAuthenticated: false, username: null });
  },

  initAuth: () => {
    const session = getSession();
    set({
      isAuthenticated: !!session,
      username: session?.username ?? null,
    });
  },

  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', theme === 'dark');
      persist({ ...state, theme });
      return { theme };
    }),

  addStock: (categoryId, productId, variationId, amount) => {
    const qty = parseInt(amount, 10);
    if (!qty || qty <= 0) return false;
    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map((p) =>
                p.id === productId
                  ? {
                      ...p,
                      varieties: p.varieties.map((v) =>
                        v.id === variationId ? { ...v, stock: v.stock + qty } : v
                      ),
                    }
                  : p
              ),
            }
          : c
      );
      persist({ ...state, categories });
      return { categories };
    });
    return true;
  },

  addCategory: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, message: 'Kategori adı gerekli' };

    const exists = get().categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return { success: false, message: 'Bu isimde kategori zaten var' };

    const catId = `custom-cat-${generateId()}`;
    const newCategory = {
      id: catId,
      name: trimmed,
      custom: true,
      active: true,
      products: [
        {
          id: mainProductId(catId),
          name: trimmed,
          active: true,
          custom: true,
          varieties: [],
        },
      ],
    };

    set((state) => {
      const categories = [...state.categories, newCategory];
      persist({ ...state, categories });
      return { categories };
    });

    return { success: true };
  },

  addProduct: (categoryId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, message: 'Ürün adı gerekli' };

    const category = get().categories.find((c) => c.id === categoryId);
    if (!category) return { success: false, message: 'Kategori bulunamadı' };

    const newProduct = {
      id: `custom-prod-${generateId()}`,
      name: trimmed,
      active: true,
      custom: true,
      varieties: [],
    };

    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === categoryId ? { ...c, products: [...c.products, newProduct] } : c
      );
      persist({ ...state, categories });
      return { categories };
    });

    return { success: true };
  },

  addVariety: (categoryId, productId, { name, stock, price, cost }) => {
    const trimmed = name?.trim();
    if (!trimmed) return { success: false, message: 'Çeşit adı gerekli' };

    const category = get().categories.find((c) => c.id === categoryId);
    const product = category?.products.find((p) => p.id === productId);
    if (!product) return { success: false, message: 'Ürün bulunamadı' };

    const stockQty = parseInt(stock, 10);
    const newVariety = {
      id: `custom-var-${generateId()}`,
      name: trimmed,
      stock: Number.isFinite(stockQty) && stockQty >= 0 ? stockQty : 0,
      price: parseMoney(price),
      cost: parseMoney(cost),
      active: true,
      custom: true,
    };

    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map((p) =>
                p.id === productId
                  ? { ...p, varieties: [...p.varieties, newVariety] }
                  : p
              ),
            }
          : c
      );
      persist({ ...state, categories });
      return { categories };
    });

    return { success: true };
  },

  updateVariety: (categoryId, productId, varietyId, updates) => {
    const state = get();
    const category = state.categories.find((c) => c.id === categoryId);
    const product = category?.products.find((p) => p.id === productId);
    const variety = product?.varieties.find((v) => v.id === varietyId);
    if (!variety) return { success: false, message: 'Çeşit bulunamadı' };

    const trimmedName = updates.name?.trim();
    if (!trimmedName) return { success: false, message: 'Çeşit adı gerekli' };

    const stockQty = parseInt(updates.stock, 10);
    if (!Number.isFinite(stockQty) || stockQty < 0) {
      return { success: false, message: 'Geçerli stok adedi girin' };
    }

    const targetCategoryId = updates.categoryId || categoryId;
    const targetProductId = updates.productId || productId;
    const targetCategory = state.categories.find((c) => c.id === targetCategoryId);
    const targetProduct = targetCategory?.products.find((p) => p.id === targetProductId);
    if (!targetProduct) return { success: false, message: 'Hedef ürün bulunamadı' };

    if (
      (targetCategoryId !== categoryId || targetProductId !== productId) &&
      !variety.custom
    ) {
      return { success: false, message: 'Sabit katalog çeşitleri taşınamaz' };
    }

    const updatedVariety = {
      ...variety,
      name: trimmedName,
      stock: stockQty,
      price: parseMoney(updates.price),
      cost: parseMoney(updates.cost),
      active: updates.active !== false,
    };

    set((current) => {
      let categories = current.categories.map((c) => {
        if (c.id === categoryId && categoryId === targetCategoryId && productId === targetProductId) {
          return {
            ...c,
            products: c.products.map((p) =>
              p.id === productId
                ? {
                    ...p,
                    varieties: p.varieties.map((v) =>
                      v.id === varietyId ? updatedVariety : v
                    ),
                  }
                : p
            ),
          };
        }
        if (c.id === categoryId) {
          return {
            ...c,
            products: c.products.map((p) =>
              p.id === productId
                ? { ...p, varieties: p.varieties.filter((v) => v.id !== varietyId) }
                : p
            ),
          };
        }
        if (c.id === targetCategoryId) {
          return {
            ...c,
            products: c.products.map((p) =>
              p.id === targetProductId
                ? { ...p, varieties: [...p.varieties, updatedVariety] }
                : p
            ),
          };
        }
        return c;
      });

      persist({ ...current, categories });
      return { categories };
    });

    return { success: true };
  },

  setProductActive: (categoryId, productId, active) => {
    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map((p) =>
                p.id === productId ? { ...p, active } : p
              ),
            }
          : c
      );
      persist({ ...state, categories });
      return { categories };
    });
    return { success: true };
  },

  setVarietyActive: (categoryId, productId, varietyId, active) => {
    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map((p) =>
                p.id === productId
                  ? {
                      ...p,
                      varieties: p.varieties.map((v) =>
                        v.id === varietyId ? { ...v, active } : v
                      ),
                    }
                  : p
              ),
            }
          : c
      );
      persist({ ...state, categories });
      return { categories };
    });
    return { success: true };
  },

  completeSale: (cartItems) => {
    if (!cartItems.length) return { success: false, message: 'Sepet boş' };

    const state = get();
    const stockCheck = validateCartStock(state.categories, cartItems);
    if (!stockCheck.success) return stockCheck;

    const sale = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: 'completed',
      username: state.username,
      items: cartItems.map((item) => buildCartItemSnapshot(state.categories, item)),
    };

    set((current) => {
      const categories = deductStockFromCategories(current.categories, cartItems);
      const sales = [...current.sales, sale];
      persist({ ...current, categories, sales });
      return { categories, sales };
    });

    return { success: true };
  },

  cancelSale: (saleId) => {
    const state = get();
    const sale = state.sales.find((s) => s.id === saleId);
    if (!sale) return { success: false, message: 'Satış bulunamadı' };
    if (sale.status === 'cancelled') {
      return { success: false, message: 'Bu satış zaten iptal edilmiş' };
    }

    set((current) => {
      const categories = restoreStockToCategories(current.categories, sale.items);
      const sales = current.sales.map((s) =>
        s.id === saleId
          ? {
              ...s,
              status: 'cancelled',
              cancelledAt: new Date().toISOString(),
              cancelledBy: current.username,
            }
          : s
      );
      persist({ ...current, categories, sales });
      return { categories, sales };
    });

    return { success: true };
  },

  completeIkram: (cartItems, note = '') => {
    if (!cartItems.length) return { success: false, message: 'Sepet boş' };

    const state = get();
    const stockCheck = validateCartStock(state.categories, cartItems);
    if (!stockCheck.success) return stockCheck;

    const ikram = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      note: note.trim(),
      username: state.username,
      items: cartItems.map((item) => {
        const snap = buildCartItemSnapshot(state.categories, item);
        return {
          categoryId: snap.categoryId,
          categoryName: snap.categoryName,
          productId: snap.productId,
          productName: snap.productName,
          variationId: snap.variationId,
          variationName: snap.variationName,
          quantity: snap.quantity,
          unitCost: snap.unitCost,
        };
      }),
    };

    set((current) => {
      const categories = deductStockFromCategories(current.categories, cartItems);
      const ikrams = [...current.ikrams, ikram];
      persist({ ...current, categories, ikrams });
      return { categories, ikrams };
    });

    return { success: true };
  },

  importData: async (data) => {
    const catalog = await fetchCatalog();
    cachedCatalog = catalog;
    const stock = data.stock ?? {};
    const sales = (Array.isArray(data.sales) ? data.sales : []).map((s) => ({
      status: 'completed',
      ...s,
    }));
    const ikrams = Array.isArray(data.ikrams) ? data.ikrams : [];
    const customCategories = migrateCustomCategoriesLegacy(data.customCategories ?? []);
    const customProducts = data.customProducts ?? [];
    const customVariations = data.customVariations ?? [];
    const variationMeta =
      data.variationMeta && typeof data.variationMeta === 'object' ? data.variationMeta : {};
    const productMeta =
      data.productMeta && typeof data.productMeta === 'object' ? data.productMeta : {};
    const theme = data.theme === 'dark' ? 'dark' : 'light';
    const categories = buildCategories(
      catalog.categories,
      stock,
      customCategories,
      variationMeta,
      customProducts,
      customVariations,
      productMeta
    );

    set((state) => {
      persist({
        ...state,
        categories,
        sales,
        ikrams,
        _variationMeta: variationMeta,
        _productMeta: productMeta,
        theme,
      });
      document.documentElement.classList.toggle('dark', theme === 'dark');
      return { categories, sales, ikrams, _variationMeta: variationMeta, _productMeta: productMeta, theme };
    });
  },

  resetData: async () => {
    const catalog = await fetchCatalog();
    cachedCatalog = catalog;
    const categories = buildCategories(catalog.categories, {}, [], {}, [], [], {});
    saveToStorage({
      stock: {},
      sales: [],
      ikrams: [],
      customCategories: [],
      customProducts: [],
      customVariations: [],
      variationMeta: {},
      productMeta: {},
      theme: 'light',
    });
    document.documentElement.classList.toggle('dark', false);
    set({
      categories,
      sales: [],
      ikrams: [],
      _variationMeta: {},
      _productMeta: {},
      theme: 'light',
    });
  },
}));

function hydrateAuth() {
  const session = getSession();
  return {
    isAuthenticated: !!session,
    username: session?.username ?? null,
  };
}

export default useStore;
