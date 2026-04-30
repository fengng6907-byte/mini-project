"use client";

import { useState, useMemo } from "react";
import { useGoldStore } from "@/lib/store";
import { CURRENCIES } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { Currency } from "@/types";

export default function CurrencyConverter() {
  const forexRates = useGoldStore((s) => s.forexRates);
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState<Currency>("USD");
  const [to, setTo] = useState<Currency>("MYR");

  const result = useMemo(() => {
    if (!forexRates || !amount || isNaN(Number(amount))) return null;
    const amountInUSD = Number(amount) / forexRates[from];
    return amountInUSD * forexRates[to];
  }, [forexRates, amount, from, to]);

  const select = "w-full rounded-xl bg-surface-light border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50";
  const input = "w-full rounded-xl bg-surface-light border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-muted">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={input}
          min="0"
          placeholder="1000"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-muted">From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value as Currency)} className={select}>
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted">To</label>
          <select value={to} onChange={(e) => setTo(e.target.value as Currency)} className={select}>
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
          </select>
        </div>
      </div>
      {result !== null && (
        <div className="rounded-xl bg-gold/10 border border-gold/20 p-4 text-center">
          <p className="text-xs text-muted mb-1">{amount} {from} =</p>
          <p className="text-2xl font-bold text-gold">{formatNumber(result, 2)} <span className="text-base">{to}</span></p>
          {!forexRates && <p className="text-xs text-muted mt-1">Loading live rates…</p>}
        </div>
      )}
    </div>
  );
}
