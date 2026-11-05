"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { InView } from "@/components/ui/in-view";
import { MagicCard } from "@/components/ui/magic-card";
import { PROBLEM } from "@/content/site";
import { cn } from "@/lib/utils";
import { DOT_R, LINE, RING_EDGE, ROYAL, SCROLL_SPRING, SKY, easeOut, ramp, snap, useLg, useReducedMotionPref } from "./system-circuit";

/*
  Problem: a BROKEN circuit. System, further down the page, draws the same circuit completed (see system-circuit).

  Header: the headline (title solid, the continuation outlined) in 7 of 12 columns; the paragraph to its right,
  bottom-aligned with it, and the three facts under the paragraph as one plain line.

  Desktop (lg): one full-width diagram. A horizontal main trace runs through the middle; six branches leave it at
  even intervals, alternating up (01, 03, 05) and down (02, 04, 06), each ending at its problem card. The main trace
  is six segments that never meet: each stops 18px before the next junction and ends in an open ring, and every
  junction is a ring too. The cards sit in a 7-column grid (each spans two columns, the bottom row one column to the
  right), so their centres, and with them the branches, are evenly spaced. One SVG behind the cards draws the
  lines; a ResizeObserver measures the cards, so nothing depends on the page width.

  Motion (lg, motion allowed): the scroll position through the diagram, spring-smoothed, plays the six problems left
  to right, one at a time: the segment runs in, its two rings open, the branch draws to the card, and the card flies
  in from the right (140px, turned 4 degrees, transparent) to land as the branch reaches it. All of it is scrubbed by
  the scroll and reverses on the way back. Lines draw by stroke-dashoffset (pathLength 1); cards move by transform and
  opacity only, never scale.

  Phones and tablets: the cards stacked, with the same broken trace down the left edge (a ring at each card, a break
  before each one) drawn in CSS; each card slides in once with Motion Primitives' InView. Reduced motion, no script
  and every breakpoint below lg show the end state: the lines drawn (still broken) and the cards in place.
*/

type Problem = (typeof PROBLEM.items)[number];

const ITEMS = PROBLEM.items;
const COUNT = ITEMS.length;
/** Each problem's share of the scroll progress. */
const SPAN = 1 / COUNT;

const LINE_OPACITY = 0.45;
const RING_OPACITY = 0.75;
/** How far before its junction a segment of the main trace ends (the centre of its open ring). */
const BREAK = 18;
/** The first segment fades in from the container's left edge over this many px. */
const LEAD_FADE = 72;

// Where a card's flight starts: px to the right of its place, and degrees of turn.
const FLY_X = 140;
const FLY_TURN = 4;

// The steps inside one problem's share of the progress (0 to 1). The card's flight overlaps the branch and lands with it.
const SEGMENT = [0, 0.4] as const;
const RINGS = [0.36, 0.46] as const;
const BRANCH = [0.44, 0.86] as const;
const FLIGHT = [0.3, 0.86] as const;
const FADE = [0.3, 0.58] as const;

// lg: card k starts in column k + 1 of 7 and spans two; even cards on the top row, odd cards on the bottom row.
const PLACE = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-2 lg:row-start-3",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-4 lg:row-start-3",
  "lg:col-start-5 lg:row-start-1",
  "lg:col-start-6 lg:row-start-3",
];

const EASE = [0.16, 1, 0.3, 1] as const;
const PHONE_IN = { hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0 } };
const PHONE_IN_TRANSITION = { duration: 0.7, ease: EASE };

export function ProblemSection() {
  const diagram = useRef<HTMLDivElement>(null);
  const circuit = useCircuit(diagram);
  const lg = useLg();
  const reduced = useReducedMotionPref();

  /*
    The six problems start flying in as soon as the diagram's top enters the lower part of the screen (85%), so the
    space under the header is never empty, and the last one lands as the diagram's centre reaches 55%: on a 900px-high
    screen the whole diagram is then in view below the header.
  */
  const progress = useSectionProgress(diagram, ["start 85%", "center 55%"]);
  const smooth = useSpring(progress, SCROLL_SPRING);

  // 1 on lg with motion allowed. Set after mount, so the server and hydration renders both show the end state.
  const live = useMotionValue(0);
  useEffect(() => {
    live.set(lg && !reduced ? 1 : 0);
  }, [live, lg, reduced]);
  const p = useTransform(() => {
    const on = live.get();
    const value = smooth.get();
    return on ? value : 1;
  });

  return (
    <Section className="overflow-x-clip">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-10">
          <Reveal className="lg:col-span-7">
            <Heading title={PROBLEM.title} accent={PROBLEM.accent} variant="outline" />
          </Reveal>
          <Reveal className="mt-6 lg:col-span-5 lg:mt-0" delay={0.08}>
            <p className="t-lead">{PROBLEM.text}</p>
          </Reveal>
          <Reveal className="mt-8 lg:col-span-5 lg:col-start-8" delay={0.14}>
            <Facts />
          </Reveal>
        </div>

        <div ref={diagram} className="relative mt-14 md:mt-20 lg:mt-24">
          <CircuitLines circuit={circuit} p={p} />
          <ol
            role="list"
            className="relative z-10 flex flex-col gap-4 md:max-w-[620px] lg:grid lg:max-w-none lg:grid-cols-7 lg:grid-rows-[auto_112px_auto] lg:gap-x-8 lg:gap-y-0 xl:grid-rows-[auto_128px_auto] xl:gap-x-12"
          >
            {ITEMS.map((item, k) => (
              <ProblemCard key={item.title} k={k} item={item} p={p} />
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

/* The three facts as one plain line: label (13px silver) over value (15px white), thin vertical hairlines between. */
function Facts() {
  return (
    <dl className="grid grid-cols-3">
      {PROBLEM.reality.map((fact, i) => (
        <div key={fact.label} className={cn("min-w-0 px-3 first:pl-0 last:pr-0 sm:px-5", i > 0 && "border-l border-white/12")}>
          <dt className="text-[13px] leading-snug text-silver">{fact.label}</dt>
          <dd className="mt-1 text-[15px] leading-snug hyphens-auto text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** One problem card: Magic UI's cursor-lit glass card, flying in on lg, sliding in below. */
function ProblemCard({ k, item, p }: { k: number; item: Problem; p: MotionValue<number> }) {
  const at = k * SPAN;
  const flight = useTransform(() => easeOut(ramp(p.get(), at + FLIGHT[0] * SPAN, at + FLIGHT[1] * SPAN)));
  const x = useTransform(() => FLY_X * (1 - flight.get()));
  const rotate = useTransform(() => FLY_TURN * (1 - flight.get()));
  const opacity = useTransform(() => ramp(p.get(), at + FADE[0] * SPAN, at + FADE[1] * SPAN));

  return (
    <li data-problem className={cn("relative pl-10 lg:col-span-2 lg:pl-0", PLACE[k])}>
      <PhoneTrace k={k} />
      {/* InView (Motion Primitives) is the entrance below lg; from lg CSS holds it at rest and the flight takes over. */}
      <div className="h-full *:h-full lg:*:transform-none! lg:*:opacity-100!">
        <InView variants={PHONE_IN} transition={PHONE_IN_TRANSITION} viewOptions={{ once: true, margin: "0px 0px -12% 0px" }}>
          <motion.div style={{ x, rotate, opacity }} className="h-full lg:motion-safe:will-change-transform">
            <MagicCard className="glass h-full rounded-panel p-6" gradientSize={240} gradientFrom={SKY} gradientTo={ROYAL} gradientOpacity={0.7}>
              <span aria-hidden className="ghost-num block text-[56px]">
                {String(k + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-[19px] leading-[1.3] font-medium text-balance text-white">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-ink/75">{item.text}</p>
            </MagicCard>
          </motion.div>
        </InView>
      </div>
    </li>
  );
}

/*
  Below lg: the same broken trace down the left edge (x 12.5px), in CSS. Each card has a junction ring level with
  its number and a short branch into the card; the trace coming down from the card above stops 18px before that ring
  in an open ring of its own. 16px between cards (the list's gap) is part of the arithmetic.
*/
function PhoneTrace({ k }: { k: number }) {
  return (
    <span aria-hidden className="lg:hidden">
      {k === 0 && <span className="absolute -top-10 left-3 h-[67px] w-px bg-[linear-gradient(180deg,transparent,rgb(105_191_248/0.45))]" />}
      <span className="absolute top-[27px] left-[9px] size-[7px] rounded-full border border-sky/75" />
      <span className="absolute top-[45px] left-[9px] size-[7px] rounded-full border border-sky/75" />
      <span className="absolute top-12 left-4 h-px w-6 bg-sky/45" />
      {k < COUNT - 1 && <span className="absolute top-[52px] bottom-[-43px] left-3 w-px bg-sky/45" />}
    </span>
  );
}

/* ---------- The desktop circuit ---------- */

type Circuit = {
  w: number;
  h: number;
  /** The main trace. */
  y: number;
  /** Each junction (a card's centre). */
  xs: number[];
  /** Where each branch meets its card: the bottom edge on the top row, the top edge on the bottom row. */
  ends: number[];
};

function measure(wrap: HTMLElement, items: HTMLElement[]): Circuit | null {
  const box = wrap.getBoundingClientRect();
  const rects = items.map((el) => el.getBoundingClientRect());
  const topRow = Math.max(...rects.filter((_, k) => k % 2 === 0).map((r) => r.bottom));
  const bottomRow = Math.min(...rects.filter((_, k) => k % 2 === 1).map((r) => r.top));
  // Stacked (below lg) there is no channel between two rows, so there is no circuit to draw.
  if (bottomRow - topRow < 2 * BREAK) return null;
  return {
    w: box.width,
    h: box.height,
    y: snap((topRow + bottomRow) / 2 - box.top),
    xs: rects.map((r) => snap(r.left + r.width / 2 - box.left)),
    ends: rects.map((r, k) => Math.round((k % 2 === 0 ? r.bottom : r.top) - box.top)),
  };
}

function same(a: Circuit | null, b: Circuit | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.w === b.w && a.h === b.h && a.y === b.y && a.xs.every((x, k) => x === b.xs[k]) && a.ends.every((e, k) => e === b.ends[k]);
}

/** Measures the cards' layout boxes (the list items, which never move; only the cards inside them fly). */
function useCircuit(ref: RefObject<HTMLDivElement | null>) {
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;
    const items = Array.from(wrap.querySelectorAll<HTMLElement>("[data-problem]"));
    if (items.length !== COUNT) return;
    // A ResizeObserver reports each element once when it starts observing, which is the first measurement.
    const ro = new ResizeObserver(() => {
      const next = measure(wrap, items);
      setCircuit((prev) => (same(prev, next) ? prev : next));
    });
    ro.observe(wrap);
    items.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [ref]);
  return circuit;
}

function CircuitLines({ circuit, p }: { circuit: Circuit | null; p: MotionValue<number> }) {
  const fade = `problem-lead-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <svg
      aria-hidden
      fill="none"
      width={circuit?.w ?? 0}
      height={circuit?.h ?? 0}
      viewBox={circuit ? `0 0 ${circuit.w} ${circuit.h}` : undefined}
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-visible lg:block"
    >
      {circuit && (
        <>
          <defs>
            <linearGradient id={fade} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={LEAD_FADE} y2="0">
              <stop offset="0" stopColor={SKY} stopOpacity="0" />
              <stop offset="1" stopColor={SKY} stopOpacity={LINE_OPACITY} />
            </linearGradient>
          </defs>
          {ITEMS.map((item, k) => (
            <Contact key={item.title} k={k} circuit={circuit} p={p} lead={`url(#${fade})`} />
          ))}
        </>
      )}
    </svg>
  );
}

/**
 * Problem k's part of the circuit: the segment of main trace running towards its junction (the first one comes in
 * from the left edge), the open ring where that segment stops, the junction ring, and the branch to the card.
 */
function Contact({ k, circuit, p, lead }: { k: number; circuit: Circuit; p: MotionValue<number>; lead: string }) {
  const at = k * SPAN;
  const segment = useTransform(() => ramp(p.get(), at + SEGMENT[0] * SPAN, at + SEGMENT[1] * SPAN));
  const ring = useTransform(() => ramp(p.get(), at + RINGS[0] * SPAN, at + RINGS[1] * SPAN));
  const ringScale = useTransform(() => 0.4 + 0.6 * ring.get());
  const branch = useTransform(() => ramp(p.get(), at + BRANCH[0] * SPAN, at + BRANCH[1] * SPAN));

  const { y } = circuit;
  const x = circuit.xs[k];
  const from = k === 0 ? 0 : circuit.xs[k - 1] + RING_EDGE;
  const loose = x - BREAK;
  const branchFrom = k % 2 === 0 ? y - RING_EDGE : y + RING_EDGE;

  return (
    <g>
      <motion.path
        d={`M ${from} ${y} H ${loose - RING_EDGE}`}
        stroke={k === 0 ? lead : SKY}
        strokeOpacity={k === 0 ? 1 : LINE_OPACITY}
        strokeWidth={LINE}
        style={{ pathLength: segment }}
      />
      <motion.circle cx={loose} cy={y} r={DOT_R} stroke={SKY} strokeOpacity={RING_OPACITY} strokeWidth={LINE} style={{ opacity: ring, scale: ringScale }} />
      <motion.circle cx={x} cy={y} r={DOT_R} stroke={SKY} strokeOpacity={RING_OPACITY} strokeWidth={LINE} style={{ opacity: ring, scale: ringScale }} />
      <motion.path
        d={`M ${x} ${branchFrom} V ${circuit.ends[k]}`}
        stroke={SKY}
        strokeOpacity={LINE_OPACITY}
        strokeWidth={LINE}
        style={{ pathLength: branch }}
      />
    </g>
  );
}
