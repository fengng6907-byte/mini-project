import { useEffect, useRef, useCallback } from "react";
import { useGoldStore } from "./store";
import { API_REFRESH_INTERVAL } from "./constants";

export function useGoldData() {
  const { setGoldPrice, setForexRates, setNews, setInsight, setLoading } = useGoldStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchGoldPrice = useCallback(async () => {
    try {
      const res = await fetch("/api/gold-price");
      if (res.ok) {
        const data = await res.json();
        setGoldPrice(data);
      }
    } catch {
      // Silently fail - will retry on next interval
    }
  }, [setGoldPrice]);

  const fetchForexRates = useCallback(async () => {
    try {
      const res = await fetch("/api/forex-rates");
      if (res.ok) {
        const data = await res.json();
        setForexRates(data);
      }
    } catch {
      // Silently fail
    }
  }, [setForexRates]);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        setNews(data.news);
        setInsight(data.insight);
      }
    } catch {
      // Silently fail
    }
  }, [setNews, setInsight]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchGoldPrice(), fetchForexRates(), fetchNews()]);
    setLoading(false);
  }, [fetchGoldPrice, fetchForexRates, fetchNews, setLoading]);

  useEffect(() => {
    fetchAll();

    intervalRef.current = setInterval(fetchGoldPrice, API_REFRESH_INTERVAL);

    // Refresh forex and news less frequently
    const slowInterval = setInterval(() => {
      fetchForexRates();
      fetchNews();
    }, 300000); // 5 minutes

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(slowInterval);
    };
  }, [fetchAll, fetchGoldPrice, fetchForexRates, fetchNews]);

  return { refetch: fetchAll };
}

export function usePriceAlerts() {
  const { goldPrice, alerts } = useGoldStore();

  useEffect(() => {
    if (!goldPrice) return;

    alerts
      .filter((a) => a.active)
      .forEach((alert) => {
        const triggered =
          (alert.direction === "above" && goldPrice.price >= alert.targetPrice) ||
          (alert.direction === "below" && goldPrice.price <= alert.targetPrice);

        if (triggered && typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("GOLD Eyes Price Alert", {
              body: `Gold is now ${alert.direction === "above" ? "above" : "below"} $${alert.targetPrice}. Current: $${goldPrice.price.toFixed(2)}`,
              icon: "/favicon.svg",
            });
          }
        }
      });
  }, [goldPrice, alerts]);
}
