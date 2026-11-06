"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CaseCard, caseCardId } from "@/components/sections/cases-panel";
import { Container, Heading, Section } from "@/components/system/primitives";
import { CASES } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Fallstudien (v5, 2026-11-06), where the navigation's "Use Cases" lands. The developer found v4's pinned sideways
  panels "not good at all"; this follows the success stories in the developer's reference instead:
  - Matte case cards (CaseCard) in a native snap scroller: two side by side from 1280px, one with the next peeking
    below that.
  - Above them, the six areas (the original's six tabs) as the navigation: the cards in view are marked (white, with
    a sky dot), and an area brings its card into view.
  - Arrows beside the areas from lg, under the cards on phones and tablets (the client likes arrows); each moves one
    card and dims at the end.
  No pinning and no scroll hijack: the page scrolls normally, and the cards move only when the reader asks (arrows,
  areas, swipe, trackpad, keyboard). The cards are focusable, so Tab walks through them and the scroller follows.
  The markup never depends on the window: which cards are in view is measured after mount and on every scroll.
*/

const ITEMS = CASES.items;
const HEADING_ID = "use-cases-heading";
const TRACK_ID = "use-cases-track";

type View = { first: number; last: number; atStart: boolean; atEnd: boolean };

const sameView = (a: View, b: View) => a.first === b.first && a.last === b.last && a.atStart === b.atStart && a.atEnd === b.atEnd;

export function CasesSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const [view, setView] = useState<View>({ first: 0, last: 0, atStart: true, atEnd: false });

  // Which cards are fully in view (between the track's padding), and whether the scroller is at either end.
  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;
    const box = scroller.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    let first = -1;
    let last = -1;
    Array.from(track.children).forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      if (rect.left >= box.left + pad - 2 && rect.right <= box.right - pad + 2) {
        if (first < 0) first = index;
        last = index;
      }
    });
    // A window narrower than one card: the card nearest the start counts as the one in view.
    if (first < 0) {
      const step = cardStep(track);
      first = last = step > 0 ? Math.min(ITEMS.length - 1, Math.round(scroller.scrollLeft / step)) : 0;
    }
    const max = scroller.scrollWidth - scroller.clientWidth;
    const next = { first, last, atStart: scroller.scrollLeft <= 2, atEnd: scroller.scrollLeft >= max - 2 };
    setView((current) => (sameView(current, next) ? current : next));
  }, []);

  // Measured in an animation frame: once after mount, then on every scroll of the cards and every resize; and once
  // more, directly, when a scroll ends (so the marks are exact even where frames are slowed).
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };
    schedule();
    scroller.addEventListener("scroll", schedule, { passive: true });
    scroller.addEventListener("scrollend", measure);
    const observer = new ResizeObserver(schedule);
    observer.observe(scroller);
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
      scroller.removeEventListener("scrollend", measure);
      observer.disconnect();
    };
  }, [measure]);

  const behavior = (): ScrollBehavior => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth");

  // One card back or forward.
  const move = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (scroller && track) scroller.scrollBy({ left: direction * cardStep(track), behavior: behavior() });
  };

  // Card `index` to the content edge (the track's padding and the scroll padding cancel out: card i sits at i steps).
  const goTo = (index: number) => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    scroller.scrollTo({ left: Math.min(index * cardStep(track), max), behavior: behavior() });
  };

  const arrows = (
    <>
      <Arrow direction={-1} disabled={view.atStart} onClick={() => move(-1)} />
      <Arrow direction={1} disabled={view.atEnd} onClick={() => move(1)} />
    </>
  );

  return (
    <Section id="use-cases">
      <Container>
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_400px] xl:items-end xl:gap-x-16">
          <div id={HEADING_ID}>
            {/* The continuation (the white-to-sky phrase) gets its own line. */}
            <Heading
              title={CASES.title}
              accent={CASES.accent}
              className="max-w-[760px] text-[2.25rem] md:text-[2.75rem] xl:text-[3rem] [&>.accent]:block"
            />
          </div>
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[580px] xl:mt-0">
            {CASES.text}
          </p>
        </div>

        <div data-reveal="up" data-rd="2" className="mt-10 flex items-center justify-between gap-6 md:mt-14">
          <CaseNav first={view.first} last={view.last} onSelect={goTo} />
          <div className="hidden shrink-0 gap-3 lg:flex">{arrows}</div>
        </div>

        <div>
          {/*
            A full-bleed snap scroller (no scrollbar) and a size container for the card widths. Its padding keeps the
            first card on the content edge and leaves room for the focus ring and the cards' shadow.
          */}
          <div
            ref={scrollerRef}
            id={TRACK_ID}
            role="region"
            aria-roledescription="Karussell"
            aria-labelledby={HEADING_ID}
            data-lenis-prevent-horizontal
            className="@container -mx-5 mt-4 snap-x snap-mandatory scroll-px-5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:-mx-8 md:scroll-px-8 [&::-webkit-scrollbar]:hidden"
          >
            <ol
              ref={trackRef}
              data-reveal-group
              data-rd="3"
              role="list"
              className="flex w-max items-start gap-4 px-5 pt-2 pb-10 md:gap-6 md:px-8 xl:items-stretch"
            >
              {ITEMS.map((item, index) => (
                <CaseCard key={item.name} item={item} index={index} />
              ))}
            </ol>
          </div>
        </div>

        <div className="-mt-3 flex justify-center gap-3 lg:hidden">{arrows}</div>
      </Container>
    </Section>
  );
}

/** From one card's left edge to the next (card plus gap), in px. */
function cardStep(track: HTMLElement) {
  const [a, b] = Array.from(track.children);
  return a && b ? b.getBoundingClientRect().left - a.getBoundingClientRect().left : 0;
}

/*
  The six areas as text buttons (44px tall). The cards in view are white with a sky dot before them, the others at
  55% white (about 6.4:1 on the page). The dot hangs in the button's left padding, and the row is pulled 16px left,
  so the words line up with the cards' edge and nothing shifts when the dots move.
*/
function CaseNav({ first, last, onSelect }: { first: number; last: number; onSelect: (index: number) => void }) {
  return (
    <div className="-ml-4 flex flex-wrap">
      {ITEMS.map((item, index) => {
        const on = index >= first && index <= last;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onSelect(index)}
            aria-controls={caseCardId(index)}
            aria-current={index === first ? "true" : undefined}
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

/** A 52px arrow with slightly curved corners and a hairline border; dimmed at the end of the cards. */
function Arrow({ direction, disabled, onClick }: { direction: 1 | -1; disabled: boolean; onClick: () => void }) {
  const Icon = direction === 1 ? ArrowRight : ArrowLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-controls={TRACK_ID}
      aria-label={direction === 1 ? "Nächste Fallstudie" : "Vorherige Fallstudie"}
      className="group grid size-[52px] shrink-0 cursor-pointer place-items-center rounded-button border border-white/15 text-white transition-[border-color,background-color,opacity] duration-200 ease-out enabled:hover:border-white/40 enabled:hover:bg-white/[0.04] enabled:active:scale-[0.96] disabled:cursor-default disabled:opacity-35"
    >
      <Icon
        aria-hidden
        strokeWidth={1.5}
        className={cn(
          "size-5 transition-transform duration-200 ease-out",
          !disabled && (direction === 1 ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5")
        )}
      />
    </button>
  );
}
