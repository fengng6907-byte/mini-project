"use client";

interface BalanceCardProps {
  balance: number;
  goldHeld: number;
  goldValue: number;
  unrealizedPnl: number;
  totalValue: number;
  totalPnl: number;
  goldAvgCost: number;
  currentPrice: number;
}

export default function BalanceCard({
  balance, goldHeld, goldValue, unrealizedPnl, totalValue, totalPnl, goldAvgCost, currentPrice
}: BalanceCardProps) {
  const pnlPositive = totalPnl + unrealizedPnl >= 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-xs text-muted">Total Portfolio Value</p>
        <p className="text-2xl font-bold tabular-nums mt-0.5">
          ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-light rounded-xl p-3">
          <p className="text-xs text-muted mb-1">USD Balance</p>
          <p className="text-sm font-semibold tabular-nums">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-surface-light rounded-xl p-3">
          <p className="text-xs text-muted mb-1">Gold Holdings</p>
          <p className="text-sm font-semibold tabular-nums">{goldHeld.toFixed(4)} oz</p>
          <p className="text-xs text-muted tabular-nums">${goldValue.toFixed(2)}</p>
        </div>
        <div className="bg-surface-light rounded-xl p-3">
          <p className="text-xs text-muted mb-1">Unrealized P&L</p>
          <p className={`text-sm font-semibold tabular-nums ${unrealizedPnl >= 0 ? "text-success" : "text-danger"}`}>
            {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
          </p>
        </div>
        <div className="bg-surface-light rounded-xl p-3">
          <p className="text-xs text-muted mb-1">Realized P&L</p>
          <p className={`text-sm font-semibold tabular-nums ${totalPnl >= 0 ? "text-success" : "text-danger"}`}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </p>
        </div>
      </div>

      {goldHeld > 0 && (
        <div className="text-xs text-muted flex gap-4">
          <span>Avg Cost: <span className="text-foreground tabular-nums">${goldAvgCost.toFixed(2)}</span></span>
          <span>Current: <span className="text-foreground tabular-nums">${currentPrice.toFixed(2)}</span></span>
        </div>
      )}
    </div>
  );
}
