import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/system/motion-provider";
import { PageBackground } from "@/components/system/page-background";
import { VersionNav } from "@/components/system/version-nav";
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

export const metadata: Metadata = {
  title: "KI-Automatisierung, die Ergebnisse schafft | Branded Genius",
  description:
    "Branded Genius entwickelt KI-Agenten, Automatisierungen und intelligente Workflows für Marketing, Vertrieb, Kundenservice und interne Prozesse – von der Potenzialanalyse bis zur Umsetzung.",
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`dark ${brand.variable}`}>
      <body>
        <PageBackground />
        <MotionProvider>{children}</MotionProvider>
        {/* Every version the client reviews (v1 the homepage, v2 to v7 the layout concepts), on every page. */}
        <VersionNav />
      </body>
    </html>
  );
}
