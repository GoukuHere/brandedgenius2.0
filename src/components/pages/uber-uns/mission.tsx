"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Container, Heading } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { useCopy } from "@/i18n/client";
import { cn } from "@/lib/utils";

/*
  Über uns, Mission. The client's heading centred, his mission sentence as the lead and the rest of his text smaller.
  Then his three goals as one growth line across the section: a calm curve that starts flat and rises, drawn with the
  scroll (scroll-linked and reversible, not held). The area under it fills behind the line's head; each goal is a point
  on the line that lights when the line reaches it, and its label rises in under it, so the three read as steps up.

  Wide screens: the labels sit in three columns, each under its point, joined to it by a thin drop line (the higher the
  point, the longer the drop). Phones: the line runs across the top with numbered points, the three labels under it.
  The geometry is measured from the box (no width assumed). Reduced motion: the line stands complete.
  Round 5 (DE/EN): copy by language.
*/

// The goals' places along the line, at the centres of three equal columns.
const STOPS_T = [1 / 6, 1 / 2, 5 / 6];
const SAMPLES = 72; // a multiple of 6, so each stop falls on a sample
const K = 2.3; // how sharply the curve rises towards its end

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const r1 = (v: number) => Math.round(v * 10) / 10;
const pad = (i: number) => String(i + 1).padStart(2, "0");

type Geo = { w: number; h: number; d: string; area: string; xs: number[]; ys: number[]; frac: number[]; points: { x: number; y: number }[]; stops: number[] };

function curveY(t: number, h: number) {
  const f = (Math.exp(K * t) - 1) / (Math.exp(K) - 1);
  const top = h * 0.07;
  const bottom = h * 0.93;
  return bottom - (bottom - top) * f;
}

function build(w: number, h: number): Geo {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    xs.push(t * w);
    ys.push(curveY(t, h));
  }
  const lengths = [0];
  for (let i = 1; i <= SAMPLES; i++) lengths.push(lengths[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]));
  const total = lengths[SAMPLES] || 1;
  const frac = lengths.map((l) => l / total);
  const d = xs.map((x, i) => `${i ? "L" : "M"}${r1(x)} ${r1(ys[i])}`).join(" ");
  const area = `${d} L${r1(w)} ${r1(h)} L0 ${r1(h)} Z`;
  const points = STOPS_T.map((t) => ({ x: t * w, y: curveY(t, h) }));
  const stops = STOPS_T.map((t) => frac[Math.round(t * SAMPLES)]);
  return { w, h, d, area, xs, ys, frac, points, stops };
}

/** The point on the line at a share of its length (linear between the samples). */
function pointAt(geo: Geo, p: number) {
  const { frac, xs, ys } = geo;
  if (p <= 0) return { x: xs[0], y: ys[0] };
  if (p >= 1) return { x: xs[SAMPLES], y: ys[SAMPLES] };
  let i = 1;
  while (i < SAMPLES && frac[i] < p) i++;
  const k = (p - frac[i - 1]) / (frac[i] - frac[i - 1] || 1);
  return { x: xs[i - 1] + (xs[i] - xs[i - 1]) * k, y: ys[i - 1] + (ys[i] - ys[i - 1]) * k };
}

export function UberMission() {
  const { UU_MISSION } = useCopy().uberUns;
  const GOALS = UU_MISSION.goals;
  const chart = useRef<HTMLDivElement>(null);
  const plot = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const geoRef = useRef<Geo | null>(null);

  // Drawn while the chart rises from 88% of the screen until its foot passes 72%; scroll-linked and reversible.
  const progress = useSectionProgress(chart, ["start 88%", "end 72%"]);
  const smooth = useSpring(progress, { stiffness: 90, damping: 26, mass: 0.6 });
  const live = useMotionValue(0);
  const drawn = useTransform(() => (live.get() ? clamp01(smooth.get()) : 1));

  useEffect(() => {
    const el = plot.current;
    if (!el) return undefined;
    live.set(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1);
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const next = build(width, height);
      geoRef.current = next;
      setGeo(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [live]);

  const head = useTransform(() => (geoRef.current ? pointAt(geoRef.current, drawn.get()) : { x: 0, y: 0 }));
  const headX = useTransform(() => head.get().x);
  const headY = useTransform(() => head.get().y);
  const areaClip = useTransform(() => (geoRef.current ? `inset(0 ${r1(Math.max(0, geoRef.current.w - head.get().x))}px 0 0)` : "inset(0 100% 0 0)"));
  const headOpacity = useTransform(() => (drawn.get() > 0.003 ? 1 : 0));

  return (
    <section id="mission" className="relative py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-[920px] text-center">
          <Heading title={UU_MISSION.title} accent={UU_MISSION.accent} className="mx-auto" />
          <p data-reveal="up" data-rd="2" className="mx-auto mt-7 max-w-[720px] text-[20px] leading-[1.5] tracking-[-0.01em] text-pretty text-white/90 md:mt-9 md:text-[24px]">
            {UU_MISSION.lead}
          </p>
        </div>

        <div ref={chart} className="relative mt-16 md:mt-24">
          <p className="text-[15px] leading-snug text-white/60 md:absolute md:top-0 md:left-0 md:z-[1] md:max-w-[400px] md:text-[16px]">{UU_MISSION.goalsIntro}</p>

          {/* The plot: the line, the area under it, the three points. */}
          <div ref={plot} aria-hidden className="relative mt-6 h-[190px] sm:h-[230px] md:mt-0 md:h-[300px] lg:h-[340px]">
            {geo && (
              <>
                <motion.div style={{ clipPath: areaClip }} className="absolute inset-0">
                  <svg width={geo.w} height={geo.h} className="absolute inset-0 overflow-visible">
                    <defs>
                      <linearGradient id="uu-mission-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#69bff8" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#69bff8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={geo.area} fill="url(#uu-mission-area)" />
                  </svg>
                </motion.div>
                <svg width={geo.w} height={geo.h} className="absolute inset-0 overflow-visible" fill="none">
                  <defs>
                    <linearGradient id="uu-mission-line" x1="0" y1="0" x2={geo.w} y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1a6fe0" />
                      <stop offset="55%" stopColor="#69bff8" />
                      <stop offset="100%" stopColor="#dcecff" />
                    </linearGradient>
                  </defs>
                  {/* The baseline and the line's faint track. */}
                  <line x1={0} y1={geo.h} x2={geo.w} y2={geo.h} stroke="rgb(255 255 255 / 0.1)" strokeWidth={1} />
                  <path d={geo.d} stroke="rgb(255 255 255 / 0.1)" strokeWidth={1.5} strokeDasharray="2 6" strokeLinecap="round" />
                  <motion.path d={geo.d} stroke="rgb(105 191 248 / 0.16)" strokeWidth={10} strokeLinecap="round" style={{ pathLength: drawn }} />
                  <motion.path d={geo.d} stroke="url(#uu-mission-line)" strokeWidth={2.5} strokeLinecap="round" style={{ pathLength: drawn }} />
                </svg>

                {geo.points.map((pt, i) => (
                  <GoalPoint key={GOALS[i].title} index={i} x={pt.x} y={pt.y} h={geo.h} drawn={drawn} stop={geo.stops[i]} />
                ))}

                {/* The line's head. */}
                <motion.span
                  style={{ x: headX, y: headY, opacity: headOpacity }}
                  className="absolute top-0 left-0 -mt-[5px] -ml-[5px] size-[10px] rounded-full bg-white shadow-[0_0_0_4px_rgb(105_191_248/0.25),0_0_22px_4px_rgb(105_191_248/0.55)]"
                />
              </>
            )}
          </div>

          {/* The three goals: under their points on wide screens, stacked under the line on phones. */}
          <ol role="list" className="mt-8 grid gap-6 md:mt-0 md:grid-cols-3 md:gap-0">
            {GOALS.map((goal, i) => (
              <GoalLabel key={goal.title} index={i} title={goal.title} tag={goal.tag} drawn={drawn} stop={geo?.stops[i] ?? STOPS_T[i]} />
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/** How far the line is past a stop, 0 to 1 over a short stretch (so a point lights just as the line arrives). */
function useLit(drawn: MotionValue<number>, stop: number) {
  return useTransform(() => clamp01((drawn.get() - (stop - 0.02)) / 0.04));
}

function GoalPoint({ index, x, y, h, drawn, stop }: { index: number; x: number; y: number; h: number; drawn: MotionValue<number>; stop: number }) {
  const on = useLit(drawn, stop);
  const scale = useTransform(() => 0.6 + 0.4 * on.get());
  return (
    <>
      {/* Wide screens: the drop line from the point down to its label. */}
      <span className="absolute hidden w-px md:block" style={{ left: x, top: y + 10, height: Math.max(0, h - y - 10) + 40 }}>
        <span className="absolute inset-0 bg-[repeating-linear-gradient(180deg,rgb(255_255_255/0.16)_0_3px,transparent_3px_8px)]" />
        <motion.span style={{ scaleY: on }} className="absolute inset-0 origin-top bg-[linear-gradient(180deg,rgb(105_191_248/0.7),rgb(105_191_248/0.15))]" />
      </span>

      <span className="absolute" style={{ left: x, top: y }}>
        <span className="absolute -top-[7px] -left-[7px] size-[14px] rounded-full border-[1.5px] border-white/30 bg-[#081a3f]" />
        <motion.span
          style={{ opacity: on, scale }}
          className="absolute -top-[7px] -left-[7px] size-[14px] rounded-full border-[1.5px] border-sky bg-sky shadow-[0_0_0_5px_rgb(105_191_248/0.16),0_0_26px_2px_rgb(105_191_248/0.6)]"
        />
        {/* Phones: the point's number above it. */}
        <span className="num absolute -top-9 -translate-x-1/2 text-[13px] text-white/55 md:hidden">{pad(index)}</span>
      </span>
    </>
  );
}

function GoalLabel({ index, title, tag, drawn, stop }: { index: number; title: string; tag: string; drawn: MotionValue<number>; stop: number }) {
  const on = useLit(drawn, stop);
  const y = useTransform(() => (1 - on.get()) * 16);
  const opacity = useTransform(() => 0.18 + 0.82 * on.get());
  const numberColor = useTransform(() => (on.get() > 0.5 ? "#69bff8" : "rgb(241 241 238 / 0.45)"));
  return (
    <motion.li style={{ y, opacity }} className={cn("flex gap-4 md:flex-col md:items-center md:gap-0 md:px-6 md:pt-[56px] md:text-center")}>
      <motion.span style={{ color: numberColor }} className="num pt-[3px] text-[15px] md:pt-0">
        {pad(index)}
      </motion.span>
      <span className="min-w-0">
        <span className="block text-[20px] leading-[1.25] font-medium tracking-[-0.015em] text-balance text-white md:mt-3 md:text-[22px] lg:text-[24px]">{title}</span>
        <span className="mt-2 block text-[14px] text-white/55 md:text-[15px]">{tag}</span>
      </span>
    </motion.li>
  );
}
