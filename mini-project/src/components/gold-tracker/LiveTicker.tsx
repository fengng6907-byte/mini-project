"use client";

import { motion } from "framer-motion";
import { useGoldStore } from "@/lib/store";
import { formatCurrency, formatNumber, formatPercent, timeAgo } from "@/lib/utils";

export default function LiveTicker() {
  const goldPrice = useGoldStore((s) => s.goldPrice);
  const lastUpdated = useGoldStore((s) => s.lastUpdated);
  const isLoading = useGoldStore((s) => s.isLoading);

  if (isLoading && !goldPrice) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  if (!goldPrice) return null;

  const isPositive = goldPrice.changePercent >= 0;

  const stats = [
    {
      label: "Spot Price",
      value: formatCurrency(goldPrice.price),
      highlight: true,
    },
    {
      label: "24h Change",
      value: `${isPositive ? "+" : ""}${formatNumber(goldPrice.change)}`,
      sub: formatPercent(goldPrice.changePercent),
      color: isPositive ? "text-success" : "text-danger",
    },
    {
      label: "24h High",
      value: formatCurrency(goldPrice.high),
    },
    {
      label: "24h Low",
      value: formatCurrency(goldPrice.low),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative overflow-hidden rounded-2xl border p-4 ${
              stat.highlight
                ? "bg-gradient-to-br from-gold/10 to-gold-dark/5 border-gold/20"
                : "bg-surface border-border"
            }`}
          >
            <p className="text-xs text-muted mb-1">{stat.label}</p>
            <p
              className={`text-xl font-bold tracking-tight ${
                stat.color ?? "text-foreground"
              }`}
            >
              {stat.value}
            </p>
            {stat.sub && (
              <p className={`text-sm font-medium mt-0.5 ${stat.color}`}>
                {stat.sub}
              </p>
            )}
            {stat.highlight && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                </span>
                <span className="text-[10px] text-muted">LIVE</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      {lastUpdated && (
        <p className="text-[11px] text-muted text-right">
          Last updated: {timeAgo(lastUpdated)}
        </p>
      )}
    </div>
  );
}
