"use client";

import { Check, X } from "lucide-react";
import { MotionConfig, motion, stagger, type Variants } from "motion/react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal, RevealGroup } from "@/components/system/reveal";
import { COMPARE } from "@/content/site";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/* The classic card rises like every other block on the page, then its points follow one by one. */
const classicCard: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delayChildren: stagger(0.07, { startDelay: 0.2 }) } },
};

/* The Branded Genius card arrives a beat later, sliding in from the right. */
const oursCard: Variants = {
  hidden: { opacity: 0, x: 40 },
  shown: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, delay: 0.22, ease: EASE, delayChildren: stagger(0.07, { startDelay: 0.42 }) },
  },
};

/* Points, then the hairline and result line, as the last step of each card's stagger. */
const line: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/*
  The classic way keeps a reduced presence: its surface sits at 80% and its text is quieter. The opacity lives on
  the surface layer only, so the text keeps the colours below at full strength (AA contrast on the navy).
*/
const TONES = {
  classic: {
    Icon: X,
    card: classicCard,
    surface: "opacity-80",
    icon: "text-silver",
    title: "text-white/70",
    point: "text-ink/60",
    result: "text-silver",
  },
  ours: {
    Icon: Check,
    card: oursCard,
    surface: "border-sky/30",
    icon: "text-sky",
    title: "text-white",
    point: "text-white/85",
    result: "font-medium text-white",
  },
};

type Way = (typeof COMPARE)["classic"];

function WayCard({ way, tone }: { way: Way; tone: keyof typeof TONES }) {
  const t = TONES[tone];
  return (
    // Each card watches its own entry, so on phones the second card still plays when it is scrolled to. Side by side,
    // both enter together and the delays above keep the order: classic first, then Branded Genius.
    <RevealGroup className="md:row-span-3 md:grid md:grid-rows-subgrid">
      <motion.div
        variants={t.card}
        className="relative isolate flex flex-col gap-7 border border-transparent p-6 md:row-span-3 md:grid md:grid-rows-subgrid md:gap-8 md:p-8"
      >
        <div aria-hidden className={cn("surface pointer-events-none absolute -inset-px -z-10", t.surface)}>
          {tone === "ours" ? (
            <div className="absolute inset-0 overflow-hidden rounded-[inherit] bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgb(0_75_160/0.28),transparent)]" />
          ) : null}
        </div>

        <h3 className={cn("t-h3", t.title)}>{way.title}</h3>

        <ul role="list" className="flex flex-col gap-4">
          {way.points.map((text) => (
            <motion.li
              key={text}
              variants={line}
              className={cn("flex items-start gap-3 text-[16px] leading-[1.55] md:text-[17px]", t.point)}
            >
              <span aria-hidden className={cn("flex h-[1lh] shrink-0 items-center", t.icon)}>
                <t.Icon className="size-4" strokeWidth={1.5} />
              </span>
              <span>{text}</span>
            </motion.li>
          ))}
        </ul>

        <motion.div variants={line}>
          <div aria-hidden className="hairline" />
          <p className={cn("mt-6 text-[16px] leading-[1.5] text-balance lg:text-[18px]", t.result)}>{way.result}</p>
        </motion.div>
      </motion.div>
    </RevealGroup>
  );
}

export function CompareSection() {
  return (
    <MotionConfig reducedMotion="user">
      {/* overflow-x-clip stops the second card's slide from widening the page on phones, where it is full width. */}
      <Section id="unterschied" className="overflow-x-clip">
        <Container>
          <Reveal>
            <Heading title={COMPARE.title} accent={COMPARE.accent} className="max-w-[820px]" />
            <p className="t-lead mt-6 max-w-[620px]">{COMPARE.text}</p>
          </Reveal>

          {/*
            From md up both cards share three rows (title, points, result) through subgrid, so the hairlines and result
            lines stay level even when one result line wraps and the other does not.
          */}
          <div className="relative mt-14 grid gap-6 md:mt-20 md:grid-cols-2 md:gap-y-8">
            <WayCard way={COMPARE.classic} tone="classic" />
            <WayCard way={COMPARE.ours} tone="ours" />
            <Reveal
              y={0}
              delay={0.35}
              className="pointer-events-none absolute top-1/2 left-1/2 z-10 hidden size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-page md:grid"
            >
              {/* Lowercase serif sits low in its line box; 1.5px lifts the x-height to the optical centre. */}
              <span aria-hidden className="accent -translate-y-[1.5px] text-[20px]">
                vs
              </span>
            </Reveal>
          </div>
        </Container>
      </Section>
    </MotionConfig>
  );
}
