import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Jost } from "next/font/google";
import { PageBackground } from "@/components/system/page-background";
import "./globals.css";

// next/font downloads both families at build time and serves them from this site, so no visitor request goes to Google.
const jost = Jost({ variable: "--font-jost", subsets: ["latin"], display: "swap" });
const serif = Instrument_Serif({ variable: "--font-instrument", weight: "400", style: ["normal", "italic"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "KI-Automatisierung, die Ergebnisse schafft | Branded Genius",
  description:
    "Branded Genius entwickelt KI-Agenten, Automatisierungen und intelligente Workflows für Marketing, Vertrieb, Kundenservice und interne Prozesse – von der Potenzialanalyse bis zur Umsetzung.",
};

export const viewport: Viewport = {
  themeColor: "#050a14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${jost.variable} ${serif.variable}`}>
      <body>
        <PageBackground />
        {children}
      </body>
    </html>
  );
}
