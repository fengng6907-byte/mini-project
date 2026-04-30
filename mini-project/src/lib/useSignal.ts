"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SignalResponse, Timeframe } from "@/types";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useSignal(timeframe: Timeframe = "1H") {
  const [data, setData] = useState<SignalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch_ = useCallback(async (tf: Timeframe) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/signal?timeframe=${tf}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json: SignalResponse = await r.json();
      setData(json);

      // Fire alert for strong signals
      if (json.signal === "Strong Buy" || json.signal === "Strong Sell") {
        await fetch("/api/alerts/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signal: json.signal,
            confidence: json.confidence,
            price: json.price,
            reasons: json.reasons,
          }),
        }).catch(() => {});
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_(timeframe);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetch_(timeframe), POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeframe, fetch_]);

  return {
    data,
    loading,
    error,
    refetch: () => fetch_(timeframe),
  };
}
