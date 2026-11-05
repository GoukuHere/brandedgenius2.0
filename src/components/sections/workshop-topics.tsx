"use client";

import { AnimatePresence, motion, useInView, useReducedMotion, type Transition, type Variants } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type PointerEvent } from "react";
import { PrimaryLink } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { TextLoop } from "@/components/ui/text-loop";
import { LINKS, WORKSHOP } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  The KI-Workshop topics (v4). One large display line shows the seven topics one at a time (Motion Primitives
  TextLoop, every 2.6s: the outgoing topic slides up and fades, the next rises from below). Under it all seven stand
  as one wrapped row of plain text with small sky dots between them, the one on show in white. Each topic is a
  button that brings it to the display line and holds it there for a few seconds. Then the booking link.

  The loop runs only while the block is on screen, and waits while the mouse is over the block or the keyboard is
  in it. TextLoop has no controlled index, so a jump starts a fresh loop at the chosen topic (the list rotated to
  begin there), and AnimatePresence swaps the two loops with the same motion as a normal step.

  The display line is decorative (aria-hidden): screen readers get the list, named by "Themenbeispiele". On lg the
  label stands beside the display line on a shared baseline; on phones it follows the display line and heads the
  list (never small text above the big line). The separator dots sit before each topic and are clipped off at the
  start of every wrapped row. Reduced motion: no loop, the first topic stays on the display line.
*/

const TOPICS = WORKSHOP.topics;
const COUNT = TOPICS.length;

const EASE = [0.16, 1, 0.3, 1] as const;
const INTERVAL = 2.6; // seconds (TextLoop's unit)
const HOLD_MS = 5000; // a chosen topic stays this long before the loop moves on

// One step: the outgoing topic slides up and fades quickly; the next one rises from below a beat later.
const STEP: Variants = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.12, ease: EASE } },
  exit: { opacity: 0, y: -28, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } },
};
const STEP_TRANSITION: Transition = { duration: 0.6, ease: EASE };

type Loop = {
  /** The topic the running TextLoop started at (its children are the topics rotated to begin there). */
  start: number;
  /** Key of the running TextLoop; a jump mounts a new one. */
  run: number;
  /** The topic on the display line. */
  shown: number;
};

export function WorkshopTopics() {
  const labelId = useId();
  const block = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<number | undefined>(undefined);

  const inView = useInView(block);
  const reduce = useReducedMotion();
  const [loop, setLoop] = useState<Loop>({ start: 0, run: 0, shown: 0 });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const timer = holdTimer;
    return () => window.clearTimeout(timer.current);
  }, []);

  // Only the client knows these, and they only feed TextLoop's timer, so the markup never changes with them.
  const running = inView && !reduce && !hovered && !focused && !held;

  const { start, run, shown } = loop;

  // TextLoop reports its index in the rotated list. A loop that is fading out after a jump may still tick once;
  // only the loop that is currently running moves the highlight.
  const onIndexChange = useCallback(
    (index: number) => setLoop((current) => (current.run === run ? { ...current, shown: (start + index) % COUNT } : current)),
    [start, run]
  );

  function show(index: number) {
    window.clearTimeout(holdTimer.current);
    setHeld(true);
    holdTimer.current = window.setTimeout(() => setHeld(false), HOLD_MS);
    setLoop((current) => (current.shown === index ? current : { start: index, run: current.run + 1, shown: index }));
  }

  // The mouse pauses the loop; a touch leaves it running (a tap on a topic holds it instead).
  function onPointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") setHovered(true);
  }
  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") setHovered(false);
  }
  // Keyboard focus pauses it; the focus a mouse click leaves on a button does not (that would never resume).
  function onFocus(event: FocusEvent<HTMLDivElement>) {
    if (event.target.matches(":focus-visible")) setFocused(true);
  }
  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  }

  const order = TOPICS.map((_, k) => TOPICS[(start + k) % COUNT]);

  return (
    <Reveal className="mt-16 md:mt-24">
      <div className="rule" />
      <div
        ref={block}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        className="grid pt-10 md:pt-14 lg:grid-cols-12 lg:items-baseline lg:gap-x-8"
      >
        <h3
          id={labelId}
          className="order-2 mt-8 text-[15px] leading-normal font-normal text-silver lg:order-none lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:mt-0"
        >
          {WORKSHOP.topicsLabel}
        </h3>

        {/* Two lines tall at every size (no topic needs more), so nothing below moves when the topic changes. */}
        <div
          aria-hidden
          className="relative order-1 min-h-[2lh] text-[28px] leading-[1.12] font-medium tracking-[-0.02em] text-balance text-white sm:text-[36px] md:text-[40px] lg:order-none lg:col-span-8 lg:col-start-5 lg:row-start-1 lg:text-[44px] xl:text-[48px]"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={run} variants={STEP} initial="initial" animate="animate" exit="exit">
              <TextLoop
                interval={INTERVAL}
                trigger={running}
                onIndexChange={onIndexChange}
                variants={STEP}
                transition={STEP_TRANSITION}
                className="block w-full whitespace-normal"
              >
                {order.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </TextLoop>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="order-3 mt-3 lg:order-none lg:col-span-8 lg:col-start-5 lg:row-start-2 lg:mt-10">
          {/*
            Each topic carries a 24px slot with its dot before it. The list is pulled 24px left and clipped 17px in,
            so the dot of whichever topic starts a row is cut off while focus rings stay visible.
          */}
          <ul role="list" aria-labelledby={labelId} className="-ml-6 flex flex-wrap [clip-path:inset(-12px_-12px_-12px_17px)]">
            {TOPICS.map((topic, i) => {
              const on = i === shown;
              return (
                <li key={topic} className="flex min-w-0 items-start">
                  <span aria-hidden className="flex h-11 w-6 shrink-0 items-center justify-center">
                    <span className="size-1 rounded-full bg-sky" />
                  </span>
                  <button
                    type="button"
                    onClick={() => show(i)}
                    aria-current={on ? "true" : undefined}
                    className={cn(
                      "min-w-0 cursor-pointer py-2.5 text-left text-[16px] leading-6 transition-colors duration-200 ease-out md:text-[17px]",
                      on ? "text-white" : "text-white/55 hover:text-white/85"
                    )}
                  >
                    {topic}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-10">
            <PrimaryLink href={LINKS.booking}>{WORKSHOP.cta}</PrimaryLink>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
