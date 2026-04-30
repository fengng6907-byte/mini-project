"""Fetches XAU/USD OHLC data from Twelve Data, Alpha Vantage, or simulation."""

import os
import math
import random
from datetime import datetime, timedelta, timezone
from typing import Literal

import httpx
import numpy as np
import pandas as pd

Timeframe = Literal["1H", "4H", "1D"]

TWELVE_DATA_BASE = "https://api.twelvedata.com"
ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query"

_AV_INTERVAL_MAP: dict[str, str] = {
    "1H": "60min",
    "4H": "60min",  # will downsample
    "1D": "daily",
}

_TD_INTERVAL_MAP: dict[str, str] = {
    "1H": "1h",
    "4H": "4h",
    "1D": "1day",
}


async def fetch_ohlc(timeframe: Timeframe = "1H", length: int = 200) -> pd.DataFrame:
    """Return a DataFrame with columns [open, high, low, close, volume]."""
    td_key = os.getenv("TWELVE_DATA_API_KEY", "")
    av_key = os.getenv("ALPHA_VANTAGE_API_KEY", "")

    df: pd.DataFrame | None = None

    if td_key:
        df = await _fetch_twelve_data(td_key, timeframe, length)

    if df is None and av_key:
        df = await _fetch_alpha_vantage(av_key, timeframe, length)

    if df is None:
        df = _simulate_ohlc(length, timeframe)

    return df.tail(length).copy()


async def _fetch_twelve_data(key: str, timeframe: Timeframe, length: int) -> pd.DataFrame | None:
    interval = _TD_INTERVAL_MAP[timeframe]
    params = {
        "symbol": "XAU/USD",
        "interval": interval,
        "outputsize": str(length),
        "apikey": key,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{TWELVE_DATA_BASE}/time_series", params=params)
            r.raise_for_status()
            data = r.json()
        values = data.get("values")
        if not values:
            return None
        df = pd.DataFrame(values)
        df = df.rename(columns={"datetime": "time"})
        for col in ["open", "high", "low", "close", "volume"]:
            df[col] = pd.to_numeric(df.get(col, 0), errors="coerce")
        df["time"] = pd.to_datetime(df["time"])
        df = df.sort_values("time").reset_index(drop=True)
        return df[["time", "open", "high", "low", "close", "volume"]]
    except Exception:
        return None


async def _fetch_alpha_vantage(key: str, timeframe: Timeframe, length: int) -> pd.DataFrame | None:
    interval = _AV_INTERVAL_MAP[timeframe]
    if interval == "daily":
        func = "FX_DAILY"
    else:
        func = "FX_INTRADAY"

    params: dict = {
        "function": func,
        "from_symbol": "XAU",
        "to_symbol": "USD",
        "apikey": key,
        "outputsize": "compact",
    }
    if func == "FX_INTRADAY":
        params["interval"] = interval

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(ALPHA_VANTAGE_BASE, params=params)
            r.raise_for_status()
            data = r.json()

        ts_key = next((k for k in data if "Time Series" in k), None)
        if not ts_key:
            return None
        ts = data[ts_key]
        rows = []
        for dt_str, vals in ts.items():
            rows.append({
                "time": pd.to_datetime(dt_str),
                "open": float(vals.get("1. open", 0)),
                "high": float(vals.get("2. high", 0)),
                "low": float(vals.get("3. low", 0)),
                "close": float(vals.get("4. close", 0)),
                "volume": 0.0,
            })
        df = pd.DataFrame(rows).sort_values("time").reset_index(drop=True)
        return df.tail(length)
    except Exception:
        return None


def _simulate_ohlc(length: int, timeframe: Timeframe) -> pd.DataFrame:
    """Generate realistic-looking synthetic XAU/USD data using Brownian motion."""
    rng = random.Random(42)
    base = 3200.0
    rows = []
    now = datetime.now(timezone.utc)

    hours_per_bar = {"1H": 1, "4H": 4, "1D": 24}[timeframe]
    price = base

    for i in range(length):
        dt = now - timedelta(hours=hours_per_bar * (length - i))
        # Drift + noise with occasional trend shifts
        drift = rng.gauss(0.002, 0.3)
        price = max(price * (1 + drift / 100), 1000)
        spread = price * rng.uniform(0.001, 0.004)
        open_ = price + rng.gauss(0, spread * 0.3)
        close = price + rng.gauss(0, spread * 0.3)
        high = max(open_, close) + abs(rng.gauss(0, spread))
        low = min(open_, close) - abs(rng.gauss(0, spread))
        volume = rng.uniform(800, 3000)
        rows.append({"time": dt, "open": open_, "high": high, "low": low, "close": close, "volume": volume})

    return pd.DataFrame(rows)


def get_current_price(df: pd.DataFrame) -> float:
    return float(df["close"].iloc[-1])
