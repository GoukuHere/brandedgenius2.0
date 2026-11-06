"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { isSceneId } from "@/components/sections/service-scenes";
import { RevealObserver } from "@/components/system/reveal-observer";
import { SmoothScroll } from "@/components/system/smooth-scroll";
import { CASES, CONTACT, CTA, FOOTER, HEADER, HERO, LINKS, PROBLEM, PROMISE, REALITY, SERVICES } from "@/content/site";
import { cn } from "@/lib/utils";
import { ClientScene, HeroFilm, RevealWords, useReducedMotion } from "../shared";

/*
  Concept 4, "Kobalt" (2026-11-07). The second of the "totally new colours and everything" pair: the whole page is
  one vivid cobalt gradient, and every part is a mosaic of tiles in paper white, ice, ink, the brand gradient and
  the client's photos. No dark page, no thin lines, no stacked sections: each part is one composition of tiles of
  different sizes, assembling as it comes into view, tilting towards the pointer with a soft light on desktop.
  - Type: Instrument Sans throughout, headlines condensed (width 88) and bold.
  - Buttons: ink on light tiles, white on blue, both with 12px corners.
*/

const EXT = { target: "_blank", rel: "noopener" } as const;
const EASE = [0.16, 1, 0.3, 1] as const;
const LEAD = `${HERO.text.split(" für ")[0]}.`;
const pad = (n: number) => String(n).padStart(2, "0");

type Tone = "paper" | "ice" | "ink" | "grad" | "photo";

function Tile({ tone, n, className, children, style }: { tone: Tone; n: number; className?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={cn("c4-tile", `c4-${tone}`, className)} style={{ "--n": n, ...style } as CSSProperties}>
      {children}
    </div>
  );
}

function Btn({ href, children, variant = "ink", className }: { href: string; children: ReactNode; variant?: "ink" | "white" | "line"; className?: string }) {
  return (
    <a href={href} {...EXT} className={cn("c4-btn group", `c4-btn-${variant}`, className)}>
      {children}
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

/** Tiles lean towards the pointer and catch a soft light where it is (desktop mouse only). */
function useTileLight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return undefined;
    let frame = 0;
    let last: PointerEvent | null = null;
    let current: HTMLElement | null = null;
    const paint = () => {
      frame = 0;
      if (!last) return;
      const tile = (last.target as Element).closest<HTMLElement>(".c4-tile");
      if (current && current !== tile) {
        current.style.removeProperty("--rx");
        current.style.removeProperty("--ry");
      }
      current = tile;
      if (!tile) return;
      const r = tile.getBoundingClientRect();
      const px = (last.clientX - r.left) / r.width;
      const py = (last.clientY - r.top) / r.height;
      tile.style.setProperty("--mx", `${Math.round(px * 100)}%`);
      tile.style.setProperty("--my", `${Math.round(py * 100)}%`);
      tile.style.setProperty("--ry", `${((px - 0.5) * 5).toFixed(2)}deg`);
      tile.style.setProperty("--rx", `${((0.5 - py) * 5).toFixed(2)}deg`);
    };
    const move = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = () => {
      if (current) {
        current.style.removeProperty("--rx");
        current.style.removeProperty("--ry");
      }
      current = null;
    };
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
    };
  }, []);
  return ref;
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 lg:px-6">
      <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between rounded-[18px] bg-[rgb(4_30_96/0.55)] px-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)] backdrop-blur-md lg:h-[64px] lg:px-6">
        <a href="#top" aria-label="Branded Genius, zum Anfang" className="block h-[22px] lg:h-[26px]">
          <BrandLogo />
        </a>
        <Btn href={LINKS.contact} variant="white" className="c4-btn-sm">
          <span className="hidden sm:inline">{HEADER.cta}</span>
          <span className="sm:hidden">Kontakt</span>
        </Btn>
      </div>
    </header>
  );
}

/** The claim, one word at a time. */
function ClaimCycle() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return undefined;
    const id = window.setInterval(() => setI((v) => (v + 1) % HERO.claim.length), 2400);
    return () => window.clearInterval(id);
  }, [reduced]);
  return (
    <div className="flex h-full flex-col justify-between p-6 lg:p-8">
      <div className="flex gap-1.5" aria-hidden>
        {HERO.claim.map((w, k) => (
          <span key={w} className={cn("h-[3px] flex-1 rounded-full transition-colors duration-500", k === i ? "bg-[var(--c4-sky)]" : "bg-white/18")} />
        ))}
      </div>
      <p className="c4-display relative h-[1.1em] overflow-hidden text-[34px] lg:text-[48px] 2xl:text-[60px]" aria-label={HERO.claim.join(" ")}>
        <AnimatePresence initial={false}>
          <motion.span
            key={i}
            aria-hidden
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-110%" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-x-0 top-0"
          >
            {HERO.claim[i]}
          </motion.span>
        </AnimatePresence>
      </p>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="pt-[84px] lg:pt-[92px]">
      {/* Two rows: the headline and the film side by side, then two figures and the claim. */}
      <div data-reveal="mosaic" className="c4-grid lg:h-[770px] lg:grid-rows-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <Tile tone="paper" n={0} className="col-span-2 flex flex-col justify-between gap-10 p-7 lg:col-span-6 lg:p-10">
          {/* Sized with the tile, so "KI-Automatisierung," always fits on one line (a word never breaks at its hyphen). */}
          <h1 data-reveal="heading" className="c4-display text-[clamp(2rem,calc(5.2vw-1.25rem),3.75rem)]">
            <RevealWords text={HERO.title} accent={HERO.accent} accentClass="text-[var(--c4-royal)]" />
          </h1>
          <div>
            <p className="max-w-[440px] text-[17px] leading-[1.6] text-[var(--c4-ink-soft)] lg:text-[18px]">{LEAD}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Btn href={LINKS.analysis}>{HERO.primary}</Btn>
              <Btn href={LINKS.booking} variant="line">
                {HERO.secondary}
              </Btn>
            </div>
          </div>
        </Tile>
        <Tile tone="ink" n={1} className="col-span-2 aspect-video lg:col-span-6 lg:aspect-auto">
          <HeroFilm className="absolute inset-0 [&_video]:object-[50%_35%]" sizes="(min-width: 1024px) 50vw, 100vw" />
        </Tile>
        <Tile tone="ice" n={2} className="flex min-h-[170px] flex-col justify-between gap-6 p-6 lg:col-span-3 lg:p-8">
          <span className="c4-display text-[34px] text-[var(--c4-royal)] lg:text-[48px] 2xl:text-[56px]">{PROMISE.figures[0].value}</span>
          <span className="max-w-[220px] text-[15px] leading-[1.45] text-[var(--c4-ink-soft)]">{PROMISE.figures[0].label}</span>
        </Tile>
        <Tile tone="grad" n={3} className="flex min-h-[170px] flex-col justify-between gap-4 p-6 lg:col-span-3 lg:p-8">
          <span className="c4-display text-[34px] lg:text-[48px] 2xl:text-[56px]">{PROMISE.figures[1].value}</span>
          <span className="max-w-[220px] text-[15px] leading-[1.45] text-white/85">{PROMISE.figures[1].label}</span>
        </Tile>
        <Tile tone="ink" n={4} className="col-span-2 min-h-[150px] lg:col-span-6">
          <ClaimCycle />
        </Tile>
      </div>
    </section>
  );
}

function Problem() {
  const r = REALITY.items;
  const text = (i: number, tone: "ink" | "ice" | "grad") => (
    <>
      <span className={cn("c4-num text-[15px]", { ink: "text-[var(--c4-sky)]", ice: "text-[var(--c4-royal)]", grad: "text-white/85" }[tone])}>{pad(i + 1)}</span>
      <span className="mt-auto block">
        <span className="c4-title block text-[22px] lg:text-[24px]">{r[i].title}</span>
        <span className={cn("mt-2 block text-[15px] leading-[1.5]", { ink: "text-white/70", ice: "text-[var(--c4-ink-soft)]", grad: "text-white/90" }[tone])}>{r[i].text}</span>
      </span>
    </>
  );
  const photo = (i: number) => (
    <>
      <Image src={r[i].img} alt={r[i].title} fill sizes="(min-width: 1024px) 34vw, 100vw" className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_20_48/0)_35%,rgb(10_20_48/0.85)_100%)]" />
      <span className="relative mt-auto block p-6 text-white lg:p-7">
        <span className="c4-num text-[15px] text-[var(--c4-sky)]">{pad(i + 1)}</span>
        <span className="c4-title mt-2 block text-[22px] lg:text-[24px]">{r[i].title}</span>
      </span>
    </>
  );
  return (
    <section id="problem" className="mt-3">
      <div data-reveal="mosaic" className="c4-grid lg:auto-rows-[236px]">
        <Tile tone="paper" n={0} className="col-span-2 flex flex-col justify-between gap-8 p-7 lg:col-span-5 lg:row-span-2 lg:p-10">
          <h2 data-reveal="heading" className="c4-display text-[clamp(2.1rem,1.5rem+1.6vw,3.3rem)]">
            <RevealWords text={PROBLEM.title} accent={PROBLEM.accent} accentClass="text-[var(--c4-royal)]" />
          </h2>
          <p className="max-w-[460px] text-[16px] leading-[1.6] text-[var(--c4-ink-soft)] lg:text-[17px]">{PROBLEM.text}</p>
        </Tile>
        <Tile tone="photo" n={1} className="group col-span-2 flex min-h-[320px] flex-col lg:col-span-4 lg:row-span-2">
          {photo(0)}
        </Tile>
        <Tile tone="ink" n={2} className="col-span-2 flex min-h-[200px] flex-col p-6 lg:col-span-3 lg:p-7">
          {text(1, "ink")}
        </Tile>
        <Tile tone="ice" n={3} className="col-span-2 flex min-h-[200px] flex-col p-6 lg:col-span-3 lg:p-7">
          {text(2, "ice")}
        </Tile>
        <Tile tone="photo" n={4} className="group col-span-2 flex min-h-[260px] flex-col lg:col-span-4">
          {photo(3)}
        </Tile>
        <Tile tone="grad" n={5} className="col-span-2 flex min-h-[200px] flex-col p-6 lg:col-span-4 lg:p-7">
          {text(4, "grad")}
        </Tile>
        <Tile tone="photo" n={6} className="group col-span-2 flex min-h-[260px] flex-col lg:col-span-4">
          {photo(5)}
        </Tile>
      </div>
    </section>
  );
}

function Services() {
  const tones: Tone[] = ["ink", "paper", "paper", "ink"];
  const spans = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];
  return (
    <section id="leistungen" className="mt-24 lg:mt-36">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-6 lg:grid-cols-12 lg:items-end lg:px-10">
        <h2 data-reveal="heading" className="c4-display text-[clamp(2.3rem,1.6rem+2vw,3.8rem)] lg:col-span-7">
          <RevealWords text={SERVICES.title} accent={SERVICES.accent} accentClass="text-[var(--c4-ice)]" />
        </h2>
        <p data-reveal="up" data-rd="2" className="max-w-[460px] text-[17px] leading-[1.6] text-white/80 lg:col-span-4 lg:col-start-9">
          {SERVICES.text}
        </p>
      </div>
      <div data-reveal="mosaic" className="c4-grid mt-10 lg:mt-14">
        {SERVICES.items.map((item, i) => {
          const dark = tones[i] === "ink";
          const scene = isSceneId(item.id) ? item.id : null;
          return (
            <Tile key={item.id} tone={tones[i]} n={i} className={cn("col-span-2 flex flex-col gap-6 p-7 lg:min-h-[440px] lg:p-9", spans[i])}>
              <div className="flex items-start justify-between gap-6">
                <span className={cn("c4-num text-[15px]", dark ? "text-[var(--c4-sky)]" : "text-[var(--c4-royal)]")}>{pad(i + 1)}</span>
                <a
                  href={LINKS.contact}
                  {...EXT}
                  aria-label={item.cta}
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-[12px] transition-colors",
                    dark ? "bg-white/10 text-white hover:bg-white hover:text-[var(--c4-ink)]" : "bg-[var(--c4-ink)] text-white hover:bg-[var(--c4-royal)]"
                  )}
                >
                  <ArrowUpRight className="size-5" />
                </a>
              </div>
              <div className="max-w-[560px]">
                <h3 className="c4-title text-[26px] lg:text-[32px]">{item.title}</h3>
                <p className={cn("mt-3 text-[16px] leading-[1.6]", dark ? "text-white/72" : "text-[var(--c4-ink-soft)]")}>{item.text}</p>
              </div>
              {scene && (
                <div className="c4-scene mt-auto hidden overflow-hidden rounded-[16px] bg-[#0d1838] sm:block">
                  <ClientScene id={scene} />
                </div>
              )}
            </Tile>
          );
        })}
      </div>
    </section>
  );
}

function Cases() {
  const [active, setActive] = useState(0);
  const study = CASES.items[active];
  const tones: Tone[] = ["ice", "paper", "grad"];
  return (
    <section id="fallstudien" className="mt-24 lg:mt-36">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-6 lg:grid-cols-12 lg:items-end lg:px-10">
        <h2 data-reveal="heading" className="c4-display text-[clamp(2.3rem,1.6rem+2vw,3.8rem)] lg:col-span-7">
          <RevealWords text={CASES.title} accent={CASES.accent} accentClass="text-[var(--c4-ice)]" />
        </h2>
        <p data-reveal="up" data-rd="2" className="max-w-[460px] text-[17px] leading-[1.6] text-white/80 lg:col-span-4 lg:col-start-9">
          {CASES.text}
        </p>
      </div>
      <div role="tablist" aria-label="Fallstudien" className="mx-auto mt-10 flex max-w-[1440px] flex-wrap gap-2 px-6 lg:mt-12 lg:px-10">
        {CASES.items.map((c, i) => (
          <button
            key={c.area}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "h-11 cursor-pointer rounded-[10px] px-4 text-[15px] font-medium transition-colors",
              i === active ? "bg-white text-[var(--c4-ink)]" : "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16)] hover:bg-white/18"
            )}
          >
            {c.area}
          </button>
        ))}
      </div>
      <div data-reveal="mosaic" className="c4-grid mt-4">
        {study.metrics.map((m, k) => (
          <Tile key={k} tone={tones[k]} n={k} className="col-span-2 flex min-h-[230px] flex-col justify-between gap-6 p-7 lg:col-span-4 lg:min-h-[280px] lg:p-9">
            <span className="block overflow-hidden pb-[0.05em]">
              <motion.span
                key={`${active}-${k}`}
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, delay: k * 0.08, ease: EASE }}
                className={cn("c4-display block text-[64px] lg:text-[88px]", tones[k] === "grad" ? "text-white" : "text-[var(--c4-royal)]")}
              >
                {m.value}
              </motion.span>
            </span>
            <span className={cn("max-w-[260px] text-[15px] leading-[1.5]", tones[k] === "grad" ? "text-white/85" : "text-[var(--c4-ink-soft)]")}>{m.label}</span>
          </Tile>
        ))}
        <Tile tone="ink" n={3} className="col-span-2 flex flex-col justify-between gap-8 p-7 lg:col-span-8 lg:p-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4 }}>
              <p className="c4-title text-[26px] lg:text-[34px]">{study.tagline}</p>
              <blockquote className="mt-6 max-w-[640px] text-[18px] leading-[1.6] text-white/80">„{study.quote}“</blockquote>
              <p className="mt-3 text-[14px] text-[var(--c4-sky)]">{study.role}</p>
            </motion.div>
          </AnimatePresence>
        </Tile>
        <Tile tone="photo" n={4} className="col-span-2 min-h-[300px] lg:col-span-4">
          <Image src="/media/photos/roman-meeting.webp" alt="Roman Tränkle im Gespräch mit einem Team" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover object-[50%_30%]" />
        </Tile>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="kontakt" className="mt-24 lg:mt-36">
      <div data-reveal="mosaic" className="c4-grid">
        <Tile tone="paper" n={0} className="col-span-2 flex flex-col justify-between gap-10 p-7 lg:col-span-8 lg:min-h-[520px] lg:p-12">
          <h2 data-reveal="heading" className="c4-display max-w-[760px] text-[clamp(2.4rem,1.6rem+2.4vw,4.2rem)]">
            <RevealWords text={CTA.title} accent={CTA.accent} accentClass="text-[var(--c4-royal)]" />
          </h2>
          <div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Btn href={LINKS.contact}>{CTA.primary}</Btn>
              <Btn href={LINKS.booking} variant="line">
                {CTA.secondary}
              </Btn>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-[var(--c4-ink-soft)]">
              {CTA.checks.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span aria-hidden className="size-1.5 rounded-full bg-[var(--c4-royal)]" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Tile>
        <Tile tone="photo" n={1} className="col-span-2 min-h-[420px] lg:col-span-4 lg:row-span-2">
          <Image src="/media/photos/roman-standing.webp" alt="Roman Tränkle vor dem Branded Genius Logo" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover object-[50%_20%]" />
        </Tile>
        <Tile tone="ink" n={2} className="col-span-2 flex flex-col gap-2 p-7 text-[17px] lg:col-span-8 lg:flex-row lg:items-center lg:gap-12 lg:p-9">
          <a href={`mailto:${CONTACT.email}`} className="font-medium text-white transition-colors hover:text-[var(--c4-sky)]">
            {CONTACT.email}
          </a>
          <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="text-white/80 transition-colors hover:text-white">
            {CONTACT.phone}
          </a>
          <span className="text-white/60">{CONTACT.city}</span>
        </Tile>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1440px] flex-col items-start justify-between gap-4 px-6 pb-8 text-[13px] text-white/60 sm:flex-row sm:items-center lg:px-10">
        <span>{FOOTER.copyright}</span>
        <nav aria-label="Rechtliches" className="flex gap-5">
          {FOOTER.legal.map((link) => (
            <a key={link.label} href={link.href} {...EXT} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

export function CobaltConcept({ fontClass }: { fontClass: string }) {
  const light = useTileLight();
  return (
    <div ref={light} className={cn("c4", fontClass)}>
      <div aria-hidden className="c4-canvas" />
      <Header />
      <main>
        <div className="relative">
          <Hero />
          <Problem />
          <Services />
          <Cases />
          <Contact />
        </div>
      </main>
      <RevealObserver />
      <SmoothScroll />
    </div>
  );
}
