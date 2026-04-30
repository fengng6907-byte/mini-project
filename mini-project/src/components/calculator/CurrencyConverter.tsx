"use client";

import { useState, useMemo } from "react";
import { useGoldStore } from "@/lib/store";
import { CURRENCIES } from "@/lib/constants";
import { convertCurrency, formatNumber } from "@/lib/utils";
import type { Currency } from "@/types";

export default function CurrencyConverter() {
  const forexRates = useGoldStore((s) => s.forexRates);
  const [amount, setAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState<Currency>("USD");
  const [toCurrency, setToCurrency] = useState<Currency>("MYR");

  const result = useMemo(() => {
    if (!forexRates || !amount || isNaN(Number(amount))) return null;
    return convertCurrency(Number(amount), fromCurrency, toCurrency, forexRates);
  }, [amount, fromCurrency, toCurrency, forexRates]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Convert between currencies at live exchange rates.</p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-muted mb-1.5">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="Enter amount"
          />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div>
            <label className="block text-xs text-muted mb-1.5">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as Currency)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={swap}
            className="mb-0.5 p-2 rounded-lg bg-surface-light hover:bg-surface-hover transition-colors text-muted hover:text-gold"
            aria-label="Swap currencies"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          <div>
            <label className="block text-xs text-muted mb-1.5">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as Currency)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {result !== null && (
        <div className="mt-4 p-4 rounded-xl bg-gold/5 border border-gold/20">
          <p className="text-xs text-muted mb-1">Converted Amount</p>
          <p className="text-2xl font-bold text-gold">
            {CURRENCIES.find((c) => c.code === toCurrency)?.symbol}
            {formatNumber(result)}
          </p>
          <p className="text-xs text-muted mt-1">
            1 {fromCurrency} ={" "}
            {forexRates
              ? formatNumber(convertCurrency(1, fromCurrency, toCurrency, forexRates), 4)
              : "—"}{" "}
            {toCurrency}
          </p>
        </div>
      )}
    </div>
  );
}
