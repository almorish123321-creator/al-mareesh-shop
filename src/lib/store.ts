import { create } from 'zustand';

export type View = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'admin' | 'auth' | 'orders' | 'wishlist' | 'about' | 'contact';

interface AppState {
  view: View;
  setView: (view: View) => void;
  selectedProductId: string | null;
  setSelectedProduct: (id: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (slug: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  user: { id: string; email: string; name: string; role: string } | null;
  setUser: (user: { id: string; email: string; name: string; role: string } | null) => void;
  cart: any[];
  setCart: (items: any[]) => void;
  cartCount: number;
  updateCartCount: () => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'home',
  setView: (view) => set({ view }),
  selectedProductId: null,
  setSelectedProduct: (id) => set({ selectedProductId: id }),
  selectedCategory: null,
  setSelectedCategory: (slug) => set({ selectedCategory: slug }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  user: null,
  setUser: (user) => set({ user }),
  cart: [],
  setCart: (items) => set({ cart: items, cartCount: items.reduce((sum, i) => sum + i.quantity, 0) }),
  cartCount: 0,
  updateCartCount: () => set((state) => ({ cartCount: state.cart.reduce((sum, i) => sum + i.quantity, 0) })),
  adminTab: 'dashboard',
  setAdminTab: (tab) => set({ adminTab: tab }),
  showAuthModal: false,
  setShowAuthModal: (show) => set({ showAuthModal: show }),
  authMode: 'login',
  setAuthMode: (mode) => set({ authMode: mode }),
  notification: null,
  showNotification: (message, type) => set({ notification: { message, type } }),
  clearNotification: () => set({ notification: null }),
}));
