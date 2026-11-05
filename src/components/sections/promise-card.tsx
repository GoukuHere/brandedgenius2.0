"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import { Tilt } from "@/components/ui/tilt";
import { PROMISE } from "@/content/site";

/*
  The Versprechen's 3D card (desktop pinned stage only; decorative, the figures are read from the section's list).
  A lit glass card in a 1200px perspective, turned by the scroll and, on top of that, by the pointer (Motion
  Primitives Tilt). The current figure's value stands large in the upper half and swaps whole on each step (a
  vertical slide, direction-aware); a faint sky grid fills the lower half and brightens a little with each step.

  The turn: at every step change the card stands 14 degrees to one side (alternating sides, so the turn never
  snaps back), and for the middle half of each step it faces the reader, eased in and out. Reduced motion: no
  turn and no tilt (CSS), and the value swap is a crossfade (MotionConfig skips the slide).
*/

const FIGURES = PROMISE.figures;
const STEPS = FIGURES.length;
const EASE = [0.16, 1, 0.3, 1] as const;

/** The value's full size; a value wider than the card ("3–6 Monate", "Nachhaltig") shrinks until it fits. */
const VALUE_PX = 76;
const TURN_Y = 14;
const TURN_X = 4;
/** Share of each step spent turning in from the last step change, and again turning out towards the next. */
const TURN_SHARE = 0.25;
const TILT_SPRING = { stiffness: 160, damping: 20, mass: 0.6 };

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** How far the card is turned at a runway progress, from -1 to 1 (0 while a figure faces the reader). */
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

/* A 1px sky grid, pure CSS, fading out towards the card's middle. */
const GRID: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgb(105 191 248 / 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgb(105 191 248 / 0.18) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
  backgroundPosition: "center top",
  maskImage: "linear-gradient(to bottom, transparent 0%, #000 62%)",
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 62%)",
};

export function PromiseCard({ progress, step }: { progress: MotionValue<number>; step: number }) {
  const valuesRef = useRef<HTMLDivElement>(null);

  const turn = useTransform(() => turnAt(progress.get()));
  const rotateY = useTransform(() => TURN_Y * turn.get());
  const rotateX = useTransform(() => TURN_X * Math.abs(turn.get()));

  // Fit each value to the card's inner width: measured in em at its current size, so it scales exactly. Runs once
  // the brand font is in, and whenever the card changes size (it is 300 to 380px wide, and hidden below lg).
  useEffect(() => {
    const box = valuesRef.current;
    if (!box) return;
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
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) fit();
    });
    return () => {
      live = false;
      observer.disconnect();
    };
  }, []);

  return (
    <div className="[perspective:1200px]">
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="will-change-transform motion-reduce:transform-none!">
        <Tilt rotationFactor={8} springOptions={TILT_SPRING} className="motion-reduce:transform-none!">
          <div className="glass glass-lit relative aspect-[380/480] w-[clamp(300px,24vw,380px)] overflow-hidden rounded-[32px]">
            <motion.div
              className="absolute inset-x-0 bottom-0 h-1/2"
              style={GRID}
              initial={false}
              animate={{ opacity: 0.45 + (0.55 * step) / (STEPS - 1) }}
              transition={{ duration: 0.8, ease: EASE }}
            />

            {/* All four values share one cell; the current one stands, the others wait above or below, faded. */}
            <div ref={valuesRef} className="absolute inset-x-0 top-0 grid h-1/2 items-end px-9 pb-1">
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
                    {figure.value}
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
