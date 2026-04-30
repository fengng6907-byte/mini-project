"""Optional RandomForestClassifier that boosts or reduces confidence score."""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Optional

try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    _SKLEARN_AVAILABLE = True
except ImportError:
    _SKLEARN_AVAILABLE = False

from .indicators import IndicatorResult, calculate_macd, calculate_rsi, _ema


@dataclass
class MLPrediction:
    probability_up: float  # 0..1
    boost_pts: int          # added to confidence (positive = bullish, negative = bearish)
    available: bool


_model: Optional["RandomForestClassifier"] = None  # type: ignore[type-arg]
_scaler: Optional["StandardScaler"] = None          # type: ignore[type-arg]
_trained = False


def _extract_features(df: pd.DataFrame) -> np.ndarray:
    """Build feature matrix from OHLC DataFrame."""
    close = df["close"]
    macd_line, signal_line, histogram = calculate_macd(close)
    rsi = calculate_rsi(close)
    ema50 = _ema(close, 50)
    ema200 = _ema(close, 200)

    features = pd.DataFrame({
        "macd": macd_line,
        "signal_line": signal_line,
        "histogram": histogram,
        "rsi": rsi,
        "ema_ratio": ema50 / ema200,
        "price_vs_ema50": close / ema50,
        "returns_1": close.pct_change(1),
        "returns_3": close.pct_change(3),
        "returns_5": close.pct_change(5),
    }).dropna()

    return features.values


def train(df: pd.DataFrame) -> bool:
    """Train the RandomForest on historical OHLC data. Returns True if trained."""
    global _model, _scaler, _trained

    if not _SKLEARN_AVAILABLE:
        return False

    if len(df) < 60:
        return False

    try:
        X = _extract_features(df)
        close = df["close"].values
        # Label: 1 if price rises 3 bars ahead, else 0
        labels = []
        for i in range(len(close) - 5):
            labels.append(1 if close[i + 3] > close[i] else 0)

        # Align X with labels
        X = X[:len(labels)]

        _scaler = StandardScaler()
        X_scaled = _scaler.fit_transform(X)

        _model = RandomForestClassifier(
            n_estimators=100,
            max_depth=4,         # shallow tree — avoid overfitting
            min_samples_leaf=10,
            random_state=42,
        )
        _model.fit(X_scaled, labels)
        _trained = True
        return True
    except Exception:
        return False


def predict(ind: IndicatorResult) -> MLPrediction:
    """Return ML prediction for current indicator state."""
    if not _SKLEARN_AVAILABLE or not _trained or _model is None or _scaler is None:
        return MLPrediction(probability_up=0.5, boost_pts=0, available=False)

    try:
        ema_ratio = ind.ema50 / ind.ema200 if ind.ema200 != 0 else 1.0
        price_vs_ema50 = ind.current_price / ind.ema50 if ind.ema50 != 0 else 1.0

        X = np.array([[
            ind.macd,
            ind.signal_line,
            ind.histogram,
            ind.rsi,
            ema_ratio,
            price_vs_ema50,
            0.0,  # returns_1 (unknown at inference)
            0.0,
            0.0,
        ]])
        X_scaled = _scaler.transform(X)
        prob_up = float(_model.predict_proba(X_scaled)[0][1])

        # Convert probability to boost points (-10 to +10)
        if prob_up > 0.65:
            boost = int((prob_up - 0.5) * 40)   # up to +12
        elif prob_up < 0.35:
            boost = int((prob_up - 0.5) * 40)   # down to -12
        else:
            boost = 0

        boost = max(-10, min(10, boost))
        return MLPrediction(probability_up=prob_up, boost_pts=boost, available=True)
    except Exception:
        return MLPrediction(probability_up=0.5, boost_pts=0, available=False)
