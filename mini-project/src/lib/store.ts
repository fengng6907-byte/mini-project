import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GoldPrice,
  ForexRates,
  PriceAlert,
  PortfolioHolding,
  ChatMessage,
  GoldInsight,
  NewsItem,
} from "@/types";

interface GoldStore {
  // Market data
  goldPrice: GoldPrice | null;
  forexRates: ForexRates | null;
  news: NewsItem[];
  insight: GoldInsight | null;
  isLoading: boolean;
  lastUpdated: number | null;

  // Price alerts
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, "id" | "createdAt" | "active">) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;

  // Portfolio
  holdings: PortfolioHolding[];
  addHolding: (holding: Omit<PortfolioHolding, "id">) => void;
  removeHolding: (id: string) => void;
  updateHolding: (id: string, holding: Partial<PortfolioHolding>) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChat: () => void;

  // Actions
  setGoldPrice: (price: GoldPrice) => void;
  setForexRates: (rates: ForexRates) => void;
  setNews: (news: NewsItem[]) => void;
  setInsight: (insight: GoldInsight) => void;
  setLoading: (loading: boolean) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useGoldStore = create<GoldStore>()(
  persist(
    (set) => ({
      // Market data
      goldPrice: null,
      forexRates: null,
      news: [],
      insight: null,
      isLoading: false,
      lastUpdated: null,

      // Price alerts
      alerts: [],
      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            ...state.alerts,
            { ...alert, id: generateId(), createdAt: new Date().toISOString(), active: true },
          ],
        })),
      removeAlert: (id) =>
        set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
      toggleAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
        })),

      // Portfolio
      holdings: [],
      addHolding: (holding) =>
        set((state) => ({
          holdings: [...state.holdings, { ...holding, id: generateId() }],
        })),
      removeHolding: (id) =>
        set((state) => ({ holdings: state.holdings.filter((h) => h.id !== id) })),
      updateHolding: (id, updates) =>
        set((state) => ({
          holdings: state.holdings.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),

      // Chat
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            { ...message, id: generateId(), timestamp: Date.now() },
          ],
        })),
      clearChat: () => set({ chatMessages: [] }),

      // Actions
      setGoldPrice: (price) => set({ goldPrice: price, lastUpdated: Date.now() }),
      setForexRates: (rates) => set({ forexRates: rates }),
      setNews: (news) => set({ news }),
      setInsight: (insight) => set({ insight }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "gold-eyes-storage",
      partialize: (state) => ({
        alerts: state.alerts,
        holdings: state.holdings,
        chatMessages: state.chatMessages,
      }),
    }
  )
);
