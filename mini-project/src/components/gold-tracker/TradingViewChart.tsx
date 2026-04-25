"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const TIMEFRAMES = [
  { label: "1H", value: "1" },
  { label: "4H", value: "4" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
  { label: "1M", value: "M" },
];

const INDICATORS = ["RSI", "MACD", "MA"] as const;

export default function TradingViewChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTimeframe, setActiveTimeframe] = useState("D");
  const [activeIndicators, setActiveIndicators] = useState<Set<string>>(new Set(["MA"]));
  const [sentiment, setSentiment] = useState<"Bullish" | "Bearish" | "Neutral">("Bullish");

  // Rotate sentiment demo
  useEffect(() => {
    const sentiments: ("Bullish" | "Bearish" | "Neutral")[] = ["Bullish", "Neutral", "Bearish"];
    const idx = Math.floor(Math.random() * 3);
    setSentiment(sentiments[idx]);
  }, []);

  const toggleIndicator = (ind: string) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(ind)) next.delete(ind);
      else next.add(ind);
      return next;
    });
  };

  // Build TradingView studies string
  const studies = Array.from(activeIndicators)
    .map((ind) => {
      if (ind === "RSI") return "RSI@tv-basicstudies";
      if (ind === "MACD") return "MACD@tv-basicstudies";
      if (ind === "MA") return "MASimple@tv-basicstudies";
      return "";
    })
    .filter(Boolean);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window !== "undefined" && containerRef.current && (window as unknown as Record<string, unknown>).TradingView) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new ((window as any).TradingView.widget)({
          container_id: containerRef.current.id,
          autosize: true,
          symbol: "OANDA:XAUUSD",
          interval: activeTimeframe,
          timezone: "exchange",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0B0B0B",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          backgroundColor: "#0B0B0B",
          gridColor: "rgba(42, 42, 42, 0.3)",
          studies,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimeframe, JSON.stringify(Array.from(activeIndicators))]);

  const sentimentColor = {
    Bullish: "text-success bg-success/10 border-success/20",
    Bearish: "text-danger bg-danger/10 border-danger/20",
    Neutral: "text-gold bg-gold/10 border-gold/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-surface overflow-hidden"
    >
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border">
        {/* Timeframes */}
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                activeTimeframe === tf.value
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "text-muted hover:text-foreground hover:bg-surface-light"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted mr-1">Indicators:</span>
          {INDICATORS.map((ind) => (
            <button
              key={ind}
              onClick={() => toggleIndicator(ind)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                activeIndicators.has(ind)
                  ? "bg-foreground/10 text-foreground border border-foreground/20"
                  : "text-muted hover:text-foreground hover:bg-surface-light"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Sentiment */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${sentimentColor[sentiment]}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              sentiment === "Bullish" ? "bg-success" : sentiment === "Bearish" ? "bg-danger" : "bg-gold"
            }`}
          />
          {sentiment}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative w-full" style={{ height: "480px" }}>
        <div id="tradingview-chart" ref={containerRef} className="w-full h-full" />
      </div>

      {/* Expert Insights Bar */}
      <div className="px-4 py-3 border-t border-border bg-surface-light">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-semibold text-gold uppercase tracking-wider">
            Expert Insights
          </span>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Gold is trading within a consolidation range. Key support at $2,300 and resistance at $2,400.
          Watch for Fed commentary and CPI data this week. RSI shows neutral momentum with
          potential for breakout on volume confirmation.
        </p>
      </div>
    </motion.div>
  );
}
