"use client";

import { Check, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { TextMorph } from "@/components/ui/text-morph";
import { COMPARE } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Vorher / Nachher, "Rewritten". The developer found the v4 slider cheap and chose this: the classic way is rewritten,
  line by line, into the Branded Genius way as the reader scrolls.

  One glass panel holds five large lines and the result line, all in the classic way at first (silver, a bare X).
  As each line passes the reading line (about 60% down the screen) it morphs into its Branded Genius counterpart:
  the letters the two sentences share glide to their new places and the others fade out and in, in a light
  left-to-right wave (Text Morph, after Motion Primitives). The text turns white, the X spins away, a sky check
  lands with one ring pulse, a faint band of sky light passes once across the row, and a sky line draws under it.
  The result line turns last. Scrolling back rewrites
  it all back, in reverse order.

  Above the lines, the two titles sit at either end of a track with "VS" in its middle; the track fills with sky as
  the lines are rewritten, and the lit title moves from the classic way to the Branded Genius way.

  Every resting state is whole, readable text: no word is ever cut. Screen readers get both full lists in a visually
  hidden block (the animated lines are hidden from them). Reduced motion: MotionProvider turns the glides and spins
  into instant swaps; the rewrite itself still follows the scroll.
*/

type Way = typeof COMPARE.classic;

const CLASSIC: Way = COMPARE.classic;
const OURS: Way = COMPARE.ours;
const PAIRS = CLASSIC.points.map((point, i) => ({ before: point, after: OURS.points[i] }));
// The five points and the result line.
const STEPS = PAIRS.length + 1;

const EASE = [0.16, 1, 0.3, 1] as const;

// The rewrite runs while the lines cross the screen: from the list's top at 70% of the viewport to its bottom at 50%.
const OFFSET = ["start 0.7", "end 0.5"] as const;

const countAt = (p: number) => Math.min(STEPS, Math.max(0, Math.floor(p * STEPS + 0.5)));

export function CompareSection() {
  const listRef = useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(listRef, [...OFFSET]);
  // How many lines are rewritten (0 to 6).
  const [done, setDone] = useState(0);

  useMotionValueEvent(progress, "change", (p) => {
    const next = countAt(p);
    setDone((current) => (current === next ? current : next));
  });
  // A reload part-way down the page starts at the right line (read once the first frame has measured the scroll).
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDone(countAt(progress.get())));
    return () => cancelAnimationFrame(frame);
  }, [progress]);

  // The track between the titles: the left half fills over the first three lines, the right half over the rest.
  const share = done / STEPS;
  const finished = done === STEPS;

  return (
    // The Versprechen follows straight on (on the original it is the last row of this section), so the bottom
    // padding is shorter than the shared rhythm (none at all where the Versprechen pins).
    <Section id="unterschied" className="pb-12 md:pb-16 lg:[@media(min-height:720px)]:pb-0">
      <Container>
        <Reveal className="max-w-[920px]">
          <Heading title={COMPARE.title} accent={COMPARE.accent} variant="outline" />
          <p className="t-lead mt-6 max-w-[600px]">{COMPARE.text}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 md:mt-16">
          <div className="glass rounded-[32px] px-5 pt-6 pb-8 sm:px-8 md:rounded-[40px] md:px-12 md:pt-9 md:pb-12">
            {/* The two ways at the ends of a track that fills as the lines are rewritten. */}
            <div aria-hidden className="flex items-center gap-2.5 sm:gap-5">
              <span
                className={cn(
                  // Phones: the titles may wrap to two lines so the row fits; from sm they stay on one line.
                  "max-w-[36%] min-w-0 text-[13px] leading-tight text-balance transition-colors duration-500 sm:max-w-none sm:shrink-0 sm:text-[17px]",
                  finished ? "text-silver" : "text-white"
                )}
              >
                {CLASSIC.title}
              </span>
              <span className="relative h-px min-w-4 flex-1 bg-white/12">
                <motion.span
                  initial={false}
                  animate={{ scaleX: Math.min(1, share * 2) }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0 origin-left bg-sky"
                />
              </span>
              <span className={cn("shrink-0 text-[12px] font-medium transition-colors duration-500", done > 0 ? "text-sky" : "text-silver")}>
                {COMPARE.vs}
              </span>
              <span className="relative h-px min-w-4 flex-1 bg-white/12">
                <motion.span
                  initial={false}
                  animate={{ scaleX: Math.max(0, share * 2 - 1) }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0 origin-left bg-sky"
                />
              </span>
              <span
                className={cn(
                  "max-w-[36%] min-w-0 text-right text-[13px] leading-tight font-medium text-balance transition-colors duration-500 sm:max-w-none sm:shrink-0 sm:text-[17px]",
                  finished ? "text-white" : "text-silver"
                )}
              >
                {OURS.title}
              </span>
            </div>

            <div ref={listRef} aria-hidden className="mt-6 md:mt-8">
              <ol className="border-t border-white/[0.08]">
                {PAIRS.map((pair, i) => (
                  <Line key={pair.after} on={done > i} before={pair.before} after={pair.after} />
                ))}
              </ol>
              <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-x-4 pt-7 md:grid-cols-[48px_minmax(0,1fr)] md:gap-x-6 md:pt-9">
                <span />
                <TextMorph
                  className={cn(
                    "text-[18px] leading-[1.35] font-medium tracking-[-0.012em] transition-colors duration-500 md:text-[22px] lg:text-[24px]",
                    finished ? "text-white" : "text-silver"
                  )}
                >
                  {finished ? OURS.result : CLASSIC.result}
                </TextMorph>
              </div>
            </div>

            {/* What screen readers get: both ways, complete. */}
            <div className="sr-only">
              {[CLASSIC, OURS].map((way) => (
                <div key={way.title}>
                  <h3>{way.title}</h3>
                  <ul>
                    {way.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <p>{way.result}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/** One line: the classic statement, or its Branded Genius counterpart once rewritten. */
function Line({ on, before, after }: { on: boolean; before: string; after: string }) {
  return (
    <li className="relative grid grid-cols-[36px_minmax(0,1fr)] items-start gap-x-4 overflow-hidden py-5 md:grid-cols-[48px_minmax(0,1fr)] md:gap-x-6 md:py-6">
      <Mark on={on} />
      <TextMorph
        className={cn(
          "text-[22px] leading-[1.22] tracking-[-0.02em] transition-colors duration-500 sm:text-[26px] md:text-[32px] lg:text-[36px] xl:text-[40px]",
          on ? "text-white" : "text-silver"
        )}
      >
        {on ? after : before}
      </TextMorph>
      {/* One light pass across the row as it is rewritten (decorative; hidden for reduced motion). */}
      <AnimatePresence>
        {on && (
          <motion.span
            key="scan"
            aria-hidden
            // The band is a third of the row wide, so -100% to 300% of its own width crosses the whole row.
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "300%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, ease: [0.45, 0, 0.2, 1] }}
            className="pointer-events-none absolute inset-y-1 left-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgb(105_191_248/0.14),transparent)] motion-reduce:hidden"
          />
        )}
      </AnimatePresence>
      {/* The row's hairline, and the sky line that draws over it once the row is rewritten. */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.08]" />
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-[linear-gradient(90deg,#69bff8,rgb(105_191_248/0.15))] shadow-[0_0_14px_rgb(105_191_248/0.55)]"
      />
    </li>
  );
}

/* The mark before a line: a bare silver X that spins away, a bare sky check that lands with one ring pulse. */
function Mark({ on }: { on: boolean }) {
  // The ring pulse below plays once each time the line is rewritten (it mounts with the check).
  return (
    <span className="relative mt-[0.2em] grid size-9 place-items-center md:mt-[0.3em] md:size-12">
      <AnimatePresence initial={false} mode="popLayout">
        {on ? (
          <motion.span
            key="check"
            initial={{ scale: 0.3, opacity: 0, rotate: -60 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.08 }}
            className="grid place-items-center text-sky"
          >
            <Check strokeWidth={2} className="size-6 md:size-7" />
          </motion.span>
        ) : (
          <motion.span
            key="x"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0, rotate: 120, transition: { duration: 0.25 } }}
            transition={{ duration: 0.3 }}
            className="grid place-items-center text-silver"
          >
            <X strokeWidth={1.5} className="size-6 md:size-7" />
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {on && (
          <motion.span
            key="pulse"
            aria-hidden
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.9, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="pointer-events-none absolute inset-0 rounded-full border border-sky motion-reduce:hidden"
          />
        )}
      </AnimatePresence>
    </span>
  );
}
