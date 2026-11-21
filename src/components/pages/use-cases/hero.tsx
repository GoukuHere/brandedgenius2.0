"use client";

import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import { Container, Heading, PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import type { ProjectSlug } from "@/content/pages/use-cases";
import { useCopy } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { useLive } from "./use-live";

/*
  Hero (2026-11-16). His headline, centred and clear of the header, his lead (the sentence that introduces the
  projects) and his two buttons. Behind and around it his seven project names in very large outlined type, on three
  depths: far (small, faint), middle and near (huge). Each drifts slowly sideways on its own clock, and as the page
  scrolls the names part: those above the headline rise, those below sink, the sides move outwards, the near ones
  most. They fade at the screen's edges and around the text, so the first screen says "real projects" without a card.

  Phones: four names, smaller. Reduced motion: the names stand still in their places (no drift, no parting).
  Round 5 (DE/EN): copy by language.
*/

type Name = {
  slug: ProjectSlug;
  /** 1 far, 2 middle, 3 near. */
  layer: 1 | 2 | 3;
  /** Centre on tablets and desktop, in % of the hero. */
  d: [number, number];
  /** Centre on phones; without it the name is left out there. */
  p?: [number, number];
  /** Parting: -1 rises, 1 sinks, 0 stays level; side: -1 moves left, 1 right. */
  up: -1 | 0 | 1;
  side: -1 | 1;
  /** The slow drift: its reach (px) and its period (s). */
  reach: number;
  period: number;
};

/*
  The composition (desktop): one near name in the band above the headline and one below it, at opposite corners and
  bleeding off the screen; a middle-depth name on each side; the far names in the gaps. Nothing crosses the text.
*/
const NAMES: Name[] = [
  { slug: "cryptotransfer", layer: 3, d: [80, 19], p: [62, 19], up: -1, side: 1, reach: 26, period: 36 },
  { slug: "mega-screen", layer: 3, d: [25, 86], p: [36, 85], up: 1, side: -1, reach: 30, period: 42 },
  { slug: "wrapwerk", layer: 1, d: [16, 14], up: -1, side: -1, reach: 18, period: 31 },
  { slug: "elysium", layer: 2, d: [-2, 52], up: 0, side: -1, reach: 20, period: 33 },
  { slug: "km-electronics", layer: 2, d: [81, 79], p: [70, 95], up: 1, side: 1, reach: 20, period: 29 },
  { slug: "ledbow", layer: 1, d: [97, 47], up: 0, side: 1, reach: 16, period: 27 },
  { slug: "martin-wildt", layer: 1, d: [54, 97], up: 1, side: 1, reach: 14, period: 25 },
];

/** How far each depth travels while the hero scrolls away (px). */
const RISE = { 1: 70, 2: 160, 3: 260 } as const;
const SPREAD = { 1: 40, 2: 60, 3: 90 } as const;

export function UseCasesHero() {
  const copy = useCopy();
  const { UC_HERO, UC_ITEMS } = copy.useCases;
  const { LINKS } = copy.site;
  const nameOf = (slug: ProjectSlug) => UC_ITEMS.find((item) => item.slug === slug)?.short ?? "";
  const hero = useRef<HTMLElement>(null);
  useLive(hero, "0px");
  // 0 while the hero fills the screen, 1 once it has scrolled away.
  const progress = useSectionProgress(hero, ["start start", "end start"]);
  // Parting only where motion is allowed (set after mount, so the server markup is the still picture).
  const live = useMotionValue(0);
  const part = useTransform(() => live.get() * progress.get());

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => live.set(query.matches ? 0 : 1);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [live]);

  return (
    <section
      id="hero"
      ref={hero}
      className="uc-hero uc-live relative isolate flex min-h-[680px] items-center overflow-hidden pt-[76px] pb-12 md:min-h-[780px] md:pt-[84px] lg:min-h-[860px]"
    >
      <div aria-hidden className="uc-names">
        {NAMES.map((name, i) => (
          <DriftingName key={name.slug} name={name} label={nameOf(name.slug)} index={i} part={part} />
        ))}
      </div>

      <Container className="relative z-10">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center text-center">
          <Heading as="h1" size="display" title={UC_HERO.title} accent={UC_HERO.accent} className="uc-hero-title" />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[620px] md:mt-7">
            {UC_HERO.lead}
          </p>
          <div data-reveal="up" data-rd="3" className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center md:mt-10">
            <PrimaryLink href={LINKS.contact}>{UC_HERO.primary}</PrimaryLink>
            <SecondaryLink href="#projekte">{UC_HERO.secondary}</SecondaryLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

function DriftingName({ name, label, index, part }: { name: Name; label: string; index: number; part: MotionValue<number> }) {
  const x = useTransform(() => part.get() * name.side * SPREAD[name.layer]);
  const y = useTransform(() => part.get() * name.up * RISE[name.layer]);
  const opacity = useTransform(() => 1 - part.get() * 0.6);
  const place = {
    "--dx": `${name.d[0]}%`,
    "--dy": `${name.d[1]}%`,
    "--px": `${(name.p ?? name.d)[0]}%`,
    "--py": `${(name.p ?? name.d)[1]}%`,
    "--reach": `${name.reach}px`,
    "--period": `${name.period}s`,
    // Each name starts its drift at a different point of its swing.
    "--phase": `${-((index * 7) % name.period)}s`,
    "--in": `${0.15 + (3 - name.layer) * 0.18 + index * 0.06}s`,
  } as CSSProperties;
  return (
    <div className={cn("uc-name-slot", !name.p && "max-md:hidden")} style={place}>
      <motion.div style={{ x, y, opacity }} className="will-change-transform">
        <span className="uc-name" data-layer={name.layer}>
          {label}
        </span>
      </motion.div>
    </div>
  );
}
