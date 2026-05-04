"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoldStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function PriceAlerts() {
  const goldPrice = useGoldStore((s) => s.goldPrice);
  const alerts = useGoldStore((s) => s.alerts);
  const addAlert = useGoldStore((s) => s.addAlert);
  const removeAlert = useGoldStore((s) => s.removeAlert);
  const toggleAlert = useGoldStore((s) => s.toggleAlert);

  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestNotifications = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const result = await Notification.requestPermission();
      setNotificationsEnabled(result === "granted");
    }
  };

  const handleAdd = () => {
    if (!targetPrice || isNaN(Number(targetPrice))) return;
    addAlert({
      targetPrice: Number(targetPrice),
      direction,
      currency: "USD",
    });
    setTargetPrice("");

    // Also register with backend
    fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetPrice: Number(targetPrice), direction }),
    }).catch(() => {});
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Price Alerts</h3>
        {!notificationsEnabled && (
          <button
            onClick={requestNotifications}
            className="text-[10px] px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
          >
            Enable Notifications
          </button>
        )}
      </div>

      {/* Add Alert Form */}
      <div className="flex gap-2">
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as "above" | "below")}
          className="px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50"
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="w-full pl-7 pr-4 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="Target price"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!targetPrice}
          className="px-4 py-2 rounded-xl bg-gold text-background text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {/* Current price reference */}
      {goldPrice && (
        <p className="text-xs text-muted">
          Current: {formatCurrency(goldPrice.price)} USD/oz
        </p>
      )}

      {/* Alert List */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {alerts.length === 0 && (
            <p className="text-xs text-muted text-center py-4">No alerts set. Add one above.</p>
          )}
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`w-4 h-4 rounded border transition-colors ${
                    alert.active
                      ? "bg-gold border-gold"
                      : "border-border hover:border-muted"
                  }`}
                >
                  {alert.active && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm ${alert.active ? "text-foreground" : "text-muted line-through"}`}>
                  Gold {alert.direction} ${alert.targetPrice.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-muted hover:text-danger transition-colors p-1"
                aria-label="Remove alert"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
