import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/system/motion-provider";
import "./globals.css";

/*
  The one brand face: General Sans (Indian Type Foundry, via Fontshare), upright only, as a variable font covering
  weights 200 to 700. Self-hosted through next/font, so no visitor request goes to a font service.
  Licence: ITF Free Font License 2.0 (free for commercial use, self-hosting on websites allowed), see fonts/GeneralSans-FFL.txt.
*/
const brand = localFont({
  src: "./fonts/GeneralSans-Variable.woff2",
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
export const metadata: Metadata = {
  title: { default: "KI-Automatisierung, die Ergebnisse schafft | Branded Genius", template: "%s | Branded Genius" },
  robots: { index: false, follow: false },
  description:
    "Branded Genius entwickelt KI-Agenten, Automatisierungen und intelligente Workflows für Marketing, Vertrieb, Kundenservice und interne Prozesse – von der Potenzialanalyse bis zur Umsetzung.",
};

export const viewport: Viewport = {
  themeColor: "#05112c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`dark ${brand.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
