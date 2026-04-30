"use client";

import { motion } from "framer-motion";
import { useGoldStore } from "@/lib/store";
import type { Sentiment } from "@/types";

function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const config = {
    bullish: { label: "Bullish", color: "text-success bg-success/10 border-success/20", icon: "\u2191" },
    bearish: { label: "Bearish", color: "text-danger bg-danger/10 border-danger/20", icon: "\u2193" },
    neutral: { label: "Neutral", color: "text-gold bg-gold/10 border-gold/20", icon: "\u2194" },
  };
  const { label, color, icon } = config[sentiment];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${color}`}>
      {icon} {label}
    </span>
  );
}

function DriverCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-3 rounded-xl bg-background border border-border">
      <h4 className="text-xs font-semibold text-gold mb-1">{title}</h4>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function NewsCard({
  title,
  summary,
  source,
  publishedAt,
  sentiment,
}: {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment: Sentiment;
}) {
  const timeStr = new Date(publishedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="p-3 rounded-xl bg-background border border-border">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-muted">{source} &middot; {timeStr}</span>
        <SentimentBadge sentiment={sentiment} />
      </div>
      <h4 className="text-sm font-medium text-foreground mb-1 leading-snug">{title}</h4>
      <p className="text-xs text-muted leading-relaxed line-clamp-2">{summary}</p>
    </div>
  );
}

export default function DailyInsights() {
  const news = useGoldStore((s) => s.news);
  const insight = useGoldStore((s) => s.insight);
  const isLoading = useGoldStore((s) => s.isLoading);

  if (isLoading && !insight) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Today's Outlook */}
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gold">Today&apos;s Gold Outlook</h3>
            <SentimentBadge sentiment={insight.sentiment} />
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed mb-4">{insight.outlook}</p>

          {/* Key Drivers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <DriverCard title="Inflation" description={insight.drivers.inflation} />
            <DriverCard title="USD Strength" description={insight.drivers.usdStrength} />
            <DriverCard title="Interest Rates" description={insight.drivers.interestRates} />
          </div>
        </motion.div>
      )}

      {/* News Feed */}
      {news.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Latest Headlines</h3>
          {news.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <NewsCard
                title={item.title}
                summary={item.summary}
                source={item.source}
                publishedAt={item.publishedAt}
                sentiment={item.sentiment}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
