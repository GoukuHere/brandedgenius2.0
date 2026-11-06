"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { isSceneId } from "@/components/sections/service-scenes";
import { SmoothScroll } from "@/components/system/smooth-scroll";
import { CASES, CONTACT, CTA, FOOTER, HEADER, HERO, LINKS, PROBLEM, SERVICES, SYSTEM } from "@/content/site";
import { cn } from "@/lib/utils";
import { ClientScene, HeroFilm, useReducedMotion } from "../shared";

/*
  Concept 6, "System" (2026-11-07), the second "super futuristic, 100% new design and flow" concept. Where concept
  5 flies through depth, this one flies over a map, after the room-and-map navigation of this year's award winners
  (Hubtown's zoom transitions, Cartier's rooms). The whole page is one large plan, light silver with a blueprint grid:
  the Branded Genius core in the middle, the client's tools wired to it, and one room per part of the page. The
  camera starts inside the first room, pulls back to show the whole system (the client's own line: "Alle Tools. Ein
  System. Intelligent vernetzt."), then flies from room to room, zooming out mid-flight and back in. Signals pulse
  along the wires; a minimap shows where you are and flies you anywhere.
  - Type: Sora (light, large) for headlines, Geist Mono for the plan's labels.
  - Colour: silver white, ink, the brand royal as the signal colour, sky for light.
  With reduced motion the rooms simply stand one under the other.
*/

const EXT = { target: "_blank", rel: "noopener" } as const;
const LEAD = `${HERO.text.split(" für ")[0]}.`;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Rect = { x: number; y: number; w: number; h: number };
type RoomId = "start" | "problem" | "leistungen" | "fallstudien" | "kontakt";
type World = { w: number; h: number; rooms: Record<RoomId, Rect>; hub: { x: number; y: number } | null };

const ROOMS: { id: RoomId; label: string }[] = [
  { id: "start", label: "Start" },
  { id: "problem", label: "Problem" },
  { id: "leistungen", label: "Leistungen" },
  { id: "fallstudien", label: "Fallstudien" },
  { id: "kontakt", label: "Kontakt" },
];

// The plan on a desktop: the rooms in a loop round the core. On a phone: one column.
const DESK: World = {
  w: 4480,
  h: 2520,
  hub: { x: 2240, y: 1240 },
  rooms: {
    start: { x: 0, y: 780, w: 1200, h: 700 },
    problem: { x: 1640, y: 0, w: 1200, h: 700 },
    leistungen: { x: 3280, y: 760, w: 1200, h: 760 },
    fallstudien: { x: 1640, y: 1820, w: 1200, h: 700 },
    kontakt: { x: 0, y: 1760, w: 1200, h: 640 },
  },
};
const PHONE: World = {
  w: 360,
  h: 4560,
  hub: null,
  rooms: {
    start: { x: 0, y: 0, w: 360, h: 820 },
    problem: { x: 0, y: 940, w: 360, h: 820 },
    leistungen: { x: 0, y: 1880, w: 360, h: 860 },
    fallstudien: { x: 0, y: 2860, w: 360, h: 820 },
    kontakt: { x: 0, y: 3800, w: 360, h: 760 },
  },
};

// The camera's stops: the first room, the whole system, then the other rooms in order.
type Stop = { kind: "room"; id: RoomId } | { kind: "overview" };
const STOPS: Stop[] = [
  { kind: "room", id: "start" },
  { kind: "overview" },
  { kind: "room", id: "problem" },
  { kind: "room", id: "leistungen" },
  { kind: "room", id: "fallstudien" },
  { kind: "room", id: "kontakt" },
];
const DWELL = 700;
const MOVE = 1000;
const TOTAL = STOPS.length * DWELL + (STOPS.length - 1) * MOVE;
const stopScroll = (k: number) => k * (DWELL + MOVE) + DWELL * 0.4;

type Cam = { cx: number; cy: number; s: number };
const TOP = 76;

function camFor(stop: Stop, world: World, vw: number, vh: number): Cam {
  const pad = vw < 768 ? 8 : 44;
  const r: Rect = stop.kind === "overview" ? { x: -60, y: -60, w: world.w + 120, h: world.h + 120 } : world.rooms[stop.id];
  const s = Math.min((vw - pad * 2) / r.w, (vh - TOP - pad) / r.h);
  return { cx: r.x + r.w / 2, cy: r.y + r.h / 2, s };
}

/** Where the camera is for a scroll position, and which stop is nearest. */
function cameraAt(scroll: number, world: World, vw: number, vh: number): Cam & { near: number } {
  let rest = Math.max(0, scroll);
  for (let k = 0; k < STOPS.length; k++) {
    const a = camFor(STOPS[k], world, vw, vh);
    if (rest <= DWELL || k === STOPS.length - 1) return { ...a, near: k };
    rest -= DWELL;
    if (rest <= MOVE) {
      const b = camFor(STOPS[k + 1], world, vw, vh);
      const e = ease(rest / MOVE);
      // Fly: travel between the two centres, and pull back a little in the middle of the flight.
      const dip = 0.32 * clamp01(Math.min(a.s, b.s) / 0.6);
      const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * e) * (1 - dip * Math.sin(Math.PI * e));
      return { cx: a.cx + (b.cx - a.cx) * e, cy: a.cy + (b.cy - a.cy) * e, s, near: e < 0.5 ? k : k + 1 };
    }
    rest -= MOVE;
  }
  return { ...camFor(STOPS[STOPS.length - 1], world, vw, vh), near: STOPS.length - 1 };
}

function Btn({ href, children, line = false, className }: { href: string; children: ReactNode; line?: boolean; className?: string }) {
  return (
    <a href={href} {...EXT} className={cn("k6-btn group", line ? "k6-btn-line" : "k6-btn-ink", className)}>
      {children}
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

/* ---------- The rooms ---------- */

function StartRoom() {
  const [word, setWord] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = window.setInterval(() => setWord((v) => (v + 1) % HERO.claim.length), 2400);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="grid h-full grid-cols-1 content-center gap-7 p-6 pt-14 md:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] md:items-center md:gap-12 md:p-14">
      <div>
        <h1 className="k6-display">
          {HERO.title} <span className="text-[var(--k6-royal)]">{HERO.accent}</span>
        </h1>
        <p className="k6-body mt-6 max-w-[460px]">{LEAD}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Btn href={LINKS.analysis}>{HERO.primary}</Btn>
          <Btn href={LINKS.booking} line>
            {HERO.secondary}
          </Btn>
        </div>
      </div>
      <div>
        <div className="k6-device relative aspect-video overflow-hidden rounded-[22px]">
          <HeroFilm className="absolute inset-0" sizes="(min-width: 1024px) 40vw, 100vw" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {HERO.claim.map((w, i) => (
            <span key={w} className={cn("k6-status", i === word && "is-on")}>
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProblemRoom() {
  return (
    <div className="grid h-full grid-cols-1 content-center gap-6 p-6 pt-14 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12 md:p-14">
      <div className="md:self-center">
        <h2 className="k6-h2">
          {PROBLEM.title} <span className="text-[var(--k6-royal)]">{PROBLEM.accent}</span>
        </h2>
        <p className="k6-body mt-5 hidden max-w-[440px] md:block">{PROBLEM.text}</p>
      </div>
      {/* A diagnosis: each finding scans in when the camera arrives. */}
      <ol className="k6-scan-list">
        {PROBLEM.items.map((p, i) => (
          <li key={p.title} style={{ "--i": i } as CSSProperties}>
            <span className="k6-mono text-[11px] text-[var(--k6-royal)]">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0">
              <span className="block text-[15px] leading-[1.3] font-medium text-[#0a0e15] md:text-[17px]">{p.title}</span>
              <span className="mt-1 hidden text-[13.5px] leading-[1.45] text-[#0a0e15]/58 md:block">{p.text}</span>
            </span>
            <span aria-hidden className="k6-scan-bar" />
          </li>
        ))}
      </ol>
    </div>
  );
}

function ServicesRoom() {
  return (
    <div className="flex h-full flex-col justify-center p-6 pt-14 md:p-14 md:pt-20">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
        <h2 className="k6-h2 max-w-[620px]">
          {SERVICES.title} <span className="text-[var(--k6-royal)]">{SERVICES.accent}</span>
        </h2>
        <p className="k6-body hidden max-w-[380px] md:block">{SERVICES.text}</p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-2.5 md:mt-9 md:grid-cols-4 md:gap-4">
        {SERVICES.items.map((s, i) => {
          const scene = isSceneId(s.id) ? s.id : null;
          return (
            <a key={s.id} href={LINKS.contact} {...EXT} className="k6-module group" style={{ "--i": i } as CSSProperties}>
              {scene && (
                <span className="k6-screen hidden overflow-hidden rounded-[14px] md:block">
                  <ClientScene id={scene} />
                </span>
              )}
              <span className="flex items-start justify-between gap-3 md:mt-4">
                <span className="text-[15px] leading-[1.3] font-medium text-[#0a0e15] md:text-[16px]">{s.title}</span>
                <ArrowUpRight className="size-4 shrink-0 text-[var(--k6-royal)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="mt-2 hidden text-[13.5px] leading-[1.5] text-[#0a0e15]/58 md:block">{s.text}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function CasesRoom() {
  const [active, setActive] = useState(0);
  const study = CASES.items[active];
  return (
    <div className="flex h-full flex-col justify-center p-6 pt-14 md:p-14 md:pt-20">
      <h2 className="k6-h2 max-w-[760px]">
        {CASES.title} <span className="text-[var(--k6-royal)]">{CASES.accent}</span>
      </h2>
      <div role="tablist" aria-label="Fallstudien" className="mt-6 flex flex-wrap gap-1.5 md:mt-8">
        {CASES.items.map((c, i) => (
          <button key={c.area} type="button" role="tab" aria-selected={i === active} onClick={() => setActive(i)} className={cn("k6-tab", i === active && "is-active")}>
            {c.area}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <p className="mt-6 text-[18px] leading-[1.3] font-medium text-[#0a0e15] md:mt-8 md:text-[22px]">{study.tagline}</p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:mt-7 md:grid-cols-3 md:gap-8">
            {study.metrics.map((m, k) => (
              <div key={m.label} className="k6-metric" style={{ "--i": k } as CSSProperties}>
                <span className="k6-figure">{m.value}</span>
                <span className="mt-2 block max-w-[260px] text-[13.5px] leading-[1.45] text-[#0a0e15]/60">{m.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ContactRoom() {
  return (
    <div className="flex h-full flex-col justify-center p-6 pt-14 md:p-14">
      <h2 className="k6-display max-w-[860px]">
        {CTA.title} <span className="text-[var(--k6-royal)]">{CTA.accent}</span>
      </h2>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Btn href={LINKS.contact}>{CTA.primary}</Btn>
        <Btn href={LINKS.booking} line>
          {CTA.secondary}
        </Btn>
      </div>
      <div className="k6-mono mt-8 flex flex-col gap-2 text-[12.5px] text-[#0a0e15]/62 md:flex-row md:gap-8">
        <a href={`mailto:${CONTACT.email}`} className="hover:text-[var(--k6-royal)]">
          {CONTACT.email}
        </a>
        <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-[var(--k6-royal)]">
          {CONTACT.phone}
        </a>
        <span>{CONTACT.city}</span>
      </div>
      <div className="k6-mono mt-10 flex flex-wrap gap-x-6 gap-y-1 text-[11px] tracking-[0.12em] text-[#0a0e15]/40 uppercase">
        <span>{FOOTER.copyright}</span>
        {FOOTER.legal.map((l) => (
          <a key={l.label} href={l.href} {...EXT} className="hover:text-[#0a0e15]">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

const CONTENT: Record<RoomId, () => ReactNode> = {
  start: StartRoom,
  problem: ProblemRoom,
  leistungen: ServicesRoom,
  fallstudien: CasesRoom,
  kontakt: ContactRoom,
};

/* ---------- The plan ---------- */

/** The wires of the system: from the core to every room and to each of the client's tools, with signals on them. */
function Wires({ world }: { world: World }) {
  if (!world.hub) return null;
  const { x: hx, y: hy } = world.hub;
  const tools = SYSTEM.nodes.map((n, i) => {
    const a = (i / SYSTEM.nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: hx + Math.cos(a) * 420, y: hy + Math.sin(a) * 300 };
  });
  const roomWire = (r: Rect) => {
    const tx = Math.max(r.x, Math.min(hx, r.x + r.w));
    const ty = Math.max(r.y, Math.min(hy, r.y + r.h));
    const mx = (hx + tx) / 2;
    return `M ${hx} ${hy} C ${mx} ${hy}, ${mx} ${ty}, ${tx} ${ty}`;
  };
  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={world.w} height={world.h} fill="none">
        {Object.values(world.rooms).map((r, i) => (
          <g key={i}>
            <path d={roomWire(r)} className="k6-wire" />
            <path d={roomWire(r)} className="k6-pulse" style={{ animationDelay: `${i * 0.7}s` }} />
          </g>
        ))}
        {tools.map((t, i) => (
          <g key={t.title}>
            <path d={`M ${hx} ${hy} L ${t.x} ${t.y}`} className="k6-wire k6-wire-thin" />
            <path d={`M ${hx} ${hy} L ${t.x} ${t.y}`} className="k6-pulse k6-pulse-short" style={{ animationDelay: `${i * 0.35}s` }} />
          </g>
        ))}
      </svg>
      {tools.map((t) => (
        <span key={t.title} className="k6-tool" style={{ left: t.x, top: t.y }}>
          <span className="k6-dot" />
          {t.title}
        </span>
      ))}
      <div className="k6-core" style={{ left: hx, top: hy }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark.svg" alt="" className="h-[58%] w-auto" draggable={false} />
      </div>
    </>
  );
}

function useViewport() {
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const read = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return vp;
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5">
      <div className="mx-auto flex h-[56px] max-w-[1600px] items-center justify-between rounded-[16px] bg-white/72 px-4 shadow-[inset_0_0_0_1px_rgb(10_14_21/0.07),0_10px_30px_-18px_rgb(10_30_70/0.35)] backdrop-blur-md md:h-[60px] md:px-6">
        <a href="#top" aria-label="Branded Genius, zum Anfang" className="k6-logo block h-[22px] md:h-[24px]">
          <BrandLogo />
        </a>
        <Btn href={LINKS.contact} className="k6-btn-sm">
          <span className="hidden sm:inline">{HEADER.cta}</span>
          <span className="sm:hidden">Kontakt</span>
        </Btn>
      </div>
    </header>
  );
}

export function SystemConcept({ fontClass }: { fontClass: string }) {
  const reduced = useReducedMotion();
  const vp = useViewport();
  const world = vp.w < 768 ? PHONE : DESK;
  const { scrollY } = useScroll();
  const [near, setNear] = useState(0);
  const [moving, setMoving] = useState(false);
  // The screen size as a motion value, so the camera follows a resize as well as the scroll.
  const screen = useMotionValue({ ...vp, world });
  useEffect(() => {
    screen.set({ ...vp, world });
  }, [screen, vp, world]);

  const transform = useTransform(() => {
    const { w, h, world: plan } = screen.get();
    const c = cameraAt(scrollY.get(), plan, w, h);
    const tx = w / 2 - c.cx * c.s;
    const ty = TOP + (h - TOP) / 2 - c.cy * c.s;
    return `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${c.s.toFixed(4)})`;
  });
  // The minimap's view rectangle, in plan units.
  const view = useTransform(() => {
    const { w, h, world: plan } = screen.get();
    const c = cameraAt(scrollY.get(), plan, w, h);
    return { x: c.cx - w / 2 / c.s, y: c.cy - ((h - TOP) / 2 + TOP) / c.s, w: w / c.s, h: h / c.s };
  });
  useMotionValueEvent(scrollY, "change", (y) => {
    const { w, h, world: plan } = screen.get();
    setNear(cameraAt(y, plan, w, h).near);
  });
  // While the camera moves, the plan is one composited layer; at rest it is redrawn sharp.
  useEffect(() => {
    let t = 0;
    const off = scrollY.on("change", () => {
      setMoving(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => setMoving(false), 180);
    });
    return () => {
      off();
      window.clearTimeout(t);
    };
  }, [scrollY]);

  const activeRoom = STOPS[near].kind === "room" ? (STOPS[near] as { id: RoomId }).id : null;
  const overview = STOPS[near].kind === "overview";

  if (reduced) {
    return (
      <div className={cn("k6", fontClass)}>
        <Header />
        <main className="mx-auto flex max-w-[1240px] flex-col gap-6 px-3 pt-24 pb-12">
          {ROOMS.map((r) => {
            const Content = CONTENT[r.id];
            return (
              <section key={r.id} aria-label={r.label} className="k6-room is-active is-static">
                <Content />
              </section>
            );
          })}
        </main>
      </div>
    );
  }

  return (
    <div className={cn("k6", fontClass)} style={{ height: `calc(${TOTAL}px + 100svh)` }}>
      <Header />
      <main className="k6-viewport">
        <motion.div className={cn("k6-world", moving && "is-moving", overview && "is-overview")} style={{ width: world.w, height: world.h, transform }}>
          <Wires world={world} />
          {ROOMS.map((r, i) => {
            const rect = world.rooms[r.id];
            const Content = CONTENT[r.id];
            return (
              <section
                key={r.id}
                id={r.id === "start" ? "top" : r.id}
                aria-label={r.label}
                className={cn("k6-room", activeRoom === r.id && "is-active")}
                style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
              >
                <Content />
              </section>
            );
          })}
        </motion.div>
        {/* The whole-system view: the client's own line for it. */}
        <div className={cn("k6-overview-title", overview && "is-on")} aria-hidden={!overview}>
          <p className="k6-h2 !text-[22px] md:!text-[28px]">
            {SYSTEM.title} <span className="text-[var(--k6-royal)]">{SYSTEM.accent}</span>
          </p>
          <p className="k6-mono mt-3 text-[12px] tracking-[0.14em] text-[#0a0e15]/55 uppercase">{SYSTEM.claim}</p>
        </div>
      </main>
      {/* On a phone the plan is one tall column; the flight itself shows the way, so the minimap stays on larger screens. */}
      {world === DESK && <Minimap world={world} view={view} near={near} />}
      <SmoothScroll />
    </div>
  );
}

function Minimap({ world, view, near }: { world: World; view: MotionValue<{ x: number; y: number; w: number; h: number }>; near: number }) {
  const W = world === PHONE ? 54 : 210;
  const k = W / world.w;
  const H = world.h * k;
  const rect = useTransform(view, (v) => ({ left: v.x * k, top: v.y * k, width: v.w * k, height: v.h * k }));
  const left = useTransform(rect, (r) => r.left);
  const top = useTransform(rect, (r) => r.top);
  const width = useTransform(rect, (r) => r.width);
  const height = useTransform(rect, (r) => r.height);
  const go = (stopIndex: number) => window.scrollTo({ top: stopScroll(stopIndex), behavior: "smooth" });
  const stopOf = useMemo(() => Object.fromEntries(STOPS.map((s, i) => [s.kind === "room" ? s.id : "overview", i])), []);
  return (
    <nav aria-label="Plan" className="k6-minimap fixed right-3 bottom-3 z-40 md:right-5 md:bottom-5" style={{ width: W + 16, height: H + 16 }}>
      <div className="relative" style={{ width: W, height: H }}>
        {ROOMS.map((r) => {
          const rr = world.rooms[r.id];
          const idx = stopOf[r.id];
          return (
            <button
              key={r.id}
              type="button"
              aria-label={r.label}
              onClick={() => go(idx)}
              className={cn("absolute cursor-pointer rounded-[3px] transition-colors", idx === near ? "bg-[var(--k6-royal)]" : "bg-[#0a0e15]/14 hover:bg-[#0a0e15]/30")}
              style={{ left: rr.x * k, top: rr.y * k, width: rr.w * k, height: rr.h * k }}
            />
          );
        })}
        <motion.span aria-hidden className="pointer-events-none absolute rounded-[3px] shadow-[inset_0_0_0_1.5px_var(--k6-sky)]" style={{ left, top, width, height }} />
      </div>
    </nav>
  );
}
