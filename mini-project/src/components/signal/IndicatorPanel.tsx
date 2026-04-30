"use client";

import { motion } from "framer-motion";
import type { IndicatorValues } from "@/types";

interface Props {
  indicators: IndicatorValues;
  price: number;
}

function Badge({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className={`text-sm font-semibold ${color ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

function RsiGauge({ value }: { value: number }) {
  const pct = Math.min(Math.max(value, 0), 100);
  const color = pct > 70 ? "#ef4444" : pct < 30 ? "#22c55e" : pct > 55 ? "#f59e0b" : "#888";
  const left = `${pct}%`;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted">
        <span>Oversold 30</span>
        <span className="font-semibold text-foreground text-xs">RSI {value.toFixed(1)}</span>
        <span>Overbought 70</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{
        background: "linear-gradient(to right, #22c55e 0%, #888 30%, #888 70%, #ef4444 100%)"
      }}>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background shadow"
          style={{ left, transform: "translate(-50%, -50%)", backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function MacdChart({ macd, signal, histogram }: { macd: number; signal: number; histogram: number }) {
  const isPositive = histogram > 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-blue-400 rounded" />
          <span className="text-muted">MACD</span>
          <span className="text-foreground font-medium">{macd.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-orange-400 rounded" />
          <span className="text-muted">Signal</span>
          <span className="text-foreground font-medium">{signal.toFixed(4)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">Histogram</span>
        <div
          className={`h-2 rounded-sm transition-all ${isPositive ? "bg-emerald-500" : "bg-red-500"}`}
          style={{ width: `${Math.min(Math.abs(histogram) * 2000, 100)}%`, minWidth: "4px" }}
        />
        <span className={`text-xs font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {histogram > 0 ? "+" : ""}{histogram.toFixed(4)}
        </span>
      </div>
    </div>
  );
}

export default function IndicatorPanel({ indicators, price }: Props) {
  const trendColor =
    price > indicators.ema50
      ? "text-emerald-400"
      : "text-red-400";

  const trendLabel =
    price > indicators.ema50 && indicators.ema50 > indicators.ema200
      ? "Strong Uptrend"
      : price > indicators.ema50
      ? "Uptrend"
      : price < indicators.ema50 && indicators.ema50 < indicators.ema200
      ? "Strong Downtrend"
      : "Downtrend";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-surface p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Technical Indicators</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
          trendColor === "text-emerald-400"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-red-500/30 bg-red-500/10 text-red-400"
        }`}>
          {trendLabel}
        </span>
      </div>

      {/* MACD */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted uppercase tracking-widest">MACD (12, 26, 9)</p>
        <MacdChart
          macd={indicators.macd}
          signal={indicators.signal_line}
          histogram={indicators.histogram}
        />
      </div>

      {/* RSI */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted uppercase tracking-widest">RSI (14)</p>
        <RsiGauge value={indicators.rsi} />
      </div>

      {/* EMA */}
      <div className="space-y-0.5">
        <p className="text-xs text-muted uppercase tracking-widest mb-2">Moving Averages</p>
        <Badge
          label="Current Price"
          value={`$${indicators.current_price.toFixed(2)}`}
          color="text-gold"
        />
        <Badge
          label="EMA 50"
          value={`$${indicators.ema50.toFixed(2)}`}
          color={price > indicators.ema50 ? "text-emerald-400" : "text-red-400"}
        />
        <Badge
          label="EMA 200"
          value={`$${indicators.ema200.toFixed(2)}`}
          color={indicators.ema50 > indicators.ema200 ? "text-emerald-400" : "text-red-400"}
        />
        <Badge
          label="EMA Cross"
          value={indicators.ema50 > indicators.ema200 ? "Golden Cross ✓" : "Death Cross ✗"}
          color={indicators.ema50 > indicators.ema200 ? "text-emerald-400" : "text-red-400"}
        />
      </div>
    </motion.div>
  );
}
