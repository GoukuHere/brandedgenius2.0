"use client";

import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { PROMISE } from "@/content/site";

/* A no-break space (U+00A0) before the closing dash keeps it on the line with "schafft", however the headline wraps. */
const NO_BREAK_SPACE = String.fromCharCode(0xa0);
const TITLE = PROMISE.title.replace(/ –$/, `${NO_BREAK_SPACE}–`);

/*
  The scroll-scrubbed cascade, after jamescannella.com: figure i plays over its own slice of the row's progress,
  [i * STEP, i * STEP + SPAN]. The slices overlap, so the four arrive left to right, and scrolling back reverses them.
*/
const STEP = 0.15;
const SPAN = 0.45;

export function PromiseSection() {
  const rowRef = useRef<HTMLUListElement>(null);
  const progress = useSectionProgress(rowRef, ["start end", "end 0.65"]);
  const smooth = useSpring(progress, { stiffness: 140, damping: 30 });

  // Reduced motion holds every figure in its final state. It is applied after hydration, so the server HTML and the
  // first client render agree (useReducedMotion is null on the server).
  const reduce = useReducedMotion();
  const settled = useMotionValue(0);
  useEffect(() => {
    settled.set(reduce ? 1 : 0);
  }, [reduce, settled]);
  const cascade = useTransform([smooth, settled], ([p, s]: number[]) => Math.max(p, s));

  return (
    <MotionConfig reducedMotion="user">
      <Section id="mehrwert">
        <Container>
          <Reveal>
            <Heading title={TITLE} accent={PROMISE.accent} className="max-w-[820px]" />
          </Reveal>

          <ul
            ref={rowRef}
            role="list"
            className="mt-14 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 sm:gap-y-12 md:mt-20 md:gap-x-6 lg:grid-cols-4"
          >
            {PROMISE.figures.map((figure, index) => (
              <Figure key={figure.value} value={figure.value} label={figure.label} index={index} progress={cascade} />
            ))}
          </ul>
        </Container>
      </Section>
    </MotionConfig>
  );
}

function Figure({
  value,
  label,
  index,
  progress,
}: {
  value: string;
  label: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const range = [index * STEP, index * STEP + SPAN];
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [-40, 0]);

  return (
    <motion.li style={{ opacity, y }}>
      <div aria-hidden className="hairline" />
      {/*
        One line always. In General Sans light, "3–6 Monate" is about 4.95em wide: one column on phones, two from
        640px (44px), four from 1024px at 40px (columns about 218px) and 52px from 1280px (columns about 282px).
      */}
      <p className="num mt-6 text-[40px] leading-[1] whitespace-nowrap text-white md:text-[44px] lg:text-[40px] xl:text-[52px]">
        {value}
      </p>
      <p className="t-small mt-3">{label}</p>
    </motion.li>
  );
}
