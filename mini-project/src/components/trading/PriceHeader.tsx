"use client";

interface PriceHeaderProps {
  price: number;
  change: number;
  changePct: number;
  flash: "up" | "down" | null;
}

export default function PriceHeader({ price, change, changePct, flash }: PriceHeaderProps) {
  const isUp = change >= 0;
  return (
    <div className={`flex items-center gap-4 p-4 bg-surface border border-border rounded-2xl transition-colors ${flash === "up" ? "flash-up" : flash === "down" ? "flash-down" : ""}`}>
      <div>
        <p className="text-xs text-muted mb-0.5">XAU/USD — Spot Gold</p>
        <p className={`text-3xl font-bold tabular-nums ${isUp ? "text-success" : "text-danger"}`}>
          ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className={`text-sm font-medium ${isUp ? "text-success" : "text-danger"}`}>
        <p>{isUp ? "+" : ""}{change.toFixed(2)}</p>
        <p>{isUp ? "+" : ""}{changePct.toFixed(3)}%</p>
      </div>
      <div className="ml-auto text-xs text-muted text-right">
        <p>per troy oz</p>
        <p className="mt-0.5">Live Feed</p>
      </div>
    </div>
  );
}
