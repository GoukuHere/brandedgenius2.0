"use client";

import { useMotionValueEvent } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import { Container, Section } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { POTENZIAL } from "@/content/pages/leistungen";
import { keepCompounds, useReducedMotion } from "./shared";

/*
  Das Potenzial: his statement, very large and centred. Its words light up from dim to full one after another while
  the statement scrolls up through the screen (scroll-linked, nothing is held), and his blue phrase fills with its
  white-to-sky colour last, the way every heading's phrase does on this site. Then his paragraph, and his four benefits
  arriving one by one as a calm row on one thin line (no cards, no icons).

  The scroll writes one number (--p, 0 to 1) on the heading; CSS turns it into each word's light (leistungen.css,
  "Potenzial"). Without script or with reduced motion the statement stands fully lit.
*/

const WORDS = POTENZIAL.title.split(" ");
/** The accent phrase takes two words' worth of the scroll to fill. */
const UNITS = WORDS.length + 2;

export function PotenzialSection() {
  const statement = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  // From the statement's top at 92% of the screen until its foot passes 46%.
  const progress = useSectionProgress(statement, ["start 0.92", "end 0.46"]);

  const paint = (value: number) => statement.current?.style.setProperty("--p", reduced ? "1" : value.toFixed(4));
  useMotionValueEvent(progress, "change", paint);
  useEffect(() => {
    statement.current?.style.setProperty("--p", reduced ? "1" : progress.get().toFixed(4));
  }, [reduced, progress]);

  return (
    <Section id="potenzial">
      <Container>
        <h2 ref={statement} className="ls-statement ls-lit mx-auto max-w-[1180px] text-center" style={{ "--u": UNITS } as CSSProperties}>
          {WORDS.map((word, i) => (
            <span key={`${word}-${i}`}>
              <span className="ls-lit-word" style={{ "--i": i } as CSSProperties}>
                {word.includes("-") ? <span className="whitespace-nowrap">{word}</span> : word}
              </span>{" "}
            </span>
          ))}
          <span className="accent ls-lit-accent" style={{ "--i": WORDS.length } as CSSProperties}>
            {keepCompounds(POTENZIAL.accent)}
          </span>
        </h2>

        <p data-reveal="up" className="t-lead mx-auto mt-8 max-w-[700px] text-center md:mt-10">
          {POTENZIAL.text}
        </p>

        {/* The row: one hairline drawn left to right, the four benefits rising onto it one after another. */}
        <div className="relative mt-16 md:mt-24">
          <span aria-hidden data-reveal="rule" className="ls-benefit-rule absolute inset-x-0 top-0 hidden h-px md:block" />
          <ul role="list" data-reveal-group className="ls-benefits grid gap-y-9 md:grid-cols-4 md:gap-x-10 lg:gap-x-14">
            {POTENZIAL.benefits.map((benefit) => (
              <li key={benefit.title} className="relative pt-6 md:pt-8">
                <span aria-hidden className="ls-benefit-mark" />
                <h3 className="text-[19px] leading-[1.3] font-medium tracking-[-0.01em] text-balance text-white md:text-[20px]">{benefit.title}</h3>
                <p className="mt-2.5 max-w-[340px] text-[15px] leading-[1.6] text-white/62">{benefit.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
