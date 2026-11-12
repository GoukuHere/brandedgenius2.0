"use client";

import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { Tilt } from "@/components/ui/tilt";
import { PROMISE } from "@/content/site";
import { CountUp, RiseLetters } from "./count";
import { PromiseArt } from "./promise-art";

/*
  v11 Versprechen card: v1's 3D card (sections/promise-card.tsx), which the developer pointed back to ("we can
  utilize this from v1 by adding a loader animation on the left card from zero to that number"), in v11's navy and
  freed from v1's pinned scroll. A lit glass card in a 1200px perspective; the current figure stands large in its
  upper half, a faint sky grid fills the lower half and brightens a little with each figure.

  - Each figure counts up from zero when it arrives (both ends of "3–6" and "40–70 %"); "Nachhaltig", which has no
    number, rises in letter by letter.
  - Where the section pins (`scrollDriven` is 1), the card turns with the scroll exactly as in v1: at every change of
    figure it stands 14 degrees to one side (alternating sides) and for the middle half of each step it faces the
    reader. Elsewhere it makes the same swing on its own time at each change. The old figure slides out as the new
    one slides in (v1's).
  - The pointer tilts the card (Motion Primitives Tilt, mouse only).
  Reduced motion: no turn and no tilt, the figures simply stand.

  Round 4 (the client: "we need an other effect. This is too less"): the faint grid in the lower half is replaced by a
  line drawing per figure (promise-art.tsx). Where the section pins, a figure's drawing draws over the first 70% of
  its own step, scroll-linked and reversible; elsewhere it draws over 1.9s each time its figure arrives. Reduced
  motion: every drawing stands complete.
*/

const FIGURES = PROMISE.figures;
const STEPS = FIGURES.length;
const EASE = [0.16, 1, 0.3, 1] as const;

/** The value's full size; a value wider than the card ("3–6 Monate", "Nachhaltig") shrinks until it fits. */
const VALUE_PX = 76;
const TURN_Y = 14;
const TURN_X = 4;
/** Share of each step spent turning in from the last change of figure, and again turning out towards the next. */
const TURN_SHARE = 0.25;
const TILT_SPRING = { stiffness: 160, damping: 20, mass: 0.6 };

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** v1's turn at a runway progress, from -1 to 1 (0 while a figure faces the reader). */
function turnAt(progress: number) {
  const x = Math.min(1, Math.max(0, progress)) * STEPS;
  const step = Math.min(STEPS - 1, Math.floor(x));
  const t = x - step;
  // The side the card stands at when this step begins; the next step begins at the other side.
  const side = step % 2 === 0 ? -1 : 1;
  if (t < TURN_SHARE) return side * (1 - smoothstep(t / TURN_SHARE));
  if (t > 1 - TURN_SHARE) return -side * smoothstep((t - (1 - TURN_SHARE)) / TURN_SHARE);
  return 0;
}

/** Share of a figure's step over which its drawing completes, where the scroll drives it. */
const DRAW_SHARE = 0.7;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const hasNumber = (value: string) => /\d/.test(value);

export function PromiseCard({
  step,
  live,
  progress,
  scrollDriven,
}: {
  step: number;
  live: boolean;
  /** The section's (smoothed) runway progress. */
  progress: MotionValue<number>;
  /** 1 where the section pins and the card turns with the scroll, 0 where it swings on its own. */
  scrollDriven: MotionValue<number>;
}) {
  const valuesRef = useRef<HTMLDivElement>(null);
  const swing = useMotionValue(0);
  // Every source is read on every frame, so each stays subscribed whichever one drives the card.
  const turn = useTransform(() => {
    const scrolled = turnAt(progress.get());
    const timed = swing.get();
    return scrollDriven.get() ? scrolled : timed;
  });
  const rotateY = useTransform(() => TURN_Y * turn.get());
  const rotateX = useTransform(() => TURN_X * Math.abs(turn.get()));
  const firstStep = useRef(true);

  // The drawings: driven by the scroll where the section pins, otherwise by `timed` (0 to 1) from each arrival.
  const timed = useMotionValue(0);
  const stepValue = useMotionValue(step);
  const still = useMotionValue(0);
  useEffect(() => {
    stepValue.set(step);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      still.set(1);
      return undefined;
    }
    still.set(0);
    if (scrollDriven.get() || !live) return undefined;
    timed.set(0);
    const controls = animate(timed, 1, { duration: 1.9, delay: 0.25, ease: EASE });
    return () => controls.stop();
  }, [step, live, timed, stepValue, still, scrollDriven]);

  // The swing at each change of figure (not for the first one), where the scroll does not turn the card.
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return undefined;
    }
    if (scrollDriven.get() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const side = step % 2 === 0 ? -1 : 1;
    const controls = animate(swing, [0, side, 0], { duration: 1.3, times: [0, 0.3, 1], ease: ["easeIn", EASE] });
    return () => controls.stop();
  }, [step, swing, scrollDriven]);

  // Fit each value to the card's inner width (v1's): measured in em at its current size, so it scales exactly. Runs
  // once the brand font is in, and whenever the card changes size.
  useEffect(() => {
    const box = valuesRef.current;
    if (!box) return undefined;
    const values = Array.from(box.querySelectorAll<HTMLElement>("[data-value]"));
    const fit = () => {
      const pad = getComputedStyle(box);
      const room = box.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight);
      if (room <= 0) return;
      for (const value of values) {
        const size = parseFloat(getComputedStyle(value).fontSize) || VALUE_PX;
        const em = value.offsetWidth / size;
        if (em > 0) value.style.fontSize = `${Math.min(VALUE_PX, Math.floor((room / em) * 10) / 10)}px`;
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) fit();
    });
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, []);

  return (
    <div className="[perspective:1200px]">
      <motion.div style={{ rotateX, rotateY }} className="will-change-transform motion-reduce:transform-none!">
        <Tilt rotationFactor={8} springOptions={TILT_SPRING} className="motion-reduce:transform-none! [@media(hover:none)]:transform-none!">
          <div className="v11-promise-card relative aspect-[4/3] w-full overflow-hidden rounded-[24px] lg:aspect-[380/480] lg:w-[clamp(300px,24vw,380px)]">
            {/* The current figure's drawing in the lower half; the others wait, faded. */}
            <div className="absolute inset-x-0 bottom-0 grid h-[60%] px-7 pt-6 pb-7 sm:px-9 sm:pb-9">
              {FIGURES.map((figure, i) => (
                <ArtLayer key={figure.value} index={i} on={i === step} progress={progress} scrollDriven={scrollDriven} timed={timed} stepValue={stepValue} still={still} />
              ))}
            </div>

            {/* All four values share one cell; the current one stands, the others wait above or below, faded. */}
            <div ref={valuesRef} className="absolute inset-x-0 top-0 grid h-[40%] items-end px-7 pb-1 sm:px-9">
              {FIGURES.map((figure, i) => {
                const on = i === step;
                return (
                  <motion.p
                    key={figure.value}
                    data-value
                    className="num col-start-1 row-start-1 w-max text-[76px] leading-none whitespace-nowrap text-white"
                    initial={false}
                    animate={{ y: i < step ? "-40%" : i > step ? "40%" : "0%", opacity: on ? 1 : 0 }}
                    transition={{
                      y: { duration: 0.75, ease: EASE },
                      opacity: { duration: on ? 0.55 : 0.3, delay: on ? 0.12 : 0, ease: EASE },
                    }}
                  >
                    {hasNumber(figure.value) ? (
                      <CountUp value={figure.value} play={on && live} duration={1.25} delay={0.2} />
                    ) : (
                      <RiseLetters text={figure.value} play={on && live} />
                    )}
                  </motion.p>
                );
              })}
            </div>
          </div>
        </Tilt>
      </motion.div>
    </div>
  );
}

function ArtLayer({
  index,
  on,
  progress,
  scrollDriven,
  timed,
  stepValue,
  still,
}: {
  index: number;
  on: boolean;
  progress: MotionValue<number>;
  scrollDriven: MotionValue<number>;
  timed: MotionValue<number>;
  stepValue: MotionValue<number>;
  still: MotionValue<number>;
}) {
  const draw = useTransform(() => {
    const scrolled = clamp01((progress.get() * STEPS - index) / DRAW_SHARE);
    const current = stepValue.get();
    const arrived = index < current ? 1 : index > current ? 0 : timed.get();
    if (still.get()) return 1;
    return scrollDriven.get() ? scrolled : arrived;
  });
  return (
    <motion.div
      className="col-start-1 row-start-1 min-h-0"
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={{ duration: on ? 0.5 : 0.25, delay: on ? 0.1 : 0, ease: EASE }}
    >
      <PromiseArt index={index} draw={draw} />
    </motion.div>
  );
}
