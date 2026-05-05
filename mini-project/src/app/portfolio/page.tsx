"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PortfolioData {
  user: {
    name: string | null;
    email: string;
    balance: number;
    goldHeld: number;
    goldAvgCost: number;
    totalPnl: number;
    totalTrades: number;
  };
  trades: Array<{
    id: string;
    side: string;
    goldQty: number;
    price: number;
    total: number;
    fee: number;
    pnl: number;
    createdAt: string;
  }>;
  goldValue: number;
  unrealizedPnl: number;
  totalValue: number;
}

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [price, setPrice] = useState(3320);

  useEffect(() => {
    fetch("/api/price")
      .then((r) => r.json())
      .then((d) => setPrice(d.price));
    fetch(`/api/portfolio?price=${price}`)
      .then((r) => {
        if (r.status === 401) { window.location.href = "/login"; return null; }
        return r.json();
      })
      .then((d) => d && setData(d));
  }, []);

  if (!data) return <div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading…</div>;

  const { user, trades, goldValue, unrealizedPnl, totalValue } = data;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="text-xs text-muted hover:text-foreground transition-colors">← Dashboard</Link>
          <span className="text-sm font-bold ml-2"><span className="text-gold">GOLD</span> Eyes</span>
          <Link href="/leaderboard" className="text-xs text-muted hover:text-foreground transition-colors ml-auto">Leaderboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Portfolio</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Value", value: `$${totalValue.toFixed(2)}` },
            { label: "USD Balance", value: `$${user.balance.toFixed(2)}` },
            { label: "Gold Holdings", value: `${user.goldHeld.toFixed(4)} oz` },
            { label: "Unrealized P&L", value: `${unrealizedPnl >= 0 ? "+" : ""}$${unrealizedPnl.toFixed(2)}`, color: unrealizedPnl >= 0 ? "text-success" : "text-danger" },
          ].map((s) => (
            <div key={s.label} className="bg-surface border border-border rounded-2xl p-4">
              <p className="text-xs text-muted mb-1">{s.label}</p>
              <p className={`text-lg font-bold tabular-nums ${s.color ?? ""}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4">All Trades ({trades.length})</h2>
          {trades.length === 0 ? (
            <p className="text-xs text-muted text-center py-6">No trades yet. <Link href="/dashboard" className="text-gold">Start trading →</Link></p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted border-b border-border">
                    <th className="text-left pb-2 font-medium">Side</th>
                    <th className="text-right pb-2 font-medium">Qty (oz)</th>
                    <th className="text-right pb-2 font-medium">Price</th>
                    <th className="text-right pb-2 font-medium">Total</th>
                    <th className="text-right pb-2 font-medium">Fee</th>
                    <th className="text-right pb-2 font-medium">P&L</th>
                    <th className="text-right pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-border/40">
                      <td className={`py-2 font-semibold ${t.side === "BUY" ? "text-success" : "text-danger"}`}>{t.side}</td>
                      <td className="py-2 text-right tabular-nums">{t.goldQty.toFixed(4)}</td>
                      <td className="py-2 text-right tabular-nums">${t.price.toFixed(2)}</td>
                      <td className="py-2 text-right tabular-nums">${t.total.toFixed(2)}</td>
                      <td className="py-2 text-right text-muted tabular-nums">${t.fee.toFixed(2)}</td>
                      <td className={`py-2 text-right tabular-nums ${t.pnl >= 0 ? "text-success" : "text-danger"}`}>
                        {t.pnl !== 0 ? `${t.pnl >= 0 ? "+" : ""}$${t.pnl.toFixed(2)}` : "—"}
                      </td>
                      <td className="py-2 text-right text-muted">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
