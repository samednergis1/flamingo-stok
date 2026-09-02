import { create } from 'zustand';
import { loadFromStorage, saveToStorage, DATA_VERSION } from '../utils/storage';
import { generateId } from '../utils/mockData';
import { getSession, saveSession, clearSession, validateLogin } from '../utils/auth';
import {
  fetchCatalog,
  buildCategories,
  extractStock,
  extractCustomCategories,
  extractVariationMeta,
  migrateStockFromLegacy,
  findVariation,
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
    variationMeta: cachedCatalog
      ? extractVariationMeta(cachedCatalog.categories, state.categories)
      : state._variationMeta ?? {},
    theme: state.theme,
  });
}

function deductStockFromCategories(categories, cartItems) {
  return categories.map((c) => ({
    ...c,
    variations: c.variations.map((v) => {
      const cartItem = cartItems.find(
        (ci) => ci.categoryId === c.id && ci.variationId === v.id
      );
      return cartItem ? { ...v, stock: v.stock - cartItem.quantity } : v;
    }),
  }));
}

function validateCartStock(categories, cartItems) {
  for (const item of cartItems) {
    const variation = findVariation(categories, item.categoryId, item.variationId);
    if (!variation || variation.stock < item.quantity) {
      return {
        success: false,
        message: `${item.variationName} için yetersiz stok (mevcut: ${variation?.stock ?? 0})`,
      };
    }
  }
  return { success: true };
}

const useStore = create((set, get) => ({
  categories: [],
  sales: [],
  ikrams: [],
  theme: 'light',
  catalogLoaded: false,
  _variationMeta: {},
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
      let customCategories = stored?.customCategories ?? [];
      let variationMeta = stored?.variationMeta ?? {};
      const theme = stored?.theme ?? 'light';

      if (stored?.dataVersion !== DATA_VERSION && stored?.categories?.length) {
        stock = migrateStockFromLegacy(stored.categories, catalog.categories);
        sales = stored.sales ?? [];
        ikrams = stored.ikrams ?? [];
      }

      const categories = buildCategories(
        catalog.categories,
        stock,
        customCategories,
        variationMeta
      );

      saveToStorage({
        stock,
        sales,
        ikrams,
        customCategories,
        variationMeta,
        theme,
      });
      document.documentElement.classList.toggle('dark', theme === 'dark');
      set({
        categories,
        sales,
        ikrams,
        theme,
        _variationMeta: variationMeta,
        catalogLoaded: true,
      });
    } catch {
      cachedCatalog = FALLBACK_CATALOG;
      const categories = buildCategories(FALLBACK_CATALOG.categories, {}, [], {});
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

  addStock: (categoryId, variationId, amount) => {
    const qty = parseInt(amount, 10);
    if (!qty || qty <= 0) return false;
    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              variations: c.variations.map((v) =>
                v.id === variationId ? { ...v, stock: v.stock + qty } : v
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

    const newCategory = {
      id: `custom-cat-${generateId()}`,
      name: trimmed,
      custom: true,
      variations: [],
    };

    set((state) => {
      const categories = [...state.categories, newCategory];
      persist({ ...state, categories });
      return { categories };
    });

    return { success: true };
  },

  addVariation: (categoryId, { name, stock, price, cost }) => {
    const trimmed = name?.trim();
    if (!trimmed) return { success: false, message: 'Ürün adı gerekli' };

    const category = get().categories.find((c) => c.id === categoryId);
    if (!category?.custom) {
      return { success: false, message: 'Sadece manuel kategorilere ürün eklenebilir' };
    }

    const stockQty = parseInt(stock, 10);
    const newVariation = {
      id: `custom-var-${generateId()}`,
      name: trimmed,
      stock: Number.isFinite(stockQty) && stockQty >= 0 ? stockQty : 0,
      price: parseMoney(price),
      cost: parseMoney(cost),
    };

    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === categoryId
          ? { ...c, variations: [...c.variations, newVariation] }
          : c
      );
      persist({ ...state, categories });
      return { categories };
    });

    return { success: true };
  },

  updateVariation: (categoryId, variationId, updates) => {
    const state = get();
    const category = state.categories.find((c) => c.id === categoryId);
    const variation = category?.variations.find((v) => v.id === variationId);
    if (!variation) return { success: false, message: 'Ürün bulunamadı' };

    const trimmedName = updates.name?.trim();
    if (!trimmedName) return { success: false, message: 'Ürün adı gerekli' };

    const stockQty = parseInt(updates.stock, 10);
    if (!Number.isFinite(stockQty) || stockQty < 0) {
      return { success: false, message: 'Geçerli stok adedi girin' };
    }

    const targetCategoryId = updates.categoryId || categoryId;
    const targetCategory = state.categories.find((c) => c.id === targetCategoryId);
    if (!targetCategory) return { success: false, message: 'Kategori bulunamadı' };

    if (targetCategoryId !== categoryId && !variation.id.startsWith('custom-var-')) {
      return { success: false, message: 'Sabit katalog ürünleri taşınamaz' };
    }

    const updatedVariation = {
      ...variation,
      name: trimmedName,
      stock: stockQty,
      price: parseMoney(updates.price),
      cost: parseMoney(updates.cost),
    };

    set((current) => {
      let categories = current.categories.map((c) => {
        if (c.id === categoryId && categoryId === targetCategoryId) {
          return {
            ...c,
            variations: c.variations.map((v) =>
              v.id === variationId ? updatedVariation : v
            ),
          };
        }
        if (c.id === categoryId && categoryId !== targetCategoryId) {
          return {
            ...c,
            variations: c.variations.filter((v) => v.id !== variationId),
          };
        }
        if (c.id === targetCategoryId && categoryId !== targetCategoryId) {
          return { ...c, variations: [...c.variations, updatedVariation] };
        }
        return c;
      });

      persist({ ...current, categories });
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
      items: cartItems.map((item) => {
        const variation = findVariation(state.categories, item.categoryId, item.variationId);
        return {
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          variationId: item.variationId,
          variationName: item.variationName,
          quantity: item.quantity,
          unitPrice: variation?.price ?? null,
        };
      }),
    };

    set((current) => {
      const categories = deductStockFromCategories(current.categories, cartItems);
      const sales = [...current.sales, sale];
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
      items: cartItems.map((item) => {
        const variation = findVariation(state.categories, item.categoryId, item.variationId);
        return {
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          variationId: item.variationId,
          variationName: item.variationName,
          quantity: item.quantity,
          unitCost: variation?.cost ?? null,
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
    const sales = Array.isArray(data.sales) ? data.sales : [];
    const ikrams = Array.isArray(data.ikrams) ? data.ikrams : [];
    const customCategories = Array.isArray(data.customCategories) ? data.customCategories : [];
    const variationMeta =
      data.variationMeta && typeof data.variationMeta === 'object' ? data.variationMeta : {};
    const theme = data.theme === 'dark' ? 'dark' : 'light';
    const categories = buildCategories(
      catalog.categories,
      stock,
      customCategories,
      variationMeta
    );

    set((state) => {
      persist({
        ...state,
        categories,
        sales,
        ikrams,
        _variationMeta: variationMeta,
        theme,
      });
      document.documentElement.classList.toggle('dark', theme === 'dark');
      return { categories, sales, ikrams, _variationMeta: variationMeta, theme };
    });
  },

  resetData: async () => {
    const catalog = await fetchCatalog();
    cachedCatalog = catalog;
    const categories = buildCategories(catalog.categories, {}, [], {});
    saveToStorage({
      stock: {},
      sales: [],
      ikrams: [],
      customCategories: [],
      variationMeta: {},
      theme: 'light',
    });
    document.documentElement.classList.toggle('dark', false);
    set({
      categories,
      sales: [],
      ikrams: [],
      _variationMeta: {},
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
