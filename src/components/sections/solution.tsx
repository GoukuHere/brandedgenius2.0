"use client";

import { motion, useTransform } from "motion/react";
import Image from "next/image";
import { Fragment, useRef } from "react";
import { Container, Heading, PrimaryLink, SecondaryLink, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { Tilt } from "@/components/ui/tilt";
import { LINKS, SOLUTION } from "@/content/site";

/*
  Lösung (v4). A split: on the left the photo of Roman at his desk, large, turning gently towards the pointer
  (Motion Primitives Tilt), with the two short cards as small glass plates directly under it (never on it); on the
  right the heading with its continuation set in outline, the text and both actions. Below, across the full width,
  the three pillars as one row of three wide columns, each numbered by a huge outlined figure that stands behind
  its word, with hairlines between the columns.

  The pillars are the section's one movement, tied to the scroll and reversible: as a column crosses the screen its
  outlined number draws itself (SVG stroke-dashoffset), its word slides up 20px into place and the hairline before
  it grows. The columns start one after another, left to right. Reduced motion shows every column complete and
  stops the tilt (CSS only, so the server markup never changes); touch screens get no tilt either.

  Reading order: heading, text and actions first, then the photo and the plates, then the pillars. On phones the
  photo and the plates are shown above the heading (CSS order; they hold nothing focusable).
*/

const pad = (i: number) => String(i + 1).padStart(2, "0");

// A no-break space before each dot keeps the dot on its item's line when the list wraps.
const NBSP = String.fromCharCode(0xa0);

/** Items joined with dots for the eye; screen readers hear a comma between them instead of the dot. */
function Joined({ items }: { items: readonly string[] }) {
  return items.map((item, i) => (
    <Fragment key={item}>
      {i > 0 && (
        <>
          <span className="sr-only">,</span>
          <span aria-hidden>{`${NBSP}·`}</span>{" "}
        </>
      )}
      {item}
    </Fragment>
  ));
}

/*
  The pillar numbers are SVG text, so their stroke can be drawn. The figure is set at a font size of 100 in a
  102 x 72 box (baseline at 0) that CSS scales to the number size, so 1em of CSS font size on the svg equals the
  figure's font size. The text is nudged 3 units left to line the figure's left edge up with the word in front.
*/
const NUM_BOX = "0 -70 102 72";

// Longest outline of each digit 0-9 in General Sans Light at a font size of 100, measured from the font file. The
// dash has to be at least that long, or the stroke would stay open at the end.
const DIGIT_OUTLINE = [189, 172, 306, 343, 205, 355, 210, 233, 217, 210];
const dashFor = (num: string) => Math.ceil(Math.max(...num.split("").map((d) => DIGIT_OUTLINE[Number(d)] ?? 360)) * 1.06);

// Each column draws while its top edge travels from 92% to 56% of the viewport height. Every next column starts
// 8% later, so on md and up, where the three share a top edge, they follow each other from left to right.
const STAGGER = 0.08;

function Pillar({ index, title, items }: { index: number; title: string; items: readonly string[] }) {
  const ref = useRef<HTMLLIElement>(null);
  const shift = index * STAGGER;
  const progress = useSectionProgress(ref, [
    [0, 0.92 - shift],
    [0, 0.56 - shift],
  ]);

  const num = pad(index);
  const dash = dashFor(num);
  const dashOffset = useTransform(progress, [0, 0.8], [dash, 0]);
  const wordY = useTransform(progress, [0.3, 1], [20, 0]);
  const wordOpacity = useTransform(progress, [0.3, 0.75], [0, 1]);
  const grow = useTransform(progress, [0, 0.6], [0, 1]);

  return (
    <li ref={ref} className="relative py-10 first:pt-0 last:pb-0 md:py-0">
      {index > 0 && (
        <>
          {/* Phones: a hairline above the column. md and up: a vertical hairline centred in the gap before it. */}
          <motion.span
            aria-hidden
            style={{ scaleX: grow }}
            className="rule absolute inset-x-0 top-0 origin-left md:hidden motion-reduce:!transform-none"
          />
          <motion.span
            aria-hidden
            style={{ scaleY: grow }}
            className="absolute inset-y-0 hidden w-px origin-top bg-white/10 md:-left-4 md:block lg:-left-8 xl:-left-12 motion-reduce:!transform-none"
          />
        </>
      )}

      {/* The number and the word share one cell: the outlined figure behind, the word in front on its baseline. */}
      <div className="grid">
        <svg
          aria-hidden
          viewBox={NUM_BOX}
          overflow="visible"
          className="col-start-1 row-start-1 h-[0.72em] w-[1.02em] text-[96px] md:text-[112px] lg:text-[140px]"
        >
          <motion.text
            x={-3}
            y={0}
            fontSize={100}
            fontWeight={300}
            letterSpacing={-4}
            fill="none"
            strokeWidth={0.9}
            strokeDasharray={dash}
            style={{ strokeDashoffset: dashOffset }}
            className="stroke-sky/55 motion-reduce:[stroke-dasharray:none]"
          >
            {num}
          </motion.text>
        </svg>
        <motion.h3
          style={{ y: wordY, opacity: wordOpacity }}
          className="col-start-1 row-start-1 self-end text-[36px] leading-none font-medium tracking-[-0.025em] text-white md:text-[40px] motion-reduce:!transform-none motion-reduce:!opacity-100"
        >
          {title}
        </motion.h3>
      </div>

      <ul role="list" className="mt-6 flex flex-col gap-2.5 md:mt-7">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[16px] leading-6 text-silver">
            <span aria-hidden className="flex h-6 shrink-0 items-center">
              <span className="size-[5px] rounded-full bg-sky" />
            </span>
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function SolutionSection() {
  return (
    <Section id="loesung">
      <Container>
        <div className="grid gap-y-12 lg:grid-cols-2 lg:items-center lg:gap-x-16 xl:gap-x-20">
          <Reveal className="lg:col-start-2 lg:row-start-1">
            <Heading
              title={SOLUTION.title}
              accent={SOLUTION.accent}
              className="max-w-[600px] text-[36px] sm:text-[44px] lg:text-[48px] xl:text-[50px]"
            />
            <p className="t-lead mt-6 max-w-[520px]">{SOLUTION.text}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {/* The original opens the hosted contact form here and the booking widget from the second button. */}
              <PrimaryLink href={LINKS.contact}>{SOLUTION.primary}</PrimaryLink>
              <SecondaryLink href={LINKS.booking}>{SOLUTION.secondary}</SecondaryLink>
            </div>
          </Reveal>

          <Reveal className="order-first lg:order-none lg:col-start-1 lg:row-start-1">
            <Tilt
              rotationFactor={5}
              springOptions={{ stiffness: 150, damping: 22, mass: 0.6 }}
              className="motion-reduce:!transform-none [@media(hover:none)]:!transform-none"
            >
              <div className="frame aspect-[4/3] bg-deep">
                <Image src={SOLUTION.img} alt={SOLUTION.imgAlt} fill sizes="(min-width:1024px) 600px, 100vw" className="object-cover" />
              </div>
            </Tilt>

            {/* The two cards from the original, under the photo. Side by side once there are 400px for them. */}
            <div className="@container mt-4">
              <ol role="list" className="grid gap-3 @min-[400px]:grid-cols-2">
                {SOLUTION.cards.map((card, i) => (
                  <li key={card.title} className="glass rounded-panel p-5">
                    <p className="text-[16px] leading-snug font-medium text-white">
                      <span aria-hidden className="mr-2 text-[13px] font-normal text-sky">
                        {pad(i)}
                      </span>
                      {card.title}
                    </p>
                    <p className="t-small mt-2">
                      <Joined items={card.items} />
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>

        <ol role="list" className="mt-20 grid md:mt-28 md:grid-cols-3 md:gap-x-8 lg:mt-32 lg:gap-x-16 xl:gap-x-24">
          {SOLUTION.pillars.map((pillar, i) => (
            <Pillar key={pillar.title} index={i} title={pillar.title} items={pillar.items} />
          ))}
        </ol>
      </Container>
    </Section>
  );
}
