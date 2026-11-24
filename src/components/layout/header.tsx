"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import { publicPath, switchPath, type Locale } from "@/i18n/config";
import { useCopy, useHref, useLocale, useWords } from "@/i18n/client";
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
  v6 (2026-11-07): the current link lights up (white, with a small sky dot that slides from link to link).
  2026-11-16: the site has pages now, so the links lead to them (Next links, no reload) and the lit link is the page
  being read. The phone menu marks the same link.
*/

/**
 * The page being read (2026-11-16: the nav links to the site's pages, no longer to sections of one page). The sky dot
 * sits under that page's link; a deeper address (a later case-study page, say) lights its parent.
 */
function useCurrentPage(nav: { href: string }[]) {
  // The public address (while prerendering, the router reports the internal /de/... route).
  const path = publicPath(usePathname() ?? "/");
  // The nav's addresses end in a slash (2026-11-24), the matched path does not.
  const bare = (href: string) => href.replace(/\/+$/, "") || "/";
  const hit = nav.find((item) => {
    const href = bare(item.href);
    return href === "/" || href === "/en" ? path === href : path === href || path.startsWith(`${href}/`);
  });
  return hit ? hit.href : null;
}

/* The header's own words (the rest comes from the page's copy). */
const WORDS = {
  de: { skip: "Zum Inhalt springen", home: "Branded Genius, zur Startseite", nav: "Hauptnavigation", mobileNav: "Mobile Navigation", open: "Menü öffnen", close: "Menü schließen", language: "Sprache" },
  en: { skip: "Skip to content", home: "Branded Genius, home", nav: "Main navigation", mobileNav: "Mobile navigation", open: "Open menu", close: "Close menu", language: "Language" },
};
const LANGUAGES: { locale: Locale; label: string; name: string }[] = [
  { locale: "de", label: "DE", name: "Deutsch" },
  { locale: "en", label: "EN", name: "English" },
];

/*
  Round 5 (the client's message of 2026-11-18: "a switch button to English and German in the top of the navigation"):
  DE and EN side by side, the current one lit; each leads to the same page in that language. In the bar from sm up,
  at the top of the menu on phones (the bar has no room there). The site always opens in German.
*/
function LanguageSwitch({ className, onPick }: { className?: string; onPick?: () => void }) {
  const locale = useLocale();
  const path = publicPath(usePathname() ?? "/");
  const words = useWords(WORDS);
  return (
    <div role="group" aria-label={words.language} className={cn("flex items-center rounded-[10px] border border-white/12 p-0.5", className)}>
      {LANGUAGES.map((l) => {
        const on = l.locale === locale;
        return (
          // A plain link: the other language has its own root layout, so the change is a full page load anyway, and
          // the router's prefetch of it from this layout is answered with a 404.
          <a
            key={l.locale}
            href={on ? (path === "/" ? path : `${path}/`) : switchPath(path, l.locale)}
            hrefLang={l.locale}
            lang={l.locale}
            aria-label={l.name}
            aria-current={on ? "true" : undefined}
            onClick={onPick}
            className={cn(
              "grid h-9 min-w-10 cursor-pointer place-items-center rounded-[8px] px-2 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200",
              on ? "bg-white/[0.1] text-white" : "text-ink/60 hover:text-white"
            )}
          >
            {l.label}
          </a>
        );
      })}
    </div>
  );
}

export function Header() {
  const { HEADER, LINKS, NAV } = useCopy().site;
  const words = useWords(WORDS);
  const href = useHref();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const current = useCurrentPage(NAV);

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
        {words.skip}
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
        <Link href={href("home")} aria-label={words.home} className="block h-8 shrink-0 md:h-9">
          <BrandLogo className="h-full" />
        </Link>

        <nav aria-label={words.nav} className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {NAV.map((item) => {
              const on = current === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={on ? "true" : undefined}
                    className={cn(
                      "relative block rounded-[10px] px-3.5 py-2 text-[15px] transition-colors duration-200 hover:bg-white/[0.06] hover:text-white xl:px-4",
                      on ? "text-white" : "text-ink/75"
                    )}
                  >
                    {item.label}
                    {on && (
                      <motion.span
                        layoutId="nav-current"
                        aria-hidden
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        className="absolute inset-x-0 bottom-[3px] mx-auto size-1 rounded-full bg-sky"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitch className="hidden sm:flex" />
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
            aria-label={open ? words.close : words.open}
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
            aria-label={words.mobileNav}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="glass absolute inset-x-3 top-[80px] rounded-[20px] bg-[#161616] p-6 md:inset-x-6 xl:hidden"
          >
            <LanguageSwitch className="mb-3 w-fit sm:hidden" onPick={() => setOpen(false)} />
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={current === item.href ? "true" : undefined}
                    className="flex items-center gap-3 py-3 text-[24px] font-medium tracking-[-0.02em] text-white"
                  >
                    {item.label}
                    {current === item.href && <span aria-hidden className="size-1.5 rounded-full bg-sky" />}
                  </Link>
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
