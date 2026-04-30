"use client";

import { useState, useMemo } from "react";
import { useGoldStore } from "@/lib/store";
import { WEIGHT_UNITS, TROY_OUNCE_IN_GRAMS } from "@/lib/constants";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { WeightUnit } from "@/types";

export default function ProfitLossCalculator() {
  const goldPrice = useGoldStore((s) => s.goldPrice);
  const [buyPrice, setBuyPrice] = useState("2000");
  const [weight, setWeight] = useState("1");
  const [unit, setUnit] = useState<WeightUnit>("oz");

  const result = useMemo(() => {
    const buy = Number(buyPrice);
    const qty = Number(weight);
    if (!buy || !qty || isNaN(buy) || isNaN(qty)) return null;

    const toGrams: Record<WeightUnit, number> = { g: 1, oz: TROY_OUNCE_IN_GRAMS, kg: 1000 };
    const grams = qty * toGrams[unit];
    const ozs = grams / TROY_OUNCE_IN_GRAMS;
    const current = goldPrice?.price ?? buy;

    const costBasis = buy * ozs;
    const currentValue = current * ozs;
    const pnl = currentValue - costBasis;
    const pct = (pnl / costBasis) * 100;

    return { costBasis, currentValue, pnl, pct, currentPrice: current };
  }, [buyPrice, weight, unit, goldPrice]);

  const input = "w-full rounded-xl bg-surface-light border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50";
  const select = "w-full rounded-xl bg-surface-light border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-muted">Buy Price (USD/oz)</label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className={input}
            min="0"
            placeholder="2000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted">Quantity</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={input}
            min="0"
            step="0.01"
            placeholder="1"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-muted">Unit</label>
        <select value={unit} onChange={(e) => setUnit(e.target.value as WeightUnit)} className={select}>
          {WEIGHT_UNITS.map((u) => <option key={u.code} value={u.code}>{u.name} ({u.code})</option>)}
        </select>
      </div>
      {result !== null && (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 border ${result.pnl >= 0 ? "bg-success/10 border-success/30" : "bg-danger/10 border-danger/30"}`}>
            <p className="text-xs text-muted mb-1">Profit / Loss</p>
            <p className={`text-2xl font-bold ${result.pnl >= 0 ? "text-success" : "text-danger"}`}>
              {result.pnl >= 0 ? "+" : ""}{formatCurrency(result.pnl)}
            </p>
            <p className={`text-sm ${result.pnl >= 0 ? "text-success" : "text-danger"}`}>
              {formatPercent(result.pct)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-surface-light border border-border p-3">
              <p className="text-xs text-muted mb-0.5">Cost Basis</p>
              <p className="font-semibold">{formatCurrency(result.costBasis)}</p>
            </div>
            <div className="rounded-lg bg-surface-light border border-border p-3">
              <p className="text-xs text-muted mb-0.5">Current Value</p>
              <p className="font-semibold">{formatCurrency(result.currentValue)}</p>
            </div>
          </div>
          <p className="text-xs text-center text-muted">
            At current price: {formatCurrency(result.currentPrice)}/oz
            {!goldPrice && " (loading live price…)"}
          </p>
        </div>
      )}
    </div>
  );
}
