"""Rule-based signal engine with weighted confidence scoring."""

from dataclasses import dataclass
from typing import Literal

from .indicators import IndicatorResult

SignalLabel = Literal["Strong Buy", "Weak Buy", "No Trade", "Weak Sell", "Strong Sell"]


@dataclass
class SignalResult:
    signal: SignalLabel
    confidence: int
    direction: Literal["buy", "sell", "neutral"]
    reasons: list[str]
    score_breakdown: dict[str, int]


def generate_signal(ind: IndicatorResult, ml_boost: int = 0) -> SignalResult:
    """
    Scoring weights (total 100):
      MACD crossover     → up to 30 pts
      RSI confirmation   → up to 20 pts
      EMA trend align    → up to 30 pts
      Momentum / hist    → up to 20 pts
    """
    buy_score = 0
    sell_score = 0
    reasons: list[str] = []
    breakdown: dict[str, int] = {
        "macd_crossover": 0,
        "rsi_confirmation": 0,
        "trend_alignment": 0,
        "momentum": 0,
        "ml_boost": ml_boost,
    }

    # ── MACD crossover (30 pts) ──────────────────────────────────────────────
    bullish_cross = ind.macd > ind.signal_line and ind.prev_macd <= ind.prev_signal
    bearish_cross = ind.macd < ind.signal_line and ind.prev_macd >= ind.prev_signal
    macd_above = ind.macd > ind.signal_line
    macd_below = ind.macd < ind.signal_line

    if bullish_cross:
        pts = 30
        buy_score += pts
        breakdown["macd_crossover"] = pts
        reasons.append("MACD bullish crossover")
    elif macd_above:
        pts = 15
        buy_score += pts
        breakdown["macd_crossover"] = pts
        reasons.append("MACD above signal line")
    elif bearish_cross:
        pts = 30
        sell_score += pts
        breakdown["macd_crossover"] = -pts
        reasons.append("MACD bearish crossover")
    elif macd_below:
        pts = 15
        sell_score += pts
        breakdown["macd_crossover"] = -pts
        reasons.append("MACD below signal line")

    # ── RSI confirmation (20 pts) ────────────────────────────────────────────
    rsi = ind.rsi
    if 40 <= rsi <= 60:
        buy_score += 20
        breakdown["rsi_confirmation"] = 20
        reasons.append(f"RSI neutral zone ({rsi:.1f}) — good for entry")
    elif rsi < 35:
        buy_score += 20
        breakdown["rsi_confirmation"] = 20
        reasons.append(f"RSI oversold ({rsi:.1f}) — potential reversal")
    elif 60 < rsi <= 70:
        sell_score += 10
        breakdown["rsi_confirmation"] = -10
        reasons.append(f"RSI elevated ({rsi:.1f})")
    elif rsi > 70:
        sell_score += 20
        breakdown["rsi_confirmation"] = -20
        reasons.append(f"RSI overbought ({rsi:.1f})")

    # ── EMA trend alignment (30 pts) ─────────────────────────────────────────
    price = ind.current_price
    above_ema50 = price > ind.ema50
    above_ema200 = price > ind.ema200
    golden_cross = ind.ema50 > ind.ema200

    if above_ema50:
        buy_score += 15
        breakdown["trend_alignment"] = (breakdown.get("trend_alignment") or 0) + 15
        reasons.append("Price above EMA50")
    else:
        sell_score += 15
        breakdown["trend_alignment"] = (breakdown.get("trend_alignment") or 0) - 15
        reasons.append("Price below EMA50")

    if golden_cross:
        buy_score += 15
        breakdown["trend_alignment"] = breakdown.get("trend_alignment", 0) + 15
        reasons.append("Golden cross (EMA50 > EMA200)")
    else:
        sell_score += 15
        breakdown["trend_alignment"] = breakdown.get("trend_alignment", 0) - 15
        reasons.append("Death cross (EMA50 < EMA200)")

    # ── Momentum / histogram (20 pts) ────────────────────────────────────────
    hist_growing = ind.histogram > ind.prev_histogram
    hist_shrinking = ind.histogram < ind.prev_histogram
    hist_positive = ind.histogram > 0

    if hist_positive and hist_growing:
        buy_score += 20
        breakdown["momentum"] = 20
        reasons.append("Histogram expanding — bullish momentum")
    elif hist_positive and hist_shrinking:
        buy_score += 8
        breakdown["momentum"] = 8
        reasons.append("Histogram positive but shrinking")
    elif not hist_positive and hist_shrinking:
        sell_score += 20
        breakdown["momentum"] = -20
        reasons.append("Histogram expanding negatively — bearish momentum")
    elif not hist_positive and hist_growing:
        sell_score += 8
        breakdown["momentum"] = -8
        reasons.append("Histogram negative but recovering")
    else:
        reasons.append("Sideways momentum — histogram flat")

    # ── ML boost ─────────────────────────────────────────────────────────────
    if ml_boost > 0:
        buy_score += ml_boost
        reasons.append(f"ML model bullish signal (+{ml_boost} pts)")
    elif ml_boost < 0:
        sell_score += abs(ml_boost)
        reasons.append(f"ML model bearish signal ({ml_boost} pts)")

    # ── Determine direction and final confidence ──────────────────────────────
    net = buy_score - sell_score

    if net > 0:
        direction: Literal["buy", "sell", "neutral"] = "buy"
        confidence = min(buy_score, 100)
        label: SignalLabel = "Strong Buy" if confidence >= 70 else "Weak Buy"
    elif net < 0:
        direction = "sell"
        confidence = min(sell_score, 100)
        label = "Strong Sell" if confidence >= 70 else "Weak Sell"
    else:
        direction = "neutral"
        confidence = 50
        label = "No Trade"

    # Sideways override: very weak histogram + RSI 45-55 = no trade
    if abs(ind.histogram) < 0.05 and 45 < rsi < 55 and abs(net) < 20:
        direction = "neutral"
        label = "No Trade"
        confidence = 40
        reasons.append("Indecisive price action — no clear signal")

    return SignalResult(
        signal=label,
        confidence=confidence,
        direction=direction,
        reasons=reasons,
        score_breakdown=breakdown,
    )
