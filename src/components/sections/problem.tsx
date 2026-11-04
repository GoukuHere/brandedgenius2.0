"use client";

import { BarChart3, FlaskConical, MapIcon, Repeat, Unplug, Users, type LucideIcon } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Container, Heading, IconChip, Section } from "@/components/system/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { PROBLEM } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  The problem arena, after the v1 fly-in the client liked. Desktop (1280px wide, at least 640px tall, motion allowed):
  a 230svh runway pins a full-screen stage. The headline block holds the 560px centre column and the six problem
  cards fly in from outside, slightly turned, to land at the stage edges, three per side, as the reader scrolls.
  Progress is the runway's scroll position, spring-smoothed, and the cards move by transform and opacity only. No
  shader and no vignette: the page background shows through the whole stage.

  Geometry (container 1216px): two 280px card columns and 48px gutters around the 560px centre. The cards share three
  rows, the two cards of a row share one height, and the arena is symmetric about the page's centre line. A card can
  never cover the centre text: it lives in its own column and only ever starts outward of it.

  A desktop window that is too short, or reduced motion: the same arena, still. Phones and tablets: the headline
  block, then a single column of cards that rises in with the shared RevealGroup.
*/

// One icon per problem, in PROBLEM.items order.
const ICONS: LucideIcon[] = [FlaskConical, Repeat, Unplug, MapIcon, Users, BarChart3];

// Arena placement: odd items left of the centre, even items right, one pair per row (reading order = visual order).
const PLACE = [
  "xl:col-start-1 xl:row-start-1",
  "xl:col-start-3 xl:row-start-1",
  "xl:col-start-1 xl:row-start-2",
  "xl:col-start-3 xl:row-start-2",
  "xl:col-start-1 xl:row-start-3",
  "xl:col-start-3 xl:row-start-3",
];

// Where each card starts its flight (px and degrees), as in v1: outward of its column and slightly turned.
const FROM = [
  { x: -130, y: -70, r: -5 },
  { x: 130, y: -60, r: 4 },
  { x: -170, y: 0, r: 3 },
  { x: 170, y: 10, r: -3 },
  { x: -120, y: 90, r: 4 },
  { x: 120, y: 100, r: -4 },
];

/*
  The stage pins only with room for the arena, height for all of it on one screen, and motion allowed. CSS pins it
  with the same condition (the `xl:motion-safe:[@media(min-height:40rem)]:` classes), so the server HTML is already
  right; this query only tells the cards to follow the scroll.
*/
const PIN_QUERY = "(min-width: 80rem) and (min-height: 40rem) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PIN_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const pinnedNow = () => window.matchMedia(PIN_QUERY).matches;
const pinnedOnServer = () => false;

export function ProblemSection() {
  const runway = useRef<HTMLDivElement>(null);
  const pinned = useSyncExternalStore(subscribe, pinnedNow, pinnedOnServer);

  const progress = useSectionProgress(runway, ["start start", "end end"]);
  const smooth = useSpring(progress, { stiffness: 100, damping: 24, restDelta: 0.001, skipInitialAnimation: true });

  // The cards follow the scroll only on the pinned stage. Anywhere else, and in the server HTML, flight is 1: landed.
  const live = useMotionValue(0);
  useEffect(() => {
    live.set(pinned ? 1 : 0);
  }, [live, pinned]);
  const flight = useTransform([smooth, live], ([p, on]: number[]) => (on ? p : 1));

  return (
    <Section className="xl:motion-safe:[@media(min-height:40rem)]:py-0">
      <div ref={runway} className="relative xl:motion-safe:[@media(min-height:40rem)]:h-[230svh]">
        {/* The stage. Pinned, it is one screen tall; 96px at the top clear the fixed header (84px). */}
        <div className="flex flex-col justify-center xl:motion-safe:[@media(min-height:40rem)]:sticky xl:motion-safe:[@media(min-height:40rem)]:top-0 xl:motion-safe:[@media(min-height:40rem)]:h-svh xl:motion-safe:[@media(min-height:40rem)]:pt-24 xl:motion-safe:[@media(min-height:40rem)]:pb-12">
          {/* Desktop: the headline block and the card grid share one grid cell; the grid's centre track stays empty. */}
          <Container className="xl:grid xl:items-center">
            <Reveal className="xl:col-start-1 xl:row-start-1 xl:mx-auto xl:w-full xl:max-w-[560px] xl:text-center">
              <Heading title={PROBLEM.title} accent={PROBLEM.accent} className="max-w-[820px]" />
              <p className="t-lead mt-6 max-w-[620px] xl:max-w-none">{PROBLEM.text}</p>
              <Reality />
            </Reveal>

            <RevealGroup className="mt-14 md:mt-20 xl:pointer-events-none xl:col-start-1 xl:row-start-1 xl:mt-0">
              <ul
                role="list"
                className="grid max-w-[640px] gap-5 md:gap-6 xl:max-w-none xl:grid-cols-[minmax(0,1fr)_560px_minmax(0,1fr)] xl:gap-x-12 xl:gap-y-5"
              >
                {PROBLEM.items.map((item, i) => (
                  <RevealItem as="li" key={item.title} className={cn("xl:pointer-events-auto", PLACE[i])}>
                    <Flight index={i} flight={flight} active={pinned}>
                      <ProblemCard icon={ICONS[i]} title={item.title} text={item.text} />
                    </Flight>
                  </RevealItem>
                ))}
              </ul>
            </RevealGroup>
          </Container>
        </div>
      </div>
    </Section>
  );
}

/*
  One card's flight. Each card starts 7.5% of the runway after the one before and lands 30% later, as in v1; the last
  lands at 67.5%, so the finished arena holds for the last third of the runway. At flight 1 the card is in place.
*/
function Flight({ index, flight, active, children }: { index: number; flight: MotionValue<number>; active: boolean; children: ReactNode }) {
  const from = FROM[index];
  const start = index * 0.075;
  const end = start + 0.3;
  const x = useTransform(flight, [start, end], [from.x, 0]);
  const y = useTransform(flight, [start, end], [from.y, 0]);
  const rotate = useTransform(flight, [start, end], [from.r, 0]);
  const opacity = useTransform(flight, [start, start + 0.22], [0, 1]);

  // No scale in the flight: a layer that changes scale under will-change keeps its first raster and lands blurred.
  return (
    <motion.div style={{ x, y, rotate, opacity }} className={cn("h-full", active && "will-change-transform")}>
      {children}
    </motion.div>
  );
}

function ProblemCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="surface surface-hover h-full p-6 md:p-8 xl:p-5">
      <div className="flex items-center gap-3.5">
        <IconChip>
          <Icon aria-hidden strokeWidth={1.5} />
        </IconChip>
        <h3 className="text-[17px] leading-snug font-medium text-balance text-white">{title}</h3>
      </div>
      <p className="t-small mt-3 text-ink/60">{text}</p>
    </div>
  );
}

/*
  The reality in three facts, label over value, divided by vertical hairlines in the brand's light blue (the vertical
  twin of .hairline). Phones: three equal columns. Desktop: each column as wide as its value, so every value stays on
  one line (about 510px of the 560px centre column), and the row is centred.
*/
function Reality() {
  return (
    <dl className="mt-10 grid max-w-[620px] grid-cols-3 xl:mx-auto xl:w-fit xl:max-w-none xl:grid-cols-[repeat(3,auto)]">
      {PROBLEM.reality.map((fact) => (
        <div
          key={fact.label}
          className="relative px-3 first:pl-0 last:pr-0 not-first:before:absolute not-first:before:inset-y-0 not-first:before:left-0 not-first:before:w-px not-first:before:bg-[linear-gradient(transparent,rgb(105_191_248/0.28),transparent)] sm:px-5 xl:px-4"
        >
          <dt className="t-small">{fact.label}</dt>
          <dd className="mt-1 text-[15px] leading-snug text-balance text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
