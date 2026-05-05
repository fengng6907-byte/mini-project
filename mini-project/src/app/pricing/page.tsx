import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const TIERS = [
  {
    name: "Explorer",
    price: "Free",
    period: "",
    description: "Everything you need to start tracking gold markets with confidence.",
    cta: "Get Started Free",
    href: "/register",
    highlight: false,
    features: [
      "Live XAU/USD spot price",
      "Basic price charts (1D, 1W)",
      "1 price alert",
      "Retail directory access",
      "Gold weight calculator",
      "Community leaderboard",
    ],
    missing: [
      "AI-powered daily insights",
      "Virtual trading simulator",
      "Unlimited alerts",
      "Portfolio tracker",
      "API access",
    ],
  },
  {
    name: "Trader",
    price: "$29",
    period: "/ month",
    description: "The full intelligence suite for professionals who close deals with data.",
    cta: "Start 14-Day Free Trial",
    href: "/register",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Everything in Explorer",
      "Live multi-timeframe charts",
      "Unlimited price alerts",
      "AI-powered daily insights",
      "Virtual trading simulator ($10K)",
      "Full portfolio & P&L tracker",
      "Forex correlation data",
      "Priority email support",
    ],
    missing: ["API access", "Dedicated account manager"],
  },
  {
    name: "Institutional",
    price: "$99",
    period: "/ month",
    description: "For firms and teams that need deeper data, custom workflows, and white-glove service.",
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
    features: [
      "Everything in Trader",
      "REST API access (10K req/day)",
      "Custom alert workflows",
      "Team seats (up to 10 users)",
      "Dedicated account manager",
      "SLA-backed uptime guarantee",
      "Custom data exports (CSV/JSON)",
      "Early access to new features",
    ],
    missing: [],
  },
];

const FAQ = [
  {
    q: "Can I upgrade or downgrade at any time?",
    a: "Yes. Plan changes take effect immediately. If you upgrade mid-cycle you are billed the prorated difference; downgrades apply at the next renewal.",
  },
  {
    q: "Is the 14-day trial really free?",
    a: "Absolutely. No credit card is required to start the Trader trial. You will only be charged if you choose to continue after the 14 days.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) as well as FPX for Malaysian customers.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes — annual billing is available at a 20% discount. Contact us at the link below to activate an annual plan.",
  },
  {
    q: "What is the API rate limit on Institutional?",
    a: "Institutional accounts receive 10,000 requests per day on our REST API. Higher limits are available for enterprise customers — reach out to discuss.",
  },
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-success shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="w-4 h-4 text-muted shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export const metadata = {
  title: "Pricing — GOLD Eyes",
  description: "Simple, transparent pricing for gold market intelligence. Start free, upgrade when you're ready.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 text-center max-w-3xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-3">Transparent Pricing</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Simple plans,<br />
          <span className="shimmer">powerful intelligence</span>
        </h1>
        <p className="mt-4 text-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Start free and upgrade as your needs grow. No hidden fees, no lock-in contracts.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-7 flex flex-col ${
                tier.highlight
                  ? "bg-[#1A1A1A] text-white shadow-2xl ring-2 ring-gold/50 md:-mt-4 md:pb-11"
                  : "matte-card"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold text-[#1A1A1A] text-xs font-bold tracking-wide">
                  {tier.badge}
                </div>
              )}

              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${tier.highlight ? "text-gold" : "text-muted"}`}>
                {tier.name}
              </p>
              <div className="flex items-end gap-1 mb-1">
                <span className={`text-4xl font-extrabold ${tier.highlight ? "text-white" : "text-foreground"}`}>
                  {tier.price}
                </span>
                {tier.period && (
                  <span className={`text-sm mb-1.5 ${tier.highlight ? "text-white/50" : "text-muted"}`}>
                    {tier.period}
                  </span>
                )}
              </div>
              <p className={`text-xs leading-relaxed mb-6 ${tier.highlight ? "text-white/60" : "text-muted"}`}>
                {tier.description}
              </p>

              <Link
                href={tier.href}
                className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-colors mb-6 ${
                  tier.highlight
                    ? "bg-cta hover:bg-cta-hover text-white"
                    : "border border-border hover:bg-surface-light text-foreground"
                }`}
              >
                {tier.cta}
              </Link>

              <div className="space-y-2.5">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckIcon />
                    <span className={`text-xs leading-relaxed ${tier.highlight ? "text-white/80" : "text-foreground"}`}>{f}</span>
                  </div>
                ))}
                {tier.missing.map((f) => (
                  <div key={f} className="flex items-start gap-2 opacity-40">
                    <CrossIcon />
                    <span className="text-xs leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-8">
          All prices in USD. Annual billing available at{" "}
          <span className="text-gold font-medium">20% off</span>.{" "}
          <Link href="/contact" className="underline hover:text-foreground transition-colors">
            Contact us
          </Link>{" "}
          for enterprise pricing.
        </p>
      </section>

      {/* Gold divider */}
      <div className="flex items-center justify-center gap-3 max-w-7xl mx-auto px-6 mb-16">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
      </div>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="matte-card rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-2">{item.q}</p>
              <p className="text-sm text-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] px-8 py-14 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/[0.08] rounded-full blur-[80px]" />
          </div>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Still have questions?</h2>
            <p className="text-sm text-white/60 mb-7 max-w-sm mx-auto">Our team is happy to walk you through the right plan for your workflow.</p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-cta hover:bg-cta-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-lg"
            >
              Talk to Sales →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
