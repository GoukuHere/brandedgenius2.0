"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import { HEADER, LINKS, NAV } from "@/content/site";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";

const EASE = [0.16, 1, 0.3, 1] as const;

/*
  A floating bar, as on the client's own site: clear at the top, then glass with a backdrop blur once the page
  scrolls (the one glass that is always on screen, and one of only two blurred surfaces on the page). Navigation and
  button labels follow brandedgenius.de: Startseite first, "Jetzt Kontakt aufnehmen" on desktop, "Analyse" on phones,
  and "KI-Potenzialanalyse anfragen" in the phone menu; all three open the client's hosted contact form.
  Buttons have slightly curved corners (2026-11-06), so the bar's 20px corner is concentric with the button inside
  it: the button's 12px plus its 8px inset. A pill bar around a 12px button would pinch the gap at the corner.
  v5: as in the developer's reference, the header's button is the dark second style, so the cream main button
  leads in the content; the phone menu keeps the cream one.
*/
export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <a
        href="#main"
        className="sr-only rounded-[10px] bg-white px-4 py-2 text-[14px] font-medium text-page focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60]"
      >
        Zum Inhalt springen
      </a>
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        className={cn(
          "mx-auto flex max-w-[1280px] items-center justify-between gap-6 rounded-[20px] border pr-2 pl-5 transition-[height,background-color,border-color] duration-500 md:pl-6",
          scrolled || open ? "glass glass-blur h-[60px] border-transparent" : "h-16 border-white/[0.06] bg-page/40 md:h-[68px]"
        )}
      >
        <a href="#top" aria-label="Branded Genius, zum Seitenanfang" className="block h-8 shrink-0 md:h-9">
          <BrandLogo className="h-full" />
        </a>

        <nav aria-label="Hauptnavigation" className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-[10px] px-3.5 py-2 text-[15px] text-ink/75 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white xl:px-4"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <SecondaryLink href={LINKS.contact} className="hidden h-11 px-5 text-[14px] sm:inline-flex md:h-12 md:px-6 md:text-[15px]">
            {HEADER.cta}
          </SecondaryLink>
          <SecondaryLink href={LINKS.contact} className="h-11 px-4 text-[14px] sm:hidden">
            {HEADER.mobileCta}
          </SecondaryLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            className="relative grid size-11 cursor-pointer place-items-center rounded-button border border-white/12 transition-colors duration-200 hover:bg-white/[0.06] xl:hidden"
          >
            <span className={cn("absolute h-px w-[18px] bg-white transition-transform duration-300", open ? "rotate-45" : "-translate-y-[4px]")} />
            <span className={cn("absolute h-px w-[18px] bg-white transition-transform duration-300", open ? "-rotate-45" : "translate-y-[4px]")} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="glass absolute inset-x-3 top-[80px] rounded-[20px] bg-[#161616] p-6 md:inset-x-6 xl:hidden"
          >
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={() => setOpen(false)} className="block py-3 text-[24px] font-medium tracking-[-0.02em] text-white">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <PrimaryLink href={LINKS.contact} onClick={() => setOpen(false)} className="mt-6 w-full">
              {HEADER.menuCta}
            </PrimaryLink>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
