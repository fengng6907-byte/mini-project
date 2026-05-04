"use client";

import { useState, useMemo } from "react";
import { WEIGHT_UNITS } from "@/lib/constants";
import { convertWeight, formatNumber } from "@/lib/utils";
import type { WeightUnit } from "@/types";

export default function WeightConverter() {
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState<WeightUnit>("oz");
  const [toUnit, setToUnit] = useState<WeightUnit>("g");

  const result = useMemo(() => {
    if (!value || isNaN(Number(value))) return null;
    return convertWeight(Number(value), fromUnit, toUnit);
  }, [value, fromUnit, toUnit]);

  const allConversions = useMemo(() => {
    if (!value || isNaN(Number(value))) return [];
    return WEIGHT_UNITS.filter((u) => u.code !== fromUnit).map((u) => ({
      code: u.code,
      name: u.name,
      value: convertWeight(Number(value), fromUnit, u.code as WeightUnit),
    }));
  }, [value, fromUnit]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Convert between gold weight units.</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1.5">Value</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="Enter weight"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">From Unit</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value as WeightUnit)}
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

      <div>
        <label className="block text-xs text-muted mb-1.5">Convert To</label>
        <select
          value={toUnit}
          onChange={(e) => setToUnit(e.target.value as WeightUnit)}
          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
        >
          {WEIGHT_UNITS.map((u) => (
            <option key={u.code} value={u.code}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {result !== null && (
        <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
          <p className="text-xs text-muted mb-1">Result</p>
          <p className="text-2xl font-bold text-gold">
            {formatNumber(result, 4)} {toUnit}
          </p>
        </div>
      )}

      {allConversions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted">Quick Reference:</p>
          {allConversions.map((c) => (
            <div
              key={c.code}
              className="flex justify-between text-sm px-3 py-2 rounded-lg bg-background border border-border"
            >
              <span className="text-muted">{c.name}</span>
              <span className="font-medium text-foreground">
                {formatNumber(c.value, 4)} {c.code}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
