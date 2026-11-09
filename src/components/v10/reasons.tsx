"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Heading } from "@/components/system/primitives";
import { REALITY } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  v10 Die Realität: v2's Problem chapter (the client: "please take also that section here, do it like this, I like
  that style"), in place of v1's reasons list ("not really good, the other one is better"), in normal scrolling
  ("not this scrolling by scrolling"). One screen: the Realität headline (v1's Problem headline is already right
  above it), the six reasons one at a time with their photos dissolving into the panel's light, and a row of bars.

  The reasons no longer step with the scroll. While the section is on screen each one stays for DWELL ms and its bar
  fills like a story, then the next follows. A bar is a button: picking one shows that reason and stops the advance
  (the visitor has taken over); hovering or focusing the reasons holds it. Reduced motion: no advance, the bars
  still pick. Every reason is in the markup for screen readers as one list.
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const DWELL = 5200;
const REASONS = REALITY.items;
const COUNT = REASONS.length;
const pad = (i: number) => String(i + 1).padStart(2, "0");

export function ReasonsSection() {
  const root = useRef<HTMLElement>(null);
  // Live while most of the section is on screen and the tab is visible.
  const [onScreen, setOnScreen] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.55 });
    io.observe(el);
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  const live = onScreen && visible;

  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0); // a new number restarts the running bar
  const [manual, setManual] = useState(false);
  const [held, setHeld] = useState(false);
  const reason = REASONS[active];

  const pick = (i: number) => {
    setManual(true);
    setActive(i);
    setRun((r) => r + 1);
  };
  const advance = () => {
    setActive((a) => (a + 1) % COUNT);
    setRun((r) => r + 1);
  };
  const running = !manual;
  const paused = !live || held;

  const hold = {
    onPointerEnter: () => setHeld(true),
    onPointerLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false),
  };
  const bars = (
    <Bars active={active} run={run} running={running} paused={paused} onPick={pick} onDone={advance} />
  );

  return (
    <section ref={root} id="realitaet" aria-label={`${REALITY.title} ${REALITY.accent}`} className="relative h-[calc(100svh_-_2*var(--v10-gap))] min-h-[600px]">
      {/* Desktop: the photos fill the right of the panel and dissolve into its light. */}
      <div aria-hidden className="v10-photo-fade absolute inset-y-0 right-0 z-[2] hidden w-[58%] overflow-hidden md:block">
        <ReasonPhotos active={active} sizes="58vw" />
      </div>

      <div className="relative z-10 mx-auto grid h-full max-w-[1360px] grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-5 px-5 pt-[88px] pb-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-1 md:items-center md:gap-16 md:px-12 md:pt-[96px] md:pb-[72px]">
        <div>
          <Heading title={REALITY.title} accent={REALITY.accent} className="text-[length:clamp(1.75rem,1.2rem+1.6vw,3rem)]" />
          <div className="mt-8 hidden md:block" {...hold}>
            {bars}
            <ReasonText index={active} title={reason.title} text={reason.text} />
          </div>
        </div>

        {/* Phones: the photo in a frame between the heading and the reason. */}
        <div aria-hidden className="relative min-h-0 overflow-hidden rounded-[16px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.09)] md:hidden">
          <ReasonPhotos active={active} sizes="92vw" />
        </div>

        <div className="md:hidden" {...hold}>
          {bars}
          <ReasonText index={active} title={reason.title} text={reason.text} compact />
        </div>
      </div>

      {/* All six reasons for screen readers, in order; the changing view above is hidden from them. */}
      <ol className="sr-only">
        {REASONS.map((r) => (
          <li key={r.title}>
            {r.title}: {r.text}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** One bar per reason: done ones full, the current one filling over its time, the rest empty. Each picks its reason. */
function Bars({
  active,
  run,
  running,
  paused,
  onPick,
  onDone,
}: {
  active: number;
  run: number;
  running: boolean;
  paused: boolean;
  onPick: (i: number) => void;
  onDone: () => void;
}) {
  return (
    <div className="-my-3 flex gap-1.5">
      {REASONS.map((r, i) => {
        const state = i < active ? "done" : i === active ? (running ? "running" : "done") : "idle";
        return (
          <button
            key={r.title}
            type="button"
            onClick={() => onPick(i)}
            aria-label={`Grund ${i + 1} von ${COUNT} zeigen`}
            aria-current={i === active ? "step" : undefined}
            className="group relative h-11 min-w-0 flex-1 cursor-pointer rounded-[6px]"
          >
            <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/14 transition-colors duration-200 group-hover:bg-white/28">
              <span
                key={i === active ? run : -1}
                data-state={state}
                data-paused={paused || undefined}
                onAnimationEnd={i === active && running ? onDone : undefined}
                style={{ "--v10-dwell": `${DWELL}ms` } as CSSProperties}
                className="v10-bar-fill absolute inset-0 rounded-full bg-sky"
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** The six reasons' photos, one shown at a time, under a royal grade so each sits in the panel's light (v2's). */
function ReasonPhotos({ active, sizes }: { active: number; sizes: string }) {
  return (
    <>
      {REASONS.map((r, i) => (
        <Image
          key={r.img}
          src={r.img}
          alt=""
          fill
          sizes={sizes}
          className={cn(
            "object-cover transition-[opacity,scale] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            i === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
          )}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(3_10_26/0.6)_0%,rgb(3_10_26/0)_45%),linear-gradient(0deg,rgb(0_75_160/0.24),rgb(0_75_160/0.24))]" />
    </>
  );
}

function ReasonText({ index, title, text, compact = false }: { index: number; title: string; text: string; compact?: boolean }) {
  return (
    <div aria-hidden className={cn("relative", compact ? "mt-4 min-h-[124px]" : "mt-6 min-h-[156px]")}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <p className="num text-[15px] text-sky">{pad(index)}</p>
          <h3 className={cn("mt-2 font-medium tracking-[-0.015em] text-white", compact ? "text-[21px] leading-[1.2]" : "text-[26px] leading-[1.2]")}>{title}</h3>
          <p className={cn("mt-2 max-w-[460px] text-white/70", compact ? "text-[15px] leading-[1.5]" : "text-[17px] leading-[1.6]")}>{text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
