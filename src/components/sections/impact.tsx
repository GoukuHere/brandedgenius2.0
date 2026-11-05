"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { IMPACT, LINKS } from "@/content/site";

/*
  Business Impact. Desktop: an asymmetric split, the argument on the left (heading, text and the three principles as
  plain ruled lines) and the section's one glass object on the right, the worked example with its measured result.
  Under the figure sits the original's thin bar, drawn to its value as the reader scrolls (reversible, transform
  only). Then the four benefits as a ruled row of text, and the goal with the original's arrow link to the booking.
  No icons, no tiles, no banner.
*/

// The bar is drawn to the figure itself ("−84%" draws to 84%), so it stays honest if the figure ever changes.
const parsed = Number.parseFloat(IMPACT.live.metric.replace(/[^\d.,]/g, "").replace(",", "."));
const SHARE = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : null;

export function ImpactSection({ id = "impact" }: { id?: string }) {
  return (
    <Section id={id}>
      <Container>
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-16 xl:gap-x-20">
          <div className="lg:col-span-5">
            <Reveal y={12}>
              <Heading title={IMPACT.title} accent={IMPACT.accent} />
              <p className="t-lead mt-6">{IMPACT.text}</p>
            </Reveal>

            <ul role="list" className="mt-10 md:mt-12">
              {IMPACT.principles.map((principle, index) => (
                <li key={principle.title} className="relative py-4 first:pt-0 last:pb-0">
                  {index > 0 && <div aria-hidden className="rule absolute inset-x-0 top-0" />}
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="text-[17px] leading-snug font-medium text-white">{principle.title}</h3>
                    <p className="text-[15px] leading-snug text-silver">{principle.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* The one glass surface. On desktop it stretches to the left column's height and pins the result to its foot. */}
          <article
            aria-label={IMPACT.live.label}
            className="glass glass-lit flex flex-col justify-between gap-12 rounded-[32px] p-8 md:p-10 lg:col-span-7 lg:gap-16"
          >
            <div>
              <h3 className="t-h3">{IMPACT.live.title}</h3>
              <p className="t-body mt-3 max-w-[480px]">{IMPACT.live.text}</p>
            </div>
            <div>
              <p className="num text-[84px] leading-none text-white">{IMPACT.live.metric}</p>
              <p className="mt-3 text-[16px] leading-normal text-silver">{IMPACT.live.metricLabel}</p>
              {SHARE !== null && <PerformanceBar share={SHARE} />}
            </div>
          </article>
        </div>

        <ul role="list" className="mt-20 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10">
          {IMPACT.benefits.map((benefit) => (
            <li key={benefit.title}>
              <div aria-hidden className="rule" />
              <h3 className="mt-6 text-[18px] leading-snug font-medium text-white">{benefit.title}</h3>
              {/* 16px on phones and tablets (the page's body minimum there), 15px in the four-column row. */}
              <p className="mt-2 text-[16px] leading-relaxed text-silver lg:text-[15px]">{benefit.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-20">
          <Heading as="h3" size="h2" title={IMPACT.goal.title} className="max-w-[760px]" />
          <p className="t-lead mt-5 max-w-[620px]">{IMPACT.goal.text}</p>

          {/* As on the original: the sentence itself, with its arrow, opens the booking. */}
          <div className="mt-10">
            <a
              href={LINKS.booking}
              target="_blank"
              rel="noopener"
              className="group inline-flex max-w-full items-center gap-5 rounded-2xl py-1 text-white"
            >
              <span className="min-w-0 text-[22px] leading-snug font-medium tracking-[-0.01em] text-balance">
                {IMPACT.goal.cta}
              </span>
              <span
                aria-hidden
                className="grid size-12 shrink-0 place-items-center rounded-button border border-white/20 transition-[background-color,border-color,color] duration-200 ease-out group-hover:border-sky group-hover:bg-sky group-hover:text-page group-focus-visible:border-sky group-focus-visible:bg-sky group-focus-visible:text-page"
              >
                <ArrowUpRight
                  strokeWidth={1.5}
                  className="size-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </a>
            <p className="mt-3 max-w-[560px] text-[16px] leading-relaxed text-silver">{IMPACT.goal.ctaText}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/*
  The original's performance bar: a 3px track and a sky fill with a brighter tip. The fill sits in a clip as wide as
  the figure and slides in from the left (translateX, so it only composites), which keeps the tip at the leading
  edge without stretching it. It draws while the bar travels from the foot of the screen to just above the middle
  and undraws on the way back. Reduced motion removes the transform in CSS, so the bar shows fully drawn.
*/
function PerformanceBar({ share }: { share: number }) {
  const track = useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(track, ["start 0.95", "start 0.55"]);
  // Overdamped, as on the Ablauf line: no overshoot, settles about half a second after the scroll stops.
  const smooth = useSpring(progress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const x = useTransform(smooth, [0, 1], ["-100%", "0%"]);

  return (
    <div ref={track} aria-hidden className="relative mt-8 h-[3px] rounded-full bg-white/10">
      <div className="absolute inset-y-0 left-0 overflow-hidden rounded-full" style={{ width: `${share}%` }}>
        <motion.div style={{ x }} className="absolute inset-0 rounded-full bg-sky will-change-transform motion-reduce:!transform-none">
          <span className="absolute inset-y-0 right-0 w-10 rounded-full bg-linear-to-r from-sky to-ice" />
        </motion.div>
      </div>
    </div>
  );
}
