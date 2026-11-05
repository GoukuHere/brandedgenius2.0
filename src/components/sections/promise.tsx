"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { Fragment, useRef } from "react";
import { Container, Section } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { PROMISE } from "@/content/site";

/*
  Unser Versprechen. On brandedgenius.de this is the last row of the Vorher/Nachher section, so it sits close under
  it: the statement as one sentence, then the four figures as a typographic ledger. No photo, no glass.

  Motion is scrubbed by the scroll and reverses on the way back. The statement lights up word by word (25% to full
  white) while it moves from 85% to 40% of the screen height; the figures settle left to right onto their hairlines.
  Reduced motion shows the end state through CSS (motion-reduce:), so the markup never changes.
*/

type Range = [number, number];

/* The title and its continuation read as one sentence. A no-break space keeps the dash with "schafft". */
const NO_BREAK_SPACE = String.fromCharCode(0xa0);
const WORDS = `${PROMISE.title} ${PROMISE.accent}`.split(" ").reduce<string[]>((words, word) => {
  if (word === "–" && words.length > 0) words[words.length - 1] += `${NO_BREAK_SPACE}–`;
  else words.push(word);
  return words;
}, []);

/* Each word lights over its own slice of the progress; the slices overlap so the sweep stays soft, and the last ends at 1. */
const WORD_SPAN = Math.min(1, 3 / WORDS.length);
const wordRange = (i: number): Range => {
  const start = (i / Math.max(1, WORDS.length - 1)) * (1 - WORD_SPAN);
  return [start, start + WORD_SPAN];
};

/* Figure i settles over [i * STEP, i * STEP + SPAN] of the ledger's progress, left to right. */
const STEP = 0.15;
const SPAN = 0.45;
const figureRange = (i: number): Range => [i * STEP, i * STEP + SPAN];

export function PromiseSection() {
  const statement = useRef<HTMLHeadingElement>(null);
  const ledger = useRef<HTMLUListElement>(null);
  const words = useSectionProgress(statement, ["start 0.85", "start 0.4"]);
  const figures = useSectionProgress(ledger, ["start 0.9", "end 0.6"]);

  return (
    <Section id="mehrwert" className="pt-0 md:pt-4">
      <Container>
        <h2 ref={statement} className="t-h2 max-w-[880px]">
          {WORDS.map((word, i) => (
            <Fragment key={i}>
              {i > 0 ? " " : null}
              <Word progress={words} range={wordRange(i)}>
                {word}
              </Word>
            </Fragment>
          ))}
        </h2>

        <ul ref={ledger} role="list" className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-[repeat(2,1fr)] md:mt-20 lg:grid-cols-[repeat(4,1fr)]">
          {PROMISE.figures.map((figure, i) => (
            <Figure key={figure.value} value={figure.value} label={figure.label} progress={figures} range={figureRange(i)} />
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: Range }) {
  const opacity = useTransform(progress, range, [0.25, 1]);
  return (
    <motion.span style={{ opacity }} className="motion-reduce:!opacity-100">
      {children}
    </motion.span>
  );
}

function Figure({ value, label, progress, range }: { value: string; label: string; progress: MotionValue<number>; range: Range }) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [24, 0]);

  return (
    <li>
      <div aria-hidden className="rule" />
      <motion.div style={{ opacity, y }} className="pt-6 motion-reduce:!transform-none motion-reduce:!opacity-100">
        {/*
          One line always: "3–6 Monate" is about 4.95em wide in this face. Phones (one column, 320px at a 360px
          screen): 52px = 257px. Two columns from 640px (288px each at the narrowest): 56px = 277px. Four columns
          from 1024px: the size follows the column, 48px at 1024 up to 56px from about 1310, and the 1fr tracks
          (auto minimum) let the widest figure take a few more pixels instead of overflowing.
        */}
        <p className="num text-[52px] leading-none whitespace-nowrap text-white sm:text-[56px] lg:text-[length:clamp(3rem,calc((100vw_-_136px)/21),3.5rem)]">
          {value}
        </p>
        <p className="t-small mt-3 max-w-[16rem] text-pretty">{label}</p>
      </motion.div>
    </li>
  );
}
