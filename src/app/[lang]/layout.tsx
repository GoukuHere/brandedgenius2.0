import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { MotionProvider } from "@/components/system/motion-provider";
import { isLocale, LOCALES } from "@/i18n/config";
import { ldJson, ROBOTS, SHARE_IMAGE, SITE_NAME, SITE_URL, siteGraph } from "@/lib/seo";
import "../globals.css";

/*
  The one brand face: General Sans (Indian Type Foundry, via Fontshare), upright only, as a variable font covering
  weights 200 to 700. Self-hosted through next/font, so no visitor request goes to a font service.
  Licence: ITF Free Font License 2.0 (free for commercial use, self-hosting on websites allowed), see fonts/GeneralSans-FFL.txt.
*/
const brand = localFont({
  src: "../fonts/GeneralSans-Variable.woff2",
  variable: "--font-brand",
  weight: "200 700",
  style: "normal",
  display: "swap",
});

/*
  2026-11-24 (the move from the client's WordPress site, "he didn't want to lose the SEO"): the site is made to be
  indexed at brandedgenius.de. Every address and share card resolves against the live domain (metadataBase), the
  robots line is the old site's, and each page sets its own title, description and canonical (lib/seo.ts). The
  preview on vercel.app stays out of search through an X-Robots-Tag header on that host (next.config.ts), so the two
  never compete.
*/
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: ROBOTS,
  openGraph: { siteName: SITE_NAME, images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#05112c",
};

/*
  Round 5 (the DE/EN switch): the root layout sits in app/[lang], so every page is rendered once per language; the
  public addresses are mapped onto these routes in next.config.ts (German keeps its plain addresses). Only these two
  languages exist; any other first segment is not a page (the layout answers it with a 404; cacheComponents rules out
  dynamicParams = false).
*/
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} className={`dark ${brand.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
        {/* The business, its founder and the website, for search engines (lib/seo.ts). */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(siteGraph(locale)) }} />
      </body>
    </html>
  );
}
