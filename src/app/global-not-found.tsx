import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

/*
  The 404 for any address that is not a page (round 5: the pages moved under app/[lang], so there is no layout above
  them to render a not-found page in; Next renders this one on its own). German first, as the site always opens in
  German, with the English line under it; both lead home. The site's ground colour and brand face, nothing else.
*/
const brand = localFont({
  src: "./fonts/GeneralSans-Variable.woff2",
  variable: "--font-brand",
  weight: "200 700",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seite nicht gefunden | Branded Genius",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="de" className={`dark ${brand.variable}`}>
      <body className="bg-[#05112c] font-sans text-[#f1f1ee]">
        <main className="mx-auto flex min-h-svh max-w-[640px] flex-col justify-center px-6 py-24">
          <p className="num text-[15px] text-[#69bff8]">404</p>
          <h1 className="mt-4 text-[34px] leading-[1.15] font-medium tracking-[-0.02em] md:text-[44px]">Diese Seite gibt es nicht.</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-white/65" lang="en">
            This page does not exist.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center rounded-[12px] bg-[#ecebe6] px-6 text-[15px] font-medium text-[#141414] transition-colors duration-200 hover:bg-[#f7f7f4]"
            >
              Zur Startseite
            </Link>
            <Link
              href="/en/"
              lang="en"
              className="inline-flex h-12 items-center rounded-[12px] border border-white/15 px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-white/[0.08]"
            >
              English homepage
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
