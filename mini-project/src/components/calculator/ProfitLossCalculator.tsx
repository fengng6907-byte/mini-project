"use client";

import { useState, useMemo } from "react";
import { useGoldStore } from "@/lib/store";
import { CURRENCIES } from "@/lib/constants";
import { formatCurrency, formatNumber, formatPercent, calculateProfitLoss } from "@/lib/utils";
import type { Currency } from "@/types";

export default function ProfitLossCalculator() {
  const goldPrice = useGoldStore((s) => s.goldPrice);
  const forexRates = useGoldStore((s) => s.forexRates);

  const [buyPrice, setBuyPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [quantity, setQuantity] = useState("1");

  const result = useMemo(() => {
    if (
      !goldPrice ||
      !forexRates ||
      !buyPrice ||
      isNaN(Number(buyPrice)) ||
      !quantity ||
      isNaN(Number(quantity))
    ) {
      return null;
    }

    const currentPriceInCurrency = goldPrice.price * forexRates[currency];
    const buyPriceNum = Number(buyPrice);
    const qty = Number(quantity);

    const { profit: profitPerOz, percentage } = calculateProfitLoss(buyPriceNum, currentPriceInCurrency);

    return {
      currentPrice: currentPriceInCurrency,
      profitPerOz,
      totalProfit: profitPerOz * qty,
      percentage,
      quantity: qty,
    };
  }, [goldPrice, forexRates, currency, buyPrice, quantity]);

  const isProfit = result ? result.totalProfit >= 0 : true;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Calculate your profit or loss on gold trades.</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1.5">Buy Price (per oz)</label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="e.g. 2200"
          />
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

      <div>
        <label className="block text-xs text-muted mb-1.5">Quantity (troy ounces)</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors"
          placeholder="e.g. 1"
        />
      </div>

      {result && (
        <div
          className={`p-4 rounded-xl border ${
            isProfit ? "bg-success/5 border-success/20" : "bg-danger/5 border-danger/20"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted">Total P&L</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isProfit ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              }`}
            >
              {formatPercent(result.percentage)}
            </span>
          </div>
          <p className={`text-3xl font-bold ${isProfit ? "text-success" : "text-danger"}`}>
            {isProfit ? "+" : ""}
            {formatCurrency(result.totalProfit, currency)}
          </p>

          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between py-1.5 border-t border-border/50">
              <span className="text-muted">Current Price:</span>
              <span className="text-foreground font-medium">
                {formatCurrency(result.currentPrice, currency)}/oz
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-t border-border/50">
              <span className="text-muted">P&L per oz:</span>
              <span className={`font-medium ${isProfit ? "text-success" : "text-danger"}`}>
                {isProfit ? "+" : ""}
                {formatCurrency(result.profitPerOz, currency)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-t border-border/50">
              <span className="text-muted">Quantity:</span>
              <span className="text-foreground font-medium">{formatNumber(result.quantity, 2)} oz</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
