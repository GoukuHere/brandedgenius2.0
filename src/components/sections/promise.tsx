"use client";

import { motion, useMotionValueEvent, useSpring, type Variants } from "motion/react";
import { useRef, useState } from "react";
import { Container, Heading } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { PROMISE } from "@/content/site";
import { cn } from "@/lib/utils";
import { PromiseCard } from "./promise-card";

/*
  Unser Versprechen (v4): a pinned scroll story, on lg screens at least 720px tall. The section is a 320svh runway
  with a sticky 100svh stage: on the left a lit glass card in 3D (promise-card.tsx) shows the current figure's
  value; on the right the statement is the heading, and under it the current figure's label steps along with a
  vertical step indicator. The runway is cut into four equal steps, scroll-linked and reversible.

  Phones, tablets and short screens: no pin. The statement, then the four figures as small glass cards (one
  column below 400px, two up to lg, four on wide short screens), revealed in a short stagger. On the pinned stage
  that list stays in the DOM as the screen-reader version (sr-only), while the card and the stepping label are
  decorative (aria-hidden). Values never count up; they swap whole.
*/

const FIGURES = PROMISE.figures;
const STEPS = FIGURES.length;
const EASE = [0.16, 1, 0.3, 1] as const;

// The title ends in a dash: a no-break space keeps it with "schafft", so no line ever starts with it.
const TITLE = PROMISE.title.replace(/ –$/, " –");

const stepAt = (progress: number) => Math.min(STEPS - 1, Math.max(0, Math.floor(progress * STEPS)));

const list: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.07 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function PromiseSection() {
  const runway = useRef<HTMLElement>(null);
  // 0 when the stage pins (section top at the screen top), 1 when it lets go (section bottom at the screen bottom).
  const progress = useSectionProgress(runway, ["start start", "end end"]);
  const smooth = useSpring(progress, { stiffness: 110, damping: 26, mass: 0.6, skipInitialAnimation: true });
  const [step, setStep] = useState(0);

  useMotionValueEvent(smooth, "change", (p) => setStep(stepAt(p)));

  return (
    <section
      ref={runway}
      id="mehrwert"
      className="relative pt-0 pb-16 md:pt-4 md:pb-24 lg:[@media(min-height:720px)]:h-[320svh] lg:[@media(min-height:720px)]:py-0"
    >
      {/* The stage: pinned for the length of the runway, its content centred below the fixed header. */}
      <div className="lg:[@media(min-height:720px)]:sticky lg:[@media(min-height:720px)]:top-0 lg:[@media(min-height:720px)]:flex lg:[@media(min-height:720px)]:h-svh lg:[@media(min-height:720px)]:items-center lg:[@media(min-height:720px)]:pt-20">
        <Container className="lg:[@media(min-height:720px)]:grid lg:[@media(min-height:720px)]:grid-cols-[auto_minmax(0,1fr)] lg:[@media(min-height:720px)]:items-center lg:[@media(min-height:720px)]:gap-[clamp(56px,6vw,112px)]">
          <div aria-hidden className="hidden lg:[@media(min-height:720px)]:block">
            <PromiseCard progress={smooth} step={step} />
          </div>

          <div className="min-w-0">
            <Reveal>
              <Heading
                title={TITLE}
                accent={PROMISE.accent}
                variant="outline"
                className="max-w-[880px] text-[length:clamp(2.125rem,1.25rem+2.2vw,3.25rem)]"
              />
            </Reveal>

            <StepLabel step={step} />

            <motion.ul
              role="list"
              variants={list}
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              className="mt-12 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 md:mt-16 lg:grid-cols-4 lg:[@media(min-height:720px)]:sr-only"
            >
              {FIGURES.map((figure) => (
                <motion.li key={figure.value} variants={item} className="glass @container rounded-[24px] p-5 sm:p-6">
                  {/* One line always: at most 40px, smaller in a narrow card ("3–6 Monate" is about 5em wide). */}
                  <p className="num text-[length:min(40px,18cqi)] leading-none whitespace-nowrap text-white">{figure.value}</p>
                  <p className="t-small mt-3 text-pretty">{figure.label}</p>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </Container>
      </div>
    </section>
  );
}

/** The current figure's label beside a four-tick step indicator (pinned stage only, decorative). */
function StepLabel({ step }: { step: number }) {
  return (
    <div aria-hidden className="mt-12 hidden items-center gap-6 lg:[@media(min-height:720px)]:flex xl:mt-14">
      <div className="flex shrink-0 flex-col gap-1.5">
        {FIGURES.map((figure, i) => (
          <span
            key={figure.value}
            className={cn("h-[22px] w-[2px] rounded-full transition-colors duration-500 ease-out", i === step ? "bg-sky" : "bg-white/20")}
          />
        ))}
      </div>

      {/* All four labels share one cell, so the block never changes height while they cross. */}
      <div className="grid min-w-0">
        {FIGURES.map((figure, i) => {
          const on = i === step;
          return (
            <motion.p
              key={figure.value}
              className="col-start-1 row-start-1 text-[30px] leading-[1.2] tracking-[-0.015em] text-pretty text-white xl:text-[32px]"
              initial={false}
              animate={{ opacity: on ? 1 : 0, y: i < step ? -12 : i > step ? 12 : 0 }}
              transition={{ duration: on ? 0.6 : 0.35, delay: on ? 0.1 : 0, ease: EASE }}
            >
              {figure.label}
            </motion.p>
          );
        })}
      </div>
    </div>
  );
}
