"use client";

import { Check, X } from "lucide-react";
import { motion, useInView, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { COMPARE } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Vorher / Nachher, "Chaos to System". The developer found the large rewritten lines cheap and the text too big, and
  asked for something entirely new that suits the site. The section now tells the site's own story (Tool-Chaos statt
  System) with the line-and-dot language of Problem and System, and small type.

  One glass panel, split by "VS":
  - Left, the classic way: the five classic points as small glass chips in a messy pile (tilted, out of line,
    drifting slightly), hanging off a broken, dashed line.
  - Right, the Branded Genius way: the same pile at first; as the panel comes up the screen (scroll-linked and
    reversible) the chips straighten into a clean column on a solid sky line, a dot lights at each one, the result
    line appears, and a pulse of light runs down the line.
  Phones: the two halves stack. Reduced motion: no drift, no pulse, the right side already in order.
*/

type Way = typeof COMPARE.classic;
const CLASSIC: Way = COMPARE.classic;
const OURS: Way = COMPARE.ours;

// The pile: offsets in px (scaled down on narrow panels) and tilts in degrees, one per chip; deterministic.
const PILE = [
  { x: 26, y: 8, r: -5 },
  { x: -6, y: -6, r: 4 },
  { x: 44, y: 10, r: -3 },
  { x: 8, y: -12, r: 6 },
  { x: 34, y: 4, r: -4 },
];

// A slow, small drift for the classic pile (seconds per cycle), so the chaos never quite settles.
const DRIFT = [6.2, 7.4, 5.6, 8.1, 6.8];

const EASE = [0.16, 1, 0.3, 1] as const;

export function CompareSection() {
  const panelRef = useRef<HTMLDivElement>(null);
  const oursRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { margin: "0px 0px -10% 0px" });

  /*
    0 = the right side still a pile, 1 = in order. It follows that half itself (on desktop it shares the panel's top;
    on phones it sits under the classic half, so the order happens where the reader actually sees it), smoothed;
    under reduced motion it rests at 1.
  */
  const progress = useSectionProgress(oursRef, ["start 85%", "center 50%"]);
  const smooth = useSpring(progress, { stiffness: 120, damping: 26, mass: 0.6 });
  const reduced = useMotionValue(0);
  const order = useTransform(() => (reduced.get() ? 1 : smooth.get()));

  // The pile shrinks on narrow panels, so chips never leave the panel on a phone.
  const spread = useMotionValue(1);
  useEffect(() => {
    reduced.set(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0);
    const panel = panelRef.current;
    if (!panel) return;
    const observer = new ResizeObserver(([entry]) => spread.set(Math.max(0.35, Math.min(1, entry.contentRect.width / 1100))));
    observer.observe(panel);
    return () => observer.disconnect();
  }, [reduced, spread]);

  // Once the column is complete, the pulse runs and the result shows.
  const [complete, setComplete] = useState(false);
  useMotionValueEvent(order, "change", (value) => {
    const next = value > 0.95;
    setComplete((current) => (current === next ? current : next));
  });

  return (
    <Section id="unterschied" className="pb-12 md:pb-16 lg:[@media(min-height:720px)]:pb-12">
      <Container>
        <Reveal className="max-w-[920px]">
          <Heading title={COMPARE.title} accent={COMPARE.accent} />
          <p className="t-lead mt-6 max-w-[600px]">{COMPARE.text}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 md:mt-16">
          <div ref={panelRef} className="glass relative grid overflow-hidden rounded-panel lg:grid-cols-2">
            {/* Left: the classic way, a pile that never settles. */}
            <div className="relative px-6 pt-8 pb-9 sm:px-10 md:pt-10 md:pb-11">
              <h3 className="flex items-center gap-2.5 text-[16px] font-medium text-silver">
                <X aria-hidden strokeWidth={1.75} className="size-4" />
                {CLASSIC.title}
              </h3>
              <ol className="relative mt-8 space-y-3.5 pl-8 md:mt-10">
                {/* A broken, dashed line: the steps never connect. */}
                <span
                  aria-hidden
                  className="absolute top-2 bottom-2 left-[5px] w-px bg-[repeating-linear-gradient(180deg,rgb(255_255_255/0.22)_0_6px,transparent_6px_14px)] [mask-image:linear-gradient(180deg,#000_0_18%,transparent_18%_30%,#000_30%_62%,transparent_62%_72%,#000_72%_100%)]"
                />
                {CLASSIC.points.map((point, i) => (
                  <Chip key={point} index={i} kind="classic" text={point} spread={spread} drift={inView} />
                ))}
              </ol>
              <p className="mt-9 border-t border-white/[0.07] pt-5 text-[15px] leading-snug text-silver md:mt-10">{CLASSIC.result}</p>
            </div>

            {/* The divider with the original's "VS". */}
            <div aria-hidden className="pointer-events-none absolute inset-x-6 top-1/2 h-px bg-white/[0.08] lg:inset-x-auto lg:inset-y-8 lg:left-1/2 lg:h-auto lg:w-px" />
            <div
              aria-hidden
              className="glass absolute top-1/2 left-1/2 z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-button text-[12px] font-medium text-sky"
            >
              {COMPARE.vs}
            </div>

            {/* Right: the Branded Genius way, the same pile pulled into order. */}
            <div
              ref={oursRef}
              className="relative px-6 pt-10 pb-9 sm:px-10 md:pb-11 lg:pt-10"
            >
              <h3 className="flex items-center gap-2.5 text-[16px] font-medium text-white">
                <Check aria-hidden strokeWidth={2} className="size-4 text-sky" />
                {OURS.title}
              </h3>
              <ol className="relative mt-8 space-y-3.5 pl-8 md:mt-10">
                <Spine order={order} complete={complete} />
                {OURS.points.map((point, i) => (
                  <Chip key={point} index={i} kind="ours" text={point} spread={spread} order={order} />
                ))}
              </ol>
              <motion.p
                initial={false}
                animate={{ opacity: complete ? 1 : 0.35, y: complete ? 0 : 6 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="mt-9 flex items-start gap-2.5 border-t border-white/10 pt-5 text-[16px] leading-snug font-medium text-white md:mt-10"
              >
                <Check aria-hidden strokeWidth={2} className="mt-[3px] size-4 shrink-0 text-sky" />
                {OURS.result}
              </motion.p>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/*
  One chip. Classic: a dim matte chip held in the pile (offset and tilted), drifting slightly while the panel is on
  screen, its ring open. Ours: the same pile position at first, pulled straight as `order` goes to 1, its dot filling.
  The chip is a step lighter than the panel with its own hairline (v5 matte; no panel inside a panel).
*/
function Chip({
  index,
  kind,
  text,
  spread,
  order,
  drift = false,
}: {
  index: number;
  kind: "classic" | "ours";
  text: string;
  spread: MotionValue<number>;
  order?: MotionValue<number>;
  drift?: boolean;
}) {
  const pile = PILE[index];
  const ours = kind === "ours";
  const away = useTransform(() => (ours && order ? 1 - order.get() : 1));
  const x = useTransform(() => pile.x * spread.get() * away.get());
  const y = useTransform(() => pile.y * spread.get() * away.get());
  const rotate = useTransform(() => pile.r * away.get());
  // Each dot lights as the drawing line reaches its row (the line draws over order 0.3 to 0.9), so all five are full
  // before the column counts as complete.
  const dot = useTransform(() => (ours && order ? Math.min(1, Math.max(0, (order.get() - 0.33 - index * 0.13) / 0.08)) : 0));

  return (
    <li className="relative">
      {/* The row's mark on the line: an open ring for the classic way, a sky dot that fills for ours. */}
      <span aria-hidden className={cn("absolute top-1/2 -left-8 size-[11px] -translate-y-1/2 rounded-full border", ours ? "border-sky/60" : "border-white/25")}>
        {ours && <motion.span style={{ opacity: dot }} className="absolute inset-[2px] rounded-full bg-sky shadow-[0_0_10px_rgb(105_191_248/0.8)]" />}
      </span>
      <motion.div style={{ x, y, rotate }} className="origin-left">
        <motion.div
          animate={drift ? { rotate: [0, 1.4, -0.8, 0], x: [0, 5, -3, 0] } : { rotate: 0, x: 0 }}
          transition={drift ? { duration: DRIFT[index], repeat: Infinity, ease: "easeInOut" } : { duration: 0.6 }}
          className={cn(
            "inline-flex max-w-full items-center gap-3 rounded-[10px] bg-white/[0.045] px-4 py-3 text-[15px] leading-snug shadow-[inset_0_0_0_1px_rgb(241_241_238/0.08)] motion-reduce:!transform-none",
            ours ? "text-white" : "text-silver opacity-90"
          )}
        >
          {ours ? (
            <Check aria-hidden strokeWidth={2} className="size-4 shrink-0 text-sky" />
          ) : (
            <X aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-silver" />
          )}
          <span className="min-w-0">{text}</span>
        </motion.div>
      </motion.div>
    </li>
  );
}

/* The solid sky line behind the ordered column: it draws as the chips straighten, then a pulse runs down it. */
function Spine({ order, complete }: { order: MotionValue<number>; complete: boolean }) {
  const scaleY = useTransform(order, [0.3, 0.9], [0, 1], { clamp: true });
  return (
    <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px overflow-hidden">
      <motion.span style={{ scaleY }} className="absolute inset-0 origin-top bg-sky/55" />
      {complete && (
        <motion.span
          initial={{ y: "-100%" }}
          animate={{ y: "400%" }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
          className="absolute inset-x-0 top-0 h-1/4 bg-[linear-gradient(180deg,transparent,#dcecff,transparent)] motion-reduce:hidden"
        />
      )}
    </span>
  );
}
