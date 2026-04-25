"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoldEyesLogo from "@/components/ui/GoldEyesLogo";
import { useGoldStore } from "@/lib/store";
import { formatCurrency, formatPercent } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Market", href: "#market" },
  { label: "Calculator", href: "#calculator" },
  { label: "Directory", href: "#directory" },
  { label: "Insights", href: "#insights" },
  { label: "Portfolio", href: "#portfolio" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const goldPrice = useGoldStore((s) => s.goldPrice);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <a href="#" className="flex items-center gap-2.5 group">
            <GoldEyesLogo size={34} />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight gold-shimmer leading-tight">
                GOLD Eyes
              </span>
              <span className="text-[10px] text-muted leading-none hidden sm:block">
                See the Market. Seize the Value.
              </span>
            </div>
          </a>

          {/* Live Price Pill */}
          {goldPrice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-surface border border-border"
            >
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(goldPrice.price)}
              </span>
              <span
                className={`text-xs font-medium ${
                  goldPrice.changePercent >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {formatPercent(goldPrice.changePercent)}
              </span>
            </motion.div>
          )}

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface-light"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="md:hidden p-2 text-muted hover:text-foreground"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border bg-background"
          >
            <div className="px-4 py-3 space-y-1">
              {goldPrice && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  XAU/USD: {formatCurrency(goldPrice.price)}{" "}
                  <span className={goldPrice.changePercent >= 0 ? "text-success" : "text-danger"}>
                    {formatPercent(goldPrice.changePercent)}
                  </span>
                </div>
              )}
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-light rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
