import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 30,16 16,30 2,16" fill="url(#fGold)" stroke="#B8941F" strokeWidth="0.8" />
                <defs>
                  <linearGradient id="fGold" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#E8C547" />
                    <stop offset="100%" stopColor="#B8941F" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-bold text-sm shimmer">GOLD Eyes</span>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-[220px]">
              Market intelligence for professionals who close deals with confidence.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3">Platform</p>
            <ul className="space-y-2">
              {[
                { label: "Home",        href: "/" },
                { label: "Pricing",     href: "/pricing" },
                { label: "Contact",     href: "/contact" },
                { label: "Dashboard",   href: "/dashboard" },
                { label: "Leaderboard", href: "/leaderboard" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-muted hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3">Legal</p>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Disclaimer"].map((t) => (
                <li key={t}>
                  <a href="#" className="text-xs text-muted hover:text-foreground transition-colors">{t}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            © {year} GOLD Eyes. All rights reserved.
          </p>
          <p className="text-xs text-muted text-center sm:text-right max-w-xs">
            Market data is for informational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
