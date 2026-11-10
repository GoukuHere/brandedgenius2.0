"use client";

import { motion, useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Container, Heading } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { PROMISE } from "@/content/site";
import { cn } from "@/lib/utils";
import { PromiseCard } from "./promise-card";

/*
  v11 Unser Versprechen: v1's section (the developer: "we can utilize this from v1", then "let it animate with
  scrolling as it used to do in v1"): the 3D card with the current figure on the left, the statement on the right,
  and under it v1's four ticks beside the current figure's label. Each figure counts up from zero on the card as it
  arrives (v11).

  Desktop (lg, at least 720px tall) as in v1, and phones and tablets at least 640px tall (the developer: "it should
  do the same thing on mobile too"): a pinned scroll story. The section is a 320svh runway with a sticky one-screen
  stage; the runway is cut into four equal steps, scroll-linked and reversible, and the card turns with the scroll
  between them. A tick scrolls to its figure. Phones stack the card, the statement and the ticks with the label on
  the stage, sized to fit a 667px screen.

  Short windows (phones on their side, desktop windows under 720px): the figures take turns on their own while the
  section is on screen, DWELL ms each; a tick picks one and stops the turns, hovering or focusing holds them.
  Reduced motion: no turns there, the ticks still pick.

  Every figure is in the markup for screen readers as one list; the card and the changing label are hidden from them.
*/

const FIGURES = PROMISE.figures;
const COUNT = FIGURES.length;
const DWELL = 4600;
const EASE = [0.16, 1, 0.3, 1] as const;
// Keep in step with v11.css (.v11-promise): desktop as in v1, and phones and tablets too (the developer: "it should do
// the same thing on mobile too, scrolling").
const PIN = "(min-width: 1024px) and (min-height: 720px), (max-width: 1023px) and (min-height: 600px)";

// The title ends in a dash: a no-break space keeps it with "schafft", so no line ever starts with it.
const TITLE = PROMISE.title.replace(/ –$/, " –");

const stepAt = (progress: number) => Math.min(COUNT - 1, Math.max(0, Math.floor(progress * COUNT)));

export function PromiseSection() {
  const runway = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  // 0 when the stage pins (section top at the screen top), 1 when it lets go (section bottom at the screen bottom).
  const progress = useSectionProgress(runway, ["start start", "end end"]);
  const smooth = useSpring(progress, { stiffness: 110, damping: 26, mass: 0.6, skipInitialAnimation: true });
  const pinnedValue = useMotionValue(0);

  const [pinned, setPinned] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pinQuery = window.matchMedia(PIN);
    const onQuery = () => {
      setReduced(motionQuery.matches);
      setPinned(pinQuery.matches);
      pinnedValue.set(pinQuery.matches ? 1 : 0);
      if (pinQuery.matches) setStep(stepAt(smooth.get()));
    };
    onQuery();
    motionQuery.addEventListener("change", onQuery);
    pinQuery.addEventListener("change", onQuery);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onQuery);
      pinQuery.removeEventListener("change", onQuery);
    };
  }, [pinnedValue, smooth]);

  // Pinned: the figure follows the scroll (v1's).
  useMotionValueEvent(smooth, "change", (p) => {
    if (pinnedValue.get()) setStep(stepAt(p));
  });

  // Not pinned: the next figure after DWELL ms, while the section is on screen and nobody holds or has picked.
  const turning = !pinned && onScreen && visible && !held && !manual && !reduced;
  useEffect(() => {
    if (!turning) return undefined;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % COUNT), DWELL);
    return () => window.clearTimeout(id);
  }, [turning, step]);

  const pick = (i: number) => {
    const el = runway.current;
    if (pinned && el) {
      // Scroll to the middle of that figure's step on the runway.
      const top = el.getBoundingClientRect().top + window.scrollY;
      const travel = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((i + 0.5) / COUNT) * travel, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    setManual(true);
    setStep(i);
  };
  const hold = pinned
    ? {}
    : {
        onPointerEnter: () => setHeld(true),
        onPointerLeave: () => setHeld(false),
        onFocus: () => setHeld(true),
        onBlur: () => setHeld(false),
      };

  return (
    <section ref={runway} id="mehrwert" className="v11-promise relative py-16 md:py-24">
      {/* The stage: pinned for the length of the runway (v11.css), its content centred below the fixed header. */}
      <div ref={stage} className="v11-promise-stage">
        <Container className="v11-promise-grid grid items-center gap-y-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-[clamp(56px,6vw,112px)]">
          <div aria-hidden data-reveal="up" className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none" {...hold}>
            <PromiseCard step={step} live={onScreen} progress={smooth} scrollDriven={pinnedValue} />
          </div>

          <div className="min-w-0">
            <Heading title={TITLE} accent={PROMISE.accent} className="max-w-[880px] text-[length:clamp(2.125rem,1.25rem+2.2vw,3.25rem)]" />

            <div data-reveal="up" data-rd="2" className="v11-promise-steps mt-10 flex items-center gap-5 xl:mt-14" {...hold}>
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
      </div>
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
