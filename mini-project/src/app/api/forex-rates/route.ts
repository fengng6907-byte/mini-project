import { NextResponse } from "next/server";

const EXCHANGE_RATE_URL = "https://api.exchangerate-api.com/v4/latest/USD";

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

function generateSimulatedRates() {
  return {
    USD: 1,
    MYR: 4.42 + (Math.random() - 0.5) * 0.05,
    SGD: 1.34 + (Math.random() - 0.5) * 0.02,
    EUR: 0.92 + (Math.random() - 0.5) * 0.01,
    GBP: 0.79 + (Math.random() - 0.5) * 0.01,
    timestamp: Date.now(),
  };
}

export async function GET() {
  try {
    const res = await fetch(EXCHANGE_RATE_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(generateSimulatedRates());
    }

    const data: ExchangeRateResponse = await res.json();

    return NextResponse.json({
      USD: 1,
      MYR: data.rates.MYR ?? 4.42,
      SGD: data.rates.SGD ?? 1.34,
      EUR: data.rates.EUR ?? 0.92,
      GBP: data.rates.GBP ?? 0.79,
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json(generateSimulatedRates());
  }
}
