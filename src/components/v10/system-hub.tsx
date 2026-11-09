"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useEffectEvent, useRef, useState, type PointerEvent, type RefObject } from "react";
import { Container, Heading, PrimaryLink, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { BorderBeam } from "@/components/ui/border-beam";
import { LINKS, SYSTEM } from "@/content/site";
import { cn } from "@/lib/utils";
import {
  DOT_R,
  ICE,
  LINE,
  ROYAL,
  SCROLL_SPRING,
  SKY,
  easeInOut,
  easeOut,
  ramp,
  snap,
  useLg,
  useReducedMotionPref,
  useTabVisible,
} from "@/components/sections/system-circuit";

/*
  System: the circuit from Problem, COMPLETED (see system-circuit). Same sky, same 1px lines, same dot size; here
  every trace reaches its card and every contact is a filled dot.

  Desktop (lg): a 600px stage. In the middle the hub, the section's lit glass panel with Magic UI's BorderBeam, the
  logo, the name, the claim and the four qualities. The eight tool groups sit four on each side as small glass cards. Every group is
  wired to the hub by an orthogonal trace like a circuit board: out of the hub's side, a vertical run, then into the
  card, with 8px rounded corners and a filled dot at both ends and at each corner. The four ports on each side of the
  hub sit 28px apart; the outer traces turn close to the hub and the inner ones further out, so no two traces cross.
  One SVG behind the cards draws them; a ResizeObserver measures the hub and the cards (no page width is assumed).

  Entrance (scroll-linked, reversible): the traces draw outward from the hub at one speed, so the inner groups are
  reached first, and each card docks (24px towards the hub, fading in) as its trace arrives.

  Light: once the circuit is complete, short bright pulses (a 56px sky dash with a brighter ice head) run from one
  group into the hub and on to the next group, one route every 2.4s, crossing the hub row by row until every group has
  sent one. Hovering or focusing a card plays its route at once (and repeats it while it stays hovered or focused);
  the two cards on the active route get a sky edge. The light stops off screen and while the tab is hidden, and
  reduced motion hides it (the routes still answer hover and focus, without the moving light).

  Phones and tablets: the hub first, then the groups as a list wired by one continuous sky line with a filled dot per
  group. No pulses. Reduced motion and no script: everything drawn and in place.

  v10: the client liked the hub ("looks nice") but found the row of four qualities under it "not really fitting", so
  the qualities now sit inside the hub, under its claim.
*/

type Group = (typeof SYSTEM.nodes)[number];

const NODES = SYSTEM.nodes;
const COUNT = NODES.length;
/** Groups per side of the hub. */
const SIDE = COUNT / 2;

// A no-break space before each dot keeps the dot on its tool's line when the list wraps.
const NBSP = String.fromCharCode(0xa0);
const joined = (tools: readonly string[]) => tools.join(`${NBSP}· `);

const LINE_OPACITY = 0.55;
const DOT_OPACITY = 0.9;
/** Corner radius of a trace. */
const CORNER = 8;
/** A rounded corner's length per px of radius (a quadratic curve through the corner point). */
const CURVE = 1.6232;
/** Between the four ports on each side of the hub. */
const PORT_GAP = 28;
/** An end dot's centre sits this far outside the hub or card edge, so the dot just touches it. */
const END_GAP = 4;
/** Where a trace's vertical run sits, as a share of the way from the hub to the card. */
const RUN_OUTER = 0.3;
const RUN_INNER = 0.62;
/** A card docks over the last px of its trace. */
const DOCK = 64;
const DOCK_X = 24;

/* The routes: each group sends to the next one in this chain, alternating sides row by row, so all eight take a turn. */
const CHAIN = [0, 4, 1, 5, 2, 6, 3, 7];
const nextOf = (i: number) => CHAIN[(CHAIN.indexOf(i) + 1) % CHAIN.length];
const ROUTE_S = 2.4;
/** The pulse reaches the hub at this share of the route; the second leg leaves slightly before and ends at 90%. */
const IN_END = 0.46;
const OUT = [0.4, 0.9] as const;
/** The pulse: three dashes sharing one leading end read as one sky dash brightening to an ice head. */
const TAIL = 56;
const LAYERS = [
  { length: TAIL, color: SKY, opacity: 0.28, width: 1.5 },
  { length: 30, color: SKY, opacity: 0.7, width: 1.5 },
  { length: 12, color: ICE, opacity: 1, width: 1.75 },
];
type Layer = (typeof LAYERS)[number];

export function SystemSection() {
  const diagram = useRef<HTMLDivElement>(null);
  const traces = useTraces(diagram);
  const lg = useLg();
  const reduced = useReducedMotionPref();
  const tabVisible = useTabVisible();

  // Entrance: drawn while the stage rises from 62% of the screen until its centre passes 52%.
  const progress = useSectionProgress(diagram, ["start 62%", "center 52%"]);
  const smooth = useSpring(progress, SCROLL_SPRING);
  // 1 on lg with motion allowed (set after mount); everywhere else the end state.
  const live = useMotionValue(0);
  useEffect(() => {
    live.set(lg && !reduced ? 1 : 0);
  }, [live, lg, reduced]);
  const p = useTransform(() => {
    const on = live.get();
    const value = smooth.get();
    return on ? value : 1;
  });
  // How far, in px, the current has travelled out of the hub. Every trace draws at this one speed.
  const maxLen = traces?.maxLen ?? 0;
  const reach = useTransform(() => p.get() * maxLen);

  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(true); // the circuit is complete (false while it draws)
  const [step, setStep] = useState(0); // position in CHAIN
  const [pinned, setPinned] = useState<number | null>(null); // the hovered or focused group
  const [run, setRun] = useState(0); // a new number for every route that starts

  // Report only the moments the circuit becomes complete or incomplete, not every frame of the drawing.
  const complete = useRef(true);
  useMotionValueEvent(p, "change", (value) => {
    const done = value > 0.985;
    if (done === complete.current) return;
    complete.current = done;
    setReady(done);
  });

  useEffect(() => {
    const el = diagram.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const from = pinned ?? CHAIN[step];
  const to = nextOf(from);
  // A route plays only on lg, on screen and in a visible tab: a hovered or focused group's route always, the cycle
  // once the circuit is complete and motion is allowed.
  const active = traces !== null && lg && onScreen && tabVisible && (pinned !== null || (ready && !reduced));

  const advance = () => {
    if (pinned === null) setStep((s) => (s + 1) % CHAIN.length);
    setRun((r) => r + 1);
  };
  const pin = (i: number) => {
    if (!lg || !ready || pinned === i) return;
    setPinned(i);
    setRun((r) => r + 1);
  };
  const release = (i: number) => {
    if (pinned !== i) return;
    setPinned(null);
    setStep((CHAIN.indexOf(i) + 1) % CHAIN.length);
    setRun((r) => r + 1);
  };
  const lit = (i: number) => active && (i === from || i === to);

  const card = (group: Group, i: number) => (
    <GroupCard
      key={group.title}
      i={i}
      group={group}
      reach={reach}
      len={traces?.list[i]?.len}
      lit={lit(i)}
      onPin={pin}
      onRelease={release}
    />
  );

  return (
    <Section id="system">
      <Container>
        <div>
          <Heading title={SYSTEM.title} accent={SYSTEM.accent} className="max-w-[880px]" />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[620px]">
            {SYSTEM.text}
          </p>
          <div data-reveal="up" data-rd="3" className="mt-9">
            <PrimaryLink href={LINKS.analysis}>{SYSTEM.cta}</PrimaryLink>
          </div>
        </div>

        <Reveal className="mt-16 md:mt-24">
          <div
            ref={diagram}
            className="relative flex flex-col gap-4 md:max-w-[620px] lg:grid lg:h-[600px] lg:max-w-none lg:grid-cols-[minmax(0,1fr)_260px_minmax(0,1fr)] lg:gap-0"
          >
            <svg
              aria-hidden
              fill="none"
              width={traces?.w ?? 0}
              height={traces?.h ?? 0}
              viewBox={traces ? `0 0 ${traces.w} ${traces.h}` : undefined}
              className="pointer-events-none absolute inset-0 z-0 hidden overflow-visible lg:block"
            >
              {traces?.list.map((trace, i) => (
                <TraceLine key={NODES[i].title} trace={trace} reach={reach} />
              ))}
              {traces && active && !reduced && <Pulse key={run} from={traces.list[from]} to={traces.list[to]} onDone={advance} />}
            </svg>

            <Hub />
            <ul role="list" className="relative z-10 flex flex-col gap-4 lg:col-start-1 lg:row-start-1 lg:grid lg:h-full lg:grid-rows-4 lg:gap-0">
              {NODES.slice(0, SIDE).map((group, i) => card(group, i))}
            </ul>
            <ul role="list" className="relative z-10 flex flex-col gap-4 lg:col-start-3 lg:row-start-1 lg:grid lg:h-full lg:grid-rows-4 lg:gap-0">
              {NODES.slice(SIDE).map((group, i) => card(group, i + SIDE))}
            </ul>
          </div>
        </Reveal>

      </Container>
    </Section>
  );
}

/** The hub: the section's lit glass panel. A column in the middle of the stage on lg, the head of the list below. */
function Hub() {
  return (
    <div className="relative z-10 pl-10 lg:col-start-2 lg:row-start-1 lg:self-center lg:pl-0">
      <PhoneNode dot={52.5} first />
      <div data-hub className="glass glass-lit rounded-panel p-6 lg:px-7 lg:py-10 lg:text-center">
        <BorderBeam colorFrom={SKY} colorTo={ROYAL} duration={12} size={160} />
        {/* eslint-disable-next-line @next/next/no-img-element -- a small static vector mark; next/image adds nothing */}
        <img src="/brand/mark.svg" alt="" width={89} height={56} className="block h-14 w-auto lg:mx-auto" />
        <p className="mt-5 text-[18px] leading-tight font-medium tracking-[-0.01em] text-white">Branded Genius</p>
        <p className="mt-2 text-[14px] leading-normal text-balance text-silver">{SYSTEM.claim}</p>
        {/* The four qualities belong to the system itself, so they sit in the hub (v1 had them as a row below). */}
        <ul role="list" className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-left sm:grid-cols-2 lg:grid-cols-1">
          {SYSTEM.qualities.map((quality) => (
            <li key={quality.title} className="flex items-start gap-3">
              <span aria-hidden className="flex h-5 shrink-0 items-center">
                <span className="size-1.5 rounded-full bg-sky" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] leading-5 font-medium text-white">{quality.title}</span>
                <span className="block text-[13px] leading-[1.45] text-silver">{quality.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** One tool group: a small glass card. On lg it docks as its trace arrives, and hover or focus plays its route. */
function GroupCard({
  i,
  group,
  reach,
  len,
  lit,
  onPin,
  onRelease,
}: {
  i: number;
  group: Group;
  reach: MotionValue<number>;
  len: number | undefined;
  lit: boolean;
  onPin: (i: number) => void;
  onRelease: (i: number) => void;
}) {
  const left = i < SIDE;
  const dock = useTransform(() => {
    const travelled = reach.get();
    return len === undefined ? 1 : ramp(travelled, len - DOCK, len);
  });
  const x = useTransform(() => (left ? -DOCK_X : DOCK_X) * (1 - easeOut(dock.get())));

  const onEnter = (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType === "mouse") onPin(i);
  };
  const onLeave = (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType === "mouse") onRelease(i);
  };

  return (
    <li
      data-node
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={cn(
        "relative pl-10 lg:w-[min(300px,calc(100%_-_112px))] lg:self-center lg:pl-0",
        left ? "lg:justify-self-start" : "lg:justify-self-end"
      )}
    >
      <PhoneNode dot={27.5} last={i === COUNT - 1} />
      <motion.div style={{ x, opacity: dock }} className="lg:motion-safe:will-change-transform">
        <div className="glass rounded-panel px-5 py-4">
          {/* The sky edge while this group is on the active route. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(105_191_248/0.8)] transition-opacity duration-300 ease-out",
              lit ? "opacity-100" : "opacity-0"
            )}
          />
          <h3 className="text-[16px] leading-snug font-medium text-white">
            <span className="lg:hidden">{group.title}</span>
            {/* On lg the group is a button (hover, focus or press plays its route); its hit area is the whole card. */}
            <button
              type="button"
              onFocus={() => onPin(i)}
              onBlur={() => onRelease(i)}
              onClick={() => onPin(i)}
              className="hidden cursor-pointer text-left after:absolute after:inset-0 after:rounded-panel focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-sky lg:inline"
            >
              {group.title}
            </button>
          </h3>
          <p className="mt-1 text-[13px] leading-[1.5] text-silver">{joined(group.tools)}</p>
        </div>
      </motion.div>
    </li>
  );
}

/*
  Below lg: one continuous sky line down the left edge (x 12.5px) with a filled dot and a short branch into each card.
  The line starts at the hub's dot, runs through every card and the 16px gap after it, and ends at the last dot.
  `dot` is the dot's centre from the top of the item (on a half pixel, so the 1px branch stays crisp).
*/
function PhoneNode({ dot, first = false, last = false }: { dot: number; first?: boolean; last?: boolean }) {
  const line = first ? { top: dot, bottom: -16 } : last ? { top: 0, height: dot } : { top: 0, bottom: -16 };
  return (
    <span aria-hidden className="lg:hidden">
      <span className="absolute left-3 w-px bg-sky/55" style={line} />
      <span className="absolute left-[15px] h-px w-[25px] bg-sky/55" style={{ top: dot - 0.5 }} />
      <span className="absolute left-[9.5px] size-1.5 rounded-full bg-sky" style={{ top: dot - DOT_R }} />
    </span>
  );
}

/* ---------- The desktop traces ---------- */

type Point = { x: number; y: number };
type Dot = Point & { at: number };
type Trace = { d: string; len: number; dots: Dot[] };
type Traces = { w: number; h: number; maxLen: number; list: Trace[] };

/**
 * An orthogonal trace from a hub port: horizontal to the vertical run, along the run to the card's height, then
 * horizontal into the card. Its length and the distance of each dot along it are kept for the drawing and the pulses.
 */
function buildTrace(port: Point, run: number, end: Point): Trace {
  const out = run - port.x;
  const rise = end.y - port.y;
  const last = end.x - run;
  const r = Math.min(CORNER, Math.abs(rise) / 2, Math.abs(out), Math.abs(last));
  if (r < 1) {
    const len = Math.abs(out) + Math.abs(rise) + Math.abs(last);
    return { d: `M ${port.x} ${port.y} H ${run} V ${end.y} H ${end.x}`, len, dots: [{ ...port, at: 0 }, { ...end, at: len }] };
  }
  const sx1 = Math.sign(out);
  const sy = Math.sign(rise);
  const sx2 = Math.sign(last);
  const corner = CURVE * r;
  const first = Math.abs(out) - r;
  const middle = Math.abs(rise) - 2 * r;
  const len = first + corner + middle + corner + Math.abs(last) - r;
  const d = [
    `M ${port.x} ${port.y}`,
    `H ${run - sx1 * r}`,
    `Q ${run} ${port.y} ${run} ${port.y + sy * r}`,
    `V ${end.y - sy * r}`,
    `Q ${run} ${end.y} ${run + sx2 * r} ${end.y}`,
    `H ${end.x}`,
  ].join(" ");
  return {
    d,
    len,
    dots: [
      { x: port.x, y: port.y, at: 0 },
      // The midpoints of the two corner curves.
      { x: run - (sx1 * r) / 4, y: port.y + (sy * r) / 4, at: first + corner / 2 },
      { x: run + (sx2 * r) / 4, y: end.y - (sy * r) / 4, at: first + corner + middle + corner / 2 },
      { x: end.x, y: end.y, at: len },
    ],
  };
}

function measure(wrap: HTMLElement, hub: HTMLElement, cards: HTMLElement[]): Traces | null {
  const box = wrap.getBoundingClientRect();
  const h = hub.getBoundingClientRect();
  const hubY = h.top + h.height / 2 - box.top;
  const list: Trace[] = [];
  for (let i = 0; i < cards.length; i++) {
    const r = cards[i].getBoundingClientRect();
    const left = i < SIDE;
    const row = i % SIDE;
    const dir = left ? -1 : 1;
    const hubEdge = (left ? h.left : h.right) - box.left;
    const cardEdge = (left ? r.right : r.left) - box.left;
    // Stacked (below lg) the groups sit under the hub, not beside it: no traces to draw.
    if ((cardEdge - hubEdge) * dir < 2 * (CORNER + END_GAP)) return null;
    const port = { x: snap(hubEdge + dir * END_GAP), y: snap(hubY + (row - (SIDE - 1) / 2) * PORT_GAP) };
    const end = { x: snap(cardEdge - dir * END_GAP), y: snap(r.top + r.height / 2 - box.top) };
    const outer = row === 0 || row === SIDE - 1;
    const run = snap(port.x + (end.x - port.x) * (outer ? RUN_OUTER : RUN_INNER));
    list.push(buildTrace(port, run, end));
  }
  return { w: box.width, h: box.height, maxLen: Math.max(...list.map((t) => t.len)), list };
}

function same(a: Traces | null, b: Traces | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.w === b.w && a.h === b.h && a.list.every((t, i) => t.d === b.list[i].d);
}

/** Measures the hub and the cards' layout boxes (the list items, which never move; only the cards inside them dock). */
function useTraces(ref: RefObject<HTMLDivElement | null>) {
  const [traces, setTraces] = useState<Traces | null>(null);
  useEffect(() => {
    const wrap = ref.current;
    const hub = wrap?.querySelector<HTMLElement>("[data-hub]");
    const cards = wrap ? Array.from(wrap.querySelectorAll<HTMLElement>("[data-node]")) : [];
    if (!wrap || !hub || cards.length !== COUNT) return;
    // A ResizeObserver reports each element once when it starts observing, which is the first measurement.
    const ro = new ResizeObserver(() => {
      const next = measure(wrap, hub, cards);
      setTraces((prev) => (same(prev, next) ? prev : next));
    });
    [wrap, hub, ...cards].forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [ref]);
  return traces;
}

/** One trace and its four dots, drawn outward from the hub as the current reaches them. */
function TraceLine({ trace, reach }: { trace: Trace; reach: MotionValue<number> }) {
  const drawn = useTransform(() => ramp(reach.get(), 0, trace.len));
  return (
    <>
      <motion.path d={trace.d} stroke={SKY} strokeOpacity={LINE_OPACITY} strokeWidth={LINE} style={{ pathLength: drawn }} />
      {trace.dots.map((dot) => (
        <TraceDot key={dot.at} dot={dot} reach={reach} />
      ))}
    </>
  );
}

function TraceDot({ dot, reach }: { dot: Dot; reach: MotionValue<number> }) {
  // Fully lit the moment the line reaches it (the port dot as soon as the line leaves the hub).
  const shown = useTransform(() => ramp(reach.get(), Math.max(0, dot.at - 12), Math.max(12, dot.at)));
  const scale = useTransform(() => 0.4 + 0.6 * shown.get());
  return <motion.circle cx={dot.x} cy={dot.y} r={DOT_R} fill={SKY} fillOpacity={DOT_OPACITY} style={{ opacity: shown, scale }} />;
}

/**
 * One route of light: a pulse runs from the sending group into the hub (against the direction its trace was drawn),
 * then out along the receiving group's trace. Mounted fresh for every route; reports back when the route is over.
 */
function Pulse({ from, to, onDone }: { from: Trace; to: Trace; onDone: () => void }) {
  const t = useMotionValue(0);
  const done = useEffectEvent(onDone);
  useEffect(() => {
    const controls = animate(t, 1, { duration: ROUTE_S, ease: "linear", onComplete: () => done() });
    return () => controls.stop();
  }, [t]);

  // Where the pulse's leading end is, in px along each path.
  const inHead = useTransform(() => from.len - (from.len + TAIL) * easeInOut(ramp(t.get(), 0, IN_END)));
  const outHead = useTransform(() => (to.len + TAIL) * easeInOut(ramp(t.get(), OUT[0], OUT[1])));

  return (
    <g className="motion-reduce:hidden">
      {LAYERS.map((layer) => (
        <Dash key={`in-${layer.length}`} d={from.d} len={from.len} layer={layer} head={inHead} inward />
      ))}
      {LAYERS.map((layer) => (
        <Dash key={`out-${layer.length}`} d={to.d} len={to.len} layer={layer} head={outHead} />
      ))}
    </g>
  );
}

/** One dash of the pulse, its leading end at `head`; the gap is longer than the path, so only one dash ever shows. */
function Dash({ d, len, layer, head, inward = false }: { d: string; len: number; layer: Layer; head: MotionValue<number>; inward?: boolean }) {
  const offset = useTransform(() => {
    const at = head.get();
    // Outward the dash trails behind its head towards the hub; inward it trails behind towards the card.
    return inward ? -at : layer.length - at;
  });
  return (
    <motion.path
      d={d}
      stroke={layer.color}
      strokeOpacity={layer.opacity}
      strokeWidth={layer.width}
      strokeLinecap="round"
      strokeDasharray={`${layer.length} ${len + 2 * TAIL}`}
      style={{ strokeDashoffset: offset }}
    />
  );
}
