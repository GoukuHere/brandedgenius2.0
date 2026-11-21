"use client";

import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { Container, Heading, PrimaryLink, SecondaryLink, Section } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import type { Project, ProjectSlug } from "@/content/pages/use-cases";
import { useCopy } from "@/i18n/client";
import { useLive } from "./use-live";

/*
  Anfrage, the finale (2026-11-16): his "Ihr Projekt könnte das nächste sein" block. Above his headline the seven
  projects return as small marks of their cover art (the LED wall, the film, the candles, the transfer, the mark, the
  chip, the skyline), set on an arc; from each a line draws down with the scroll, the seven lines converge, and where
  they meet one point lights: the next project. Once it is lit, light keeps running along the lines into it while
  the section is on screen. Then his headline, his paragraph, his two buttons and his e-mail line. His project form
  is not built here (it has no backend on this site); the buttons lead to his booking and his contact form.

  Two drawings, one composition: a wide arc from tablets up, a tighter one on phones. Reduced motion: drawn and lit.
  Round 5 (DE/EN): copy by language.
*/

type Spot = { x: number; y: number };
type Drawing = { w: number; h: number; size: number; point: Spot; spots: Spot[] };

const WIDE: Drawing = {
  w: 1200,
  h: 340,
  size: 56,
  point: { x: 600, y: 318 },
  spots: [
    { x: 110, y: 150 },
    { x: 290, y: 92 },
    { x: 445, y: 58 },
    { x: 600, y: 44 },
    { x: 755, y: 58 },
    { x: 910, y: 92 },
    { x: 1090, y: 150 },
  ],
};

const NARROW: Drawing = {
  w: 360,
  h: 300,
  size: 36,
  point: { x: 180, y: 282 },
  spots: [
    { x: 26, y: 132 },
    { x: 78, y: 90 },
    { x: 129, y: 63 },
    { x: 180, y: 52 },
    { x: 231, y: 63 },
    { x: 282, y: 90 },
    { x: 334, y: 132 },
  ],
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const r1 = (v: number) => Math.round(v * 10) / 10;
/** Outer lines start first (they are longer), the middle one last; all are drawn by 0.86. */
const drawn = (p: number, i: number) => clamp01((p - (3 - Math.abs(i - 3)) * 0.05) / 0.71);

function lineFor(d: Drawing, s: Spot) {
  const start = s.y + d.size * 0.72;
  const bend = d.point.x + (s.x - d.point.x) * 0.12;
  return `M${s.x} ${r1(start)} C${s.x} ${r1(start + d.h * 0.34)} ${r1(bend)} ${r1(d.point.y - d.h * 0.24)} ${d.point.x} ${d.point.y}`;
}

export function ClosingSection() {
  const copy = useCopy();
  const { UC_CLOSING, UC_ITEMS } = copy.useCases;
  const { LINKS } = copy.site;
  const band = useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(band, ["start 90%", "end 55%"]);
  const live = useMotionValue(0);
  // Both values are read on every run: a computed value only follows the values its first run reads.
  const p = useTransform(() => {
    const scrolled = progress.get();
    return live.get() ? scrolled : 1;
  });

  useEffect(() => {
    live.set(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1);
  }, [live]);

  // Once the lines have met, the light runs into the point (CSS, while on screen).
  useMotionValueEvent(p, "change", (v) => {
    const el = band.current;
    if (!el) return;
    if (v >= 0.97) el.dataset.done = "";
    else delete el.dataset.done;
  });

  useLive(band);

  return (
    <Section id="anfrage">
      <Container>
        <div ref={band} role="img" aria-label={UC_CLOSING.label} className="uc-converge uc-live" data-done="">
          <Converge drawing={WIDE} items={UC_ITEMS} p={p} className="hidden md:block" />
          <Converge drawing={NARROW} items={UC_ITEMS} p={p} className="md:hidden" />
        </div>

        <div className="mx-auto mt-10 flex max-w-[1080px] flex-col items-center text-center md:mt-12">
          {/* His title on one line, his blue phrase on the next (uc-split in use-cases.css). */}
          <Heading title={UC_CLOSING.title} accent={UC_CLOSING.accent} className="uc-split max-w-[1060px]" />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[660px]">
            {UC_CLOSING.text}
          </p>
          <div data-reveal="up" data-rd="3" className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <PrimaryLink href={LINKS.booking}>{UC_CLOSING.primary}</PrimaryLink>
            <SecondaryLink href={LINKS.contact}>{UC_CLOSING.secondary}</SecondaryLink>
          </div>
          <p data-reveal="up" data-rd="4" className="mt-9 text-[15px] text-white/60">
            {UC_CLOSING.emailLabel}{" "}
            <a href={`mailto:${UC_CLOSING.email}`} className="font-medium text-white underline decoration-white/25 underline-offset-[5px] transition-colors duration-200 hover:text-sky hover:decoration-sky/60">
              {UC_CLOSING.email}
            </a>
          </p>
        </div>
      </Container>
    </Section>
  );
}

function Converge({ drawing, items, p, className }: { drawing: Drawing; items: Project[]; p: MotionValue<number>; className?: string }) {
  const glow = useTransform(() => clamp01((p.get() - 0.78) / 0.2));
  const haloScale = useTransform(() => 0.4 + 0.6 * glow.get());
  const core = useTransform(() => 0.25 + 0.75 * glow.get());
  const { point } = drawing;
  return (
    <svg viewBox={`0 0 ${drawing.w} ${drawing.h}`} aria-hidden focusable="false" className={`uc-converge-svg ${className ?? ""}`}>
      <defs>
        <radialGradient id={`uc-point-${drawing.w}`}>
          <stop offset="0" stopColor="#69bff8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#69bff8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {drawing.spots.map((spot, i) => (
        <Strand key={i} index={i} d={lineFor(drawing, spot)} p={p} />
      ))}
      {items.map((item, i) => (
        <Mark key={item.slug} slug={item.slug} spot={drawing.spots[i]} size={drawing.size} index={i} p={p} />
      ))}
      <motion.circle cx={point.x} cy={point.y} r={drawing.size * 0.75} fill={`url(#uc-point-${drawing.w})`} style={{ opacity: glow, scale: haloScale }} className="uc-converge-halo" />
      <circle cx={point.x} cy={point.y} r={drawing.size * 0.2} fill="none" stroke="#69bff8" strokeWidth="1.5" className="uc-converge-ring" />
      <motion.circle cx={point.x} cy={point.y} r={drawing.size * 0.1} fill="#f4f9ff" style={{ opacity: core }} />
    </svg>
  );
}

function Strand({ index, d, p }: { index: number; d: string; p: MotionValue<number> }) {
  const length = useTransform(() => drawn(p.get(), index));
  return (
    <g>
      <path d={d} fill="none" stroke="#ffffff" strokeOpacity="0.07" />
      <motion.path d={d} fill="none" stroke="#69bff8" strokeOpacity="0.55" strokeWidth="1.25" style={{ pathLength: length }} />
      <path d={d} pathLength={1} fill="none" stroke="#eaf6ff" strokeWidth="2" strokeLinecap="round" className="uc-strand-light" style={{ animationDelay: `${(index * 0.37).toFixed(2)}s` }} />
    </g>
  );
}

/** A project's cover art as a small mark (drawn in a 56 x 56 box around its centre). */
function Mark({ slug, spot, size, index, p }: { slug: ProjectSlug; spot: Spot; size: number; index: number; p: MotionValue<number> }) {
  const opacity = useTransform(() => clamp01(p.get() * 5 - (3 - Math.abs(index - 3)) * 0.35));
  const k = size / 56;
  return (
    <motion.g style={{ opacity }}>
      <g transform={`translate(${spot.x} ${spot.y}) scale(${k})`} fill="none" stroke="#dcecff" strokeOpacity="0.7" strokeWidth={1.3 / k} strokeLinecap="round" strokeLinejoin="round">
        <circle r="27" fill="#0a1d44" fillOpacity="0.6" stroke="#ffffff" strokeOpacity="0.12" />
        {MARKS[slug]}
      </g>
    </motion.g>
  );
}

const MARKS: Record<ProjectSlug, React.ReactNode> = {
  "mega-screen": (
    <g stroke="none">
      {Array.from({ length: 16 }, (_, i) => {
        const lit = i === 5 || i === 6 || i === 9;
        return <rect key={i} x={-16 + (i % 4) * 8.5} y={-16 + Math.floor(i / 4) * 8.5} width="6" height="6" rx="1.2" fill={lit ? "#69bff8" : "#dcecff"} fillOpacity={lit ? 0.95 : 0.3} />;
      })}
    </g>
  ),
  wrapwerk: (
    <g>
      {[-8, 0, 8].map((dy, i) => (
        <path key={dy} d={`M-18 ${12 + dy} C-8 ${12 + dy} -4 ${dy - 2} 4 ${dy - 6} S14 ${dy - 12} 20 ${dy - 13}`} stroke="#69bff8" strokeOpacity={[0.55, 0.9, 0.45][i]} strokeWidth="4.5" />
      ))}
    </g>
  ),
  ledbow: (
    <g>
      {[
        [-14, 6, 14],
        [-7, 2, 10],
        [0, 4, 8],
        [7, -4, 3],
        [14, -10, -2],
      ].map(([x, top, bottom], i) => (
        <g key={x} stroke={i === 2 ? "#dcecff" : "#69bff8"}>
          <path d={`M${x} ${top - 4} V${bottom + 4}`} strokeOpacity="0.6" />
          <rect x={x - 2.4} y={top} width="4.8" height={bottom - top} rx="0.8" fill={i === 2 ? "none" : "#69bff8"} fillOpacity="0.3" />
        </g>
      ))}
    </g>
  ),
  cryptotransfer: (
    <g>
      <path d="M-12 12 C-12 -2 -4 -12 12 -12" stroke="#69bff8" strokeDasharray="2 3" />
      <circle cx="-12" cy="12" r="4.5" fill="#69bff8" fillOpacity="0.9" stroke="none" />
      <circle cx="12" cy="-12" r="4.5" />
      <circle cx="12" cy="-12" r="1.6" fill="#dcecff" stroke="none" />
    </g>
  ),
  elysium: (
    <g>
      <circle r="17" />
      <path d="M0 -17 L17 0 L0 17 L-17 0 Z" strokeOpacity="0.55" />
      <circle r="8" stroke="#69bff8" />
      <circle r="1.8" fill="#69bff8" stroke="none" />
    </g>
  ),
  "km-electronics": (
    <g>
      <rect x="-8" y="-8" width="16" height="16" rx="2.5" />
      <rect x="-3" y="-3" width="6" height="6" rx="1" stroke="#69bff8" />
      <path d="M-4 -8 V-12 M4 -8 V-12 M-4 8 V12 M4 8 V12 M-8 -4 H-12 M-8 4 H-12 M8 -4 H12 M8 4 H12" strokeOpacity="0.6" />
      <path d="M12 -4 H17 L21 -8" stroke="#69bff8" strokeOpacity="0.85" />
      <path d="M-12 4 H-17 L-21 8" strokeOpacity="0.5" />
    </g>
  ),
  "martin-wildt": (
    <g>
      <path d="M-20 16 V6 H-12 V-2 H-5 V16 M-5 16 V-14 H5 V16 M5 16 V0 H12 V8 H20 V16" />
      <path d="M0 -14 V-19" />
      <path d="M-22 16 H22" strokeOpacity="0.5" />
      <rect x="-1" y="-8" width="2" height="3" fill="#69bff8" stroke="none" />
    </g>
  ),
};
