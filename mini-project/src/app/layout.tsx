import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GOLD Eyes — Market Intelligence for Deal Closers",
    template: "%s — GOLD Eyes",
  },
  description:
    "Real-time XAU/USD intelligence, AI-powered insights, and portfolio analytics that help salespeople, real estate agents, and entrepreneurs close more deals.",
  keywords: [
    "gold market intelligence", "XAU/USD live price", "gold trading simulator",
    "lead closing rate", "sales intelligence", "gold tracker Malaysia",
    "gold tracker Singapore", "gold price alerts",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "GOLD Eyes — Market Intelligence for Deal Closers",
    description: "Live gold data, AI insights, and portfolio analytics that professionals use to close more deals.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F4F4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
