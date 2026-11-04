"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { PrimaryLink } from "@/components/system/primitives";
import { NAV } from "@/content/site";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";

const EASE = [0.16, 1, 0.3, 1] as const;

// A floating pill, as on arventas.de and the client's own site. Solid navy instead of a blur, which costs nothing to scroll.
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
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        className={cn(
          "mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 rounded-full border pr-2 pl-5 transition-[background-color,border-color,box-shadow] duration-500 md:h-[68px] md:pl-6",
          scrolled || open
            ? "border-white/10 bg-[#07101f]/92 shadow-[0_18px_50px_-24px_rgb(0_0_0/0.9)]"
            : "border-white/[0.06] bg-[#07101f]/45"
        )}
      >
        <a href="#top" aria-label="Branded Genius, zum Seitenanfang" className="block h-8 shrink-0 md:h-9">
          <BrandLogo className="h-full" />
        </a>

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-full px-4 py-2 text-[15px] text-ink/75 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <PrimaryLink href="#kontakt" className="hidden h-11 px-5 text-[14px] sm:inline-flex md:h-12 md:px-6 md:text-[15px]">
            Jetzt Kontakt aufnehmen
          </PrimaryLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            className="relative grid size-12 cursor-pointer place-items-center rounded-full border border-white/12 transition-colors duration-200 hover:bg-white/[0.06] lg:hidden"
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
            className="absolute inset-x-3 top-[80px] rounded-[28px] border border-white/10 bg-[#07101f] p-6 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] md:inset-x-6 lg:hidden"
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
            <PrimaryLink href="#kontakt" onClick={() => setOpen(false)} className="mt-6 w-full">
              Jetzt Kontakt aufnehmen
            </PrimaryLink>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
