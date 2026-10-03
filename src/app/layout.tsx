import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { HeaderFallback, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const display = Unbounded({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "MARQUEE — a series guide",
    template: "%s — MARQUEE",
  },
  description: "A TVMaze catalog with an infinite list, paused search, and a watchlist kept in the browser.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MARQUEE",
    title: "MARQUEE — a series guide",
    description: "A live show catalog: a scrolling list, search, and a watchlist.",
  },
};

export const viewport: Viewport = {
  themeColor: "#100e0c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-stage font-sans text-ink antialiased">
        <Providers>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Suspense fallback={<HeaderFallback />}>
            <SiteHeader />
          </Suspense>
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
