"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoldStore } from "@/lib/store";
import { formatCurrency, formatPercent } from "@/lib/utils";

const QUICK_QUESTIONS = [
  "What's the current gold price?",
  "Is gold bullish or bearish today?",
  "What are the key price levels?",
  "How does inflation affect gold?",
];

function generateResponse(question: string, goldPrice: ReturnType<typeof useGoldStore.getState>["goldPrice"], insight: ReturnType<typeof useGoldStore.getState>["insight"]): string {
  const q = question.toLowerCase();

  if (q.includes("price") || q.includes("current") || q.includes("how much")) {
    if (!goldPrice) return "I'm still loading the latest gold price data. Please try again in a moment.";
    return `Gold (XAU/USD) is currently trading at ${formatCurrency(goldPrice.price)} per troy ounce, with a ${formatPercent(goldPrice.changePercent)} change today. The 24h range is ${formatCurrency(goldPrice.low)} — ${formatCurrency(goldPrice.high)}.`;
  }

  if (q.includes("bullish") || q.includes("bearish") || q.includes("sentiment") || q.includes("outlook")) {
    if (!insight) return "I'm still analyzing market sentiment. Please check back shortly.";
    return `Today's sentiment is **${insight.sentiment.toUpperCase()}**. ${insight.outlook ?? insight.summary}`;
  }

  if (q.includes("level") || q.includes("support") || q.includes("resistance")) {
    if (!goldPrice) return "Loading price data...";
    const support = Math.floor(goldPrice.low / 10) * 10;
    const resistance = Math.ceil(goldPrice.high / 10) * 10;
    return `Key technical levels to watch:\n\n**Support:** $${support} (near today's low)\n**Resistance:** $${resistance} (near today's high)\n**Pivot:** $${Math.round((support + resistance) / 2)}\n\nA break above resistance could target $${resistance + 50}, while a break below support may test $${support - 50}.`;
  }

  if (q.includes("inflation")) {
    return "**Gold and Inflation:**\n\nGold is traditionally viewed as an inflation hedge. When inflation rises, the purchasing power of fiat currencies decreases, making gold more attractive as a store of value.\n\n" +
      (insight ? `Current view: ${insight.drivers?.inflation ?? insight.summary}` : "Load market data for current analysis.");
  }

  if (q.includes("usd") || q.includes("dollar")) {
    return "**Gold and the US Dollar:**\n\nGold has an inverse relationship with the USD. A stronger dollar makes gold more expensive for foreign buyers, typically pressuring prices down. Conversely, dollar weakness supports gold prices.\n\n" +
      (insight ? `Current view: ${insight.drivers?.usdStrength ?? insight.summary}` : "Load market data for current analysis.");
  }

  if (q.includes("rate") || q.includes("interest") || q.includes("fed")) {
    return "**Gold and Interest Rates:**\n\nHigher interest rates increase the opportunity cost of holding non-yielding assets like gold. When central banks raise rates, gold can face downward pressure. Rate cut expectations tend to support gold.\n\n" +
      (insight ? `Current view: ${insight.drivers?.interestRates ?? insight.summary}` : "Load market data for current analysis.");
  }

  if (q.includes("buy") || q.includes("invest") || q.includes("should")) {
    return "I can provide market data and analysis, but I'm not a financial advisor. Here's what I can share:\n\n" +
      (goldPrice ? `- Current price: ${formatCurrency(goldPrice.price)}\n` : "") +
      (insight ? `- Sentiment: ${insight.sentiment}\n- ${insight.outlook ?? insight.summary}\n\n` : "") +
      "Always do your own research and consider consulting a licensed financial advisor before making investment decisions.";
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return "Hello! I'm **GOLD Eyes AI**, your gold market assistant. I can help you with:\n\n- Current gold prices and market data\n- Market sentiment and outlook\n- Key support/resistance levels\n- How macro factors affect gold\n\nWhat would you like to know?";
  }

  return "Great question! Here's what I can help with:\n\n" +
    "- **\"What's the current gold price?\"** — Live XAU/USD data\n" +
    "- **\"Is gold bullish today?\"** — Market sentiment\n" +
    "- **\"Key price levels\"** — Support & resistance\n" +
    "- **\"How does inflation affect gold?\"** — Macro analysis\n\n" +
    "Try asking one of these!";
}

export default function GoldChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatMessages = useGoldStore((s) => s.chatMessages);
  const addChatMessage = useGoldStore((s) => s.addChatMessage);
  const clearChat = useGoldStore((s) => s.clearChat);
  const goldPrice = useGoldStore((s) => s.goldPrice);
  const insight = useGoldStore((s) => s.insight);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const handleSend = (message?: string) => {
    const text = message || input.trim();
    if (!text) return;

    addChatMessage({ role: "user", content: text });
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = generateResponse(text, goldPrice, insight);
      addChatMessage({ role: "assistant", content: response });
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold text-background shadow-lg shadow-gold/20 flex items-center justify-center hover:bg-gold-light transition-colors pulse-gold"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Ask GOLD Eyes"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] rounded-2xl bg-surface border border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-surface-light flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gold/15 flex items-center justify-center">
                  <span className="text-gold text-xs font-bold">GE</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Ask GOLD Eyes</h3>
                  <p className="text-[10px] text-muted">Gold market Q&A</p>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="text-[10px] text-muted hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {chatMessages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted text-center mb-3">
                    Ask me anything about the gold market!
                  </p>
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="w-full text-left px-3 py-2 text-xs text-muted hover:text-foreground bg-background rounded-lg border border-border hover:border-gold/30 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-gold text-background rounded-br-sm"
                        : "bg-background text-foreground border border-border rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-xl bg-background border border-border rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="Ask about gold..."
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-3 py-2 rounded-xl bg-gold text-background text-xs font-semibold hover:bg-gold-light transition-colors disabled:opacity-40"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
