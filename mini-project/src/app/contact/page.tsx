"use client";

import { useActionState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { sendContactEmail, type ContactState } from "@/app/actions/contact";

const SUBJECTS = [
  "General Enquiry",
  "Sales / Pricing",
  "Technical Support",
  "Partnership Opportunity",
  "API Access",
  "Other",
];

const CONTACT_DETAILS = [
  {
    label: "Email",
    value: "fengng6907@gmail.com",
    href: "mailto:fengng6907@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Response Time",
    value: "Within 24 hours",
    href: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Location",
    value: "Malaysia & Singapore",
    href: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const initialState: ContactState = {};

export default function ContactPage() {
  const [state, formAction, pending] = useActionState(sendContactEmail, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <section className="pt-32 pb-12 text-center max-w-2xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-3">Get in Touch</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Let&apos;s start a<br />
          <span className="shimmer">conversation</span>
        </h1>
        <p className="mt-4 text-muted text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          Whether you have a question about pricing, need a product walkthrough, or want to explore a partnership — we&apos;re here to help.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ── Left: Contact details ── */}
          <div className="lg:col-span-2 space-y-5">
            {CONTACT_DETAILS.map((item) => (
              <div key={item.label} className="matte-card rounded-xl p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-muted mb-0.5">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium text-foreground hover:text-gold transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Decorative promise card */}
            <div className="rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-xs font-semibold text-gold uppercase tracking-widest">Our Promise</p>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Every enquiry is read personally. We respond within one business day — often sooner.
              </p>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="lg:col-span-3">
            <div className="matte-card rounded-2xl p-7">
              <h2 className="text-lg font-semibold text-foreground mb-6">Send us a message</h2>

              {/* Success state */}
              {state.success && (
                <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-success/10 border border-success/25">
                  <svg className="w-5 h-5 text-success shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-success">Message sent successfully!</p>
                    <p className="text-xs text-muted mt-0.5">We&apos;ll be in touch within 24 hours.</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {state.error && (
                <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/25">
                  <svg className="w-5 h-5 text-danger shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-danger">{state.error}</p>
                </div>
              )}

              <form ref={formRef} action={formAction} className="space-y-4">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-muted mb-1.5">
                      Full Name <span className="text-cta">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Jane Smith"
                      className="w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-muted mb-1.5">
                      Email Address <span className="text-cta">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="jane@company.com"
                      className="w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                    />
                  </div>
                </div>

                {/* Company + Subject row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-xs font-medium text-muted mb-1.5">Company</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Acme Corp (optional)"
                      className="w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-xs font-medium text-muted mb-1.5">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all appearance-none"
                    >
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-muted mb-1.5">
                    Message <span className="text-cta">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us how we can help…"
                    className="w-full bg-surface-light border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full py-3 bg-cta hover:bg-cta-hover disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {pending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    "Send Message →"
                  )}
                </button>

                <p className="text-xs text-muted text-center">
                  By submitting you agree to our{" "}
                  <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
