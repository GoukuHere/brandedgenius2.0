"use client";

import { AnimatePresence, motion, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Heading } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { useCopy, useWords } from "@/i18n/client";
import { cn } from "@/lib/utils";

/*
  v11 Die Realität: v2's Problem chapter (the client: "please take also that section here, do it like this, I like
  that style") in place of v1's reasons list ("not really good, the other one is better"), as a normal section of
  v1's page in normal scrolling ("not this scrolling by scrolling"): the Realität headline (v1's Problem headline is
  already right above it), the six reasons one at a time with a row of bars, and their photos filling the right of
  the section and dissolving into the page towards the text. Phones: headline, photo in a frame, bars, reason.

  Round 4 (the client's Loom of 2026-11-12, at 0:46): "before it was like kind of slider animation ... step by step
  before it's going to the next section ... there is no slider effect anymore. So if you can put it inside, that will
  be great." That was v2's chapter: the panel held while the six reasons stepped with the scroll. So, on every screen
  tall enough (PIN, the same as the Versprechen's), the section is a runway with a sticky one-screen stage: the photo
  and the text hold, each reason has its own stretch of the scroll, the bars fill with it (scroll-linked and
  reversible), and after the sixth the page moves on. A bar scrolls to its reason.

  Round 5 (2026-11-21): copy by language (DE/EN). A centred heading with the slides moving up through a window
  (Roman's Loom of 2026-11-18) was built and taken back on the developer's word ("it was good with the previous
  scrolling effect"): this is the previous section, with the round-5 lines.

  Short windows (phones on their side, desktop windows under 720px): the reasons take turns on their own while the
  section is on screen, DWELL ms each, as before; a bar picks one and stops the turns, hovering or focusing holds
  them. Reduced motion: no turns, the bars still pick. Every reason is in the markup for screen readers as one list.
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const DWELL = 5200;
const pad = (i: number) => String(i + 1).padStart(2, "0");
// Keep in step with v11.css (.v11-reasons) and the Versprechen's PIN.
const PIN = "(min-width: 1024px) and (min-height: 720px), (max-width: 1023px) and (min-height: 600px)";
const stepAt = (progress: number, count: number) => Math.min(count - 1, Math.max(0, Math.floor(progress * count)));

/* The section's own words (round 5, DE/EN); the reasons come from the page's copy. */
const WORDS = {
  de: { pick: (n: number, of: number) => `Grund ${n} von ${of} zeigen` },
  en: { pick: (n: number, of: number) => `Show reason ${n} of ${of}` },
};
type Reason = { title: string; text: string; img: string };
type Pick = (n: number, of: number) => string;

export function ReasonsSection() {
  const { REALITY } = useCopy().site;
  const REASONS: Reason[] = REALITY.items;
  const COUNT = REASONS.length;
  const words = useWords(WORDS);
  const root = useRef<HTMLElement>(null);
  // 0 when the stage pins (section top at the screen top), 1 when it lets go (section bottom at the screen bottom).
  const progress = useSectionProgress(root, ["start start", "end end"]);
  const smooth = useSpring(progress, { stiffness: 120, damping: 28, mass: 0.6, skipInitialAnimation: true });

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
  }, []);
  const live = onScreen && visible;

  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0); // a new number restarts the running bar
  const [manual, setManual] = useState(false);
  const [held, setHeld] = useState(false);
  const reason = REASONS[active];

  // Pinned: the reason follows the scroll. On a switch into the pinned layout it takes the scroll's reason at once.
  useMotionValueEvent(smooth, "change", (p) => {
    if (pinned) setActive(stepAt(p, COUNT));
  });
  const [wasPinned, setWasPinned] = useState(pinned);
  if (wasPinned !== pinned) {
    setWasPinned(pinned);
    if (pinned) setActive(stepAt(smooth.get(), COUNT));
  }

  const pick = (i: number) => {
    const el = root.current;
    if (pinned && el) {
      // Scroll to the middle of that reason's stretch of the runway.
      const top = el.getBoundingClientRect().top + window.scrollY;
      const travel = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((i + 0.5) / COUNT) * travel, behavior: reduced ? "auto" : "smooth" });
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
  const running = !manual;
  const paused = !live || held;

  const hold = pinned
    ? {}
    : {
        onPointerEnter: () => setHeld(true),
        onPointerLeave: () => setHeld(false),
        onFocus: () => setHeld(true),
        onBlur: () => setHeld(false),
      };
  const bars = pinned ? (
    <ScrollBars reasons={REASONS} label={words.pick} progress={smooth} active={active} onPick={pick} />
  ) : (
    <Bars reasons={REASONS} label={words.pick} active={active} run={run} running={running} paused={paused} onPick={pick} onDone={advance} />
  );

  return (
    <section ref={root} id="realitaet" aria-label={`${REALITY.title} ${REALITY.accent}`} className="v11-reasons relative overflow-x-clip py-16 md:py-24">
      {/* The stage: held for the length of the runway on tall enough screens (v11.css), its content centred. */}
      <div className="v11-reasons-stage relative">
        {/* Desktop: the photos fill the right of the stage and dissolve into the page towards the text. */}
        <div aria-hidden className="v11-photo-fade absolute inset-y-0 right-0 hidden w-[56%] overflow-hidden md:block">
          <ReasonPhotos reasons={REASONS} active={active} sizes="56vw" />
        </div>

        <Container className="relative w-full">
          <div className="md:w-[44%] md:pr-10">
            <Heading title={REALITY.title} accent={REALITY.accent} />

            {/* Phones: the photo in a frame between the heading and the reason. */}
            <div aria-hidden className="v11-reasons-frame relative mt-8 aspect-[4/3] overflow-hidden rounded-panel shadow-[inset_0_0_0_1px_rgb(255_255_255/0.09)] md:hidden">
              <ReasonPhotos reasons={REASONS} active={active} sizes="92vw" />
            </div>

            <div className="v11-reasons-steps mt-8" {...hold}>
              {bars}
              <ReasonText index={active} title={reason.title} text={reason.text} />
            </div>
          </div>
        </Container>
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

/** Held: one bar per reason, each filling over its own stretch of the scroll. Each scrolls to its reason. */
function ScrollBars({ reasons, label, progress, active, onPick }: { reasons: Reason[]; label: Pick; progress: MotionValue<number>; active: number; onPick: (i: number) => void }) {
  return (
    <div className="-my-3 flex gap-1.5">
      {reasons.map((r, i) => (
        <ScrollBar key={r.title} index={i} count={reasons.length} label={label} progress={progress} current={i === active} onPick={onPick} />
      ))}
    </div>
  );
}

function ScrollBar({
  index,
  count,
  label,
  progress,
  current,
  onPick,
}: {
  index: number;
  count: number;
  label: Pick;
  progress: MotionValue<number>;
  current: boolean;
  onPick: (i: number) => void;
}) {
  const fill = useTransform(() => Math.min(1, Math.max(0, progress.get() * count - index)));
  return (
    <button
      type="button"
      onClick={() => onPick(index)}
      aria-label={label(index + 1, count)}
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
  reasons,
  label,
  active,
  run,
  running,
  paused,
  onPick,
  onDone,
}: {
  reasons: Reason[];
  label: Pick;
  active: number;
  run: number;
  running: boolean;
  paused: boolean;
  onPick: (i: number) => void;
  onDone: () => void;
}) {
  return (
    <div className="-my-3 flex gap-1.5">
      {reasons.map((r, i) => {
        const state = i < active ? "done" : i === active ? (running ? "running" : "done") : "idle";
        return (
          <button
            key={r.title}
            type="button"
            onClick={() => onPick(i)}
            aria-label={label(i + 1, reasons.length)}
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

/** The six reasons' photos, one shown at a time, under a royal grade so each sits in the panel's light (v2's). */
function ReasonPhotos({ reasons, active, sizes }: { reasons: Reason[]; active: number; sizes: string }) {
  return (
    <>
      {reasons.map((r, i) => (
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
