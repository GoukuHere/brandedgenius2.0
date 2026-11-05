"use client";

import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent } from "react";
import { CasePanel, casePanelId } from "@/components/sections/cases-panel";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { CASES } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Fallstudien (v4), where the navigation's "Use Cases" lands. The six cases are wide glass panels in one row.

  Desktop windows at least 1280px wide and 720px tall: a pinned horizontal scroll. A runway as tall as the track's
  travel plus one screen holds a sticky, one-screen stage; while the stage is pinned, scrolling down moves the track
  left one pixel per pixel (scroll progress "start start" to "end end", a light spring, transform only), until the
  sixth panel stands where the first began. The panel at the stage's left content edge is at full strength, the
  others rest at 0.55 opacity and 0.96 scale, eased by their distance from that edge. Under the track, the six areas
  (the original's six tabs) jump the window to a case, and a 1px line shows how far the reader is.

  Everything else (phones, tablets, short or narrower desktop windows): no pin. The same panels sit in a horizontal
  snap scroller with the six areas above it, which scroll the scroller, never the window.

  The pin is pure CSS (the `xl:[@media(min-height:720px)]:` classes), so the server HTML is already right; the
  runway's height is a CSS formula of the panel width. Effects only measure the track (a ResizeObserver) and read
  the media queries, and they write motion values, never the markup. Until then, and outside the pinned stage, the
  track does not move and every panel is at full strength. Reduced motion: the track still follows the scroll (it
  is direct manipulation) but without the spring, and every panel stays at full strength.

  Keyboard: every panel is focusable and stays in the DOM. Tab or the arrow keys bring the focused case to the front
  (the window in the pinned stage, the scroller elsewhere), and the area buttons are ordinary buttons.
*/

const ITEMS = CASES.items;
const COUNT = ITEMS.length;
const HEADING_ID = "use-cases-heading";

/** Must match the `xl:[@media(min-height:720px)]:` classes below. */
const PIN_QUERY = "(min-width: 80rem) and (min-height: 720px)";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

/** The pinned gap between panels in px (the track's pinned `gap-10`); the runway repeats it. */
const GAP = 40;

/**
 * The pinned runway: the track's travel (one panel width plus the gap, once per case after the first) plus the
 * stage's own screen, so one pixel of scroll moves the track one pixel. `--case-w` is set per mode on the region.
 */
const RUNWAY = { "--cases-runway": `calc(${COUNT - 1} * (var(--case-w) + ${GAP}px) + 100svh)` } as CSSProperties;

/** Light: follows the scroll within about a quarter of a second, no overshoot. */
const SPRING = { stiffness: 400, damping: 30, mass: 0.5, restDelta: 0.5, skipInitialAnimation: true };

export function CasesSection() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  /** Mirrors `current` for the handlers and the resize logic. */
  const currentRef = useRef(0);
  /** The unpinned scroller's distance from one panel to the next, measured with the rest. */
  const scrollerStep = useRef(0);
  /** True while an arrow key moves the focus, so the focus handler leaves the scrolling to the key. */
  const steering = useRef(false);
  const [current, setCurrent] = useState(0);

  // Set after mount, so the server markup never depends on them: reduced motion (1 or 0), the slot (one panel plus
  // the gap) and the track's travel, both 0 unless the stage is pinned.
  const reduced = useMotionValue(0);
  const slot = useMotionValue(0);
  const travel = useMotionValue(0);

  const progress = useSectionProgress(runwayRef, ["start start", "end end"]);
  const target = useTransform(() => -progress.get() * travel.get());
  const smooth = useSpring(target, SPRING);
  // Whole pixels, so the panel at rest is never left on a half pixel.
  const x = useTransform(() => {
    const direct = target.get();
    const eased = smooth.get();
    return Math.round(reduced.get() ? direct : eased);
  });
  const fill = useTransform(() => {
    const offset = x.get();
    const total = travel.get();
    return total > 0 ? Math.min(1, Math.max(0, -offset / total)) : 0;
  });

  const show = useCallback((index: number) => {
    currentRef.current = index;
    setCurrent(index);
  }, []);

  // The case at the front, for the area buttons. Only a change of case re-renders, and the panels are memoised.
  useMotionValueEvent(x, "change", (offset) => {
    const step = slot.get();
    if (step <= 0) return;
    const index = Math.min(COUNT - 1, Math.max(0, Math.round(-offset / step)));
    if (index !== currentRef.current) show(index);
  });

  // Measure the track (the observer reports once on start and on every resize) and follow both media queries.
  useEffect(() => {
    const track = trackRef.current;
    const scroller = scrollerRef.current;
    if (!track || !scroller) return;
    const pin = window.matchMedia(PIN_QUERY);
    const motionless = window.matchMedia(REDUCE_QUERY);

    const measure = () => {
      const lefts = Array.from(track.children, (panel) => panel.getBoundingClientRect().left);
      const step = lefts.length > 1 ? lefts[1] - lefts[0] : 0;
      reduced.set(motionless.matches ? 1 : 0);
      if (pin.matches) {
        slot.set(step);
        travel.set(lefts[lefts.length - 1] - lefts[0]);
        return;
      }
      const wasPinned = slot.get() > 0;
      slot.set(0);
      travel.set(0);
      scrollerStep.current = step;
      // The window just stopped pinning (made narrower or shorter): keep the reader on the same case.
      if (wasPinned) scroller.scrollLeft = currentRef.current * step;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    pin.addEventListener("change", measure);
    motionless.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      pin.removeEventListener("change", measure);
      motionless.removeEventListener("change", measure);
    };
  }, [reduced, slot, travel]);

  // Unpinned: the case snapped to the scroller's start is the current one (the last one once the scroller is at its end).
  const onScrollerScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    const step = scrollerStep.current;
    if (!scroller || step <= 0 || slot.get() > 0) return;
    const end = scroller.scrollWidth - scroller.clientWidth;
    const index = scroller.scrollLeft >= end - 2 ? COUNT - 1 : Math.min(COUNT - 1, Math.max(0, Math.round(scroller.scrollLeft / step)));
    if (index !== currentRef.current) show(index);
  }, [show, slot]);

  /**
   * Brings case `index` to the front. Pinned: scrolls the window to that case's point on the runway. Unpinned:
   * scrolls the scroller (the track's padding and the scroller's scroll padding cancel out, so case i sits at i steps).
   */
  const goTo = useCallback(
    (index: number, behavior?: ScrollBehavior) => {
      const how = behavior ?? (window.matchMedia(REDUCE_QUERY).matches ? "instant" : "smooth");
      const runway = runwayRef.current;
      const step = slot.get();
      const total = travel.get();
      if (runway && step > 0 && total > 0) {
        const top = runway.getBoundingClientRect().top + window.scrollY;
        const range = runway.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + ((index * step) / total) * range, behavior: how });
        return;
      }
      scrollerRef.current?.scrollTo({ left: index * scrollerStep.current, behavior: how });
    },
    [slot, travel]
  );

  // A panel reached with the keyboard (Tab) comes to the front. Mouse focus never scrolls, so clicks land where aimed.
  const onFocusPanel = useCallback(
    (index: number, event: FocusEvent<HTMLElement>) => {
      if (steering.current || event.target !== event.currentTarget || !event.currentTarget.matches(":focus-visible")) return;
      goTo(index, "instant");
    },
    [goTo]
  );

  // Left and Right on a focused panel move to the neighbouring case (scrolled like a button press) and focus it.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const panel = (event.target as HTMLElement).closest<HTMLElement>("[data-case]");
    if (!panel) return;
    event.preventDefault();
    const index = Number(panel.dataset.case);
    const next = Math.min(COUNT - 1, Math.max(0, index + (event.key === "ArrowRight" ? 1 : -1)));
    if (next === index) return;
    goTo(next);
    steering.current = true;
    document.getElementById(casePanelId(next))?.focus({ preventScroll: true });
    steering.current = false;
  }

  return (
    <Section id="use-cases" className="xl:[@media(min-height:720px)]:pb-0">
      <Container>
        <Reveal y={12} className="xl:grid xl:grid-cols-[minmax(0,1fr)_400px] xl:items-end xl:gap-x-16">
          <div id={HEADING_ID}>
            {/* The outlined continuation gets its own line; 36px on phones keeps its 1.25px stroke legible. */}
            <Heading
              variant="outline"
              title={CASES.title}
              accent={CASES.accent}
              className="max-w-[760px] text-[2.25rem] md:text-[2.75rem] xl:text-[3rem] [&>.outline-text]:block"
            />
          </div>
          <p className="t-lead mt-6 max-w-[580px] xl:mt-0">{CASES.text}</p>
        </Reveal>
      </Container>

      <div
        role="region"
        aria-roledescription="Karussell"
        aria-labelledby={HEADING_ID}
        className="mt-12 [--case-w:88vw] md:mt-16 lg:[--case-w:min(1120px,88vw)] xl:[@media(min-height:720px)]:mt-0 xl:[@media(min-height:720px)]:[--case-w:min(1120px,80vw)]"
      >
        {/* Unpinned: the areas above the scroller. */}
        <Container className="xl:[@media(min-height:720px)]:hidden">
          <CaseNav current={current} onSelect={goTo} className="flex-wrap" />
        </Container>

        <div ref={runwayRef} style={RUNWAY} className="relative xl:[@media(min-height:720px)]:h-[var(--cases-runway)]">
          {/* The stage. Pinned, it is one screen tall and clips the track at the window's edges; 84px clear the fixed header. */}
          <div className="xl:[@media(min-height:720px)]:sticky xl:[@media(min-height:720px)]:top-0 xl:[@media(min-height:720px)]:flex xl:[@media(min-height:720px)]:h-svh xl:[@media(min-height:720px)]:flex-col xl:[@media(min-height:720px)]:justify-center xl:[@media(min-height:720px)]:overflow-x-clip xl:[@media(min-height:720px)]:pt-[84px] xl:[@media(min-height:720px)]:pb-5">
            <Container>
              {/*
                Unpinned: a full-bleed snap scroller (no scrollbar); its padding keeps the first panel on the content edge
                and leaves room for the focus ring and the glass shadow. Pinned: a plain box, the track starts on the
                container's left edge and overflows to the right.
              */}
              <div
                ref={scrollerRef}
                onScroll={onScrollerScroll}
                onKeyDown={onKeyDown}
                className="-mx-5 mt-6 snap-x snap-mandatory scroll-px-5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:-mx-8 md:scroll-px-8 [&::-webkit-scrollbar]:hidden xl:[@media(min-height:720px)]:mx-0 xl:[@media(min-height:720px)]:mt-0 xl:[@media(min-height:720px)]:snap-none xl:[@media(min-height:720px)]:overflow-visible"
              >
                <motion.ol
                  ref={trackRef}
                  role="list"
                  style={{ x }}
                  className="relative flex w-max gap-4 px-5 pt-2 pb-10 md:gap-6 md:px-8 xl:[@media(min-height:720px)]:gap-10 xl:[@media(min-height:720px)]:p-0 xl:[@media(min-height:720px)]:will-change-transform"
                >
                  {ITEMS.map((item, index) => (
                    <CasePanel key={item.name} item={item} index={index} x={x} slot={slot} reduced={reduced} onFocusPanel={onFocusPanel} />
                  ))}
                </motion.ol>
              </div>

              {/* Pinned: the areas under the track, then the progress line to the content's right edge. */}
              <div className="mt-5 hidden items-center gap-8 xl:[@media(min-height:720px)]:flex">
                <CaseNav current={current} onSelect={goTo} />
                <Progress fill={fill} />
              </div>
            </Container>
          </div>
        </div>
      </div>
    </Section>
  );
}

/*
  The six areas as text buttons (44px tall). The current one is white with a sky dot before it, the others at 55%
  white (about 6.4:1 on the page). The dot hangs in the button's left padding, and the row is pulled 16px left, so
  the words line up with the panels' edge and nothing shifts when the dot moves.
*/
function CaseNav({ current, onSelect, className }: { current: number; onSelect: (index: number) => void; className?: string }) {
  return (
    <div className={cn("-ml-4 flex", className)}>
      {ITEMS.map((item, index) => {
        const on = index === current;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onSelect(index)}
            aria-controls={casePanelId(index)}
            aria-current={on ? "true" : undefined}
            aria-label={item.name}
            className="group relative min-h-11 shrink-0 cursor-pointer rounded-button pr-2 pl-4 text-[15px] leading-5 whitespace-nowrap"
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 left-1 size-1.5 -translate-y-1/2 rounded-full bg-sky transition-[opacity,scale] duration-200 ease-out",
                on ? "opacity-100" : "scale-50 opacity-0"
              )}
            />
            <span className={cn("transition-colors duration-200 ease-out", on ? "text-white" : "text-white/55 group-hover:text-white/85")}>
              {item.area}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** A 1px line whose sky fill grows with the track (scaleX from the left, transform only). */
function Progress({ fill }: { fill: MotionValue<number> }) {
  return (
    <div aria-hidden className="relative h-px min-w-16 flex-1 bg-white/10">
      <motion.div style={{ scaleX: fill }} className="absolute inset-0 origin-left bg-sky" />
    </div>
  );
}
