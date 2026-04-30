"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSignal } from "@/lib/useSignal";
import { useGoldData } from "@/lib/hooks";
import { useGoldStore } from "@/lib/store";
import SignalCard from "@/components/signal/SignalCard";
import IndicatorPanel from "@/components/signal/IndicatorPanel";
import PriceChart from "@/components/signal/PriceChart";
import type { Timeframe } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

const TIMEFRAMES: Timeframe[] = ["1H", "4H", "1D"];

function LastUpdated({ ts }: { ts: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
      if (diff < 60) setLabel(`${diff}s ago`);
      else setLabel(`${Math.floor(diff / 60)}m ago`);
    };
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, [ts]);
  return <span className="text-muted text-xs">{label}</span>;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-2xl bg-surface animate-pulse ${className}`} />;
}

export default function HomePage() {
  useGoldData();
  const goldPrice = useGoldStore((s) => s.goldPrice);
  const [timeframe, setTimeframe] = useState<Timeframe>("1H");
  const { data, loading, error, refetch } = useSignal(timeframe);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(300);

  // Countdown to next auto-refresh
  useEffect(() => {
    if (!autoRefresh) { setCountdown(300); return; }
    setCountdown(300);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { refetch(); return 300; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeframe, autoRefresh, refetch]);

  const signalColors: Record<string, string> = {
    "Strong Buy":  "text-emerald-400",
    "Weak Buy":    "text-green-400",
    "No Trade":    "text-gray-400",
    "Weak Sell":   "text-orange-400",
    "Strong Sell": "text-red-400",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center">
              <span className="text-gold font-bold text-sm">G</span>
            </div>
            <div>
              <h1 className="text-sm font-bold gold-shimmer leading-none">Gold AI Signal</h1>
              <p className="text-[10px] text-muted leading-none">XAU/USD Dashboard</p>
            </div>
          </div>

          {/* Live price */}
          {goldPrice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full bg-surface border border-border text-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="font-semibold">{formatCurrency(goldPrice.price)}</span>
              <span className={goldPrice.changePercent >= 0 ? "text-success text-xs" : "text-danger text-xs"}>
                {formatPercent(goldPrice.changePercent)}
              </span>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Timeframe picker */}
            <div className="flex gap-1 bg-surface rounded-xl p-1 border border-border">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    timeframe === tf
                      ? "bg-gold/20 text-gold border border-gold/30"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {autoRefresh ? `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}` : "Refresh"}
            </button>

            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh((a) => !a)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                autoRefresh
                  ? "bg-gold/10 border-gold/30 text-gold"
                  : "bg-surface border-border text-muted hover:text-foreground"
              }`}
            >
              {autoRefresh ? "AUTO" : "MANUAL"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Hero price strip */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-4 px-6 py-4 rounded-2xl bg-surface border border-border"
          >
            <div>
              <p className="text-xs text-muted">XAU/USD</p>
              <p className="text-3xl font-bold text-foreground">${data.price.toFixed(2)}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted">Signal ({data.timeframe})</p>
              <p className={`text-xl font-bold ${signalColors[data.signal] ?? "text-foreground"}`}>
                {data.signal}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted">Confidence</p>
              <p className="text-xl font-bold text-foreground">{data.confidence}%</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted">
              <span>Updated:</span>
              <LastUpdated ts={data.timestamp} />
              {data.cached && (
                <span className="px-2 py-0.5 rounded-full bg-surface-light border border-border text-[10px]">
                  CACHED
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm"
            >
              Error fetching signal: {error}. Using simulated data.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart (full width) */}
        {loading && !data ? (
          <Skeleton className="h-80" />
        ) : data ? (
          <PriceChart bars={data.chart} signal={data.signal} />
        ) : null}

        {/* Signal + Indicators grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Signal card — wider */}
          <div className="lg:col-span-3">
            {loading && !data ? (
              <Skeleton className="h-72" />
            ) : data ? (
              <SignalCard
                signal={data.signal}
                confidence={data.confidence}
                direction={data.direction}
                reasons={data.reasons}
                breakdown={data.score_breakdown}
                mlAvailable={data.ml.available}
                mlProbUp={data.ml.probability_up}
              />
            ) : null}
          </div>

          {/* Indicator panel */}
          <div className="lg:col-span-2">
            {loading && !data ? (
              <Skeleton className="h-72" />
            ) : data ? (
              <IndicatorPanel
                indicators={data.indicators}
                price={data.price}
              />
            ) : null}
          </div>
        </div>

        {/* Score breakdown strip */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: "MACD Crossover", key: "macd_crossover" as const, max: 30 },
              { label: "RSI Confirmation", key: "rsi_confirmation" as const, max: 20 },
              { label: "Trend Alignment", key: "trend_alignment" as const, max: 30 },
              { label: "Momentum", key: "momentum" as const, max: 20 },
            ].map(({ label, key, max }) => {
              const val = data.score_breakdown[key];
              const abs = Math.abs(val);
              const pct = Math.min((abs / max) * 100, 100);
              const positive = val >= 0;
              return (
                <div key={key} className="rounded-xl bg-surface border border-border p-4 space-y-2">
                  <p className="text-xs text-muted">{label}</p>
                  <div className="h-1.5 rounded-full bg-surface-light overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${positive ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className={`text-sm font-bold ${positive ? "text-emerald-400" : "text-red-400"}`}>
                    {val > 0 ? "+" : ""}{val} <span className="text-muted font-normal text-xs">/ {max}</span>
                  </p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Market context */}
        {goldPrice && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Open", value: formatCurrency(goldPrice.open) },
              { label: "High", value: formatCurrency(goldPrice.high) },
              { label: "Low", value: formatCurrency(goldPrice.low) },
              {
                label: "24h Change",
                value: `${goldPrice.change >= 0 ? "+" : ""}${goldPrice.change.toFixed(2)}`,
                color: goldPrice.change >= 0 ? "text-success" : "text-danger",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-surface border border-border p-4">
                <p className="text-xs text-muted mb-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.color ?? "text-foreground"}`}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-muted pt-4 pb-8 space-y-1">
          <p>Gold AI Signal Dashboard · XAU/USD Analysis Engine</p>
          <p className="text-[11px]">
            Signals are for informational purposes only and do not constitute financial advice.
          </p>
        </footer>
      </main>
    </div>
  );
}
