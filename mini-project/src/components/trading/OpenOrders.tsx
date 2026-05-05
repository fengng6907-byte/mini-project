"use client";

interface Order {
  id: string;
  side: string;
  orderType: string;
  goldQty: number;
  limitPrice: number | null;
  status: string;
  createdAt: string;
}

interface OpenOrdersProps {
  orders: Order[];
  onCancel: (id: string) => void;
}

export default function OpenOrders({ orders, onCancel }: OpenOrdersProps) {
  const open = orders.filter((o) => o.status === "OPEN");

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-4">Open Orders ({open.length})</h3>
      {open.length === 0 ? (
        <p className="text-xs text-muted text-center py-6">No open orders</p>
      ) : (
        <div className="space-y-2">
          {open.map((o) => (
            <div key={o.id} className="flex items-center gap-3 bg-surface-light rounded-xl px-3 py-2.5 text-xs">
              <span className={`font-semibold ${o.side === "BUY" ? "text-success" : "text-danger"}`}>
                {o.side}
              </span>
              <span className="text-muted">{o.orderType}</span>
              <span className="tabular-nums">{o.goldQty.toFixed(4)} oz</span>
              {o.limitPrice && (
                <span className="text-gold tabular-nums">@ ${o.limitPrice.toFixed(2)}</span>
              )}
              <button
                onClick={() => onCancel(o.id)}
                className="ml-auto text-muted hover:text-danger transition-colors"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
