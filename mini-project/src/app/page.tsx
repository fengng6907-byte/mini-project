"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/* ── Stat data ── */
const ROI_STATS = [
  {
    persona: "Salespeople",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    stat: "47%",
    label: "Higher Close Rate",
    description:
      "Real-time commodity intelligence lets sales professionals time their pitches to the rhythm of the market — striking when client confidence is highest.",
  },
  {
    persona: "Real Estate Agents",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    stat: "3.2×",
    label: "More Buyer Engagement",
    description:
      "Gold-to-property correlation signals help agents identify when HNW clients are primed to diversify — turning market data into qualified conversations.",
  },
  {
    persona: "Startup Entrepreneurs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    stat: "62%",
    label: "Faster Deal Closure",
    description:
      "Data-backed commodity narratives give founders the macro credibility that closes angel and VC conversations two rounds sooner.",
  },
];

const FEATURES = [
  {
    title: "Live XAU/USD Intelligence",
    description: "Sub-second price feeds, trend detection, and multi-timeframe analysis on a single dashboard.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Daily Insights",
    description: "GPT-grade market commentary every morning — sentiment, risk factors, and actionable signals.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Portfolio & P&L Tracker",
    description: "Track gold holdings, visualise unrealised gains, and benchmark against the spot market in real time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Virtual Trading Simulator",
    description: "Practice market and limit orders risk-free with a $10,000 virtual account and live gold prices.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Smart Price Alerts",
    description: "Custom threshold alerts delivered instantly — never miss a breakout or reversal again.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    title: "Retail Directory",
    description: "Verified gold retailers across Malaysia and Singapore with live spread comparisons.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

/* ── Animated wrapper ── */
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ── Gold divider ── */
function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-16">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold/[0.06] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-xs font-medium text-gold mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Real-Time Gold Market Intelligence
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-[64px] font-bold tracking-tight leading-[1.08]"
          >
            See Every{" "}
            <span className="shimmer">Opportunity.</span>
            <br />
            Close Every Deal.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed"
          >
            GOLD Eyes gives salespeople, real estate agents, and entrepreneurs the
            market intelligence edge to convert more leads — with live XAU/USD data,
            AI insights, and precision analytics.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-cta hover:bg-cta-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
            >
              Start Free — No Credit Card
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3 border border-gold/40 text-gold hover:bg-gold/5 text-sm font-semibold rounded-xl transition-colors"
            >
              View Pricing →
            </Link>
          </motion.div>

          {/* Social proof strip */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-xs text-muted"
          >
            Trusted by <span className="text-foreground font-medium">2,400+ professionals</span> across Malaysia & Singapore
          </motion.p>
        </div>
      </section>

      <GoldDivider />

      {/* ════════════════════════════════════════
          ROI SECTION
      ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <FadeUp>
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-3">Proven ROI</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Why Professionals Choose GOLD Eyes
            </h2>
            <p className="mt-3 text-muted max-w-xl mx-auto text-sm leading-relaxed">
              Market intelligence that translates directly into deal velocity and conversion rate improvement.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROI_STATS.map((item, i) => (
            <FadeUp key={item.persona} delay={i * 0.12}>
              <div className="matte-card rounded-2xl p-7 flex flex-col h-full group hover:border-gold/40 transition-colors">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-5">
                  {item.icon}
                </div>

                {/* Stat */}
                <p className="text-5xl font-extrabold text-cta tabular-nums leading-none mb-1">
                  {item.stat}
                </p>
                <p className="text-sm font-semibold text-foreground mb-3">{item.label}</p>

                {/* Divider */}
                <div className="w-8 h-px bg-gold/40 mb-4" />

                {/* Persona + Description */}
                <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-2">
                  {item.persona}
                </p>
                <p className="text-sm text-muted leading-relaxed flex-1">{item.description}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <GoldDivider />

      {/* ════════════════════════════════════════
          PRODUCT SHOWCASE
      ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <FadeUp>
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-3">Everything You Need</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              A Complete Intelligence Platform
            </h2>
            <p className="mt-3 text-muted max-w-xl mx-auto text-sm leading-relaxed">
              Six powerful modules — one unified workspace for gold market professionals.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.08}>
              <div className="matte-card-grey rounded-xl p-6 flex gap-4 hover:border-gold/30 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0 group-hover:bg-gold/15 transition-colors">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{f.description}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <GoldDivider />

      {/* ════════════════════════════════════════
          BOTTOM CTA BANNER
      ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
        <FadeUp>
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] px-8 py-14 text-center">
            {/* Subtle gold glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/[0.08] rounded-full blur-[80px]" />
            </div>
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-4">Limited Offer</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Start Closing More Deals Today
              </h2>
              <p className="text-sm text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
                Join thousands of professionals already using GOLD Eyes to win clients with market intelligence competitors don&apos;t have.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-6 py-3 bg-cta hover:bg-cta-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-6 py-3 border border-white/20 text-white/80 hover:text-white hover:border-white/40 text-sm font-semibold rounded-xl transition-colors"
                >
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      <Footer />
    </main>
  );
}
