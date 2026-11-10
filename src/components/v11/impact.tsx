"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { IMPACT, LINKS } from "@/content/site";
import { Icon3D, Tile } from "./bento";

/*
  v11 Business Impact as a bento (the developer: "avoid sections with too much text and use some cool layout"). One
  idea per tile, little text:
  - the worked example as the big featured tile: its title, the −84% and the bar, which fills once when the tile
    comes into view (no scroll link), with a slow border light round it;
  - the three principles in one tile beside it, each with its 3D icon ("Datenbasiert, statt Bauchgefühl");
  - the four benefits as tiles that each carry a large 3D icon and the title only (their sentences stay in the
    page for screen readers);
  - the goal as one wide tile whose sentence opens the booking.
  Phones: the tiles stack in the same order, the benefits two by two.
*/

const PRINCIPLE_ICONS = ["database", "workflow", "gauge"];
const BENEFIT_ICONS = ["zap", "timer", "chart-column", "trending-up"];
const EASE = [0.16, 1, 0.3, 1] as const;

// The bar is drawn to the figure itself ("−84%" draws to 84%), so it stays honest if the figure ever changes.
const parsed = Number.parseFloat(IMPACT.live.metric.replace(/[^\d.,]/g, "").replace(",", "."));
const SHARE = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : null;

export function ImpactSection() {
  return (
    <Section id="impact">
      <Container>
        <div className="max-w-[760px]">
          <Heading title={IMPACT.title} accent={IMPACT.accent} />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[560px]">
            {IMPACT.text}
          </p>
        </div>

        <div data-reveal-group className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:mt-16 lg:grid-cols-12">
          {/* The worked example. */}
          <Tile featured className="col-span-2 min-h-[340px] lg:col-span-7 lg:row-span-2" layout="flex flex-col justify-between gap-12 p-7 sm:p-9 lg:p-10">
            <div>
              <h3 className="t-h3">{IMPACT.live.title}</h3>
              <p className="mt-3 max-w-[420px] text-[16px] leading-relaxed text-white/70">{IMPACT.live.text}</p>
            </div>
            <div>
              <p className="num text-[clamp(64px,9vw,104px)] leading-none text-white">{IMPACT.live.metric}</p>
              <p className="mt-3 text-[16px] leading-normal text-white/65">{IMPACT.live.metricLabel}</p>
              {SHARE !== null && <Bar share={SHARE} />}
            </div>
          </Tile>

          {/* The three principles. */}
          <Tile className="col-span-2 lg:col-span-5 lg:row-span-2" layout="p-6 sm:p-8">
            <ul role="list" className="flex h-full flex-col justify-between gap-6">
              {IMPACT.principles.map((principle, i) => (
                <li key={principle.title} className="flex items-center gap-5">
                  <Icon3D name={PRINCIPLE_ICONS[i]} size={64} />
                  <div className="min-w-0">
                    <h3 className="text-[20px] leading-tight font-medium tracking-[-0.01em] text-white">{principle.title}</h3>
                    <p className="mt-1 text-[15px] leading-snug text-white/60">{principle.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Tile>

          {/* The four benefits: a 3D icon and the title. */}
          {IMPACT.benefits.map((benefit, i) => (
            <Tile key={benefit.title} className="col-span-1 min-h-[200px] sm:min-h-[230px] lg:col-span-3" layout="flex flex-col justify-between gap-8 p-5 sm:p-7">
              <Icon3D name={BENEFIT_ICONS[i]} size={84} className="-mt-1 -ml-1 size-[64px] sm:size-[84px]" />
              <div>
                <h3 className="text-[18px] leading-snug font-medium tracking-[-0.01em] text-balance text-white sm:text-[20px]">{benefit.title}</h3>
                <p className="sr-only">{benefit.text}</p>
              </div>
            </Tile>
          ))}

          {/* The goal: one wide tile, its sentence opens the booking. */}
          <Tile className="col-span-2 lg:col-span-12">
            <a
              href={LINKS.booking}
              target="_blank"
              rel="noopener"
              className="group flex flex-col gap-8 p-7 sm:p-9 md:flex-row md:items-end md:justify-between lg:p-10"
            >
              <div className="max-w-[720px]">
                <h3 className="t-h2">
                  {IMPACT.goal.title} <span className="accent">{IMPACT.goal.accent}</span>
                </h3>
                <p className="mt-4 text-[17px] leading-relaxed text-white/75">{IMPACT.goal.cta}</p>
              </div>
              <span
                aria-hidden
                className="grid size-14 shrink-0 place-items-center rounded-button border border-white/20 text-white transition-[background-color,border-color] duration-200 ease-out group-hover:border-sky/70 group-hover:bg-[#0857bd] group-focus-visible:border-sky/70 group-focus-visible:bg-[#0857bd]"
              >
                <ArrowUpRight strokeWidth={1.75} className="size-6 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          </Tile>
        </div>
      </Container>
    </Section>
  );
}

/* The original's performance bar: a 3px track, a sky fill with a brighter tip; it fills once when it comes into view. */
function Bar({ share }: { share: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  return (
    <div ref={ref} aria-hidden className="relative mt-8 h-[3px] rounded-full bg-white/12">
      <div className="absolute inset-y-0 left-0 overflow-hidden rounded-full" style={{ width: `${share}%` }}>
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: seen ? "0%" : "-100%" }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
          className="absolute inset-0 rounded-full bg-sky motion-reduce:!transform-none"
        >
          <span className="absolute inset-y-0 right-0 w-10 rounded-full bg-linear-to-r from-sky to-ice" />
        </motion.div>
      </div>
    </div>
  );
}
