"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LeaderEntry {
  rank: number;
  name: string;
  totalPnl: number;
  totalTrades: number;
  balance: number;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setData(d.leaderboard ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="text-xs text-muted hover:text-foreground transition-colors">← Dashboard</Link>
          <span className="text-sm font-bold ml-2"><span className="text-gold">GOLD</span> Eyes</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {data.length === 0 ? (
            <p className="text-xs text-muted text-center py-12">No traders yet. Be the first!</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs">
                  <th className="text-left p-4 font-medium">Rank</th>
                  <th className="text-left p-4 font-medium">Trader</th>
                  <th className="text-right p-4 font-medium">Realized P&L</th>
                  <th className="text-right p-4 font-medium">Trades</th>
                  <th className="text-right p-4 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.rank} className="border-b border-border/40 hover:bg-surface-light transition-colors">
                    <td className="p-4">
                      <span className={`font-bold ${row.rank === 1 ? "text-gold" : row.rank === 2 ? "text-foreground" : row.rank === 3 ? "text-gold-dark" : "text-muted"}`}>
                        #{row.rank}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{row.name}</td>
                    <td className={`p-4 text-right tabular-nums font-semibold ${row.totalPnl >= 0 ? "text-success" : "text-danger"}`}>
                      {row.totalPnl >= 0 ? "+" : ""}${row.totalPnl.toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-muted">{row.totalTrades}</td>
                    <td className="p-4 text-right tabular-nums">${row.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
