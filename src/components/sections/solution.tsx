"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Container, Heading, PrimaryLink, SecondaryLink, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { LINKS, SOLUTION } from "@/content/site";

/*
  Plan, Systeme, Menschen as one sequence. On desktop the three pillars share a rail: a faint 1px line through their
  nodes, with a sky stroke that draws from the first node to the last when the row comes into view. Stacked on mobile,
  each pillar draws its own short rail instead, so the stroke plays when that pillar is actually on screen.
*/

const EASE = [0.16, 1, 0.3, 1] as const;

// A symmetric curve, so the stroke passes the middle node exactly halfway through its 1.2s.
const draw: Variants = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 1, transition: { duration: 1.2, ease: [0.45, 0, 0.55, 1] } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  shown: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1 + i * 0.12, ease: EASE } }),
};

// The rail is drawn at the node's vertical centre (10px node, 1px line).
const RAIL = "pointer-events-none absolute top-[4.5px] left-[5px] h-px";

export function SolutionSection() {
  const reduce = useReducedMotion();
  const initial = reduce ? false : "hidden";

  return (
    <Section id="loesung">
      <Container>
        <Reveal>
          <Heading title={SOLUTION.title} accent={SOLUTION.accent} className="max-w-[820px]" />
          <p className="t-lead mt-6 max-w-[620px]">{SOLUTION.text}</p>
        </Reveal>

        <motion.div
          className="relative mt-14 md:mt-20"
          initial={initial}
          whileInView="shown"
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        >
          {/*
            Desktop rail. The base runs from the first node to the row's end and fades out; the sky stroke ends on the
            third node. Its width is two column steps: 2/3 of (row width + one 3rem column gap).
          */}
          <span
            aria-hidden
            className={`${RAIL} right-0 hidden bg-[linear-gradient(90deg,rgb(255_255_255/0.12)_72%,transparent)] lg:block`}
          />
          <motion.span
            aria-hidden
            variants={draw}
            className={`${RAIL} hidden w-[calc((100%_+_3rem)*2/3)] origin-left bg-linear-to-r from-sky/35 via-sky/80 to-sky lg:block`}
          />

          <ol role="list" className="grid gap-14 lg:grid-cols-3 lg:gap-x-12">
            {SOLUTION.pillars.map((pillar, i) => (
              <motion.li
                key={pillar.title}
                initial={initial}
                whileInView="shown"
                viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              >
                <div className="relative">
                  <span aria-hidden className={`${RAIL} right-0 bg-linear-to-r from-white/12 to-white/0 lg:hidden`} />
                  <motion.span
                    aria-hidden
                    variants={draw}
                    className={`${RAIL} right-0 origin-left bg-linear-to-r from-sky/80 to-sky/0 lg:hidden`}
                  />
                  <span
                    aria-hidden
                    className="relative z-10 block size-2.5 rounded-full bg-sky shadow-[0_0_0_4px_rgb(105_191_248/0.12),0_0_16px_2px_rgb(105_191_248/0.5)]"
                  />
                </div>

                <motion.div variants={rise} custom={i} className="mt-8">
                  <div className="flex items-baseline gap-4">
                    <span aria-hidden className="num text-[44px] leading-none text-sky">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="t-h3">{pillar.title}</h3>
                  </div>
                  <ul role="list" className="mt-6 space-y-3">
                    {pillar.items.map((item) => (
                      <li key={item} className="flex gap-3 text-[16px] leading-6 text-ink/75">
                        <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-xs bg-sky" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.li>
            ))}
          </ol>
        </motion.div>

        <Reveal className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-20">
          <PrimaryLink href={LINKS.analysis}>{SOLUTION.primary}</PrimaryLink>
          <SecondaryLink href="#leistungen">{SOLUTION.secondary}</SecondaryLink>
        </Reveal>
      </Container>
    </Section>
  );
}
