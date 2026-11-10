"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Container, Heading } from "@/components/system/primitives";
import { PROMISE } from "@/content/site";
import { cn } from "@/lib/utils";
import { PromiseCard } from "./promise-card";

/*
  v11 Unser Versprechen: v1's layout back (the developer: "we can utilize this from v1"): the 3D card with the
  current figure on the left, the statement on the right, and under it v1's four ticks beside the current figure's
  label. The four tiles of the first v11 are gone ("the text seems super big").

  No pinned scroll (the client: "not this scrolling by scrolling"): the section scrolls like any other. While it is
  on screen the figures take turns on their own, DWELL ms each; each counts up from zero on the card as it arrives.
  A tick is a button: picking one shows that figure and stops the turns (the visitor has taken over); hovering or
  focusing the card or the ticks holds them. Reduced motion: no turns, the ticks still pick.

  Phones: the card on top, full width, then the statement, the ticks and the label. Every figure is in the markup
  for screen readers as one list; the card and the changing label are hidden from them.
*/

const FIGURES = PROMISE.figures;
const COUNT = FIGURES.length;
const DWELL = 4600;
const EASE = [0.16, 1, 0.3, 1] as const;

// The title ends in a dash: a no-break space keeps it with "schafft", so no line ever starts with it.
const TITLE = PROMISE.title.replace(/ –$/, " –");

export function PromiseSection() {
  const root = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onQuery = () => setReduced(query.matches);
    onQuery();
    query.addEventListener("change", onQuery);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      query.removeEventListener("change", onQuery);
    };
  }, []);

  // The next figure after DWELL ms, while the section is on screen and nobody holds or has picked.
  const turning = onScreen && visible && !held && !manual && !reduced;
  useEffect(() => {
    if (!turning) return undefined;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % COUNT), DWELL);
    return () => window.clearTimeout(id);
  }, [turning, step]);

  const pick = (i: number) => {
    setManual(true);
    setStep(i);
  };
  const hold = {
    onPointerEnter: () => setHeld(true),
    onPointerLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false),
  };

  return (
    <section ref={root} id="mehrwert" className="relative py-16 md:py-24">
      <Container className="grid items-center gap-y-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-[clamp(56px,6vw,112px)]">
        <div aria-hidden data-reveal="up" className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none" {...hold}>
          <PromiseCard step={step} live={onScreen} />
        </div>

        <div className="min-w-0">
          <Heading title={TITLE} accent={PROMISE.accent} className="max-w-[880px] text-[length:clamp(2.125rem,1.25rem+2.2vw,3.25rem)]" />

          <div data-reveal="up" data-rd="2" className="mt-10 flex items-center gap-5 xl:mt-14" {...hold}>
            <Ticks step={step} onPick={pick} />
            <Label step={step} />
          </div>

          <ul role="list" className="sr-only">
            {FIGURES.map((figure) => (
              <li key={figure.value}>
                {figure.value}: {figure.label}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/** v1's four ticks, one per figure, the current one in sky; each picks its figure. */
function Ticks({ step, onPick }: { step: number; onPick: (i: number) => void }) {
  return (
    <div className="flex shrink-0 flex-col">
      {FIGURES.map((figure, i) => (
        <button
          key={figure.value}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`${figure.value}: ${figure.label}`}
          aria-current={i === step ? "step" : undefined}
          className="group grid h-8 w-7 cursor-pointer place-items-center rounded-[6px] lg:h-7"
        >
          <span
            className={cn(
              "h-[22px] w-[2px] rounded-full transition-colors duration-500 ease-out",
              i === step ? "bg-sky" : "bg-white/20 group-hover:bg-white/50"
            )}
          />
        </button>
      ))}
    </div>
  );
}

/** The current figure's label (v1's): all four share one cell, so the block never changes height while they cross. */
function Label({ step }: { step: number }) {
  return (
    <div aria-hidden className="grid min-w-0">
      {FIGURES.map((figure, i) => {
        const on = i === step;
        return (
          <motion.p
            key={figure.value}
            className="col-start-1 row-start-1 text-[22px] leading-[1.25] tracking-[-0.015em] text-pretty text-white sm:text-[26px] lg:text-[30px] xl:text-[32px]"
            initial={false}
            animate={{ opacity: on ? 1 : 0, y: i < step ? -12 : i > step ? 12 : 0 }}
            transition={{ duration: on ? 0.6 : 0.35, delay: on ? 0.1 : 0, ease: EASE }}
          >
            {figure.label}
          </motion.p>
        );
      })}
    </div>
  );
}
