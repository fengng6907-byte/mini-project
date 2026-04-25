"use client";

import { useState, useMemo } from "react";
import { useGoldStore } from "@/lib/store";
import { CURRENCIES, GOLD_PURITIES, WEIGHT_UNITS, TROY_OUNCE_IN_GRAMS } from "@/lib/constants";
import { formatCurrency, formatNumber, convertWeight } from "@/lib/utils";
import type { Currency, WeightUnit, Purity } from "@/types";

export default function GoldValueCalculator() {
  const goldPrice = useGoldStore((s) => s.goldPrice);
  const forexRates = useGoldStore((s) => s.forexRates);

  const [weight, setWeight] = useState("10");
  const [unit, setUnit] = useState<WeightUnit>("g");
  const [purity, setPurity] = useState<Purity>(999);
  const [currency, setCurrency] = useState<Currency>("USD");

  const result = useMemo(() => {
    if (!goldPrice || !forexRates || !weight || isNaN(Number(weight))) return null;

    const weightInGrams = convertWeight(Number(weight), unit, "g");
    const purityFactor = purity / 1000;
    const pricePerGramUSD = goldPrice.price / TROY_OUNCE_IN_GRAMS;
    const valueUSD = weightInGrams * purityFactor * pricePerGramUSD;
    const value = valueUSD * forexRates[currency];

    return {
      value,
      weightInGrams,
      pricePerGram: pricePerGramUSD * forexRates[currency],
      purityFactor,
    };
  }, [goldPrice, forexRates, weight, unit, purity, currency]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Calculate the real-time value of your gold.</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1.5">Weight</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="Enter weight"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as WeightUnit)}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
          >
            {WEIGHT_UNITS.map((u) => (
              <option key={u.code} value={u.code}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1.5">Purity</label>
          <select
            value={purity}
            onChange={(e) => setPurity(Number(e.target.value) as Purity)}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
          >
            {GOLD_PURITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label} — {p.description}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-gold/10 to-gold-dark/5 border border-gold/20">
          <p className="text-xs text-muted mb-1">Estimated Value</p>
          <p className="text-3xl font-bold text-gold">
            {formatCurrency(result.value, currency)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
            <div className="flex justify-between p-2 bg-background/50 rounded-lg">
              <span>Weight (g):</span>
              <span className="text-foreground font-medium">{formatNumber(result.weightInGrams, 2)}g</span>
            </div>
            <div className="flex justify-between p-2 bg-background/50 rounded-lg">
              <span>Price/g:</span>
              <span className="text-foreground font-medium">
                {formatCurrency(result.pricePerGram, currency)}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-background/50 rounded-lg">
              <span>Purity:</span>
              <span className="text-foreground font-medium">{(result.purityFactor * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between p-2 bg-background/50 rounded-lg">
              <span>Spot:</span>
              <span className="text-foreground font-medium">
                {goldPrice ? formatCurrency(goldPrice.price) : "—"}/oz
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
