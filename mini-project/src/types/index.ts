export interface GoldPrice {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
  currency: string;
}

export interface ForexRates {
  USD: number;
  MYR: number;
  SGD: number;
  EUR: number;
  GBP: number;
  timestamp: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: "bullish" | "bearish" | "neutral";
}

export interface GoldInsight {
  outlook: string;
  sentiment: "bullish" | "bearish" | "neutral";
  drivers: {
    inflation: string;
    usdStrength: string;
    interestRates: string;
  };
  summary: string;
  date: string;
}

export interface PriceAlert {
  id: string;
  targetPrice: number;
  direction: "above" | "below";
  currency: string;
  active: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface RetailStore {
  id: string;
  name: string;
  country: "Malaysia" | "Singapore";
  locations: StoreLocation[];
  website: string;
  spreadEstimate: string;
  logo?: string;
}

export interface StoreLocation {
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
}

export interface PortfolioHolding {
  id: string;
  name: string;
  weight: number;
  unit: "g" | "oz" | "kg";
  purity: number;
  buyPrice: number;
  buyCurrency: string;
  buyDate: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type Currency = "USD" | "MYR" | "SGD" | "EUR" | "GBP";
export type WeightUnit = "g" | "oz" | "kg";
export type Purity = 999 | 916 | 750;
export type Timeframe = "1H" | "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";
export type Sentiment = "bullish" | "bearish" | "neutral";
