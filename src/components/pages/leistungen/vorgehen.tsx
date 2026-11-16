"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useRef, useSyncExternalStore, type CSSProperties } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { VORGEHEN } from "@/content/pages/leistungen";
import { useMedia, useReducedMotion } from "./shared";

/*
  Unser Vorgehen: his five phases as a staircase rising from left to right, one solid stepped shape, each phase a
  step with his title and line on it and its number large at its foot. The steps build one after another as the
  staircase scrolls up into view (scroll-linked and reversible; nothing is held): each rises out of the baseline, its
  tread lights, its words appear. His heading and line sit in the open space above the low steps.

  Phones: the staircase turned on its side: the phases stacked, each step reaching further out than the one before,
  so the right edge climbs out step by step; each step slides out as it scrolls in. Reduced motion: built.
*/

const PHASES = VORGEHEN.phases;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;

const subscribeNothing = () => () => {};
/** False on the server and while hydrating: the staircase is sent built, so it never depends on script to show. */
const useMounted = () => useSyncExternalStore(subscribeNothing, () => true, () => false);

export function VorgehenSection() {
  const stairs = useRef<HTMLOListElement>(null);
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const lg = useMedia("(min-width: 1024px)");
  // Desktop: the staircase builds from when its foot is just under the screen's edge until its top reaches the
  // header, so every step rises while it can be seen.
  const progress = useSectionProgress(stairs, ["end 112%", "start 10%"]);

  return (
    <Section id="vorgehen">
      <Container>
        <div className="ls-vorgehen relative">
          <div className="ls-vorgehen-head">
            <Heading title={VORGEHEN.title} accent={VORGEHEN.accent} className="ls-vorgehen-title" />
            <p data-reveal="up" data-rd="2" className="t-body mt-5 max-w-[440px] text-white/72">
              {VORGEHEN.text}
            </p>
          </div>

          <ol ref={stairs} className="ls-stairs">
            {PHASES.map((phase, k) => (
              <Step key={phase.num} k={k} phase={phase} progress={progress} lg={lg} still={reduced || !mounted} />
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

function Step({
  k,
  phase,
  progress,
  lg,
  still,
}: {
  k: number;
  phase: (typeof PHASES)[number];
  progress: MotionValue<number>;
  lg: boolean;
  /** Built and not moving: reduced motion, or the server's render. */
  still: boolean;
}) {
  const item = useRef<HTMLLIElement>(null);
  // Phones and tablets: each step builds on its own way into the screen.
  const own = useSectionProgress(item, ["start 0.95", "start 0.62"]);

  // Desktop: step k rises over its share of the staircase's progress (the windows overlap a little).
  const rise = useTransform(() => {
    if (still) return 1;
    if (!lg) return easeOut(clamp01(own.get()));
    const start = k * 0.15;
    return easeOut(clamp01((progress.get() - start) / 0.4));
  });
  const y = useTransform(() => (lg ? `${(1 - rise.get()) * 104}%` : "0%"));
  const x = useTransform(() => (lg ? "0px" : `${(1 - rise.get()) * -36}px`));
  const opacity = useTransform(() => (lg ? 1 : rise.get()));
  const words = useTransform(() => clamp01((rise.get() - 0.55) / 0.45));
  const tread = useTransform(() => clamp01((rise.get() - 0.8) / 0.2));

  return (
    <li ref={item} className="ls-stair" style={{ "--k": k } as CSSProperties}>
      <motion.div className="ls-stair-block" style={{ y, x, opacity }}>
        <motion.span aria-hidden className="ls-stair-tread" style={{ opacity: tread }} />
        <motion.div style={{ opacity: words }} className="relative">
          <h3 className="text-[19px] leading-tight font-medium tracking-[-0.01em] text-white xl:text-[20px]">{phase.title}</h3>
          <p className="ls-stair-text mt-2.5">{phase.text}</p>
        </motion.div>
        <span aria-hidden className="ls-stair-num ghost-num">
          {phase.num}
        </span>
      </motion.div>
    </li>
  );
}
