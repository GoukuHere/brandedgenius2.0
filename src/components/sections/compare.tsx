"use client";

import { Check, X } from "lucide-react";
import { useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { Compare } from "@/components/ui/compare";
import { COMPARE } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Vorher / Nachher (v4). One wide panel split by a divider: left of it the classic way (a flat dark surface, grey
  type, crosses), right of it the Branded Genius way (the section's one lit glass object, white type, sky checks).
  The five points of both ways share the same rows (the layers share one grid through subgrid), so each point
  stands level with its counterpart. The divider never cuts through words; only the panel's edges clip a list as
  it slides in or out.

  - lg and up: each list takes at most 46% of the panel's inner width. The classic list stays at the left. The
    Branded Genius list is anchored to the divider (its left edge 40px right of it) and slides in from the panel's
    right edge. The scroll sweep runs from 100 to 50 and ends with both ways side by side, the divider in the
    middle. The reader can still drag from 0 to 100: below 50 the Branded Genius way covers the classic one, above
    50 it slides back out.
  - below lg: both lists are full width and both are anchored (a push): the classic list's right edge and the
    Branded Genius list's left edge sit about 24px either side of the divider. The sweep runs from 100 to 0 and
    ends on the Branded Genius way.

  The sweep is scrubbed by the scroll (smoothed by a spring) and reversible, while the panel crosses the middle of
  the screen. The moment the reader drags, taps or uses the keys, the divider is theirs and stops following the
  scroll. Reduced motion: no sweep; the divider rests where the sweep ends (50 on lg, 0 below). Both lists are
  always in the DOM.
*/

type Way = typeof COMPARE.classic;
type Kind = "classic" | "ours";
type Mode = "rest" | "sweep" | "reader";

const CLASSIC: Way = COMPARE.classic;
const OURS: Way = COMPARE.ours;
// The word between the two titles, as on the original ("VS").
const VS = COMPARE.vs;
// The five points of a way, then its result line.
const ROWS = CLASSIC.points.length + 1;

/* The sweep runs while the panel moves from its top at 70% of the screen to its bottom at 45%. */
const OFFSET: Parameters<typeof useSectionProgress>[1] = ["start 0.7", "end 0.45"];

/* Where the sweep ends, and where the divider rests for reduced motion: side by side on lg, the Branded Genius way below. */
const restAt = (wide: boolean) => (wide ? 50 : 0);
const sweepAt = (progress: number, wide: boolean) => 100 - (100 - restAt(wide)) * Math.min(1, Math.max(0, progress));

/*
  lg and up, read through useSyncExternalStore so hydration stays exact: the server renders for wide screens, and
  a narrower screen switches right after hydration (that only changes how the classic list moves).
*/
const WIDE = "(min-width: 1024px)";
function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isWide = () => window.matchMedia(WIDE).matches;
const isWideOnServer = () => true;

/*
  Horizontal padding lives on the content, not on the layers: an anchored list moves by the divider's share of its
  own (full panel) width. The titles above the panel line up with the lists inside it: the classic title over the
  classic list, the Branded Genius title over its list where the sweep leaves it on lg (40px right of the middle).
*/
const TITLES_X = "px-5 sm:px-6 lg:px-12";
const CLASSIC_X = "px-5 sm:px-6 lg:px-12";
const OURS_X = "px-5 sm:px-6 lg:pr-12 lg:pl-10";
/* On lg each list (points and result) takes at most 46% of the panel's inner width, so the two fit side by side. */
const COLUMN = "lg:max-w-[46%]";
const LAYER_Y = "py-2 sm:py-3 lg:py-4";

export function CompareSection() {
  const classicId = useId();
  const oursId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const mode = useRef<Mode>("rest");
  const wide = useSyncExternalStore(subscribeWide, isWide, isWideOnServer);
  // Fully classic on the server and at hydration, where no word is cut on any layout; after mount the sweep (or,
  // for reduced motion, the rest position) takes over.
  const position = useMotionValue(100);

  const progress = useSectionProgress(panelRef, OFFSET);
  const smooth = useSpring(progress, { stiffness: 140, damping: 30, mass: 0.5, skipInitialAnimation: true });

  useMotionValueEvent(smooth, "change", (p) => {
    if (mode.current === "sweep") position.set(sweepAt(p, wide));
  });

  // After mount, and again whenever the layout switches at lg: follow the scroll, or rest for reduced motion.
  useEffect(() => {
    if (mode.current === "reader") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    mode.current = reduce ? "rest" : "sweep";
    position.set(reduce ? restAt(wide) : sweepAt(smooth.get(), wide));
  }, [wide, position, smooth]);

  // The reader moved the divider: from now on it is theirs.
  function takeOver() {
    mode.current = "reader";
  }

  return (
    // The Versprechen follows straight on (on the original it is the last row of this section), so the bottom
    // padding is shorter than the shared rhythm.
    <Section id="unterschied" className="pb-12 md:pb-16 lg:[@media(min-height:720px)]:pb-0">
      <Container>
        <Reveal>
          <Heading
            title={COMPARE.title}
            accent={COMPARE.accent}
            variant="outline"
            className="max-w-[920px] text-[length:clamp(2.125rem,1.25rem+2.2vw,3.25rem)]"
          />
          <p className="t-lead mt-6 max-w-[600px]">{COMPARE.text}</p>
        </Reveal>

        <Reveal className="mt-14 md:mt-20" y={32}>
          {/* Two halves with "VS" on the centre line, right above where the divider comes to rest on lg. */}
          <div className={cn("relative grid grid-cols-2 items-center", TITLES_X)}>
            <h3 id={classicId} className="pr-6 text-[17px] leading-snug text-silver sm:text-[20px]">
              {CLASSIC.title}
            </h3>
            <span aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[13px] leading-none text-silver">
              {VS}
            </span>
            <h3 id={oursId} className="pl-6 text-right text-[17px] leading-snug font-medium text-white sm:text-[20px] lg:pl-10 lg:text-left">
              <span aria-hidden className="mr-2.5 inline-block size-2 -translate-y-px rounded-full bg-sky align-middle" />
              {OURS.title}
            </h3>
          </div>

          <div ref={panelRef} className="mt-5 md:mt-6">
            <Compare
              value={position}
              onValueChange={takeOver}
              rows={ROWS}
              anchorAfter
              anchorBefore={!wide}
              label="Vergleich der zwei Wege"
              valueText={(v) => `${CLASSIC.title} ${v} %, ${OURS.title} ${100 - v} %`}
              className="rounded-[32px] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.85)] lg:min-h-[520px]"
              beforeClassName={cn("rounded-[32px] bg-[rgb(6_11_20)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)]", LAYER_Y)}
              afterClassName={cn(
                // Opaque under the glass sheen, so no classic word ever shows through.
                "glass glass-lit rounded-[32px] bg-panel bg-[linear-gradient(180deg,rgb(220_236_255/0.075)_0%,rgb(220_236_255/0.02)_42%,rgb(220_236_255/0.012)_100%)]",
                LAYER_Y
              )}
              before={<WayRows way={CLASSIC} kind="classic" labelledBy={classicId} />}
              after={<WayRows way={OURS} kind="ours" labelledBy={oursId} />}
            />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/**
 * One way's five points and its result, as rows of the panel's shared grid. Both ways render the same row
 * structure (padding, type size, hairlines), so each point sits level with its counterpart.
 */
function WayRows({ way, kind, labelledBy }: { way: Way; kind: Kind; labelledBy: string }) {
  const ours = kind === "ours";
  const Icon = ours ? Check : X;
  const hairline = ours ? "border-white/10" : "border-white/[0.07]";
  const padX = ours ? OURS_X : CLASSIC_X;

  return (
    <>
      <ul
        role="list"
        aria-labelledby={labelledBy}
        className={cn("grid grid-cols-[minmax(0,1fr)] grid-rows-subgrid", padX)}
        style={{ gridRow: `span ${way.points.length}` }}
      >
        {way.points.map((point, i) => (
          <li key={point} className={cn("flex items-center gap-3.5 py-4 sm:gap-4 sm:py-5", COLUMN, i > 0 && cn("border-t", hairline))}>
            <Icon aria-hidden strokeWidth={1.5} className={cn("size-[18px] shrink-0", ours ? "text-sky" : "text-silver")} />
            <span
              className={cn(
                "min-w-0 text-[20px] leading-[1.3] tracking-[-0.012em] text-pretty sm:text-[22px] md:text-[24px] xl:text-[26px]",
                ours ? "text-white" : "text-silver"
              )}
            >
              {point}
            </span>
          </li>
        ))}
      </ul>

      <div className={cn("grid grid-cols-[minmax(0,1fr)]", padX)}>
        <p className={cn("flex items-center border-t pt-5 pb-3 sm:pt-6", COLUMN, hairline)}>
          <span
            className={cn(
              "min-w-0 text-balance",
              ours
                ? "text-[18px] leading-[1.4] font-medium tracking-[-0.01em] text-white sm:text-[20px] xl:text-[22px]"
                : "text-[16px] leading-[1.45] text-silver sm:text-[18px]"
            )}
          >
            {way.result}
          </span>
        </p>
      </div>
    </>
  );
}
