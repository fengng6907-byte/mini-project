"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import PriceHeader from "@/components/trading/PriceHeader";
import OrderForm from "@/components/trading/OrderForm";
import BalanceCard from "@/components/trading/BalanceCard";
import OpenOrders from "@/components/trading/OpenOrders";
import TradeHistory from "@/components/trading/TradeHistory";

interface PriceData {
  price: number;
  change: number;
  changePct: number;
}

interface PortfolioData {
  user: {
    id: string;
    email: string;
    name: string | null;
    balance: number;
    goldHeld: number;
    goldAvgCost: number;
    totalPnl: number;
    totalTrades: number;
  };
  trades: any[];
  orders: any[];
  goldValue: number;
  unrealizedPnl: number;
  totalValue: number;
}

export default function DashboardPage() {
  const [priceData, setPriceData] = useState<PriceData>({ price: 3320, change: 0, changePct: 0 });
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevPrice = useRef(3320);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch("/api/price");
      const data = await res.json();
      setPriceData(data);
      if (data.price > prevPrice.current) setFlash("up");
      else if (data.price < prevPrice.current) setFlash("down");
      prevPrice.current = data.price;
      setTimeout(() => setFlash(null), 600);
    } catch {}
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch(`/api/portfolio?price=${priceData.price}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setPortfolio(data);
    } catch {}
  }, [priceData.price]);

  async function cancelOrder(id: string) {
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    fetchPortfolio();
  }

  useEffect(() => {
    fetchPrice();
    fetchPortfolio();
    const priceInterval = setInterval(fetchPrice, 2000);
    const portfolioInterval = setInterval(fetchPortfolio, 5000);
    return () => {
      clearInterval(priceInterval);
      clearInterval(portfolioInterval);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold">
            <span className="text-gold">GOLD</span> Eyes
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/portfolio" className="text-xs text-muted hover:text-foreground transition-colors">Portfolio</Link>
            <Link href="/leaderboard" className="text-xs text-muted hover:text-foreground transition-colors">Leaderboard</Link>
            {portfolio?.user.name && (
              <span className="text-xs text-muted">{portfolio.user.name}</span>
            )}
            <button onClick={handleLogout} className="text-xs text-muted hover:text-danger transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Price */}
        <PriceHeader
          price={priceData.price}
          change={priceData.change}
          changePct={priceData.changePct}
          flash={flash}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Order form + balance */}
          <div className="space-y-5">
            <OrderForm currentPrice={priceData.price} onOrderPlaced={fetchPortfolio} />
            {portfolio && (
              <BalanceCard
                balance={portfolio.user.balance}
                goldHeld={portfolio.user.goldHeld}
                goldValue={portfolio.goldValue}
                unrealizedPnl={portfolio.unrealizedPnl}
                totalValue={portfolio.totalValue}
                totalPnl={portfolio.user.totalPnl}
                goldAvgCost={portfolio.user.goldAvgCost}
                currentPrice={priceData.price}
              />
            )}
          </div>

          {/* Right: Orders + trades */}
          <div className="lg:col-span-2 space-y-5">
            {portfolio && (
              <>
                <OpenOrders orders={portfolio.orders} onCancel={cancelOrder} />
                <TradeHistory trades={portfolio.trades} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
