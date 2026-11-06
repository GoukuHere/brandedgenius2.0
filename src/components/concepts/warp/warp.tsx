"use client";

import { ArrowUpRight } from "lucide-react";
import { animate, motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { isSceneId } from "@/components/sections/service-scenes";
import { SmoothScroll } from "@/components/system/smooth-scroll";
import { CASES, CTA, FOOTER, HEADER, HERO, LINKS, PROBLEM, SERVICES } from "@/content/site";
import { cn } from "@/lib/utils";
import { ClientScene, HeroFilm, useReducedMotion } from "../shared";
import { ChromeText, DotMatrix } from "./fx";

/*
  Concept 5, "Warp" (2026-11-07). The developer asked for two more concepts, "super futuristic and animated with
  100% new design and flow", after web research. The reference sites that won this year (Oryzo AI, Cartier Watches
  & Wonders, Hubtown) move a camera through one space instead of stacking sections. This concept does it in depth:
  you fly forward through a tunnel of light frames, and each part of the page is a station that comes towards you
  out of the distance, holds while you read it, then passes you.
  - Material: space black and liquid chrome (a WebGL shader fills the headlines), LED dot-matrix displays (the
    claim, the service names, the case results re-light dot by dot when they change), the film as a floating
    holographic screen, a curved wall of problem panels.
  - Type: Unbounded (wide) for headlines, Geist for reading, Geist Mono for the cockpit gauge.
  - Scroll: one fixed stage; the page's own scroll drives the flight (DWELL px per station, FLIGHT px between).
    With reduced motion the stations simply stand one under the other.
*/

const EXT = { target: "_blank", rel: "noopener" } as const;
const LEAD = `${HERO.text.split(" für ")[0]}.`;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const STATIONS = ["Start", "Problem", "Leistungen", "Fallstudien", "Kontakt"] as const;
const N = STATIONS.length;
const D = 2600; // depth between two stations
const NEAR = 150; // a station drifts this far either side of the screen while it is read
const DWELL = 820; // scroll per station
const FLIGHT = 980; // scroll per flight
const TOTAL = N * DWELL + (N - 1) * FLIGHT;

/** Where the camera is (depth travelled) for a scroll position. */
function travelAt(s: number) {
  let rest = Math.max(0, s);
  for (let k = 0; k < N; k++) {
    if (rest <= DWELL) return k * D - NEAR + (rest / DWELL) * 2 * NEAR;
    rest -= DWELL;
    if (k === N - 1) return k * D + NEAR;
    if (rest <= FLIGHT) return k * D + NEAR + ease(rest / FLIGHT) * (D - 2 * NEAR);
    rest -= FLIGHT;
  }
  return (N - 1) * D + NEAR;
}
const stationScroll = (k: number) => k * (DWELL + FLIGHT) + DWELL * 0.5;

function Btn({ href, children, ghost = false, className }: { href: string; children: ReactNode; ghost?: boolean; className?: string }) {
  return (
    <a href={href} {...EXT} className={cn("k5-btn group", ghost ? "k5-btn-ghost" : "k5-btn-chrome", className)}>
      <span className="relative z-[1] inline-flex items-center gap-2.5">
        {children}
        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  );
}

/* ---------- The stations' contents ---------- */

function useCycle(count: number, ms: number, paused = false) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = window.setInterval(() => setI((v) => (v + 1) % count), ms);
    return () => window.clearInterval(id);
  }, [count, ms, paused]);
  return [i, setI] as const;
}

function Launch() {
  const [word] = useCycle(HERO.claim.length, 2600);
  return (
    <div className="k5-frame-content">
      <ChromeText as="h1" className="k5-display max-w-[1120px]">{`${HERO.title} ${HERO.accent}`}</ChromeText>
      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
        <div className="order-2 lg:order-1">
          <p className="k5-lead max-w-[480px]">{LEAD}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Btn href={LINKS.analysis}>{HERO.primary}</Btn>
            <Btn href={LINKS.booking} ghost>
              {HERO.secondary}
            </Btn>
          </div>
          <div className="mt-10 h-[30px] max-w-[460px] lg:h-[40px]">
            <DotMatrix text={HERO.claim[word].toUpperCase()} rows={11} className="k5-led h-full" />
          </div>
        </div>
        {/* The film as a floating holographic screen, turned slightly towards the reader. */}
        <div className="order-1 [perspective:1600px] lg:order-2">
          <div className="k5-holo relative aspect-video overflow-hidden rounded-[18px] lg:[transform:rotateY(-14deg)_rotateX(3deg)]">
            <HeroFilm className="absolute inset-0" sizes="(min-width: 1024px) 46vw, 100vw" />
            <span aria-hidden className="k5-scan" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Problem() {
  return (
    <div className="k5-frame-content">
      <h2 className="k5-h2 max-w-[900px]">
        {PROBLEM.title} <span className="k5-accent">{PROBLEM.accent}</span>
      </h2>
      {/* A curved wall of panels: the outer columns turn towards the reader, like a cockpit's screens. */}
      <ul className="mt-8 grid grid-cols-1 gap-2.5 [perspective:1400px] sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-4">
        {PROBLEM.items.map((p, i) => (
          <li key={p.title} className={cn("k5-card", i % 3 === 0 && "lg:[transform:rotateY(14deg)]", i % 3 === 2 && "lg:[transform:rotateY(-14deg)]")} style={{ "--k": i } as CSSProperties}>
            <span className="flex items-center gap-2.5">
              <span aria-hidden className="k5-led-dot" />
              <span className="k5-mono text-[11px] tracking-[0.12em] text-[#69bff8]">{String(i + 1).padStart(2, "0")}</span>
            </span>
            <span className="mt-3 block text-[16px] leading-[1.3] font-medium text-white lg:text-[19px]">{p.title}</span>
            <span className="mt-2 hidden text-[14px] leading-[1.5] text-white/58 lg:block">{p.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The LED shows each service's name in capitals; the long fourth one is cut to its first part ("KI-Marketing").
const SERVICE_LED = SERVICES.items.map((s) => s.title.replace(/­/g, "").split(" & Vertriebs")[0].toUpperCase());

function Services() {
  const [hold, setHold] = useState(false);
  const [active, setActive] = useCycle(SERVICES.items.length, 3200, hold);
  return (
    <div className="k5-frame-content">
      <h2 className="k5-h2 max-w-[900px]">
        {SERVICES.title} <span className="k5-accent">{SERVICES.accent}</span>
      </h2>
      <div className="mt-7 h-[44px] lg:mt-10 lg:h-[72px]">
        <DotMatrix text={SERVICE_LED[active]} rows={13} className="k5-led h-full" />
      </div>
      <div className="mt-7 grid grid-cols-2 gap-2.5 lg:mt-10 lg:grid-cols-4 lg:gap-4" onPointerLeave={() => setHold(false)}>
        {SERVICES.items.map((s, i) => {
          const scene = isSceneId(s.id) ? s.id : null;
          return (
            <button
              key={s.id}
              type="button"
              onPointerEnter={() => {
                setHold(true);
                setActive(i);
              }}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={cn("k5-module cursor-pointer text-left", i === active && "is-active")}
            >
              {scene && (
                <span className="k5-scene hidden overflow-hidden rounded-[12px] bg-[#0a1324] lg:block">
                  <ClientScene id={scene} />
                </span>
              )}
              <span className="block text-[15px] leading-[1.3] font-medium text-white lg:mt-4 lg:text-[17px]">{s.title}</span>
              <span className="mt-2 hidden text-[14px] leading-[1.5] text-white/58 lg:block">{s.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Cases() {
  const [active, setActive] = useState(0);
  const study = CASES.items[active];
  return (
    <div className="k5-frame-content">
      <h2 className="k5-h2 max-w-[900px]">
        {CASES.title} <span className="k5-accent">{CASES.accent}</span>
      </h2>
      <div role="tablist" aria-label="Fallstudien" className="mt-7 flex flex-wrap gap-2 lg:mt-10">
        {CASES.items.map((c, i) => (
          <button key={c.area} type="button" role="tab" aria-selected={i === active} onClick={() => setActive(i)} className={cn("k5-chip", i === active && "is-active")}>
            {c.area}
          </button>
        ))}
      </div>
      <p className="mt-7 text-[19px] leading-[1.3] font-medium text-white lg:mt-10 lg:text-[24px]">{study.tagline}</p>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:mt-8 lg:grid-cols-3 lg:gap-10">
        {study.metrics.map((m, k) => (
          <div key={k}>
            <div className="h-[52px] max-w-[300px] lg:h-[96px] lg:max-w-none">
              <DotMatrix text={m.value} rows={13} className="k5-led h-full" />
            </div>
            <p className="mt-2 max-w-[300px] text-[14px] leading-[1.45] text-white/60 lg:mt-4 lg:text-[15px]">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="k5-frame-content items-center text-center">
      <ChromeText as="h2" className="k5-display mx-auto max-w-[980px]">{`${CTA.title} ${CTA.accent}`}</ChromeText>
      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Btn href={LINKS.contact}>{CTA.primary}</Btn>
        <Btn href={LINKS.booking} ghost>
          {CTA.secondary}
        </Btn>
      </div>
      <ul className="mt-8 flex flex-col justify-center gap-x-8 gap-y-2 text-[14px] text-white/62 sm:flex-row">
        {CTA.checks.map((c) => (
          <li key={c} className="flex items-center justify-center gap-2">
            <span aria-hidden className="k5-led-dot" />
            {c}
          </li>
        ))}
      </ul>
      <div className="k5-mono mt-14 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] tracking-[0.12em] text-white/40 uppercase">
        <span>{FOOTER.copyright}</span>
        {FOOTER.legal.map((l) => (
          <a key={l.label} href={l.href} {...EXT} className="transition-colors hover:text-white">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

const CONTENT = [Launch, Problem, Services, Cases, Contact];

/* ---------- The flight ---------- */

function Station({ index, travel, children }: { index: number; travel: MotionValue<number>; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const d = useTransform(travel, (t) => t - index * D);
  const opacity = useTransform(d, (v) => {
    if (v < -2500) return 0;
    if (v < -1300) return ((v + 2500) / 1200) * 0.4;
    if (v < -420) return 0.4 + ((v + 1300) / 880) * 0.6;
    if (v < NEAR + 30) return 1;
    return clamp01(1 - (v - NEAR - 30) / 330);
  });
  const apply = (v: number) => {
    const el = ref.current;
    if (!el) return;
    el.style.pointerEvents = Math.abs(v) < NEAR + 90 ? "auto" : "none";
    el.style.visibility = v < -2500 || v > NEAR + 360 ? "hidden" : "visible";
  };
  useMotionValueEvent(d, "change", apply);
  useEffect(() => apply(d.get()));
  return (
    <motion.section ref={ref} aria-label={STATIONS[index]} id={["top", "problem", "leistungen", "fallstudien", "kontakt"][index]} className="k5-station" style={{ z: d, opacity }}>
      {children}
    </motion.section>
  );
}

/**
 * Frames of light that the camera flies through; they wrap round, so the tunnel never ends. `drift` keeps them
 * gliding slowly forward even while the reader holds still, so the flight never stops.
 */
function Frame({ i, travel, drift }: { i: number; travel: MotionValue<number>; drift: MotionValue<number> }) {
  const S = 1100;
  const L = 8 * S;
  const z = useTransform(() => -((((i * S - travel.get() - drift.get()) % L) + L) % L));
  const opacity = useTransform(z, (v) => (v > -500 ? clamp01(-v / 500) : v < -L + 1800 ? clamp01((v + L) / 1800) : 1));
  return <motion.div aria-hidden className="k5-tunnel-frame" style={{ z, opacity }} />;
}

function Gauge({ travel }: { travel: MotionValue<number> }) {
  const [active, setActive] = useState(0);
  const fill = useTransform(travel, (t) => clamp01(t / ((N - 1) * D)));
  useMotionValueEvent(travel, "change", (t) => setActive(Math.max(0, Math.min(N - 1, Math.round(t / D)))));
  const go = (k: number) => window.scrollTo({ top: stationScroll(k), behavior: "smooth" });
  return (
    <>
      <nav aria-label="Stationen" className="fixed top-1/2 left-7 z-40 hidden -translate-y-1/2 xl:block">
        <div className="relative pl-5">
          <span aria-hidden className="absolute top-1 bottom-1 left-0 w-px overflow-hidden bg-white/12">
            <motion.span className="absolute inset-0 origin-top bg-[#69bff8]" style={{ scaleY: fill }} />
          </span>
          <ol className="flex flex-col gap-6">
            {STATIONS.map((s, k) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => go(k)}
                  className={cn("k5-mono cursor-pointer text-[11px] tracking-[0.14em] uppercase transition-colors", k === active ? "text-white" : "text-white/38 hover:text-white/70")}
                >
                  {String(k + 1).padStart(2, "0")} {s}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>
      <div aria-hidden className="k5-mono fixed bottom-5 left-1/2 z-40 w-[180px] -translate-x-1/2 text-center text-[11px] tracking-[0.14em] text-white/60 uppercase xl:hidden">
        {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} {STATIONS[active]}
        <span className="mt-2 block h-px overflow-hidden bg-white/12">
          <motion.span className="block h-full origin-left bg-[#69bff8]" style={{ scaleX: fill }} />
        </span>
      </div>
    </>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-6 lg:h-[84px] lg:px-10">
        <a href="#top" aria-label="Branded Genius, zum Anfang" className="block h-[24px] lg:h-[28px]">
          <BrandLogo />
        </a>
        <Btn href={LINKS.contact} ghost className="k5-btn-sm">
          <span className="hidden sm:inline">{HEADER.cta}</span>
          <span className="sm:hidden">Kontakt</span>
        </Btn>
      </div>
    </header>
  );
}

export function WarpConcept({ fontClass }: { fontClass: string }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  // On arrival the camera warps in from far away, then the scroll takes over.
  const intro = useMotionValue(-2200);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      intro.set(0);
      return undefined;
    }
    const controls = animate(intro, 0, { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 });
    return () => controls.stop();
  }, [intro]);
  const travel = useTransform(() => travelAt(scrollY.get()) + intro.get());
  // The tunnel's own slow forward glide (about 70px a second), independent of the scroll.
  const drift = useMotionValue(0);
  useAnimationFrame((t) => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) drift.set(t * 0.07);
  });

  if (reduced) {
    return (
      <div className={cn("k5", fontClass)}>
        <Header />
        <main>
          {CONTENT.map((Content, k) => (
            <section key={k} aria-label={STATIONS[k]} className="relative flex min-h-svh items-center py-24">
              <Content />
            </section>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className={cn("k5", fontClass)} style={{ height: `calc(${TOTAL}px + 100svh)` }}>
      <Header />
      <div aria-hidden className="k5-glow" />
      <main className="k5-stage">
        {Array.from({ length: 8 }, (_, i) => (
          <Frame key={i} i={i} travel={travel} drift={drift} />
        ))}
        {CONTENT.map((Content, k) => (
          <Station key={k} index={k} travel={travel}>
            {k === N - 1 && <div aria-hidden className="k5-portal" />}
            <Content />
          </Station>
        ))}
      </main>
      <Gauge travel={travel} />
      <SmoothScroll />
    </div>
  );
}
