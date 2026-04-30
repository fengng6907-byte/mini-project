"""
Background scheduler — runs signal analysis every 5 minutes
and sends Telegram alerts on Strong Buy / Strong Sell.

Run standalone:  python scheduler.py
Or import it into main.py for in-process scheduling.
"""

import asyncio
import os
import logging
from datetime import datetime, timezone

import httpx
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("scheduler")

API_BASE = os.getenv("SIGNAL_API_URL", "http://localhost:8000")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL_SECONDS", "300"))  # 5 min
TIMEFRAMES = ["1H", "4H", "1D"]

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

_last_signal: dict[str, str] = {}


async def send_telegram(message: str) -> None:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(url, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "HTML",
        })


def format_alert(signal: str, confidence: int, price: float, reasons: list[str], tf: str) -> str:
    emoji = {"Strong Buy": "🟢🔥", "Strong Sell": "🔴🔥"}.get(signal, "⚪")
    bullet_reasons = "\n".join(f"• {r}" for r in reasons[:4])
    return (
        f"{emoji} <b>Gold Alert: {signal} [{tf}]</b>\n\n"
        f"💰 XAU/USD: <b>${price:.2f}</b>\n"
        f"📊 Confidence: <b>{confidence}%</b>\n\n"
        f"<b>Analysis:</b>\n{bullet_reasons}\n\n"
        f"<i>{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</i>"
    )


async def poll_once() -> None:
    async with httpx.AsyncClient(timeout=15) as client:
        for tf in TIMEFRAMES:
            try:
                r = await client.get(f"{API_BASE}/api/signal?timeframe={tf}&use_ml=true")
                r.raise_for_status()
                data = r.json()
                signal = data.get("signal", "")
                confidence = data.get("confidence", 0)
                price = data.get("price", 0)
                reasons = data.get("reasons", [])

                prev = _last_signal.get(tf)
                if signal in ("Strong Buy", "Strong Sell") and signal != prev:
                    log.info("Alert: %s %s @ $%.2f (%d%%)", tf, signal, price, confidence)
                    msg = format_alert(signal, confidence, price, reasons, tf)
                    await send_telegram(msg)
                else:
                    log.info("%s: %s (%d%%) @ $%.2f", tf, signal, confidence, price)

                _last_signal[tf] = signal
            except Exception as e:
                log.error("Error polling %s: %s", tf, e)


async def run() -> None:
    log.info("Scheduler started — polling every %ds", POLL_INTERVAL)
    while True:
        await poll_once()
        await asyncio.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    asyncio.run(run())
