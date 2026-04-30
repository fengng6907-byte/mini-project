"use client";

import { motion } from "framer-motion";
import type { SignalLabel, SignalDirection, ScoreBreakdown } from "@/types";

interface Props {
  signal: SignalLabel;
  confidence: number;
  direction: SignalDirection;
  reasons: string[];
  breakdown: ScoreBreakdown;
  mlAvailable?: boolean;
  mlProbUp?: number;
}

const SIGNAL_CONFIG: Record<SignalLabel, { color: string; bg: string; border: string; icon: string }> = {
  "Strong Buy":  { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "▲▲" },
  "Weak Buy":    { color: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/30",   icon: "▲" },
  "No Trade":    { color: "text-gray-400",    bg: "bg-gray-500/10",    border: "border-gray-500/30",    icon: "—" },
  "Weak Sell":   { color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30",  icon: "▼" },
  "Strong Sell": { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     icon: "▼▼" },
};

const BREAKDOWN_LABELS: Record<keyof ScoreBreakdown, string> = {
  macd_crossover:    "MACD Crossover",
  rsi_confirmation:  "RSI Confirmation",
  trend_alignment:   "Trend Alignment",
  momentum:          "Momentum",
  ml_boost:          "ML Boost",
};

export default function SignalCard({
  signal, confidence, direction, reasons, breakdown, mlAvailable, mlProbUp,
}: Props) {
  const cfg = SIGNAL_CONFIG[signal];
  const arcRadius = 54;
  const circumference = 2 * Math.PI * arcRadius;
  const offset = circumference - (confidence / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 ${cfg.bg} ${cfg.border} space-y-5`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted uppercase tracking-widest mb-1">AI Signal</p>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${cfg.color}`}>{cfg.icon}</span>
            <h2 className={`text-2xl font-bold ${cfg.color}`}>{signal}</h2>
          </div>
        </div>

        {/* Confidence arc */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={arcRadius} fill="none" stroke="#2A2A2A" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={arcRadius} fill="none"
              stroke={direction === "buy" ? "#22c55e" : direction === "sell" ? "#ef4444" : "#888"}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground">{confidence}%</span>
            <span className="text-[10px] text-muted">conf.</span>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="space-y-2">
        <p className="text-xs text-muted uppercase tracking-widest">Score Breakdown</p>
        {(Object.keys(breakdown) as (keyof ScoreBreakdown)[]).map((key) => {
          const val = breakdown[key];
          if (key === "ml_boost" && !mlAvailable) return null;
          const positive = val >= 0;
          const width = Math.min(Math.abs(val) / 30 * 100, 100);
          return (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className="w-32 text-muted truncate">{BREAKDOWN_LABELS[key]}</span>
              <div className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${positive ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className={`w-8 text-right font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
                {val > 0 ? "+" : ""}{val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Reasons */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted uppercase tracking-widest">Analysis</p>
        <ul className="space-y-1">
          {reasons.slice(0, 5).map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <span className={`mt-0.5 text-xs ${cfg.color}`}>•</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* ML badge */}
      {mlAvailable && mlProbUp !== undefined && (
        <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/40">
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
            ML Model
          </span>
          <span className="text-muted">
            P(up) = {(mlProbUp * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </motion.div>
  );
}
