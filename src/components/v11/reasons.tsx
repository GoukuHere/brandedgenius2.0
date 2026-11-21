"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Heading } from "@/components/system/primitives";
import { getLenis } from "@/components/system/smooth-scroll";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { REALITY } from "@/content/site";

/*
  v11 Die Realität: the six reasons why KI projects stall, a slider that steps with the scroll.

  Round 5 (the client's Loom of 2026-11-18, 0:17 to 0:45): "the animation and effect are good, but you see the header
  are still the same ... The header should be maybe somewhere in the middle, and then if you have the first one, you're
  scrolling up the second one coming, the third one ... to keep the header always same." Before, the heading sat on
  the left of every reason, so a new reason read as the same screen with other small text. Now:
  - The heading stands once, centred at the top of the stage, and stays; the bars sit under it.
  - Under them a window holds the six slides, each a reason with its own picture (number, title and line on the
    left, the picture on the right; on phones the picture above the text). As you scroll, the slide in the window
    moves up and out while the next comes up from below; each rests for a while before the next comes (the same
    staircase as the Use Cases deck). Scroll-linked and reversible, no extra spring on top of Lenis.
  - On every screen tall enough (PIN) the section is a runway with a sticky one-screen stage; a bar glides to its
    slide through Lenis.

  Short windows (phones on their side, desktop windows under 720px): the slides take turns on their own while the
  section is on screen, DWELL ms each, the window gliding up to the next; a bar picks one and stops the turns,
  hovering or focusing holds them. Reduced motion: no turns, the bars still pick, the window jumps. Every reason is in
  the markup for screen readers as one list; the moving view is hidden from them.
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const DWELL = 5200;
const REASONS = REALITY.items;
const COUNT = REASONS.length;
const pad = (i: number) => String(i + 1).padStart(2, "0");
// Keep in step with v11.css (.v11-reasons) and the Versprechen's PIN.
const PIN = "(min-width: 1024px) and (min-height: 720px), (max-width: 1023px) and (min-height: 600px)";
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (t: number) => t * t * (3 - 2 * t);
/** Each slide rests for 40% of its stretch of the scroll, then the next comes up (as the Use Cases deck). */
function staircase(k: number) {
  const i = Math.floor(k);
  return i + smoothstep(clamp((k - i - 0.3) / 0.4, 0, 1));
}
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function ReasonsSection() {
  const root = useRef<HTMLElement>(null);
  // 0 when the stage pins (section top at the screen top), 1 when it lets go (section bottom at the screen bottom).
  const progress = useSectionProgress(root, ["start start", "end end"]);
  const pinnedValue = useMotionValue(0);
  const timed = useMotionValue(0);
  // Where the slides stand: on the scroll where the stage pins, else on their own time.
  const deck = useTransform(() => (pinnedValue.get() ? staircase(clamp(progress.get() * COUNT - 0.5, 0, COUNT - 1)) : timed.get()));

  // Live while the section is on screen and the tab is visible.
  const [onScreen, setOnScreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.3 });
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
  }, [pinnedValue]);
  const live = onScreen && visible;

  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0); // a new number restarts the running bar
  const [manual, setManual] = useState(false);
  const [held, setHeld] = useState(false);

  // Held: the current slide follows the scroll. Else the slides glide to the chosen one.
  useMotionValueEvent(deck, "change", (k) => {
    if (pinned) setActive(clamp(Math.round(k), 0, COUNT - 1));
  });
  useEffect(() => {
    if (pinned) return undefined;
    const controls = animate(timed, active, { duration: reduced ? 0 : 0.9, ease: EASE });
    return () => controls.stop();
  }, [pinned, active, reduced, timed]);

  const pick = (i: number) => {
    const el = root.current;
    if (pinned && el) {
      // Glide to the middle of that slide's rest on the runway (through Lenis when it runs).
      const top = el.getBoundingClientRect().top + window.scrollY;
      const travel = el.offsetHeight - window.innerHeight;
      const goal = top + ((i + 0.5) / COUNT) * travel;
      const lenis = getLenis();
      if (lenis) {
        const steps = Math.abs(goal - window.scrollY) / (travel / COUNT);
        lenis.scrollTo(goal, { duration: Math.min(1.1, 0.5 + steps * 0.12), easing: easeInOut, lock: true });
      } else window.scrollTo({ top: goal, behavior: "smooth" });
      return;
    }
    setManual(true);
    setActive(i);
    setRun((r) => r + 1);
  };
  const advance = () => {
    setActive((a) => (a + 1) % COUNT);
    setRun((r) => r + 1);
  };
  const running = !manual && !reduced;
  const paused = !live || held;

  const hold = pinned
    ? {}
    : {
        onPointerEnter: () => setHeld(true),
        onPointerLeave: () => setHeld(false),
        onFocus: () => setHeld(true),
        onBlur: () => setHeld(false),
      };

  return (
    <section ref={root} id="realitaet" aria-label={`${REALITY.title} ${REALITY.accent}`} className="v11-reasons relative overflow-x-clip py-16 md:py-24">
      {/* The stage: held for the length of the runway on tall enough screens (v11.css). */}
      <div className="v11-reasons-stage relative">
        <Container className="v11-reasons-inner relative flex w-full flex-col">
          <div className="mx-auto w-full max-w-[860px] text-center">
            <Heading title={REALITY.title} accent={REALITY.accent} className="mx-auto text-balance" />
          </div>

          <div className="v11-reasons-bars mx-auto mt-6 w-full max-w-[460px] md:mt-8" {...hold}>
            {pinned ? (
              <ScrollBars progress={progress} active={active} onPick={pick} />
            ) : (
              <Bars active={active} run={run} running={running} paused={paused} onPick={pick} onDone={advance} />
            )}
          </div>

          {/* The window: one slide at a time; the next comes up from below as the current one moves up and out. */}
          <div aria-hidden className="v11-reasons-window relative mt-6 md:mt-10" {...hold}>
            {REASONS.map((r, i) => (
              <Slide key={r.title} index={i} deck={deck} title={r.title} text={r.text} img={r.img} />
            ))}
          </div>
        </Container>
      </div>

      {/* All six reasons for screen readers, in order; the moving view above is hidden from them. */}
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

/** One reason: its number, title and line beside (desktop) or under (phones) its picture, placed by the deck. */
function Slide({ index, deck, title, text, img }: { index: number; deck: MotionValue<number>; title: string; text: string; img: string }) {
  const y = useTransform(() => `${((index - deck.get()) * 100).toFixed(3)}%`);
  const opacity = useTransform(() => clamp(1 - Math.abs(index - deck.get()) * 0.85, 0, 1));
  const visibility = useTransform(() => (Math.abs(index - deck.get()) < 1.2 ? "visible" : "hidden"));
  return (
    <motion.div style={{ y, opacity, visibility }} className="v11-slide absolute inset-0 grid md:grid-cols-12 md:items-center md:gap-x-10">
      <div className="v11-slide-photo relative overflow-hidden rounded-panel md:order-2 md:col-span-7 md:h-full">
        <Image src={img} alt="" fill sizes="(min-width: 768px) 56vw, 92vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(6_21_54/0.5)_0%,rgb(6_21_54/0)_45%),linear-gradient(0deg,rgb(0_75_160/0.2),rgb(0_75_160/0.2))]" />
      </div>
      <div className="v11-slide-text md:order-1 md:col-span-5">
        <p className="num text-[15px] text-sky">{pad(index)}</p>
        <h3 className="mt-2 text-[21px] leading-[1.2] font-medium tracking-[-0.015em] text-balance text-white md:text-[30px] lg:text-[34px]">{title}</h3>
        <p className="mt-2 max-w-[460px] text-[15px] leading-[1.5] text-pretty text-white/70 md:mt-4 md:text-[18px] md:leading-[1.6]">{text}</p>
      </div>
    </motion.div>
  );
}

/** Held: one bar per reason, each filling over its own stretch of the scroll. Each glides to its slide. */
function ScrollBars({ progress, active, onPick }: { progress: MotionValue<number>; active: number; onPick: (i: number) => void }) {
  return (
    <div className="-my-3 flex gap-1.5">
      {REASONS.map((r, i) => (
        <ScrollBar key={r.title} index={i} progress={progress} current={i === active} onPick={onPick} />
      ))}
    </div>
  );
}

function ScrollBar({ index, progress, current, onPick }: { index: number; progress: MotionValue<number>; current: boolean; onPick: (i: number) => void }) {
  const fill = useTransform(() => Math.min(1, Math.max(0, progress.get() * COUNT - index)));
  return (
    <button
      type="button"
      onClick={() => onPick(index)}
      aria-label={`Grund ${index + 1} von ${COUNT} zeigen`}
      aria-current={current ? "step" : undefined}
      className="group relative h-11 min-w-0 flex-1 cursor-pointer rounded-[6px]"
    >
      <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/14 transition-colors duration-200 group-hover:bg-white/28">
        <motion.span style={{ scaleX: fill }} className="absolute inset-0 origin-left rounded-full bg-sky" />
      </span>
    </button>
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
                style={{ "--v11-dwell": `${DWELL}ms` } as CSSProperties}
                className="v11-bar-fill absolute inset-0 rounded-full bg-sky"
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
