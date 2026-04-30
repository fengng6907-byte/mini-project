"""Calculates MACD, RSI, EMA50, EMA200 from an OHLC DataFrame."""

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class IndicatorResult:
    macd: float
    signal_line: float
    histogram: float
    prev_macd: float
    prev_signal: float
    prev_histogram: float
    rsi: float
    ema50: float
    ema200: float
    current_price: float


def _ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()


def calculate_macd(
    close: pd.Series,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> tuple[pd.Series, pd.Series, pd.Series]:
    ema_fast = _ema(close, fast)
    ema_slow = _ema(close, slow)
    macd_line = ema_fast - ema_slow
    signal_line = _ema(macd_line, signal)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def calculate_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def compute_all(df: pd.DataFrame) -> IndicatorResult:
    close = df["close"]

    macd_line, signal_line, histogram = calculate_macd(close)
    rsi = calculate_rsi(close)
    ema50 = _ema(close, 50)
    ema200 = _ema(close, 200)

    idx = -1
    prev = -2

    return IndicatorResult(
        macd=float(macd_line.iloc[idx]),
        signal_line=float(signal_line.iloc[idx]),
        histogram=float(histogram.iloc[idx]),
        prev_macd=float(macd_line.iloc[prev]),
        prev_signal=float(signal_line.iloc[prev]),
        prev_histogram=float(histogram.iloc[prev]),
        rsi=float(rsi.iloc[idx]),
        ema50=float(ema50.iloc[idx]),
        ema200=float(ema200.iloc[idx]),
        current_price=float(close.iloc[idx]),
    )


def to_dict(ind: IndicatorResult) -> dict:
    return {
        "macd": round(ind.macd, 4),
        "signal_line": round(ind.signal_line, 4),
        "histogram": round(ind.histogram, 4),
        "rsi": round(ind.rsi, 2),
        "ema50": round(ind.ema50, 2),
        "ema200": round(ind.ema200, 2),
        "current_price": round(ind.current_price, 2),
    }


def get_chart_series(df: pd.DataFrame, n: int = 100) -> list[dict]:
    """Return last-n bars as a list of {time, open, high, low, close}."""
    subset = df.tail(n).copy()
    macd_line, signal_line, histogram = calculate_macd(subset["close"])
    rsi = calculate_rsi(subset["close"])
    ema50 = _ema(subset["close"], 50)

    result = []
    for i, row in subset.iterrows():
        ts = row["time"]
        result.append({
            "time": int(ts.timestamp()) if hasattr(ts, "timestamp") else int(ts),
            "open": round(float(row["open"]), 2),
            "high": round(float(row["high"]), 2),
            "low": round(float(row["low"]), 2),
            "close": round(float(row["close"]), 2),
            "macd": round(float(macd_line.loc[i] if i in macd_line.index else 0), 4),
            "signal_line": round(float(signal_line.loc[i] if i in signal_line.index else 0), 4),
            "histogram": round(float(histogram.loc[i] if i in histogram.index else 0), 4),
            "rsi": round(float(rsi.loc[i] if i in rsi.index else 50), 2),
            "ema50": round(float(ema50.loc[i] if i in ema50.index else 0), 2),
        })
    return result
