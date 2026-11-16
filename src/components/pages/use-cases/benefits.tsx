"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { UC_BENEFITS } from "@/content/pages/use-cases";
import { cn } from "@/lib/utils";

/*
  Mehrwert (2026-11-16): his six benefits as a radar chart. Six axes carry his six titles; one shape grows from a
  small hexagon to the full one as the chart passes up the screen (scroll-linked and reversible, never held), each
  axis reaching the rim a little after the one before, and each axis's point lights as the shape reaches it. The
  benefit last reached is the one being read: its line shows beside the chart (under it on phones), so the six lines
  follow one another with the scroll. Hovering, focusing or tapping an axis shows its line instead.

  No words beyond his: the axes carry his titles, the reading his lines. Marks after the site's line language: a 1px
  hexagon grid in white at low contrast, a 2px sky outline over a faint sky fill, 10px points (ringed, then filled
  and haloed once reached). Text never takes the sky colour. Each axis title is a button whose name carries its line,
  so screen readers and the keyboard reach all six.
  Reduced motion and no script: the full shape, every point lit, the last benefit's line shown.
*/

const ITEMS = UC_BENEFITS.items;
const R = 220;
const BASE = 0.2;
const angle = (i: number) => ((-90 + i * 60) * Math.PI) / 180;
const at = (i: number, r: number) => [Math.cos(angle(i)) * r, Math.sin(angle(i)) * r] as const;
const r1 = (v: number) => Math.round(v * 10) / 10;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - (1 - t) ** 3;

/** How far axis i has grown at progress p: each axis grows over 3/8 of the run, starting 1/8 after the one before. */
const reach = (p: number, i: number) => ease(clamp01((p - i / 8) / (3 / 8)));
/** How many axes have reached the rim (to the eye: the ease leaves the last 2% very slowly). */
const reached = (p: number) => ITEMS.reduce((n, _, i) => n + (reach(p, i) >= 0.98 ? 1 : 0), 0);

const ring = (k: number) =>
  ITEMS.map((_, i) => at(i, R * k))
    .map(([x, y], i) => `${i ? "L" : "M"}${r1(x)} ${r1(y)}`)
    .join(" ") + " Z";

/** A wedge around axis i, for the pointer. */
const wedge = (i: number) => {
  const a = angle(i) - Math.PI / 6;
  const b = angle(i) + Math.PI / 6;
  const out = R + 70;
  return `M0 0 L${r1(Math.cos(a) * out)} ${r1(Math.sin(a) * out)} L${r1(Math.cos(b) * out)} ${r1(Math.sin(b) * out)} Z`;
};

export function BenefitsSection() {
  const chart = useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(chart, ["start 85%", "end 40%"]);
  // The server and reduced motion draw the finished chart; the scroll takes over after mount.
  const live = useMotionValue(0);
  // Both values are read on every run: a computed value only follows the values its first run reads.
  const p = useTransform(() => {
    const scrolled = progress.get();
    return live.get() ? scrolled : 1;
  });
  const [count, setCount] = useState(ITEMS.length);
  const [hover, setHover] = useState<number | null>(null);
  const [picked, setPicked] = useState<{ axis: number; count: number } | null>(null);

  useEffect(() => {
    live.set(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1);
  }, [live]);

  useMotionValueEvent(p, "change", (v) => {
    const next = reached(v);
    setCount((prev) => (prev === next ? prev : next));
  });

  // The scroll's benefit is the one last reached; a pick holds until the scroll reaches another one.
  const fromScroll = Math.max(0, count - 1);
  const active = hover ?? (picked && picked.count === count ? picked.axis : fromScroll);

  const points = useTransform(() =>
    ITEMS.map((_, i) => at(i, R * (BASE + (1 - BASE) * reach(p.get(), i))))
      .map(([x, y]) => `${r1(x)},${r1(y)}`)
      .join(" ")
  );

  const pick = (i: number) => setPicked({ axis: i, count });

  return (
    <Section id="mehrwert">
      <Container>
        {/* From 1280px the chart stands left and the heading right; below, the heading leads and the chart follows. */}
        <div className="grid gap-12 md:gap-16 xl:grid-cols-12 xl:items-center xl:gap-x-10">
          <div className="xl:order-2 xl:col-span-5 xl:col-start-8">
            <Heading title={UC_BENEFITS.title} accent={UC_BENEFITS.accent} className="max-w-[560px]" />
            <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[520px]">
              {UC_BENEFITS.text}
            </p>
            <Reading active={active} className="mt-12 hidden xl:block" />
          </div>

          <div className="xl:order-1 xl:col-span-7">
            <div ref={chart} className="uc-radar" data-reveal="up" data-rd="1">
              <svg viewBox="-300 -300 600 600" aria-hidden focusable="false" className="uc-radar-svg">
                <g fill="none" stroke="#ffffff">
                  {[0.25, 0.5, 0.75].map((k) => (
                    <path key={k} d={ring(k)} strokeOpacity="0.08" />
                  ))}
                  <path d={ring(1)} strokeOpacity="0.2" />
                  {ITEMS.map((_, i) => {
                    const [x, y] = at(i, R);
                    return <path key={i} d={`M0 0 L${r1(x)} ${r1(y)}`} strokeOpacity={i === active ? 0.45 : 0.1} className="uc-radar-spoke" />;
                  })}
                </g>
                <path d={ring(BASE)} fill="none" stroke="#dcecff" strokeOpacity="0.22" strokeDasharray="2 5" />
                <motion.polygon points={points} fill="#69bff8" fillOpacity="0.13" stroke="#69bff8" strokeWidth="2" strokeLinejoin="round" />
                {ITEMS.map((_, i) => (
                  <Vertex key={i} index={i} p={p} lit={i < count} active={i === active} />
                ))}
                {ITEMS.map((_, i) => (
                  <path
                    key={i}
                    d={wedge(i)}
                    fill="transparent"
                    className="uc-radar-hit"
                    onPointerEnter={(event) => event.pointerType === "mouse" && setHover(i)}
                    onPointerLeave={() => setHover(null)}
                    onClick={() => pick(i)}
                  />
                ))}
              </svg>

              {ITEMS.map((item, i) => {
                const [x, y] = at(i, R);
                return (
                  <button
                    key={item.title}
                    type="button"
                    aria-label={`${item.title}: ${item.text}`}
                    data-axis={i}
                    data-lit={i < count ? "" : undefined}
                    onClick={() => pick(i)}
                    onPointerEnter={(event) => event.pointerType === "mouse" && setHover(i)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    className={cn("uc-radar-label", i === active && "is-active")}
                    style={{ left: `${50 + (x / 600) * 100}%`, top: `${50 + (y / 600) * 100}%` } as CSSProperties}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
            <Reading active={active} className="mx-auto mt-8 max-w-[520px] md:mt-12 xl:hidden" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** One axis's point: it rides the growing shape, rings while on its way and fills with a halo once it arrives. */
function Vertex({ index, p, lit, active }: { index: number; p: MotionValue<number>; lit: boolean; active: boolean }) {
  const cx = useTransform(() => r1(at(index, R * (BASE + (1 - BASE) * reach(p.get(), index)))[0]));
  const cy = useTransform(() => r1(at(index, R * (BASE + (1 - BASE) * reach(p.get(), index)))[1]));
  return (
    <g className={cn("uc-radar-point", lit && "is-lit", active && "is-active")}>
      <motion.circle cx={cx} cy={cy} r="16" className="uc-radar-halo" />
      <motion.circle cx={cx} cy={cy} r="5" className="uc-radar-dot" />
    </g>
  );
}

/** The benefit being read: his title and his line, one at a time. */
function Reading({ active, className }: { active: number; className?: string }) {
  const item = ITEMS[active];
  return (
    <div aria-hidden className={cn("uc-reading", className)}>
      <div className="uc-reading-steps">
        {ITEMS.map((_, i) => (
          <span key={i} className={cn(i === active && "is-on")} />
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="uc-reading-title">{item.title}</p>
          <p className="uc-reading-text">{item.text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
