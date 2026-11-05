"use client";

import { easeOut, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { PROBLEM } from "@/content/site";

/*
  Problem, v3. An asymmetric spread: the headline, the paragraph and the three facts hold the left 5 of 12 columns;
  the six problem cards land in the right 7 as a staggered two-column cascade (the second column 64px lower).

  Desktop (at least 1280px wide and 768px tall, motion allowed): a 230svh runway pins a one-screen stage. As the
  reader scrolls, the cards fly in from the right, slightly turned, and settle; scrolling back sends them out again.
  Progress is the runway's scroll position, spring-smoothed; the cards move by transform and opacity only, never
  scale (a scaled layer under will-change keeps its first raster and lands blurred).

  The pinning is pure CSS (the `xl:motion-safe:[@media(min-height:48rem)]:` classes), so the server HTML is already
  right. An effect only tells the cards to follow the scroll; until then, and anywhere the stage does not pin (a
  short window, reduced motion, tablets, phones), the cards sit landed. Phones and tablets: the headline block, the
  facts, then the cards stacked with the shared RevealGroup.

  Fit: at 1280 to 1659px each card is about 335px wide and 150 to 175px tall, so the cascade (3 cards, 2 gaps, the
  64px offset) is about 600px and fits the 768px minimum less the 96px header clearance and 48px foot.
*/

const PIN_QUERY = "(min-width: 80rem) and (min-height: 48rem) and (prefers-reduced-motion: no-preference)";

// Where each card starts its flight: px to the right of its place and degrees of turn (deterministic, no random).
const FROM = [
  { x: 150, r: 4 },
  { x: 200, r: 5 },
  { x: 120, r: 3 },
  { x: 180, r: 4 },
  { x: 140, r: 5 },
  { x: 190, r: 3 },
];

export function ProblemSection() {
  const runway = useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(runway, ["start start", "end end"]);
  const smooth = useSpring(progress, { stiffness: 100, damping: 24, restDelta: 0.001, skipInitialAnimation: true });

  // 1 while the stage is pinned (set after mount, never read during render), 0 everywhere else.
  const live = useMotionValue(0);
  useEffect(() => {
    const query = window.matchMedia(PIN_QUERY);
    const sync = () => live.set(query.matches ? 1 : 0);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [live]);
  const flight = useTransform([smooth, live], ([p, on]: number[]) => (on ? p : 1));

  return (
    <Section className="xl:motion-safe:[@media(min-height:48rem)]:py-0">
      <div ref={runway} className="relative xl:motion-safe:[@media(min-height:48rem)]:h-[230svh]">
        {/* The stage. Pinned, it is one screen tall; 96px at the top clear the fixed header. */}
        <div className="xl:motion-safe:[@media(min-height:48rem)]:sticky xl:motion-safe:[@media(min-height:48rem)]:top-0 xl:motion-safe:[@media(min-height:48rem)]:flex xl:motion-safe:[@media(min-height:48rem)]:h-svh xl:motion-safe:[@media(min-height:48rem)]:flex-col xl:motion-safe:[@media(min-height:48rem)]:justify-center xl:motion-safe:[@media(min-height:48rem)]:pt-24 xl:motion-safe:[@media(min-height:48rem)]:pb-12">
          <Container className="xl:grid xl:grid-cols-12 xl:items-center xl:gap-x-10">
            <Reveal className="xl:col-span-5">
              <Heading title={PROBLEM.title} accent={PROBLEM.accent} />
              <p className="t-lead mt-6 max-w-[560px]">{PROBLEM.text}</p>
              <Facts />
            </Reveal>

            <RevealGroup className="mt-14 md:mt-16 xl:col-span-7 xl:col-start-6 xl:mt-0">
              {/* pb-16 reserves the second column's 64px offset, so the cascade stays centred on the stage. */}
              <ol role="list" className="grid max-w-[600px] gap-4 md:gap-5 xl:max-w-none xl:grid-cols-2 xl:gap-x-6 xl:gap-y-5 xl:pb-16">
                {PROBLEM.items.map((item, i) => (
                  <RevealItem as="li" key={item.title} className="xl:even:translate-y-16">
                    <Flight index={i} flight={flight}>
                      <ProblemCard index={i} title={item.title} text={item.text} />
                    </Flight>
                  </RevealItem>
                ))}
              </ol>
            </RevealGroup>
          </Container>
        </div>
      </div>
    </Section>
  );
}

/*
  One card's flight. Each card starts 7.5% of the runway after the one before and lands 30% later; the last lands at
  67.5%, so the finished cascade holds for the last third of the runway. At flight 1 the card is in place.
*/
function Flight({ index, flight, children }: { index: number; flight: MotionValue<number>; children: ReactNode }) {
  const from = FROM[index];
  const start = index * 0.075;
  const end = start + 0.3;
  const x = useTransform(flight, [start, end], [from.x, 0], { ease: easeOut });
  const rotate = useTransform(flight, [start, end], [from.r, 0], { ease: easeOut });
  const opacity = useTransform(flight, [start, start + 0.2], [0, 1]);

  return (
    <motion.div style={{ x, rotate, opacity }} className="h-full xl:motion-safe:[@media(min-height:48rem)]:will-change-transform">
      {children}
    </motion.div>
  );
}

// A small glass object: the original's number inline before the title, then the line of text. No icon.
function ProblemCard({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <div className="glass h-full rounded-[24px] p-6">
      <h3 className="text-[17px] leading-snug font-medium text-balance text-white">
        <span aria-hidden className="num mr-2.5 text-[13px] text-silver">
          {String(index + 1).padStart(2, "0")}
        </span>
        {title}
      </h3>
      <p className="mt-2.5 text-[15px] leading-[1.55] text-ink/70">{text}</p>
    </div>
  );
}

/*
  The reality in three facts on one plain line: label (silver, 13px) over value (white, 15px), thin vertical
  hairlines between. No strip, no glass. Phones: three equal columns. From 640px each column hugs its value.
*/
function Facts() {
  return (
    <dl className="mt-10 grid max-w-[560px] grid-cols-3 sm:w-fit sm:max-w-full sm:grid-cols-[repeat(3,auto)]">
      {PROBLEM.reality.map((fact) => (
        <div key={fact.label} className="px-3 first:pl-0 last:pr-0 not-first:border-l not-first:border-white/12 sm:px-5">
          <dt className="text-[13px] leading-snug text-silver">{fact.label}</dt>
          <dd className="mt-1 text-[15px] leading-snug text-balance text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
