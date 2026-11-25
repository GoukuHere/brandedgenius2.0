"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { useCopy } from "@/i18n/client";
import { Tile } from "./bento";
import { CountUp } from "./count";

/*
  v11 Business Impact as a bento (the developer: "avoid sections with too much text and use some cool layout"). One
  idea per tile, little text:
  - the worked example as the big featured tile: its title, the −84% and the bar. When the tile comes into view the
    figure counts up from zero while the bar fills to it, on the same curve (the developer: "add loader animated on
    number text from zero"); no scroll link. A slow border light runs round the tile;
  - the three principles in one tile beside it, each with its animated icon ("Datenbasiert, statt Bauchgefühl");
  - the four benefits as tiles that each carry an animated icon and the title only (their sentences stay in the page
    for screen readers);
  - the goal as one wide tile whose sentence opens the booking.
  The seven icons play as one group (icon-well.tsx): in turn while the bento is on screen, at once on hover.
  Phones: the tiles stack in the same order, the benefits two by two.

  Round 4 (the client's Loom of 2026-11-12, video 2 at 0:00 to 0:41): "the icons look amazing, you know, but it's too
  much icons ... we need to redesign it maybe with pictures ... a good mix-up with picture, icons, video clip, text".
  The section is now led by its numbers and has no icons left:
  - the heading splits, the lead on its right (the page no longer stacks every heading on the left);
  - the worked example plays a short silent clip of a live dashboard behind its −84% (Pexels 36435736) under a navy
    grade, so the figure and its bar still read first;
  - the three principles are type alone: the word large, its "statt ..." quiet beside it, on hairlines;
  - the four benefits are photos (real Pexels photos, /media/v11/impact), each with its title on a dark foot;
  - the goal tile stays as it was (the client: fine).

  Round 5 (DE/EN): copy by language (useCopy); each benefit's photo is keyed by its id, never by its title.
*/

/* Round 5 (the client's Loom: a fitting picture for every heading): each tile has a picture generated for its title
   (Figma AI, Gemini image model, 928x1152, the tile's own shape), the subject centred.
   Round 6 (the client's Loom of 2026-11-24: "the report is empty", "a woman holding a laptop, makes no sense",
   "looks like cheap stock pictures"): all four made again with GPT Image 2.5 (Figma AI, 1024x1280), each screen
   showing its benefit in German (tasks done on their own and the hours saved, answers within seconds, a full
   management dashboard, orders rising while the team stays the same); the lower third stays dark for the title. */
const BENEFIT_PHOTOS: Record<string, { src: string; position?: string }> = {
  effizienz: { src: "/media/v11/impact/r6-effizienz.webp" },
  reaktionszeit: { src: "/media/v11/impact/r6-reaktionszeit.webp" },
  reporting: { src: "/media/v11/impact/r6-reporting.webp" },
  skalierbarkeit: { src: "/media/v11/impact/r6-skalierbarkeit.webp" },
};
const EASE = [0.16, 1, 0.3, 1] as const;
const FILL = { duration: 1.4, delay: 0.2 };

/** The bar is drawn to the figure itself ("−84%" draws to 84%), so it stays honest if the figure ever changes. */
function shareOf(metric: string) {
  const parsed = Number.parseFloat(metric.replace(/[^\d.,]/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : null;
}

export function ImpactSection() {
  const { IMPACT, LINKS } = useCopy().site;
  const SHARE = shareOf(IMPACT.live.metric);
  const metric = useRef<HTMLDivElement>(null);
  const seen = useInView(metric, { once: true, margin: "0px 0px -15% 0px" });

  return (
    <Section id="impact">
      <Container>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end lg:gap-x-16">
          <Heading title={IMPACT.title} accent={IMPACT.accent} className="max-w-[760px]" />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[520px] lg:mt-0">
            {IMPACT.text}
          </p>
        </div>

        <div data-reveal-group className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:mt-16 lg:grid-cols-12">
          {/*
            The worked example, over a dashboard. Round 5 (the client's Loom of 2026-11-18: "take a normal picture so
            we are not to have too many videos ... the speed will be better"): a still picture in place of the clip,
            made for this card (a sales manager over his ranked leads, the phone ready; he sits right, where the
            grade lets the picture through).
          */}
          <Tile featured className="col-span-2 min-h-[380px] lg:col-span-7 lg:row-span-2" layout="relative flex h-full flex-col justify-between gap-12 overflow-hidden rounded-[24px] p-7 sm:p-9 lg:p-10">
            <Image src="/media/v11/impact/r5-leads.webp" alt="" fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover opacity-60" />
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgb(7_22_52/0.94)_0%,rgb(7_22_52/0.72)_55%,rgb(7_22_52/0.35)_100%),linear-gradient(0deg,rgb(7_22_52/0.85)_0%,rgb(7_22_52/0)_55%)]" />
            <div className="relative">
              <h3 className="t-h3">{IMPACT.live.title}</h3>
              <p className="mt-3 max-w-[420px] text-[16px] leading-relaxed text-white/70">{IMPACT.live.text}</p>
            </div>
            <div ref={metric} className="relative">
              <p className="num text-[clamp(64px,9vw,104px)] leading-none text-white">
                <CountUp value={IMPACT.live.metric} play={seen} duration={FILL.duration} delay={FILL.delay} />
              </p>
              <p className="mt-3 text-[16px] leading-normal text-white/65">{IMPACT.live.metricLabel}</p>
              {SHARE !== null && <Bar share={SHARE} seen={seen} />}
            </div>
          </Tile>

          {/* The three principles: type alone. */}
          <Tile className="col-span-2 lg:col-span-5 lg:row-span-2" layout="flex h-full flex-col justify-center px-6 py-4 sm:px-8 sm:py-6">
            <ul role="list" className="divide-y divide-white/10">
              {IMPACT.principles.map((principle) => (
                <li key={principle.title} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-5 sm:py-6">
                  <h3 className="text-[24px] leading-tight font-medium tracking-[-0.02em] text-white sm:text-[30px]">{principle.title}</h3>
                  <p className="text-[15px] leading-snug text-white/55 sm:text-[16px]">{principle.text}</p>
                </li>
              ))}
            </ul>
          </Tile>

          {/* The four benefits: a photo each, the title on its dark foot. */}
          {IMPACT.benefits.map((benefit) => {
            const photo = BENEFIT_PHOTOS[benefit.id];
            return (
              <Tile key={benefit.id} className="col-span-1 aspect-[4/5] lg:col-span-3 lg:aspect-[4/4.4]" layout="relative h-full overflow-hidden rounded-[24px]">
                {photo && (
                  <Image
                    src={photo.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                    style={{ objectPosition: photo.position ?? "50% 50%" }}
                  />
                )}
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(6_18_44/0)_40%,rgb(6_18_44/0.9)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="text-[16px] leading-snug font-medium tracking-[-0.01em] text-balance text-white sm:text-[20px]">{benefit.title}</h3>
                  <p className="sr-only">{benefit.text}</p>
                </div>
              </Tile>
            );
          })}

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

/* The original's performance bar: a 3px track, a sky fill with a brighter tip; it fills once, with the figure. */
function Bar({ share, seen }: { share: number; seen: boolean }) {
  return (
    <div aria-hidden className="relative mt-8 h-[3px] rounded-full bg-white/12">
      <div className="absolute inset-y-0 left-0 overflow-hidden rounded-full" style={{ width: `${share}%` }}>
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: seen ? "0%" : "-100%" }}
          transition={{ duration: FILL.duration, ease: EASE, delay: FILL.delay }}
          className="absolute inset-0 rounded-full bg-sky motion-reduce:!transform-none"
        >
          <span className="absolute inset-y-0 right-0 w-10 rounded-full bg-linear-to-r from-sky to-ice" />
        </motion.div>
      </div>
    </div>
  );
}
