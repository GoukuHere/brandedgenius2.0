"use client";

import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Container, Heading } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { useCopy } from "@/i18n/client";
import { cn } from "@/lib/utils";

/*
  Über uns, "So arbeiten wir": the client's six steps on a large dial, the one held section on the whole site
  (approved). Where the screen is tall enough (PIN, as the homepage's held stages), the section is a 300svh runway with
  a sticky one-screen stage: the dial turns with the scroll (scroll-linked and reversible), so the current step's
  segment passes under the fixed marker at the top while the sky arc fills behind it, and the dial's centre shows the
  current step ("Schritt 01 / 06", his label, the title and his text). A segment or its name scrolls to its step.

  Shorter screens (phones on their side, desktop windows under 720px) and reduced motion: the same dial, not held; a
  segment or its name turns the dial to that step.

  Wide screens: the heading and his line on the left, the dial on the right with the step names around it. Phones: the
  heading, the dial with the step numbers around it, and the current step's text under it, sized to fit 600 to 750px.
  Round 5 (DE/EN): copy by language; the steps (and their count, which shapes the dial) come from the page's copy.
*/

const pad = (i: number) => String(i + 1).padStart(2, "0");
// Keep in step with uber-uns.css (.uu-proc). As the homepage's held stages, without the held stage for reduced motion.
const PIN =
  "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 720px), (prefers-reduced-motion: no-preference) and (max-width: 1023px) and (min-height: 600px)";
const stepAt = (p: number, count: number) => Math.min(count - 1, Math.max(0, Math.floor(p * count)));
/** The step for a scroll position, holding the current step within a hair of a boundary so it never flickers there. */
const HOLD = 0.04; // in steps
const stepFrom = (p: number, current: number, count: number) => {
  const raw = p * count;
  const boundary = Math.round(raw);
  if (Math.abs(raw - boundary) < HOLD && (current === boundary - 1 || current === boundary)) return current;
  return stepAt(p, count);
};

// The dial's drawing, in its own 600-unit box.
const C = 300;
const R = 214;
const GAP = 1.8; // degrees left open at each end of a segment
// Rounded, so the server's and the browser's numbers match exactly when the page hydrates.
const round2 = (v: number) => Math.round(v * 100) / 100;
const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: round2(C + r * Math.sin(a)), y: round2(C - r * Math.cos(a)) };
};
const arc = (r: number, from: number, to: number) => {
  const a = polar(r, from);
  const b = polar(r, to);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
};
/** The dial's segments, one per step. */
const segmentsFor = (count: number) => Array.from({ length: count }, (_, i) => arc(R, i * (360 / count) + GAP, (i + 1) * (360 / count) - GAP));
const FULL = `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C} ${C + R} A ${R} ${R} 0 1 1 ${C} ${C - R}`;
const TICKS = Array.from({ length: 60 }, (_, i) => {
  const major = i % 10 === 0;
  const a = polar(R - 30, i * 6);
  const b = polar(R - (major ? 42 : 36), i * 6);
  return { a, b, major };
});

export function UberProcess() {
  const { UU_PROCESS } = useCopy().uberUns;
  const STEPS = UU_PROCESS.steps;
  const COUNT = STEPS.length;
  const SEGMENTS = useMemo(() => segmentsFor(COUNT), [COUNT]);
  const runway = useRef<HTMLElement>(null);
  // 0 when the stage pins (section top at the screen top), 1 when it lets go (section bottom at the screen bottom).
  const progress = useSectionProgress(runway, ["start start", "end end"]);
  const smooth = useSpring(progress, { stiffness: 110, damping: 26, mass: 0.6, skipInitialAnimation: true });
  const pinnedValue = useMotionValue(0);
  // Not held: the dial turns to the picked step's middle.
  const freeTurn = useSpring(0.5 / COUNT, { stiffness: 70, damping: 18, mass: 0.8 });

  const [pinned, setPinned] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const pinQuery = window.matchMedia(PIN);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onQuery = () => {
      setReduced(motionQuery.matches);
      setPinned(pinQuery.matches);
      pinnedValue.set(pinQuery.matches ? 1 : 0);
      if (pinQuery.matches) setStep(stepAt(smooth.get(), COUNT));
    };
    onQuery();
    pinQuery.addEventListener("change", onQuery);
    motionQuery.addEventListener("change", onQuery);
    return () => {
      pinQuery.removeEventListener("change", onQuery);
      motionQuery.removeEventListener("change", onQuery);
    };
  }, [pinnedValue, smooth, COUNT]);

  // Held: the step follows the scroll.
  useMotionValueEvent(smooth, "change", (p) => {
    if (pinnedValue.get()) setStep((current) => stepFrom(p, current, COUNT));
  });

  // How far the dial has turned, 0 to 1: the scroll when held, the picked step otherwise.
  const turn = useTransform(() => (pinnedValue.get() ? Math.min(1, Math.max(0, smooth.get())) : freeTurn.get()));
  const rotate = useTransform(() => -turn.get() * 360);
  const upright = useTransform(() => turn.get() * 360);
  // The lit arc ends at the marker; not held, it fills the picked step's segment too.
  const lit = useTransform(() => (pinnedValue.get() ? turn.get() : Math.min(1, (Math.round(turn.get() * COUNT - 0.5) + 1) / COUNT)));

  const pick = (i: number) => {
    const el = runway.current;
    if (pinned && el) {
      // Scroll to the middle of that step's stretch of the runway.
      const top = el.getBoundingClientRect().top + window.scrollY;
      const travel = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((i + 0.5) / COUNT) * travel, behavior: "smooth" });
      return;
    }
    setStep(i);
    if (reduced) freeTurn.jump((i + 0.5) / COUNT);
    else freeTurn.set((i + 0.5) / COUNT);
  };

  return (
    <section ref={runway} id="arbeitsweise" className="uu-proc relative py-16 md:py-24">
      <div className="uu-proc-stage">
        <Container className="grid w-full items-center gap-y-5 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-6">
            <Heading title={UU_PROCESS.title} accent={UU_PROCESS.accent} className="uu-proc-heading max-w-[600px]" />
            <p data-reveal="up" data-rd="2" className="uu-proc-text t-lead mt-6 max-w-[460px]">
              {UU_PROCESS.text}
            </p>
            {/* All six steps for screen readers, in order; the dial and its centre are hidden from them. */}
            <ol className="sr-only">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  {UU_PROCESS.stepWord} {pad(i)}: {s.title}, {s.label}. {s.text}
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-6">
            <div className="uu-dial relative mx-auto">
              {/* The turning part: the six segments, the lit arc, the bezel and the step names. */}
              <motion.div style={{ rotate }} className="absolute inset-0 will-change-transform">
                <svg aria-hidden viewBox="0 0 600 600" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
                  <defs>
                    <mask id="uu-dial-seg" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="600">
                      {SEGMENTS.map((d) => (
                        <path key={d} d={d} stroke="#fff" strokeWidth={14} />
                      ))}
                    </mask>
                    <mask id="uu-dial-glow" maskUnits="userSpaceOnUse" x="-50" y="-50" width="700" height="700">
                      {SEGMENTS.map((d) => (
                        <path key={d} d={d} stroke="#fff" strokeWidth={40} />
                      ))}
                    </mask>
                  </defs>
                  {/* The bezel inside the ring. */}
                  <circle cx={C} cy={C} r={R - 52} stroke="rgb(255 255 255 / 0.07)" />
                  {TICKS.map((t, i) => (
                    <line
                      key={i}
                      x1={t.a.x}
                      y1={t.a.y}
                      x2={t.b.x}
                      y2={t.b.y}
                      stroke={t.major ? "rgb(105 191 248 / 0.55)" : "rgb(255 255 255 / 0.14)"}
                      strokeWidth={t.major ? 1.6 : 1}
                    />
                  ))}
                  {/* The six segments: the current one brighter. */}
                  {SEGMENTS.map((d, i) => (
                    <path key={d} d={d} stroke={i === step ? "rgb(241 241 238 / 0.3)" : "rgb(241 241 238 / 0.1)"} strokeWidth={12} className="transition-[stroke] duration-500" />
                  ))}
                  {/* The lit arc, from the start to the marker, in the segments' shape. */}
                  <motion.path d={FULL} stroke="rgb(105 191 248 / 0.2)" strokeWidth={36} mask="url(#uu-dial-glow)" style={{ pathLength: lit }} />
                  <motion.path d={FULL} stroke="#69bff8" strokeWidth={12} mask="url(#uu-dial-seg)" style={{ pathLength: lit }} />
                  {/* Wide, invisible strokes: a click on a segment picks its step. */}
                  {SEGMENTS.map((d, i) => (
                    <path key={d} d={d} stroke="transparent" strokeWidth={56} className="cursor-pointer" style={{ pointerEvents: "stroke" }} onClick={() => pick(i)} />
                  ))}
                </svg>

                {STEPS.map((s, i) => {
                  const at = polar(R + 62, (i + 0.5) * (360 / COUNT));
                  return (
                    <motion.button
                      key={s.title}
                      type="button"
                      onClick={() => pick(i)}
                      aria-label={`${UU_PROCESS.stepWord} ${pad(i)}: ${s.title}`}
                      aria-current={i === step ? "step" : undefined}
                      style={{ rotate: upright, left: `${(at.x / 6).toFixed(3)}%`, top: `${(at.y / 6).toFixed(3)}%` }}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[8px] px-2 py-1.5 whitespace-nowrap transition-colors duration-500",
                        i === step ? "text-white" : "text-white/45 hover:text-white/80"
                      )}
                    >
                      <span className="num text-[13px] text-current md:hidden">{pad(i)}</span>
                      <span className="hidden text-[15px] font-medium tracking-[-0.01em] md:inline">{s.title}</span>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* The fixed marker at twelve o'clock. */}
              <span aria-hidden className="absolute top-[14.33%] left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="block size-[14px] rounded-full border-2 border-white bg-sky shadow-[0_0_0_6px_rgb(105_191_248/0.18),0_0_28px_4px_rgb(105_191_248/0.65)]" />
              </span>

              {/* The centre: the current step. */}
              <div aria-hidden className="absolute inset-[24%] grid place-items-center text-center">
                <div className="grid">
                  {STEPS.map((s, i) => (
                    <div
                      key={s.title}
                      // The leaving step fades fast and the arriving one a beat later, so the two never sit on each other.
                      className={cn(
                        "col-start-1 row-start-1 flex flex-col items-center transition-[opacity,translate] ease-[cubic-bezier(0.16,1,0.3,1)]",
                        i === step
                          ? "translate-y-0 opacity-100 delay-150 duration-500"
                          : cn("opacity-0 delay-0 duration-150", i < step ? "-translate-y-3" : "translate-y-3")
                      )}
                    >
                      <p className="num text-[12px] tracking-[0.02em] text-white/55 lg:text-[13px]">
                        {UU_PROCESS.stepWord} {pad(i)} / {pad(COUNT - 1)}
                      </p>
                      <p className="mt-1.5 text-[12px] font-medium text-sky lg:mt-2 lg:text-[14px]">{s.label}</p>
                      <p className="mt-1.5 text-[26px] leading-[1.05] font-medium tracking-[-0.025em] text-white lg:mt-3 lg:text-[40px]">{s.title}</p>
                      <p className="mt-3 hidden max-w-[250px] text-[15px] leading-[1.55] text-pretty text-white/70 lg:block">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phones and tablets: the current step's text under the dial (all six share one cell, so nothing jumps). */}
            <div aria-hidden className="uu-proc-below mx-auto mt-4 grid max-w-[460px] text-center lg:hidden">
              {STEPS.map((s, i) => (
                <p
                  key={s.title}
                  className={cn(
                    "col-start-1 row-start-1 text-[15px] leading-[1.55] text-pretty text-white/75 transition-opacity",
                    i === step ? "opacity-100 delay-150 duration-500" : "opacity-0 delay-0 duration-150"
                  )}
                >
                  {s.text}
                </p>
              ))}
            </div>

          </div>
        </Container>
      </div>
    </section>
  );
}
