"use client";

import { useEffect, useRef, useState } from "react";
import type { ChartBar } from "@/types";

interface Props {
  bars: ChartBar[];
  signal?: string;
}

type ChartMode = "price" | "macd" | "rsi";

export default function PriceChart({ bars, signal }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<ChartMode>("price");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bars.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const PAD = { top: 20, right: 16, bottom: 30, left: 64 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#141414";
    ctx.fillRect(0, 0, W, H);

    if (mode === "price") drawPrice(ctx, bars, W, H, PAD, plotW, plotH);
    else if (mode === "macd") drawMacd(ctx, bars, W, H, PAD, plotW, plotH);
    else drawRsi(ctx, bars, W, H, PAD, plotW, plotH);
  }, [bars, mode]);

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">XAU/USD Chart</span>
          {signal && (
            <span className="text-xs text-muted">· {signal}</span>
          )}
        </div>
        <div className="flex gap-1">
          {(["price", "macd", "rsi"] as ChartMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-muted hover:text-foreground hover:bg-surface-light"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart canvas */}
      <div className="relative" style={{ height: 280 }}>
        <canvas ref={canvasRef} className="w-full h-full block" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

// ── Drawing helpers ────────────────────────────────────────────────────────────
type Pad = { top: number; right: number; bottom: number; left: number };

function gridLines(ctx: CanvasRenderingContext2D, W: number, H: number, pad: Pad, plotH: number, min: number, max: number, n = 5) {
  ctx.strokeStyle = "#2A2A2A";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 5]);
  ctx.fillStyle = "#888";
  ctx.font = "11px system-ui";
  ctx.textAlign = "right";
  for (let i = 0; i <= n; i++) {
    const y = pad.top + plotH - (i / n) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    const val = min + (i / n) * (max - min);
    ctx.fillText(val.toFixed(val > 100 ? 0 : 2), pad.left - 4, y + 4);
  }
  ctx.setLineDash([]);
}

function drawPrice(
  ctx: CanvasRenderingContext2D,
  bars: ChartBar[],
  W: number, H: number, pad: Pad, plotW: number, plotH: number
) {
  const closes = bars.map((b) => b.close);
  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);
  const min = Math.min(...lows) * 0.9995;
  const max = Math.max(...highs) * 1.0005;
  const range = max - min || 1;
  const scaleY = (v: number) => pad.top + plotH - ((v - min) / range) * plotH;
  const barW = plotW / bars.length;

  gridLines(ctx, W, H, pad, plotH, min, max);

  // EMA50
  ctx.beginPath();
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1.5;
  bars.forEach((b, i) => {
    const x = pad.left + i * barW + barW / 2;
    if (i === 0) ctx.moveTo(x, scaleY(b.ema50));
    else ctx.lineTo(x, scaleY(b.ema50));
  });
  ctx.stroke();

  // Candlesticks
  bars.forEach((b, i) => {
    const x = pad.left + i * barW;
    const green = b.close >= b.open;
    const color = green ? "#22c55e" : "#ef4444";
    const midX = x + barW / 2;
    const cW = Math.max(barW * 0.6, 1);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(midX, scaleY(b.high));
    ctx.lineTo(midX, scaleY(b.low));
    ctx.stroke();

    ctx.fillStyle = color;
    const top = scaleY(Math.max(b.open, b.close));
    const ht = Math.max(Math.abs(scaleY(b.open) - scaleY(b.close)), 1);
    ctx.fillRect(midX - cW / 2, top, cW, ht);
  });

  // Price label
  const lastClose = closes[closes.length - 1];
  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 12px system-ui";
  ctx.textAlign = "right";
  ctx.fillText(`$${lastClose.toFixed(2)}`, W - pad.right, scaleY(lastClose) - 6);
}

function drawMacd(
  ctx: CanvasRenderingContext2D,
  bars: ChartBar[],
  W: number, H: number, pad: Pad, plotW: number, plotH: number
) {
  const vals = bars.map((b) => b.histogram);
  const lines = bars.map((b) => b.macd);
  const signals = bars.map((b) => b.signal_line);
  const min = Math.min(...vals, ...lines, ...signals);
  const max = Math.max(...vals, ...lines, ...signals);
  const range = max - min || 1;
  const scaleY = (v: number) => pad.top + plotH - ((v - min) / range) * plotH;
  const barW = plotW / bars.length;
  const zero = scaleY(0);

  gridLines(ctx, W, H, pad, plotH, min, max);

  // Zero line
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pad.left, zero);
  ctx.lineTo(W - pad.right, zero);
  ctx.stroke();
  ctx.setLineDash([]);

  // Histogram bars
  bars.forEach((b, i) => {
    const x = pad.left + i * barW + barW * 0.15;
    const w = barW * 0.7;
    const positive = b.histogram >= 0;
    ctx.fillStyle = positive ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)";
    const top = positive ? scaleY(b.histogram) : zero;
    const ht = Math.abs(scaleY(b.histogram) - zero);
    ctx.fillRect(x, top, w, ht);
  });

  // MACD line
  ctx.beginPath();
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 1.5;
  bars.forEach((b, i) => {
    const x = pad.left + i * barW + barW / 2;
    if (i === 0) ctx.moveTo(x, scaleY(b.macd));
    else ctx.lineTo(x, scaleY(b.macd));
  });
  ctx.stroke();

  // Signal line
  ctx.beginPath();
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 1.5;
  bars.forEach((b, i) => {
    const x = pad.left + i * barW + barW / 2;
    if (i === 0) ctx.moveTo(x, scaleY(b.signal_line));
    else ctx.lineTo(x, scaleY(b.signal_line));
  });
  ctx.stroke();
}

function drawRsi(
  ctx: CanvasRenderingContext2D,
  bars: ChartBar[],
  W: number, H: number, pad: Pad, plotW: number, plotH: number
) {
  const min = 0;
  const max = 100;
  const range = 100;
  const scaleY = (v: number) => pad.top + plotH - ((v - min) / range) * plotH;
  const barW = plotW / bars.length;

  gridLines(ctx, W, H, pad, plotH, 0, 100, 4);

  // Zones
  ctx.fillStyle = "rgba(239,68,68,0.08)";
  ctx.fillRect(pad.left, scaleY(100), plotW, scaleY(70) - scaleY(100));
  ctx.fillStyle = "rgba(34,197,94,0.08)";
  ctx.fillRect(pad.left, scaleY(30), plotW, scaleY(0) - scaleY(30));

  [70, 30].forEach((level) => {
    ctx.strokeStyle = level === 70 ? "rgba(239,68,68,0.5)" : "rgba(34,197,94,0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, scaleY(level));
    ctx.lineTo(W - pad.right, scaleY(level));
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // RSI line
  ctx.beginPath();
  ctx.lineWidth = 2;
  bars.forEach((b, i) => {
    const x = pad.left + i * barW + barW / 2;
    const color = b.rsi > 70 ? "#ef4444" : b.rsi < 30 ? "#22c55e" : "#D4AF37";
    if (i === 0) {
      ctx.strokeStyle = color;
      ctx.moveTo(x, scaleY(b.rsi));
    } else {
      ctx.strokeStyle = color;
      ctx.lineTo(x, scaleY(b.rsi));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, scaleY(b.rsi));
    }
  });
  ctx.stroke();
}
