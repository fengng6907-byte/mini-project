import { NextResponse } from "next/server";
import type { NewsItem, GoldInsight, Sentiment } from "@/types";

const NEWS_API_URL = "https://newsapi.org/v2/everything";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function analyzeSentiment(title: string, description: string): Sentiment {
  const text = `${title} ${description}`.toLowerCase();
  const bullishWords = ["surge", "rally", "high", "rise", "gain", "record", "demand", "safe haven", "inflation", "uncertainty"];
  const bearishWords = ["drop", "fall", "decline", "low", "sell", "crash", "strong dollar", "rate hike", "hawkish"];

  let score = 0;
  bullishWords.forEach((w) => { if (text.includes(w)) score++; });
  bearishWords.forEach((w) => { if (text.includes(w)) score--; });

  if (score > 0) return "bullish";
  if (score < 0) return "bearish";
  return "neutral";
}

function generateInsight(articles: NewsItem[]): GoldInsight {
  const sentiments = articles.map((a) => a.sentiment);
  const bullishCount = sentiments.filter((s) => s === "bullish").length;
  const bearishCount = sentiments.filter((s) => s === "bearish").length;

  let overallSentiment: Sentiment = "neutral";
  if (bullishCount > bearishCount + 1) overallSentiment = "bullish";
  else if (bearishCount > bullishCount + 1) overallSentiment = "bearish";

  const outlookMap = {
    bullish: "Gold prices show upward momentum, supported by strong safe-haven demand and macroeconomic uncertainty. Key support levels holding firm.",
    bearish: "Gold faces headwinds from a strengthening US dollar and rising bond yields. Price may test lower support levels in the near term.",
    neutral: "Gold is consolidating in a tight range as markets weigh conflicting signals from inflation data and central bank policy expectations.",
  };

  return {
    outlook: outlookMap[overallSentiment],
    sentiment: overallSentiment,
    drivers: {
      inflation: overallSentiment === "bullish"
        ? "Persistent inflation concerns supporting gold as an inflation hedge"
        : overallSentiment === "bearish"
        ? "Easing inflation expectations reducing gold's appeal as a hedge"
        : "Mixed inflation signals creating uncertainty in gold markets",
      usdStrength: overallSentiment === "bearish"
        ? "Strong USD weighing on gold prices inversely"
        : overallSentiment === "bullish"
        ? "Weakening USD providing tailwind for gold prices"
        : "USD showing mixed signals against major currencies",
      interestRates: overallSentiment === "bearish"
        ? "Hawkish central bank rhetoric pressuring gold lower"
        : overallSentiment === "bullish"
        ? "Rate cut expectations supporting gold's non-yielding appeal"
        : "Markets pricing in steady rates, limiting gold's directional move",
    },
    summary: `Market sentiment is predominantly ${overallSentiment}. ${articles.length > 0 ? articles[0].title : "Markets await fresh catalysts."}`,
    date: new Date().toISOString().split("T")[0],
  };
}

function getFallbackData() {
  const news: NewsItem[] = [
    {
      id: generateId(),
      title: "Gold Holds Steady Above $2,300 Amid Global Uncertainty",
      summary: "Gold prices remain firm as investors weigh geopolitical tensions and inflation data. Safe-haven demand continues to support the precious metal.",
      source: "Market Watch",
      url: "#",
      publishedAt: new Date().toISOString(),
      sentiment: "bullish",
    },
    {
      id: generateId(),
      title: "Central Banks Continue Gold Accumulation Trend",
      summary: "Central banks worldwide added to gold reserves for the sixth consecutive quarter, signaling strong institutional demand.",
      source: "Reuters",
      url: "#",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      sentiment: "bullish",
    },
    {
      id: generateId(),
      title: "Fed Officials Signal Cautious Approach to Rate Cuts",
      summary: "Federal Reserve policymakers indicated they need more evidence of declining inflation before cutting rates, keeping gold in a consolidation range.",
      source: "Bloomberg",
      url: "#",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      sentiment: "neutral",
    },
    {
      id: generateId(),
      title: "Gold Demand Surges in Southeast Asian Markets",
      summary: "Retail gold buying in Malaysia and Singapore hits multi-year highs as consumers hedge against currency depreciation.",
      source: "Nikkei Asia",
      url: "#",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      sentiment: "bullish",
    },
    {
      id: generateId(),
      title: "Technical Analysis: Gold Tests Key Resistance Level",
      summary: "XAU/USD approaches the $2,400 resistance zone. A breakout could target $2,450 while failure may see a pullback to $2,320 support.",
      source: "TradingView",
      url: "#",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      sentiment: "neutral",
    },
  ];

  return { news, insight: generateInsight(news) };
}

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    const fallback = getFallbackData();
    return NextResponse.json(fallback);
  }

  try {
    const params = new URLSearchParams({
      q: "gold price XAU OR gold market OR gold trading",
      language: "en",
      sortBy: "publishedAt",
      pageSize: "10",
      apiKey,
    });

    const res = await fetch(`${NEWS_API_URL}?${params}`, {
      next: { revalidate: 1800 }, // 30 minutes
    });

    if (!res.ok) {
      const fallback = getFallbackData();
      return NextResponse.json(fallback);
    }

    const data = await res.json();

    const news: NewsItem[] = (data.articles ?? [])
      .slice(0, 5)
      .map((article: { title: string; description: string; source: { name: string }; url: string; publishedAt: string }) => ({
        id: generateId(),
        title: article.title,
        summary: article.description || article.title,
        source: article.source?.name || "Unknown",
        url: article.url,
        publishedAt: article.publishedAt,
        sentiment: analyzeSentiment(article.title, article.description || ""),
      }));

    return NextResponse.json({
      news,
      insight: generateInsight(news),
    });
  } catch {
    const fallback = getFallbackData();
    return NextResponse.json(fallback);
  }
}
