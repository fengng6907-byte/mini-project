"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RETAIL_STORES } from "@/lib/constants";
import type { RetailStore } from "@/types";

type CountryFilter = "all" | "Malaysia" | "Singapore";

function StoreCard({ store }: { store: RetailStore }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface overflow-hidden"
    >
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-light transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold font-bold text-sm">
            {store.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{store.name}</h3>
            <p className="text-xs text-muted">{store.country}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
            Spread: {store.spreadEstimate}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5 border-t border-border pt-3">
              {/* Locations */}
              {store.locations.map((loc, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gold shrink-0 mt-0.5"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className="text-foreground">{loc.address}</p>
                    <p className="text-muted">{loc.city}</p>
                  </div>
                </div>
              ))}

              {/* Map embed */}
              <div className="mt-2 rounded-lg overflow-hidden border border-border">
                <iframe
                  title={`${store.name} location`}
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=${
                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
                  }&q=${encodeURIComponent(store.name + " " + store.locations[0].city)}&zoom=14`}
                />
              </div>

              {/* Website link */}
              <a
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <path d="M15 3h6v6" />
                  <path d="M10 14L21 3" />
                </svg>
                Visit Website
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RetailDirectory() {
  const [filter, setFilter] = useState<CountryFilter>("all");

  const filtered = filter === "all" ? RETAIL_STORES : RETAIL_STORES.filter((s) => s.country === filter);

  return (
    <div className="space-y-4">
      {/* Country Filter */}
      <div className="flex items-center gap-2">
        {(["all", "Malaysia", "Singapore"] as CountryFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              filter === f
                ? "bg-gold/15 text-gold border border-gold/30"
                : "text-muted hover:text-foreground bg-surface border border-border hover:border-border"
            }`}
          >
            {f === "all" ? "All Countries" : f}
          </button>
        ))}
      </div>

      {/* Store List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
