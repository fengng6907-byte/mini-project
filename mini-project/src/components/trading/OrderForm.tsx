"use client";

import { useState } from "react";

interface OrderFormProps {
  currentPrice: number;
  onOrderPlaced: () => void;
}

export default function OrderForm({ currentPrice, onOrderPlaced }: OrderFormProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [goldQty, setGoldQty] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const qty = parseFloat(goldQty) || 0;
  const lp = parseFloat(limitPrice) || currentPrice;
  const execPrice = orderType === "MARKET" ? currentPrice : lp;
  const total = qty * execPrice;
  const fee = total * 0.001;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (qty <= 0) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side,
          goldQty: qty,
          orderType,
          limitPrice: orderType === "LIMIT" ? lp : undefined,
          currentPrice: orderType === "MARKET" ? currentPrice : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed");
      setMessage({ text: orderType === "LIMIT" ? "Limit order placed" : `${side} executed at $${currentPrice.toFixed(2)}`, ok: true });
      setGoldQty("");
      onOrderPlaced();
    } catch (err: any) {
      setMessage({ text: err.message, ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-4">Place Order</h3>

      {/* Side selector */}
      <div className="flex rounded-xl overflow-hidden border border-border mb-4">
        {(["BUY", "SELL"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              side === s
                ? s === "BUY" ? "bg-success text-background" : "bg-danger text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Order type selector */}
      <div className="flex gap-2 mb-4">
        {(["MARKET", "LIMIT"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
              orderType === t ? "border-gold text-gold" : "border-border text-muted hover:border-border/70"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-muted mb-1">Quantity (troy oz)</label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={goldQty}
            onChange={(e) => setGoldQty(e.target.value)}
            placeholder="0.000"
            className="w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm tabular-nums outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        {orderType === "LIMIT" && (
          <div>
            <label className="block text-xs text-muted mb-1">Limit Price (USD/oz)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={currentPrice.toFixed(2)}
              className="w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm tabular-nums outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        )}

        {qty > 0 && (
          <div className="bg-surface-light rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between text-muted">
              <span>Estimated Total</span>
              <span className="text-foreground tabular-nums">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Fee (0.1%)</span>
              <span className="tabular-nums">${fee.toFixed(2)}</span>
            </div>
          </div>
        )}

        {message && (
          <p className={`text-xs px-3 py-2 rounded-lg ${message.ok ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || qty <= 0}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
            side === "BUY" ? "bg-success hover:bg-success/90 text-background" : "bg-danger hover:bg-danger/90 text-white"
          }`}
        >
          {loading ? "Processing…" : `${side === "BUY" ? "Buy" : "Sell"} Gold`}
        </button>
      </form>
    </div>
  );
}
