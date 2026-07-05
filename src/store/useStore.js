import { create } from 'zustand';
import { loadFromStorage, saveToStorage, DATA_VERSION } from '../utils/storage';
import { getInitialData, generateId } from '../utils/mockData';
import { getSession, saveSession, clearSession, validateLogin } from '../utils/auth';

function hydrate() {
  const stored = loadFromStorage();
  if (stored?.categories?.length) {
    if (stored.dataVersion !== DATA_VERSION) {
      const migrated = { categories: stored.categories, sales: [], theme: stored.theme ?? 'light' };
      saveToStorage(migrated);
      return migrated;
    }
    return {
      categories: stored.categories,
      sales: stored.sales ?? [],
      theme: stored.theme ?? 'light',
    };
  }
  return getInitialData();
}

function hydrateAuth() {
  const session = getSession();
  return {
    isAuthenticated: !!session,
    username: session?.username ?? null,
  };
}

const useStore = create((set, get) => ({
  ...hydrate(),
  ...hydrateAuth(),
  activeTab: 'inventory',

  setActiveTab: (tab) => set({ activeTab: tab }),

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
      const next = { ...state, theme };
      saveToStorage({ categories: next.categories, sales: next.sales, theme: next.theme });
      return { theme };
    }),

  initTheme: () => {
    const theme = get().theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  persist: () => {
    const { categories, sales, theme } = get();
    saveToStorage({ categories, sales, theme });
  },

  addCategory: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    set((state) => {
      const categories = [...state.categories, { id: generateId(), name: trimmed, variations: [] }];
      saveToStorage({ categories, sales: state.sales, theme: state.theme });
      return { categories };
    });
    return true;
  },

  deleteCategory: (categoryId) => {
    set((state) => {
      const categories = state.categories.filter((c) => c.id !== categoryId);
      saveToStorage({ categories, sales: state.sales, theme: state.theme });
      return { categories };
    });
  },

  addVariation: (categoryId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              variations: [...c.variations, { id: generateId(), name: trimmed, stock: 0 }],
            }
          : c
      );
      saveToStorage({ categories, sales: state.sales, theme: state.theme });
      return { categories };
    });
    return true;
  },

  deleteVariation: (categoryId, variationId) => {
    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === categoryId
          ? { ...c, variations: c.variations.filter((v) => v.id !== variationId) }
          : c
      );
      saveToStorage({ categories, sales: state.sales, theme: state.theme });
      return { categories };
    });
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
      saveToStorage({ categories, sales: state.sales, theme: state.theme });
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
      saveToStorage({ categories, sales, theme: state.theme });
      return { categories, sales };
    });

    return { success: true };
  },

  importData: (data) => {
    set((state) => {
      saveToStorage({ categories: data.categories, sales: data.sales, theme: data.theme });
      document.documentElement.classList.toggle('dark', data.theme === 'dark');
      return {
        categories: data.categories,
        sales: data.sales,
        theme: data.theme,
      };
    });
  },

  resetToMock: () => {
    const data = getInitialData();
    saveToStorage(data);
    set({ categories: data.categories, sales: data.sales, theme: data.theme });
    document.documentElement.classList.toggle('dark', false);
  },
}));

export default useStore;
