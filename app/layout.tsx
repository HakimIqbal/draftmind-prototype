import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DraftMind - PRD prototype",
  description:
    "Interactive prototype of DraftMind, an AI-assisted PRD editor. Local demo data only.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-[100dvh] bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-box focus:bg-accent focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="flex items-baseline gap-2 rounded-box focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="text-lg font-semibold tracking-tight">
                DraftMind
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                PRD studio
              </span>
            </Link>
            <p
              data-testid="demo-notice"
              className="font-mono text-[11px] uppercase tracking-wider text-ink-soft"
            >
              Demo prototype - local data only
            </p>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              DraftMind prototype v1.0
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              No backend. No API calls. Data stays in this browser.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}