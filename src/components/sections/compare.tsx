"use client";

import { X } from "lucide-react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { COMPARE } from "@/content/site";

/*
  Vorher / Nachher. The material carries the argument: the classic way is plain type on the page in brand grey,
  the Branded Genius way is the section's one glass object, lit. As each list crosses the middle of the screen, a
  thin strike line draws through the classic points one after another while the matching Branded Genius check
  draws in and its point comes up from 70% to full white. Everything is scrubbed by the scroll, so scrolling back
  reverses it. Reduced motion shows the end state through CSS (motion-reduce:), so the markup never changes.
*/

type Offset = Parameters<typeof useSectionProgress>[1];
type Range = [number, number];

/* Progress runs while a list moves from its top at 75% of the screen to its bottom at 45%. */
const OFFSET: Offset = ["start 0.75", "end 0.45"];
/* Point i plays over [i * STEP, i * STEP + SPAN] of its list's progress: five points end exactly at 1. */
const STEP = 0.15;
const SPAN = 0.4;
const pointRange = (i: number): Range => [i * STEP, i * STEP + SPAN];

export function CompareSection() {
  return (
    // The Versprechen row follows straight on (it is the last row of this section on the original), so the bottom
    // padding is shorter than the shared rhythm.
    <Section id="unterschied" className="pb-16 md:pb-24">
      <Container>
        <Reveal>
          <Heading title={COMPARE.title} accent={COMPARE.accent} className="max-w-[760px]" />
          <p className="t-lead mt-6 max-w-[600px]">{COMPARE.text}</p>
        </Reveal>

        {/*
          From md up both columns share three rows (title, points, result) through subgrid, so the two lists and the
          two result lines stay level whichever one wraps more. The classic column takes the glass's vertical padding
          so the titles line up.
        */}
        <div className="relative mt-14 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-y-8">
          <ClassicWay />
          <OursWay />

          <div aria-hidden className="pointer-events-none absolute inset-y-10 left-1/2 hidden -translate-x-1/2 flex-col items-center md:flex">
            <span className="w-px flex-1 bg-white/8" />
            <span className="py-3 text-[13px] leading-none text-silver">vs</span>
            <span className="w-px flex-1 bg-white/8" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- the classic way: bare type, struck through */

type Line = { x: number; y: number; w: number };

/* One rect per rendered line of the point's text, relative to its wrapper, so a wrapped point is struck line by line. */
function measureLines(text: HTMLSpanElement | null): Line[] {
  const host = text?.parentElement;
  if (!text || !host) return [];
  const base = host.getBoundingClientRect();
  return Array.from(text.getClientRects())
    .filter((rect) => rect.width > 1)
    .map((rect) => ({
      x: rect.left - base.left,
      // Through the lowercase letters, a touch under the centre of the glyph box; whole pixels keep the 1px line crisp.
      y: Math.round(rect.top - base.top + rect.height * 0.56),
      w: rect.width,
    }));
}

function ClassicWay() {
  const way = COMPARE.classic;
  const list = useRef<HTMLUListElement>(null);
  const texts = useRef<(HTMLSpanElement | null)[]>([]);
  const progress = useSectionProgress(list, OFFSET);

  // Measured after mount only (empty on the server and at hydration, so the markup matches), again on every
  // resize of the list and once the brand font has loaded.
  const [lines, setLines] = useState<Line[][]>([]);
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    let live = true;
    const measure = () => {
      if (live) setLines(texts.current.map(measureLines));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    document.fonts.ready.then(measure);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col gap-8 md:row-span-3 md:grid md:grid-rows-subgrid md:py-10 md:pr-8">
      <h3 className="t-h3">{way.title}</h3>

      <ul ref={list} role="list" className="flex flex-col gap-5">
        {way.points.map((point, i) => (
          <li key={point} className="flex items-start gap-3 text-[17px] leading-[1.55] text-silver">
            <span aria-hidden className="flex h-[1lh] shrink-0 items-center">
              <X className="size-4" strokeWidth={1.5} aria-hidden />
            </span>
            <span className="relative min-w-0">
              <span
                ref={(el) => {
                  texts.current[i] = el;
                }}
              >
                {point}
              </span>
              {lines[i]?.length ? <Strike lines={lines[i]} progress={progress} range={pointRange(i)} /> : null}
            </span>
          </li>
        ))}
      </ul>

      <div>
        <div aria-hidden className="rule" />
        <p className="mt-6 text-[18px] leading-[1.5] text-balance text-silver">{way.result}</p>
      </div>
    </div>
  );
}

/* A wrapped point shares its slice of the progress between its lines by length, so the stroke reads as one pass. */
function Strike({ lines, progress, range }: { lines: Line[]; progress: MotionValue<number>; range: Range }) {
  const total = lines.reduce((sum, line) => sum + line.w, 0);
  const [from, to] = range;
  const ends = lines.map((_, j) => lines.slice(0, j + 1).reduce((sum, line) => sum + line.w, 0) / total);
  return lines.map((line, j) => (
    <StrikeLine key={j} line={line} progress={progress} range={[from + (j ? ends[j - 1] : 0) * (to - from), from + ends[j] * (to - from)]} />
  ));
}

function StrikeLine({ line, progress, range }: { line: Line; progress: MotionValue<number>; range: Range }) {
  const scaleX = useTransform(progress, range, [0, 1]);
  return (
    <motion.span
      aria-hidden
      style={{ left: line.x, top: line.y, width: line.w, scaleX }}
      className="pointer-events-none absolute h-px origin-left bg-silver motion-reduce:!transform-none"
    />
  );
}

/* ------------------------------------------------------------ the Branded Genius way: the one lit glass object */

function OursWay() {
  const way = COMPARE.ours;
  const list = useRef<HTMLUListElement>(null);
  const progress = useSectionProgress(list, OFFSET);

  return (
    <div className="glass glass-lit flex flex-col gap-8 rounded-[32px] p-8 md:row-span-3 md:grid md:grid-rows-subgrid md:p-10">
      <h3 className="t-h3">{way.title}</h3>

      <ul ref={list} role="list" className="flex flex-col gap-5">
        {way.points.map((point, i) => (
          <OursPoint key={point} text={point} progress={progress} range={pointRange(i)} />
        ))}
      </ul>

      <div>
        <div aria-hidden className="rule" />
        <p className="mt-6 text-[20px] leading-[1.4] font-medium tracking-[-0.01em] text-balance text-white md:text-[22px]">{way.result}</p>
      </div>
    </div>
  );
}

function OursPoint({ text, progress, range }: { text: string; progress: MotionValue<number>; range: Range }) {
  const draw = useTransform(progress, range, [0, 1]);
  // A round cap leaves a dot at zero length, so the check fades in over the first sliver of its stroke.
  const ink = useTransform(draw, [0, 0.12], [0, 1]);
  const tone = useTransform(progress, range, [0.7, 1]);

  return (
    <li className="flex items-start gap-3 text-[17px] leading-[1.55] text-white">
      <span aria-hidden className="flex h-[1lh] shrink-0 items-center text-sky">
        {/* lucide's Check (same path, 1.5 stroke at 16px), drawn with stroke-dashoffset through pathLength. */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <motion.path
            d="M20 6 9 17l-5-5"
            style={{ pathLength: draw, opacity: ink }}
            className="motion-reduce:![stroke-dasharray:none] motion-reduce:!opacity-100"
          />
        </svg>
      </span>
      <motion.span style={{ opacity: tone }} className="min-w-0 motion-reduce:!opacity-100">
        {text}
      </motion.span>
    </li>
  );
}
