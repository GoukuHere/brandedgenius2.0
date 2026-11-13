"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PrimaryLink } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { LINKS, WORKSHOP } from "@/content/site";

/*
  v11 KI-Workshop topics, round 4b. The client found the first block "strange" (a lone label, a cycling line, every
  topic twice); its replacement, a numbered two-column list, read to the developer as "too much text". So the topics
  are no longer a list: they are seven pills threaded on one sky line, the workshop as a path. The line draws with
  the scroll and each pill lights as the line reaches it; the path ends at the booking button, so it leads somewhere.

  Desktop (lg): the pills wrap into centred rows (as many as fit), read left to right; at the end of each row the line
  sweeps back to the start of the next, and the last row ends with the button. Phones and tablets: one column, the pills alternating left and right, the line weaving down between
  them to the button. The line is one SVG behind the pills (they are opaque, so it runs behind them); its points are
  the pills' centres, measured (ResizeObserver, and again once the font is in), so no width is assumed.

  Reduced motion and no script: the line and every pill stand complete. Screen readers get the topics as a list.
*/

const TOPICS = WORKSHOP.topics;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const r = (v: number) => Math.round(v * 10) / 10;

type Geo = { w: number; h: number; d: string; stops: number[] };

/** The path through the stops' centres, as segments, so the length to each stop can be measured. */
function segmentsFor(points: { x: number; y: number }[], wide: boolean) {
  const segs: string[] = [];
  if (!points.length) return segs;
  const [first] = points;
  if (wide) {
    // Along each row; between rows, a sweep out past the row's end and back in to the next row's start.
    segs.push(`M${r(first.x - 56)} ${r(first.y)} L${r(first.x)} ${r(first.y)}`);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if (Math.abs(b.y - a.y) < 4) {
        segs.push(`L${r(b.x)} ${r(b.y)}`);
      } else {
        const mid = (a.y + b.y) / 2;
        const out = 120;
        const cx = (a.x + b.x) / 2;
        segs.push(`C${r(a.x + out)} ${r(a.y)} ${r(a.x + out)} ${r(mid)} ${r(cx)} ${r(mid)} C${r(b.x - out)} ${r(mid)} ${r(b.x - out)} ${r(b.y)} ${r(b.x)} ${r(b.y)}`);
      }
    }
  } else {
    segs.push(`M${r(first.x)} ${r(first.y - 36)} L${r(first.x)} ${r(first.y)}`);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const k = (b.y - a.y) * 0.55;
      segs.push(`C${r(a.x)} ${r(a.y + k)} ${r(b.x)} ${r(b.y - k)} ${r(b.x)} ${r(b.y)}`);
    }
  }
  return segs;
}

export function WorkshopTopics() {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  // Drawn while the block rises from 85% of the screen until its foot passes 75%; scroll-linked and reversible.
  const progress = useSectionProgress(box, ["start 85%", "end 75%"]);
  const smooth = useSpring(progress, { stiffness: 120, damping: 30, mass: 0.5 });
  const live = useMotionValue(0);
  const drawn = useTransform(() => (live.get() ? smooth.get() : 1));

  useEffect(() => {
    const el = box.current;
    const host = svg.current;
    if (!el || !host) return undefined;
    live.set(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1);
    const measure = () => {
      const base = el.getBoundingClientRect();
      const points = Array.from(el.querySelectorAll<HTMLElement>("[data-stop]")).map((stop) => {
        const b = stop.getBoundingClientRect();
        return { x: b.left - base.left + b.width / 2, y: b.top - base.top + b.height / 2 };
      });
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      const segs = segmentsFor(points, wide);
      // The length along the path to each stop, as a share of the whole (one segment per stop after the first).
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
      host.appendChild(probe);
      const lengths = segs.map((_, i) => {
        probe.setAttribute("d", segs.slice(0, i + 1).join(" "));
        return probe.getTotalLength();
      });
      probe.remove();
      const total = lengths[lengths.length - 1] || 1;
      setGeo({ w: base.width, h: base.height, d: segs.join(" "), stops: lengths.map((l) => l / total) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) measure();
    });
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [live]);

  const stopAt = (i: number) => geo?.stops[i] ?? 0;

  return (
    <div className="mt-16 md:mt-24">
      <div className="rule" />
      <h3 className="pt-10 text-[20px] leading-tight font-medium tracking-[-0.01em] text-white md:pt-14 md:text-[22px] lg:text-center">{WORKSHOP.topicsLabel}</h3>

      <div ref={box} className="relative mt-10 md:mt-12">
        <svg
          ref={svg}
          aria-hidden
          fill="none"
          width={geo?.w ?? 0}
          height={geo?.h ?? 0}
          viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          {geo && (
            <>
              <path d={geo.d} stroke="rgb(255 255 255 / 0.1)" strokeWidth={1.5} strokeLinecap="round" />
              <motion.path d={geo.d} stroke="#69bff8" strokeWidth={1.5} strokeLinecap="round" style={{ pathLength: drawn }} />
            </>
          )}
        </svg>

        <ol
          role="list"
          className="relative flex flex-col gap-7 lg:flex-row lg:flex-wrap lg:items-center lg:justify-center lg:gap-x-7 lg:gap-y-24"
        >
          {TOPICS.map((topic, i) => (
            <li key={topic} className={i % 2 === 0 ? "self-start lg:self-auto" : "self-end lg:self-auto"}>
              <Pill index={i} topic={topic} drawn={drawn} stop={stopAt(i)} />
            </li>
          ))}
          <li className="self-center pt-2 lg:self-auto lg:pt-0">
            <span data-stop className="inline-block">
              <PrimaryLink href={LINKS.booking}>{WORKSHOP.cta}</PrimaryLink>
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}

/** One topic: a pill on the line, lit once the line has reached it. */
function Pill({ index, topic, drawn, stop }: { index: number; topic: string; drawn: MotionValue<number>; stop: number }) {
  const on = useTransform(() => clamp01((drawn.get() - (stop - 0.03)) / 0.03));
  const opacity = useTransform(() => 0.4 + 0.6 * on.get());
  return (
    <motion.span
      data-stop
      style={{ opacity }}
      className="relative inline-flex max-w-[78vw] items-center gap-3 rounded-full border border-white/12 bg-[#0b1f4a] py-3 pr-5 pl-3 sm:max-w-[360px] lg:max-w-none lg:whitespace-nowrap"
    >
      <motion.span aria-hidden style={{ opacity: on }} className="absolute -inset-px rounded-full border border-sky/60 shadow-[0_0_24px_-6px_rgb(105_191_248/0.55)]" />
      <span className="num relative grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[12px] text-sky">{pad(index)}</span>
      <span className="relative text-[15px] leading-snug text-white/90">{topic}</span>
    </motion.span>
  );
}
