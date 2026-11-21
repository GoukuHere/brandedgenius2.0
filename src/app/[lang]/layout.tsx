import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { MotionProvider } from "@/components/system/motion-provider";
import { isLocale, LOCALES } from "@/i18n/config";
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
  2026-11-16: v11 is the only version (the client approved it); the site gains the subpages. The whole preview stays
  out of search engines: the client's live site is brandedgenius.de, and the same copy indexed on vercel.app would
  compete with it.
*/
const SITE_META = {
  de: {
    title: "KI-Automatisierung, die Ergebnisse schafft | Branded Genius",
    description:
      "Branded Genius entwickelt KI-Agenten, Automatisierungen und intelligente Workflows für Marketing, Vertrieb, Kundenservice und interne Prozesse – von der Potenzialanalyse bis zur Umsetzung.",
  },
  // Round 5 (DE/EN): the English title and description, written to the copy standard.
  en: {
    title: "AI automation that delivers results | Branded Genius",
    description:
      "Branded Genius builds AI agents, automations and smart workflows for marketing, sales, customer service and internal processes. From the potential analysis to the finished system.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const value = await lang();
  const meta = SITE_META[isLocale(value) ? value : "de"];
  return {
    title: { default: meta.title, template: "%s | Branded Genius" },
    robots: { index: false, follow: false },
    description: meta.description,
  };
}

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
      </body>
    </html>
  );
}
