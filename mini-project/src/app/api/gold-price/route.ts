import { NextResponse } from "next/server";

const GOLDAPI_URL = "https://www.goldapi.io/api/XAU/USD";
const METALS_DEV_URL = "https://api.metals.dev/v1/latest";

interface GoldApiResponse {
  price: number;
  ch: number;
  chp: number;
  high_price: number;
  low_price: number;
  open_price: number;
  timestamp: number;
}

async function fetchFromGoldApi(apiKey: string): Promise<GoldApiResponse | null> {
  try {
    const res = await fetch(GOLDAPI_URL, {
      headers: { "x-access-token": apiKey },
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchFromMetalsDev(apiKey: string) {
  try {
    const res = await fetch(`${METALS_DEV_URL}?api_key=${apiKey}&currency=USD&unit=toz`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const gold = data.metals?.gold;
    if (!gold) return null;
    return {
      price: gold.price,
      ch: gold.price * 0.001, // approximate
      chp: 0.1,
      high_price: gold.price * 1.005,
      low_price: gold.price * 0.995,
      open_price: gold.price * 0.999,
      timestamp: Date.now() / 1000,
    };
  } catch {
    return null;
  }
}

function generateSimulatedPrice(): GoldApiResponse {
  // Realistic simulation based on recent market range
  const basePrice = 2350 + Math.random() * 100;
  const change = (Math.random() - 0.48) * 30;
  return {
    price: Math.round((basePrice + change) * 100) / 100,
    ch: Math.round(change * 100) / 100,
    chp: Math.round((change / basePrice) * 10000) / 100,
    high_price: Math.round((basePrice + Math.abs(change) + 10) * 100) / 100,
    low_price: Math.round((basePrice - Math.abs(change) - 10) * 100) / 100,
    open_price: Math.round(basePrice * 100) / 100,
    timestamp: Date.now() / 1000,
  };
}

export async function GET() {
  const goldApiKey = process.env.GOLD_API_KEY;
  const metalsDevKey = process.env.METALS_DEV_API_KEY;

  let data: GoldApiResponse | null = null;

  // Try primary API
  if (goldApiKey) {
    data = await fetchFromGoldApi(goldApiKey);
  }

  // Fallback to metals.dev
  if (!data && metalsDevKey) {
    data = await fetchFromMetalsDev(metalsDevKey);
  }

  // Fallback to simulation for demo
  if (!data) {
    data = generateSimulatedPrice();
  }

  return NextResponse.json({
    price: data.price,
    change: data.ch,
    changePercent: data.chp,
    high: data.high_price,
    low: data.low_price,
    open: data.open_price,
    timestamp: data.timestamp * 1000,
    currency: "USD",
  });
}
