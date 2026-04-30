"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoldStore } from "@/lib/store";
import { CURRENCIES, GOLD_PURITIES, WEIGHT_UNITS } from "@/lib/constants";
import { formatCurrency, formatPercent, convertWeight, calculateProfitLoss } from "@/lib/utils";
import type { Currency, WeightUnit, Purity } from "@/types";
import { TROY_OUNCE_IN_GRAMS } from "@/lib/constants";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 3" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground mb-1">No holdings yet</p>
      <p className="text-xs text-muted">Add your gold holdings to track performance</p>
    </div>
  );
}

export default function PortfolioTracker() {
  const goldPrice = useGoldStore((s) => s.goldPrice);
  const forexRates = useGoldStore((s) => s.forexRates);
  const holdings = useGoldStore((s) => s.holdings);
  const addHolding = useGoldStore((s) => s.addHolding);
  const removeHolding = useGoldStore((s) => s.removeHolding);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("g");
  const [purity, setPurity] = useState<Purity>(999);
  const [buyPrice, setBuyPrice] = useState("");
  const [buyCurrency, setBuyCurrency] = useState<Currency>("USD");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAdd = () => {
    if (!name || !weight || !buyPrice) return;
    addHolding({
      name,
      weight: Number(weight),
      unit,
      purity,
      buyPrice: Number(buyPrice),
      buyCurrency,
      buyDate,
    });
    setName("");
    setWeight("");
    setBuyPrice("");
    setShowForm(false);
  };

  const getHoldingValue = (holding: typeof holdings[0]) => {
    if (!goldPrice || !forexRates) return null;
    const weightInGrams = convertWeight(holding.weight, holding.unit, "g");
    const purityFactor = holding.purity / 1000;
    const pricePerGramUSD = goldPrice.price / TROY_OUNCE_IN_GRAMS;
    const valueUSD = weightInGrams * purityFactor * pricePerGramUSD;
    const value = valueUSD * forexRates[holding.buyCurrency as Currency];
    const { profit, percentage } = calculateProfitLoss(holding.buyPrice, value);
    return { value, profit, percentage };
  };

  const totalValue = holdings.reduce((sum, h) => {
    const v = getHoldingValue(h);
    return sum + (v?.value ?? 0);
  }, 0);

  const totalCost = holdings.reduce((sum, h) => sum + h.buyPrice, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Summary */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <p className="text-xs text-muted mb-1">Total Value</p>
            <p className="text-lg font-bold text-gold">{formatCurrency(totalValue)}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <p className="text-xs text-muted mb-1">Total Cost</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalCost)}</p>
          </div>
          <div className={`p-4 rounded-xl border ${totalPnl >= 0 ? "bg-success/5 border-success/20" : "bg-danger/5 border-danger/20"}`}>
            <p className="text-xs text-muted mb-1">P&L</p>
            <p className={`text-lg font-bold ${totalPnl >= 0 ? "text-success" : "text-danger"}`}>
              {formatPercent(totalPnlPct)}
            </p>
          </div>
        </div>
      )}

      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-foreground">Holdings ({holdings.length})</h3>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Holding"}
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Holding name (e.g. Gold Bar)"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Weight"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as WeightUnit)}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
                >
                  {WEIGHT_UNITS.map((u) => (
                    <option key={u.code} value={u.code}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={purity}
                  onChange={(e) => setPurity(Number(e.target.value) as Purity)}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
                >
                  {GOLD_PURITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={buyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="Buy price"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
                <select
                  value={buyCurrency}
                  onChange={(e) => setBuyCurrency(e.target.value as Currency)}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAdd}
                disabled={!name || !weight || !buyPrice}
                className="w-full py-2.5 rounded-xl bg-gold text-background text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-40"
              >
                Add Holding
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holdings List */}
      {holdings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {holdings.map((holding) => {
              const v = getHoldingValue(holding);
              return (
                <motion.div
                  key={holding.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{holding.name}</p>
                    <p className="text-xs text-muted">
                      {holding.weight} {holding.unit} · {GOLD_PURITIES.find((p) => p.value === holding.purity)?.label}
                    </p>
                    <p className="text-xs text-muted">Bought: {formatCurrency(holding.buyPrice, holding.buyCurrency as Currency)}</p>
                  </div>
                  <div className="text-right">
                    {v ? (
                      <>
                        <p className="text-sm font-semibold text-gold">{formatCurrency(v.value, holding.buyCurrency as Currency)}</p>
                        <p className={`text-xs font-medium ${v.profit >= 0 ? "text-success" : "text-danger"}`}>
                          {v.profit >= 0 ? "+" : ""}{formatPercent(v.percentage)}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted">Loading…</p>
                    )}
                    <button
                      onClick={() => removeHolding(holding.id)}
                      className="mt-1 text-[10px] text-muted hover:text-danger transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
