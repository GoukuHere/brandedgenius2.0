"use client";

import { motion, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { Container, Heading, PrimaryLink, SecondaryLink, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { LINKS, SOLUTION } from "@/content/site";

/*
  Lösung, as on the original: a split. The left column holds the photo of Roman at the desk and, below it (never on
  it), the two short cards as text blocks. The right column holds the heading, the text, the three pillars as
  full-width editorial rows and the two actions. No glass.

  The pillars are the section's one movement, tied to the scroll and reversible: as a row reaches 60% of the viewport
  height its hairline draws from left to right and its word rises from 35% to full opacity. Reduced motion shows every
  row complete (CSS only, so the server markup never changes).

  Phones read in document order: heading and text, the photo and its cards, then the pillars and the actions. On lg
  the photo column sits on the left across both rows and stays in view while the pillars scroll (only when the
  viewport is tall enough to hold it).
*/

const pad = (i: number) => String(i + 1).padStart(2, "0");

// A no-break space before each dot keeps the dot on its item's line when the list wraps.
const NBSP = String.fromCharCode(0xa0);
const joined = (items: readonly string[]) => items.join(`${NBSP}· `);

function PillarRow({ index, title, items }: { index: number; title: string; items: readonly string[] }) {
  const row = useRef<HTMLLIElement>(null);
  // 0 as the row's top edge enters the lower screen, 1 when it reaches 60% of the viewport height.
  const progress = useSectionProgress(row, ["start 0.95", "start 0.6"]);
  const wordOpacity = useTransform(progress, [0, 1], [0.35, 1]);

  return (
    <li ref={row} className="relative pt-7 pb-9 md:pt-8 md:pb-10">
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="rule absolute inset-x-0 top-0 origin-left motion-reduce:!transform-none"
      />
      {/*
        Phones and the narrower lg column: the number and the word on one baseline, the items under the word.
        Wider single-column layouts (sm to lg) and xl: a ledger, with the items beside the word on the same baseline.
      */}
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-4 sm:grid-cols-[2.75rem_13rem_minmax(0,1fr)] sm:gap-x-5 lg:grid-cols-[2.75rem_minmax(0,1fr)] lg:gap-x-4 xl:grid-cols-[2.75rem_13rem_minmax(0,1fr)] xl:gap-x-5">
        <span aria-hidden className="text-[13px] font-medium text-silver tabular-nums">
          {pad(index)}
        </span>
        <motion.h3
          style={{ opacity: wordOpacity }}
          className="text-[44px] leading-[1.05] font-medium tracking-[-0.03em] text-white motion-reduce:!opacity-100"
        >
          {title}
        </motion.h3>
        <p className="col-start-2 mt-3 text-[17px] leading-relaxed text-silver sm:col-start-3 sm:mt-0 lg:col-start-2 lg:mt-3 xl:col-start-3 xl:mt-0">
          {joined(items)}
        </p>
      </div>
    </li>
  );
}

export function SolutionSection() {
  return (
    <Section id="loesung">
      <Container>
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 xl:gap-x-24">
          <Reveal className="lg:col-start-2 lg:row-start-1">
            <Heading title={SOLUTION.title} accent={SOLUTION.accent} className="max-w-[640px]" />
            <p className="t-lead mt-6 max-w-[560px]">{SOLUTION.text}</p>
          </Reveal>

          <div className="mt-12 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-start lg:[@media(min-height:760px)]:sticky lg:[@media(min-height:760px)]:top-28">
            <Reveal>
              <div className="frame">
                <Image
                  src={SOLUTION.img}
                  alt={SOLUTION.imgAlt}
                  width={1600}
                  height={1196}
                  sizes="(min-width:1024px) 520px, 100vw"
                  className="block h-auto w-full"
                />
              </div>

              <ol role="list" className="mt-8 grid grid-cols-2 gap-x-6 sm:gap-x-8">
                {SOLUTION.cards.map((card, i) => (
                  <li key={card.title}>
                    <div aria-hidden className="rule" />
                    <h3 className="mt-5 text-[17px] leading-snug font-medium text-white">
                      <span aria-hidden className="mr-2.5 text-[13px] text-silver tabular-nums">
                        {pad(i)}
                      </span>
                      {card.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-silver">{joined(card.items)}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          <div className="mt-14 lg:col-start-2 lg:row-start-2 lg:mt-14">
            <ol role="list">
              {SOLUTION.pillars.map((pillar, i) => (
                <PillarRow key={pillar.title} index={i} title={pillar.title} items={pillar.items} />
              ))}
            </ol>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-12">
              {/* The original opens the hosted contact form here and the booking widget from the second button. */}
              <PrimaryLink href={LINKS.contact}>{SOLUTION.primary}</PrimaryLink>
              <SecondaryLink href={LINKS.booking}>{SOLUTION.secondary}</SecondaryLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
