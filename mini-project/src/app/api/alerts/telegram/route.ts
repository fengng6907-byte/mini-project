import { NextResponse } from "next/server";
import type { SignalLabel } from "@/types";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";
const SMTP_HOST = process.env.SMTP_HOST ?? "";
const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const ALERT_EMAIL = process.env.ALERT_EMAIL ?? "";

// ── Telegram ──────────────────────────────────────────────────────────────────
async function sendTelegram(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
  try {
    const r = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );
    return r.ok;
  } catch {
    return false;
  }
}

// ── Email via SMTP (nodemailer-compatible raw SMTP call) ──────────────────────
async function sendEmailAlert(
  subject: string,
  body: string,
  to: string
): Promise<boolean> {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !to) return false;
  try {
    // Use SMTP2GO / SendGrid / Mailgun HTTP API — avoids needing nodemailer in Next.js
    // Replace with your preferred transactional email provider's REST endpoint.
    const r = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: SMTP_PASS,
        to: [to],
        sender: SMTP_USER,
        subject,
        text_body: body,
      }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

// ── Format signal message ─────────────────────────────────────────────────────
function formatMessage(
  signal: SignalLabel,
  confidence: number,
  price: number,
  reasons: string[]
): string {
  const emoji =
    signal.includes("Strong Buy") ? "🟢🔥" :
    signal.includes("Weak Buy")   ? "🟢" :
    signal.includes("Strong Sell")? "🔴🔥" :
    signal.includes("Weak Sell")  ? "🔴" : "⚪";

  return (
    `${emoji} <b>Gold Signal Alert: ${signal}</b>\n\n` +
    `💰 XAU/USD: <b>$${price.toFixed(2)}</b>\n` +
    `📊 Confidence: <b>${confidence}%</b>\n\n` +
    `<b>Reasons:</b>\n` +
    reasons.map((r) => `• ${r}`).join("\n") +
    `\n\n<i>Gold AI Signal Dashboard</i>`
  );
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signal, confidence, price, reasons, email } = body as {
      signal: SignalLabel;
      confidence: number;
      price: number;
      reasons: string[];
      email?: string;
    };

    if (!signal || confidence === undefined || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Only alert on Strong Buy / Strong Sell
    const isActionable = signal === "Strong Buy" || signal === "Strong Sell";
    if (!isActionable) {
      return NextResponse.json({ sent: false, reason: "Signal not strong enough for alert" });
    }

    const message = formatMessage(signal, confidence, price, reasons ?? []);
    const subject = `Gold Signal: ${signal} (${confidence}% confidence)`;
    const emailText = message.replace(/<[^>]+>/g, "");

    const [telegramOk, emailOk] = await Promise.all([
      sendTelegram(message),
      sendEmailAlert(subject, emailText, email ?? ALERT_EMAIL),
    ]);

    return NextResponse.json({
      sent: telegramOk || emailOk,
      telegram: telegramOk,
      email: emailOk,
      message: `Alert dispatched for ${signal}`,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
