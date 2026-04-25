"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CurrencyConverter from "./CurrencyConverter";
import WeightConverter from "./WeightConverter";
import GoldValueCalculator from "./GoldValueCalculator";
import ProfitLossCalculator from "./ProfitLossCalculator";

const TABS = [
  { id: "currency", label: "Currency", icon: "💱" },
  { id: "weight", label: "Weight", icon: "⚖️" },
  { id: "value", label: "Gold Value", icon: "🪙" },
  { id: "pnl", label: "P&L", icon: "📊" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function GoldCalculator() {
  const [activeTab, setActiveTab] = useState<TabId>("value");

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "text-gold" : "text-muted hover:text-foreground"
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="calculator-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "currency" && <CurrencyConverter />}
            {activeTab === "weight" && <WeightConverter />}
            {activeTab === "value" && <GoldValueCalculator />}
            {activeTab === "pnl" && <ProfitLossCalculator />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
