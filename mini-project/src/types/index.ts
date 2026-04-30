// ── Market Data ────────────────────────────────────────────────────────────────
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
}

export type Sentiment = "bullish" | "bearish" | "neutral";

export interface NewsItem {
  id?: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
  sentiment?: Sentiment;
}

export interface GoldInsight {
  summary: string;
  sentiment: Sentiment;
  /** Short market outlook paragraph */
  outlook?: string;
  /** Key macro drivers */
  drivers?: {
    inflation: string;
    usdStrength: string;
    interestRates: string;
  };
  date?: string;
  updatedAt?: string;
}

// ── Alerts ────────────────────────────────────────────────────────────────────
export interface PriceAlert {
  id: string;
  targetPrice: number;
  direction: "above" | "below";
  active: boolean;
  createdAt: string;
  email?: string;
}

// ── Portfolio ─────────────────────────────────────────────────────────────────
export interface PortfolioHolding {
  id: string;
  label: string;
  weightGrams: number;
  purity: 999 | 916 | 750;
  buyPriceUSD: number;
  buyDate: string;
  currency: Currency;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// ── Retail ────────────────────────────────────────────────────────────────────
export interface RetailStore {
  id: string;
  name: string;
  country: string;
  website: string;
  spreadEstimate: string;
  locations: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  }[];
}

// ── Utility ───────────────────────────────────────────────────────────────────
export type Currency = "USD" | "MYR" | "SGD" | "EUR" | "GBP";
export type WeightUnit = "g" | "oz" | "kg";
export type Purity = 999 | 916 | 750;

// ── Signal / AI ───────────────────────────────────────────────────────────────
export type SignalLabel =
  | "Strong Buy"
  | "Weak Buy"
  | "No Trade"
  | "Weak Sell"
  | "Strong Sell";

export type SignalDirection = "buy" | "sell" | "neutral";

export type Timeframe = "1H" | "4H" | "1D";

export interface IndicatorValues {
  macd: number;
  signal_line: number;
  histogram: number;
  rsi: number;
  ema50: number;
  ema200: number;
  current_price: number;
}

export interface MLInfo {
  available: boolean;
  probability_up: number;
  boost_pts?: number;
}

export interface ScoreBreakdown {
  macd_crossover: number;
  rsi_confirmation: number;
  trend_alignment: number;
  momentum: number;
  ml_boost: number;
}

export interface ChartBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  macd: number;
  signal_line: number;
  histogram: number;
  rsi: number;
  ema50: number;
}

export interface SignalResponse {
  price: number;
  currency: string;
  timeframe: Timeframe;
  timestamp: string;
  signal: SignalLabel;
  confidence: number;
  direction: SignalDirection;
  reasons: string[];
  score_breakdown: ScoreBreakdown;
  indicators: IndicatorValues;
  ml: MLInfo;
  chart: ChartBar[];
  cached: boolean;
}
