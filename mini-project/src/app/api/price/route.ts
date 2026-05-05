import { NextResponse } from "next/server";

// Simulated XAU/USD price with realistic micro-fluctuations
let basePrice = 3320.0;
let lastUpdate = Date.now();

export function GET() {
  const now = Date.now();
  const elapsed = (now - lastUpdate) / 1000;
  // Random walk: ±0.3% per call, drift back to base
  const drift = (basePrice - 3320) * 0.001;
  basePrice += (Math.random() - 0.5) * 6 - drift;
  basePrice = Math.max(3100, Math.min(3600, basePrice));
  lastUpdate = now;

  return NextResponse.json({
    price: Math.round(basePrice * 100) / 100,
    change: Math.round((Math.random() - 0.5) * 20 * 100) / 100,
    changePct: Math.round((Math.random() - 0.5) * 0.6 * 1000) / 1000,
    timestamp: now,
    elapsed,
  });
}
