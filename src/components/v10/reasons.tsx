"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Heading } from "@/components/system/primitives";
import { REALITY } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  v10 Die Realität: v2's Problem chapter (the client: "please take also that section here, do it like this, I like
  that style") in place of v1's reasons list ("not really good, the other one is better"), as a normal section of
  v1's page in normal scrolling ("not this scrolling by scrolling"): the Realität headline (v1's Problem headline is
  already right above it), the six reasons one at a time with a row of bars, and their photos filling the right of
  the section and dissolving into the page towards the text. Phones: headline, photo in a frame, bars, reason.

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
    <section ref={root} id="realitaet" aria-label={`${REALITY.title} ${REALITY.accent}`} className="relative overflow-x-clip py-16 md:flex md:min-h-[min(820px,100svh)] md:items-center md:py-24">
      {/* Desktop: the photos fill the right of the section and dissolve into the page towards the text. */}
      <div aria-hidden className="v10-photo-fade absolute inset-y-0 right-0 hidden w-[56%] overflow-hidden md:block">
        <ReasonPhotos active={active} sizes="56vw" />
      </div>

      <Container className="relative">
        <div className="md:w-[44%] md:pr-10">
          <Heading title={REALITY.title} accent={REALITY.accent} />

          {/* Phones: the photo in a frame between the heading and the reason. */}
          <div aria-hidden className="relative mt-8 aspect-[4/3] overflow-hidden rounded-panel shadow-[inset_0_0_0_1px_rgb(255_255_255/0.09)] md:hidden">
            <ReasonPhotos active={active} sizes="92vw" />
          </div>

          <div className="mt-8" {...hold}>
            {bars}
            <ReasonText index={active} title={reason.title} text={reason.text} />
          </div>
        </div>
      </Container>

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
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(6_21_54/0.55)_0%,rgb(6_21_54/0)_45%),linear-gradient(0deg,rgb(0_75_160/0.24),rgb(0_75_160/0.24))]" />
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
