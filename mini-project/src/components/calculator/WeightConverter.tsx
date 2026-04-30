"use client";

import { useState, useMemo } from "react";
import { WEIGHT_UNITS } from "@/lib/constants";
import { convertWeight, formatNumber } from "@/lib/utils";
import type { WeightUnit } from "@/types";

export default function WeightConverter() {
  const [value, setValue] = useState("31.1035");
  const [from, setFrom] = useState<WeightUnit>("g");
  const [to, setTo] = useState<WeightUnit>("oz");

  const result = useMemo(() => {
    const num = Number(value);
    if (!value || isNaN(num)) return null;
    return convertWeight(num, from, to);
  }, [value, from, to]);

  const select = "w-full rounded-xl bg-surface-light border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50";
  const input = "w-full rounded-xl bg-surface-light border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-muted">Amount</label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={input}
          min="0"
          step="0.0001"
          placeholder="31.1035"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-muted">From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value as WeightUnit)} className={select}>
            {WEIGHT_UNITS.map((u) => <option key={u.code} value={u.code}>{u.name} ({u.code})</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted">To</label>
          <select value={to} onChange={(e) => setTo(e.target.value as WeightUnit)} className={select}>
            {WEIGHT_UNITS.map((u) => <option key={u.code} value={u.code}>{u.name} ({u.code})</option>)}
          </select>
        </div>
      </div>
      {result !== null && (
        <div className="rounded-xl bg-gold/10 border border-gold/20 p-4 text-center">
          <p className="text-xs text-muted mb-1">{value} {from} =</p>
          <p className="text-2xl font-bold text-gold">{formatNumber(result, 6)} <span className="text-base">{to}</span></p>
        </div>
      )}
    </div>
  );
}
