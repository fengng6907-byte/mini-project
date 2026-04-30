"""FastAPI entry point for the Gold AI Signal backend."""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routes.signal import router as signal_router
from services import ai_model as ai
from services.data_fetcher import fetch_ohlc

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-train the ML model on startup
    try:
        df = await fetch_ohlc(timeframe="1H", length=250)
        trained = ai.train(df)
        print(f"[startup] ML model trained: {trained}")
    except Exception as e:
        print(f"[startup] ML training skipped: {e}")
    yield


app = FastAPI(
    title="Gold AI Signal API",
    description="XAU/USD technical analysis with MACD, RSI, EMA and ML confidence scoring.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(signal_router, prefix="/api")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "time": datetime.now(timezone.utc).isoformat(),
        "ml_trained": ai._trained,
    }
