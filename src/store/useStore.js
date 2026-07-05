import { create } from 'zustand';
import { loadFromStorage, saveToStorage, DATA_VERSION } from '../utils/storage';
import { generateId } from '../utils/mockData';
import { getSession, saveSession, clearSession, validateLogin } from '../utils/auth';
import {
  fetchCatalog,
  mergeCatalogWithStock,
  extractStock,
  migrateStockFromLegacy,
} from '../utils/catalog';

function persist(state) {
  saveToStorage({
    stock: extractStock(state.categories),
    sales: state.sales,
    theme: state.theme,
  });
}

const useStore = create((set, get) => ({
  categories: [],
  sales: [],
  theme: 'light',
  catalogLoaded: false,
  ...hydrateAuth(),

  activeTab: 'inventory',

  setActiveTab: (tab) => set({ activeTab: tab }),

  initCatalog: async () => {
    const catalog = await fetchCatalog();
    const stored = loadFromStorage();

    let stock = stored?.stock ?? {};
    let sales = stored?.sales ?? [];
    const theme = stored?.theme ?? 'light';

    if (stored?.dataVersion !== DATA_VERSION && stored?.categories?.length) {
      stock = migrateStockFromLegacy(stored.categories, catalog.categories);
      sales = stored.sales ?? [];
    }

    const categories = mergeCatalogWithStock(catalog.categories, stock);

    saveToStorage({ stock, sales, theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ categories, sales, theme, catalogLoaded: true });
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

  initTheme: () => {
    const theme = get().theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

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

  completeSale: (cartItems) => {
    if (!cartItems.length) return { success: false, message: 'Sepet boş' };

    const state = get();
    for (const item of cartItems) {
      const category = state.categories.find((c) => c.id === item.categoryId);
      const variation = category?.variations.find((v) => v.id === item.variationId);
      if (!variation || variation.stock < item.quantity) {
        return {
          success: false,
          message: `${item.variationName} için yetersiz stok (mevcut: ${variation?.stock ?? 0})`,
        };
      }
    }

    const sale = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      items: cartItems.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        variationId: item.variationId,
        variationName: item.variationName,
        quantity: item.quantity,
      })),
    };

    set((state) => {
      const categories = state.categories.map((c) => ({
        ...c,
        variations: c.variations.map((v) => {
          const cartItem = cartItems.find(
            (ci) => ci.categoryId === c.id && ci.variationId === v.id
          );
          return cartItem ? { ...v, stock: v.stock - cartItem.quantity } : v;
        }),
      }));
      const sales = [...state.sales, sale];
      persist({ ...state, categories, sales });
      return { categories, sales };
    });

    return { success: true };
  },

  importData: async (data) => {
    const catalog = await fetchCatalog();
    const stock = data.stock ?? {};
    const sales = Array.isArray(data.sales) ? data.sales : [];
    const theme = data.theme === 'dark' ? 'dark' : 'light';
    const categories = mergeCatalogWithStock(catalog.categories, stock);

    set((state) => {
      persist({ ...state, categories, sales, theme });
      document.documentElement.classList.toggle('dark', theme === 'dark');
      return { categories, sales, theme };
    });
  },

  resetData: async () => {
    const catalog = await fetchCatalog();
    const categories = mergeCatalogWithStock(catalog.categories, {});
    saveToStorage({ stock: {}, sales: [], theme: 'light' });
    document.documentElement.classList.toggle('dark', false);
    set({ categories, sales: [], theme: 'light' });
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
