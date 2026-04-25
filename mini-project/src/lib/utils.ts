import { TROY_OUNCE_IN_GRAMS } from "./constants";
import type { Currency, WeightUnit, Purity, ForexRates } from "@/types";

export function formatCurrency(value: number, currency: Currency = "USD"): string {
  const symbols: Record<Currency, string> = {
    USD: "$",
    MYR: "RM",
    SGD: "S$",
    EUR: "\u20AC",
    GBP: "\u00A3",
  };
  return `${symbols[currency]}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  const toGrams: Record<WeightUnit, number> = {
    g: 1,
    oz: TROY_OUNCE_IN_GRAMS,
    kg: 1000,
  };
  const grams = value * toGrams[from];
  return grams / toGrams[to];
}

export function calculateGoldValue(
  weightInGrams: number,
  purity: Purity,
  pricePerOzUSD: number,
  currency: Currency,
  forexRates: ForexRates
): number {
  const purityFactor = purity / 1000;
  const pricePerGramUSD = pricePerOzUSD / TROY_OUNCE_IN_GRAMS;
  const valueUSD = weightInGrams * purityFactor * pricePerGramUSD;
  return valueUSD * forexRates[currency];
}

export function calculateProfitLoss(
  buyPrice: number,
  currentPrice: number
): { profit: number; percentage: number } {
  const profit = currentPrice - buyPrice;
  const percentage = buyPrice > 0 ? (profit / buyPrice) * 100 : 0;
  return { profit, percentage };
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ForexRates
): number {
  const amountInUSD = amount / rates[from];
  return amountInUSD * rates[to];
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
