"use client";

import { useGoldData, usePriceAlerts } from "@/lib/hooks";
import Header from "@/components/layout/Header";
import LiveTicker from "@/components/gold-tracker/LiveTicker";
import TradingViewChart from "@/components/gold-tracker/TradingViewChart";
import GoldCalculator from "@/components/calculator/GoldCalculator";
import RetailDirectory from "@/components/directory/RetailDirectory";
import DailyInsights from "@/components/insights/DailyInsights";
import PriceAlerts from "@/components/alerts/PriceAlerts";
import PortfolioTracker from "@/components/portfolio/PortfolioTracker";
import GoldChat from "@/components/chatbot/GoldChat";
import SectionHeading from "@/components/ui/SectionHeading";
import { motion } from "framer-motion";

function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative pt-24 pb-8 text-center"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[120px]" />
      </div>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
      >
        <span className="text-gold shimmer">GOLD</span>{" "}
        <span className="text-foreground">Eyes</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-3 text-sm sm:text-base text-muted max-w-md mx-auto"
      >
        See the Market. Seize the Value.
      </motion.p>
    </motion.section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gold font-bold">GOLD Eyes</span>
          <span className="text-muted">&copy; {new Date().getFullYear()}</span>
        </div>
        <p className="text-xs text-muted text-center sm:text-right max-w-xs">
          Market data is for informational purposes only. Not financial advice.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted">
          <a href="#" className="hidden sm:block hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hidden sm:block hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hidden sm:block hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  useGoldData();
  usePriceAlerts();

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <HeroSection />

        {/* Live Ticker */}
        <LiveTicker />

        {/* Chart */}
        <div className="mt-8">
          <TradingViewChart />
        </div>

        {/* Calculators + Alerts side-by-side on desktop */}
        <section id="calculator" className="mt-12 scroll-mt-20">
          <SectionHeading
            title="Calculators"
            subtitle="Convert currencies, weight units, gold value, and estimate P&L."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GoldCalculator />
            </div>
            <div>
              <PriceAlerts />
            </div>
          </div>
        </section>

        {/* Portfolio Tracker */}
        <section id="portfolio" className="mt-12 scroll-mt-20">
          <SectionHeading
            title="Portfolio Tracker"
            subtitle="Track your gold holdings and monitor profit and loss over time."
          />
          <div className="rounded-2xl border border-border bg-surface p-5">
            <PortfolioTracker />
          </div>
        </section>

        {/* Retail Directory */}
        <section id="directory" className="mt-12 scroll-mt-20">
          <SectionHeading
            title="Retail Directory"
            subtitle="Trusted gold retailers in Malaysia and Singapore."
          />
          <RetailDirectory />
        </section>

        {/* Daily Insights */}
        <section id="insights" className="mt-12 scroll-mt-20">
          <SectionHeading
            title="Daily Insights"
            subtitle="AI-powered market analysis and news."
          />
          <DailyInsights />
        </section>
      </div>

      <Footer />

      {/* Floating AI Chat */}
      <GoldChat />
    </main>
  );
}
