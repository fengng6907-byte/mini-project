import { NextResponse } from "next/server";
import type {
  SignalLabel,
  SignalDirection,
  IndicatorValues,
  ChartBar,
  Timeframe,
  ScoreBreakdown,
  SignalResponse,
} from "@/types";

// ── Config ────────────────────────────────────────────────────────────────────
const PYTHON_BACKEND = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

// ── Cache ─────────────────────────────────────────────────────────────────────
const cache = new Map<string, { data: SignalResponse; ts: number }>();

// ── Math helpers ──────────────────────────────────────────────────────────────
function ema(values: number[], span: number): number[] {
  const k = 2 / (span + 1);
  const result: number[] = new Array(values.length).fill(0);
  result[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    result[i] = values[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

function macd(
  close: number[],
  fast = 12,
  slow = 26,
  signal = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const emaFast = ema(close, fast);
  const emaSlow = ema(close, slow);
  const macdLine = emaFast.map((v, i) => v - emaSlow[i]);
  const signalLine = ema(macdLine, signal);
  const hist = macdLine.map((v, i) => v - signalLine[i]);
  return { macd: macdLine, signal: signalLine, histogram: hist };
}

function rsi(close: number[], period = 14): number[] {
  const result: number[] = new Array(close.length).fill(50);
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const d = close[i] - close[i - 1];
    if (d >= 0) gains += d;
    else losses -= d;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  result[period] = 100 - 100 / (1 + avgGain / (avgLoss || 0.0001));
  for (let i = period + 1; i < close.length; i++) {
    const d = close[i] - close[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
    result[i] = 100 - 100 / (1 + avgGain / (avgLoss || 0.0001));
  }
  return result;
}

// ── Simulation ────────────────────────────────────────────────────────────────
function simulateOHLC(length: number, timeframe: Timeframe): ChartBar[] {
  const hoursPerBar: Record<Timeframe, number> = { "1H": 1, "4H": 4, "1D": 24 };
  const bars: ChartBar[] = [];
  let price = 3200;
  const now = Date.now();
  const msPerBar = hoursPerBar[timeframe] * 3600 * 1000;

  // Seeded random for reproducibility within a session
  let seed = 12345;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  const closes: number[] = [];
  const opens: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  const times: number[] = [];

  for (let i = 0; i < length; i++) {
    const drift = (rand() - 0.488) * 0.6;
    price = Math.max(price * (1 + drift / 100), 1000);
    const spread = price * (0.001 + rand() * 0.003);
    const o = price + (rand() - 0.5) * spread * 0.5;
    const c = price + (rand() - 0.5) * spread * 0.5;
    const h = Math.max(o, c) + rand() * spread;
    const l = Math.min(o, c) - rand() * spread;
    const t = Math.floor((now - (length - i) * msPerBar) / 1000);
    opens.push(o);
    highs.push(h);
    lows.push(l);
    closes.push(c);
    times.push(t);
  }

  const macdData = macd(closes);
  const rsiData = rsi(closes);
  const ema50Data = ema(closes, 50);

  for (let i = 0; i < length; i++) {
    bars.push({
      time: times[i],
      open: round2(opens[i]),
      high: round2(highs[i]),
      low: round2(lows[i]),
      close: round2(closes[i]),
      macd: round4(macdData.macd[i]),
      signal_line: round4(macdData.signal[i]),
      histogram: round4(macdData.histogram[i]),
      rsi: round2(rsiData[i]),
      ema50: round2(ema50Data[i]),
    });
  }

  return bars;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round4 = (n: number) => Math.round(n * 10000) / 10000;

// ── Fetch real OHLC via Twelve Data ──────────────────────────────────────────
async function fetchTwelveData(
  key: string,
  timeframe: Timeframe,
  length: number
): Promise<ChartBar[] | null> {
  const intervalMap: Record<Timeframe, string> = { "1H": "1h", "4H": "4h", "1D": "1day" };
  const url = `https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=${intervalMap[timeframe]}&outputsize=${length}&apikey=${key}`;
  try {
    const r = await fetch(url, { next: { revalidate: 300 } });
    if (!r.ok) return null;
    const data = await r.json();
    const values: Record<string, string>[] = data.values;
    if (!values?.length) return null;

    const closes = values.map((v) => parseFloat(v.close)).reverse();
    const macdData = macd(closes);
    const rsiData = rsi(closes);
    const ema50Data = ema(closes, 50);

    return values
      .slice()
      .reverse()
      .map((v, i) => ({
        time: Math.floor(new Date(v.datetime).getTime() / 1000),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        macd: round4(macdData.macd[i]),
        signal_line: round4(macdData.signal[i]),
        histogram: round4(macdData.histogram[i]),
        rsi: round2(rsiData[i]),
        ema50: round2(ema50Data[i]),
      }));
  } catch {
    return null;
  }
}

// ── Signal logic ──────────────────────────────────────────────────────────────
function computeSignal(
  bars: ChartBar[]
): { signal: SignalLabel; confidence: number; direction: SignalDirection; reasons: string[]; breakdown: ScoreBreakdown; indicators: IndicatorValues } {
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const closes = bars.map((b) => b.close);
  const ema200Data = ema(closes, 200);
  const ema200 = ema200Data[ema200Data.length - 1];

  let buyScore = 0;
  let sellScore = 0;
  const reasons: string[] = [];
  const breakdown: ScoreBreakdown = {
    macd_crossover: 0,
    rsi_confirmation: 0,
    trend_alignment: 0,
    momentum: 0,
    ml_boost: 0,
  };

  // MACD crossover (30 pts)
  const bullishCross = last.macd > last.signal_line && prev.macd <= prev.signal_line;
  const bearishCross = last.macd < last.signal_line && prev.macd >= prev.signal_line;

  if (bullishCross) {
    buyScore += 30; breakdown.macd_crossover = 30;
    reasons.push("MACD bullish crossover");
  } else if (last.macd > last.signal_line) {
    buyScore += 15; breakdown.macd_crossover = 15;
    reasons.push("MACD above signal line");
  } else if (bearishCross) {
    sellScore += 30; breakdown.macd_crossover = -30;
    reasons.push("MACD bearish crossover");
  } else {
    sellScore += 15; breakdown.macd_crossover = -15;
    reasons.push("MACD below signal line");
  }

  // RSI (20 pts)
  const rsiVal = last.rsi;
  if (rsiVal >= 40 && rsiVal <= 60) {
    buyScore += 20; breakdown.rsi_confirmation = 20;
    reasons.push(`RSI neutral zone (${rsiVal.toFixed(1)}) — ideal entry`);
  } else if (rsiVal < 35) {
    buyScore += 20; breakdown.rsi_confirmation = 20;
    reasons.push(`RSI oversold (${rsiVal.toFixed(1)}) — reversal potential`);
  } else if (rsiVal > 70) {
    sellScore += 20; breakdown.rsi_confirmation = -20;
    reasons.push(`RSI overbought (${rsiVal.toFixed(1)})`);
  } else if (rsiVal > 60) {
    sellScore += 10; breakdown.rsi_confirmation = -10;
    reasons.push(`RSI elevated (${rsiVal.toFixed(1)})`);
  }

  // EMA trend (30 pts)
  const aboveEma50 = last.close > last.ema50;
  const goldenCross = last.ema50 > ema200;

  if (aboveEma50) {
    buyScore += 15; breakdown.trend_alignment += 15;
    reasons.push("Price above EMA50");
  } else {
    sellScore += 15; breakdown.trend_alignment -= 15;
    reasons.push("Price below EMA50");
  }
  if (goldenCross) {
    buyScore += 15; breakdown.trend_alignment += 15;
    reasons.push("Golden cross (EMA50 > EMA200)");
  } else {
    sellScore += 15; breakdown.trend_alignment -= 15;
    reasons.push("Death cross (EMA50 < EMA200)");
  }

  // Momentum (20 pts)
  const histPositive = last.histogram > 0;
  const histGrowing = last.histogram > prev.histogram;

  if (histPositive && histGrowing) {
    buyScore += 20; breakdown.momentum = 20;
    reasons.push("Histogram expanding — bullish momentum");
  } else if (histPositive) {
    buyScore += 8; breakdown.momentum = 8;
    reasons.push("Histogram positive but shrinking");
  } else if (!histPositive && !histGrowing) {
    sellScore += 20; breakdown.momentum = -20;
    reasons.push("Histogram expanding negatively — bearish momentum");
  } else {
    sellScore += 8; breakdown.momentum = -8;
    reasons.push("Histogram negative but recovering");
  }

  // Sideways override
  if (Math.abs(last.histogram) < 0.05 && rsiVal > 45 && rsiVal < 55 && Math.abs(buyScore - sellScore) < 20) {
    reasons.push("Indecisive price action — awaiting breakout");
    return {
      signal: "No Trade",
      confidence: 40,
      direction: "neutral",
      reasons,
      breakdown,
      indicators: {
        macd: last.macd, signal_line: last.signal_line, histogram: last.histogram,
        rsi: last.rsi, ema50: last.ema50, ema200: round2(ema200), current_price: last.close,
      },
    };
  }

  const net = buyScore - sellScore;
  let direction: SignalDirection;
  let signal: SignalLabel;
  let confidence: number;

  if (net > 0) {
    direction = "buy";
    confidence = Math.min(buyScore, 100);
    signal = confidence >= 70 ? "Strong Buy" : "Weak Buy";
  } else if (net < 0) {
    direction = "sell";
    confidence = Math.min(sellScore, 100);
    signal = confidence >= 70 ? "Strong Sell" : "Weak Sell";
  } else {
    direction = "neutral";
    confidence = 50;
    signal = "No Trade";
  }

  return {
    signal,
    confidence,
    direction,
    reasons,
    breakdown,
    indicators: {
      macd: last.macd, signal_line: last.signal_line, histogram: last.histogram,
      rsi: last.rsi, ema50: last.ema50, ema200: round2(ema200), current_price: last.close,
    },
  };
}

// ── Try Python backend first ──────────────────────────────────────────────────
async function fetchFromPython(timeframe: Timeframe): Promise<SignalResponse | null> {
  try {
    const r = await fetch(`${PYTHON_BACKEND}/api/signal?timeframe=${timeframe}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = (searchParams.get("timeframe") ?? "1H") as Timeframe;
  const cacheKey = timeframe;

  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return NextResponse.json({ ...hit.data, cached: true });
  }

  // Try Python backend (full ML)
  const pythonResult = await fetchFromPython(timeframe);
  if (pythonResult) {
    cache.set(cacheKey, { data: pythonResult, ts: Date.now() });
    return NextResponse.json(pythonResult);
  }

  // TypeScript fallback — runs entirely in Next.js
  const tdKey = process.env.TWELVE_DATA_API_KEY ?? "";
  let bars: ChartBar[] | null = null;

  if (tdKey) {
    bars = await fetchTwelveData(tdKey, timeframe, 200);
  }
  if (!bars) {
    bars = simulateOHLC(200, timeframe);
  }

  const { signal, confidence, direction, reasons, breakdown, indicators } = computeSignal(bars);

  const response: SignalResponse = {
    price: bars[bars.length - 1].close,
    currency: "USD",
    timeframe,
    timestamp: new Date().toISOString(),
    signal,
    confidence,
    direction,
    reasons,
    score_breakdown: breakdown,
    indicators,
    ml: { available: false, probability_up: 0.5 },
    chart: bars.slice(-100),
    cached: false,
  };

  cache.set(cacheKey, { data: response, ts: Date.now() });
  return NextResponse.json(response);
}
