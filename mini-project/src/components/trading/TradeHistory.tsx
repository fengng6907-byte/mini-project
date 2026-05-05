"use client";

interface Trade {
  id: string;
  side: string;
  goldQty: number;
  price: number;
  total: number;
  fee: number;
  pnl: number;
  createdAt: string;
}

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-4">Trade History</h3>
      {trades.length === 0 ? (
        <p className="text-xs text-muted text-center py-6">No trades yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted border-b border-border">
                <th className="text-left pb-2 font-medium">Side</th>
                <th className="text-right pb-2 font-medium">Qty (oz)</th>
                <th className="text-right pb-2 font-medium">Price</th>
                <th className="text-right pb-2 font-medium">Total</th>
                <th className="text-right pb-2 font-medium">P&L</th>
                <th className="text-right pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-border/40 hover:bg-surface-light transition-colors">
                  <td className={`py-2 font-semibold ${t.side === "BUY" ? "text-success" : "text-danger"}`}>
                    {t.side}
                  </td>
                  <td className="py-2 text-right tabular-nums">{t.goldQty.toFixed(4)}</td>
                  <td className="py-2 text-right tabular-nums">${t.price.toFixed(2)}</td>
                  <td className="py-2 text-right tabular-nums">${t.total.toFixed(2)}</td>
                  <td className={`py-2 text-right tabular-nums ${t.pnl >= 0 ? "text-success" : "text-danger"}`}>
                    {t.pnl !== 0 ? `${t.pnl >= 0 ? "+" : ""}$${t.pnl.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-2 text-right text-muted">
                    {new Date(t.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
