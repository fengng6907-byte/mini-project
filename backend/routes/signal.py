"""FastAPI router for /api/signal and supporting endpoints."""

from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Query

from services import ai_model as ai
from services import indicators as ind_svc
from services import signal_engine as eng
from services.data_fetcher import Timeframe, fetch_ohlc, get_current_price
from services.indicators import compute_all, get_chart_series, to_dict

router = APIRouter()

# In-memory cache per timeframe
_cache: dict[str, dict] = {}
_CACHE_TTL = 300  # 5 minutes


def _cached(key: str) -> dict | None:
    entry = _cache.get(key)
    if not entry:
        return None
    age = (datetime.now(timezone.utc).timestamp() - entry["ts"])
    return entry["data"] if age < _CACHE_TTL else None


def _store(key: str, data: dict) -> None:
    _cache[key] = {"ts": datetime.now(timezone.utc).timestamp(), "data": data}


@router.get("/signal")
async def get_signal(
    timeframe: Timeframe = Query("1H", description="1H | 4H | 1D"),
    use_ml: bool = Query(True, description="Include RandomForest boost"),
):
    cache_key = f"{timeframe}:{use_ml}"
    cached = _cached(cache_key)
    if cached:
        return {**cached, "cached": True}

    df = await fetch_ohlc(timeframe=timeframe, length=250)
    indicators = compute_all(df)

    ml_boost = 0
    ml_info: dict = {"available": False, "probability_up": 0.5}

    if use_ml:
        if not ai._trained:
            ai.train(df)
        pred = ai.predict(indicators)
        ml_boost = pred.boost_pts
        ml_info = {
            "available": pred.available,
            "probability_up": round(pred.probability_up, 3),
            "boost_pts": pred.boost_pts,
        }

    signal_result = eng.generate_signal(indicators, ml_boost=ml_boost)
    chart = get_chart_series(df, n=100)
    current_price = get_current_price(df)

    payload = {
        "price": round(current_price, 2),
        "currency": "USD",
        "timeframe": timeframe,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "signal": signal_result.signal,
        "confidence": signal_result.confidence,
        "direction": signal_result.direction,
        "reasons": signal_result.reasons,
        "score_breakdown": signal_result.score_breakdown,
        "indicators": to_dict(indicators),
        "ml": ml_info,
        "chart": chart,
        "cached": False,
    }

    _store(cache_key, payload)
    return payload


@router.get("/signal/indicators")
async def get_indicators(timeframe: Timeframe = Query("1H")):
    df = await fetch_ohlc(timeframe=timeframe, length=250)
    indicators = compute_all(df)
    return {
        "timeframe": timeframe,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **to_dict(indicators),
    }


@router.get("/signal/history")
async def get_history(
    timeframe: Timeframe = Query("1H"),
    bars: int = Query(100, ge=10, le=500),
):
    df = await fetch_ohlc(timeframe=timeframe, length=bars + 50)
    chart = get_chart_series(df, n=bars)
    return {"timeframe": timeframe, "bars": chart}
