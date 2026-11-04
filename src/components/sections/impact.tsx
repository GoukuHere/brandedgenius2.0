"use client";

import { ChartColumn, Timer, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import { useInView } from "motion/react";
import { Fragment, useRef } from "react";
import { Container, Heading, IconChip, PrimaryLink, Section } from "@/components/system/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/system/reveal";
import { IMPACT, LINKS, SOLUTION } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Business impact: three principles, one worked example with its measured result beside the four benefits, then the
  goal and the call to the potential analysis. The section's one signature motion is the cycle-time comparison: two
  bars on one baseline grow from zero when they come into view, the old process at full length and the AI workflow at
  what is left of it. Everything else uses the shared Reveal entrance.
*/

// One icon per benefit, in IMPACT.benefits order. ChartColumn is lucide's current name for the BarChart3 glyph.
const BENEFIT_ICONS: LucideIcon[] = [Zap, Timer, ChartColumn, TrendingUp];

// The brief names these two bar labels; site.ts has no line for them.
const BEFORE_LABEL = "Vorher";
const AFTER_LABEL = "Mit KI";

// The metric is a reduction (-84%), so the AI bar keeps what is left of the old cycle time (16%). It is drawn from
// the metric itself, so the bars stay honest if the figure ever changes.
const reduction = Number.parseFloat(IMPACT.live.metric.replace(/[^\d.,]/g, "").replace(",", "."));
const remaining = Number.isFinite(reduction) ? Math.min(100, Math.max(0, 100 - reduction)) : null;

export function ImpactSection({ id = "impact" }: { id?: string }) {
  return (
    <Section id={id}>
      <Container>
        <Reveal>
          <Heading title={IMPACT.title} accent={IMPACT.accent} className="max-w-[820px]" />
          <p className="t-lead mt-6 max-w-[620px]">{IMPACT.text}</p>
        </Reveal>

        {/* Principles: hairlines between them, horizontal on a phone, vertical from tablet up. */}
        <RevealGroup as="ul" className="mt-14 grid md:mt-20 md:grid-cols-3">
          {IMPACT.principles.map((principle) => (
            <RevealItem
              as="li"
              key={principle.title}
              className="border-white/10 py-5 not-first:border-t first:pt-0 last:pb-0 md:px-6 md:py-0 md:not-first:border-t-0 md:not-first:border-l md:first:pl-0 md:last:pr-0 lg:px-10"
            >
              <h3 className="text-[22px] leading-tight font-medium tracking-[-0.02em] text-white">{principle.title}</h3>
              <p className="mt-2 text-[16px] leading-normal text-silver">{principle.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Both columns stretch to one height: the card pins its result to the bottom, the benefits spread to match. */}
        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-2 lg:gap-16">
          <Reveal className="surface flex flex-col justify-between gap-10 p-8 md:p-10">
            <div>
              <h3 className="t-h3">{IMPACT.live.title}</h3>
              <p className="t-body mt-3">{IMPACT.live.text}</p>
            </div>
            <div>
              <dl>
                <dt className="t-small">{IMPACT.live.metricLabel}</dt>
                <dd className="num mt-2 text-[72px] leading-none text-white">{IMPACT.live.metric}</dd>
              </dl>
              {remaining !== null && <CycleBars remaining={remaining} />}
            </div>
          </Reveal>

          <RevealGroup as="ul" className="grid gap-9 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:content-between lg:py-10">
            {IMPACT.benefits.map((benefit, i) => (
              <RevealItem as="li" key={benefit.title} className="flex gap-4 sm:flex-col sm:gap-5">
                <Benefit icon={BENEFIT_ICONS[i]} title={benefit.title} text={benefit.text} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <div className="mt-20">
          <Reveal>
            <Heading as="h3" size="h2" title={IMPACT.goal.title} className="max-w-[820px]" />
            <p className="t-lead mt-6 max-w-[620px]">{IMPACT.goal.text}</p>
          </Reveal>

          <Reveal
            delay={0.1}
            className="surface mt-10 flex flex-col items-start gap-8 p-6 sm:p-8 md:mt-12 md:p-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16"
          >
            <div className="max-w-[640px]">
              <p className="t-h3">{IMPACT.goal.cta}</p>
              <p className="t-body mt-3">{IMPACT.goal.ctaText}</p>
            </div>
            {/* The label is SOLUTION.primary ("KI-Potenzialanalyse anfragen"). Full width on a phone so it never overflows the card. */}
            <PrimaryLink href={LINKS.analysis} className="w-full shrink-0 sm:w-auto lg:h-14 lg:px-8 lg:text-[16px]">
              {SOLUTION.primary}
            </PrimaryLink>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function Benefit({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <>
      <IconChip>
        <Icon strokeWidth={1.5} />
      </IconChip>
      {/* On a phone the chip sits left of the text and pt-2.5 centres the first title line on it; stacked from sm up. */}
      <div className="min-w-0 pt-2.5 sm:pt-0">
        <h3 className="text-[17px] leading-snug font-medium text-white">{title}</h3>
        <p className="t-small mt-1.5 text-ink/60">{text}</p>
      </div>
    </>
  );
}

/*
  The cycle time before and with the AI workflow, as two bars on one baseline (the label column is shared, so both
  start at the same x). The text reads the values to screen readers; the bars themselves are hidden from them.
*/
function CycleBars({ remaining }: { remaining: number }) {
  const ref = useRef<HTMLDListElement>(null);
  const shown = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  const bars = [
    { label: BEFORE_LABEL, value: 100, fill: "bg-white/15", delay: "delay-200" },
    { label: AFTER_LABEL, value: remaining, fill: "bg-gradient-to-r from-sky to-royal-bright", delay: "delay-350" },
  ];

  return (
    <dl ref={ref} className="mt-8 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
      {bars.map((bar) => (
        <Fragment key={bar.label}>
          <dt className="t-small">{bar.label}</dt>
          <dd>
            <span className="sr-only">{bar.value} %</span>
            <span
              aria-hidden
              style={{ width: `${bar.value}%` }}
              className={cn(
                "block h-2.5 origin-left rounded-full transition-[scale] duration-900 ease-out-expo",
                bar.fill,
                bar.delay,
                !shown && "motion-safe:scale-x-0"
              )}
            />
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}
