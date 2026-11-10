"use client";

import { animate, motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { CASES } from "@/content/site";
import { cn } from "@/lib/utils";
import { CountUp } from "./count";

/*
  v11 Use Cases (the developer: the carousel "my client doesn't like at all, find some stunning layout ... super
  animated"; of v9's Leistungen: "we can utilize that somewhere, just the text on the right cards is very blurry";
  then of the first fan: "it seems weird, fix the layout and it should also swipe cards with scroll down").

  A deck of six glass cards in 3D, after v9's fan of layers, built in CSS 3D with real page text (sharp, light). The
  card in front shows its case: the headline and the three results, which count up from zero as it arrives. Behind
  it the next cards wait in order, each showing its number and name on the strip above the one in front. The cards
  already seen have swiped away: up and to the left, turning and fading. So the deck is always in order, from the
  card being read to the last one, with no gaps.

  Scrolling (desktop and phones at least 640px tall; shorter phones get the deck a size smaller): the section holds on a sticky stage while you
  scroll REST + 5 + REST steps of half a screen; each card rests in front for a while, then swipes away and the next
  comes forward, all on the scroll and reversible. Picking an area scrolls to its card. Beside the deck (desktop) a
  quiet list of the six areas marks the current one; on phones the areas are buttons under the deck.

  Elsewhere (short windows, reduced motion) nothing holds: the cards take turns on their own, DWELL ms each, while
  the section is on screen (the line under the current area fills like a story); picking one stops the turns,
  hovering or focusing holds them.

  The pointer moves the point of view over the deck a little (its perspective origin). The cards move by transform
  and opacity only, each drawn on its own (no shared 3D space, so one never cuts through another). Every case is in
  the markup for screen readers as one list; the deck is hidden from them.
*/

const ITEMS = CASES.items;
const COUNT = ITEMS.length;
const DWELL = 6000;
const REST = 0.5; // steps of rest before the first card leaves and after the last one has arrived
const UNITS = COUNT - 1 + 2 * REST;
const EASE = [0.16, 1, 0.3, 1] as const;
const PIN =
  "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 640px), " +
  "(prefers-reduced-motion: no-preference) and (max-width: 1023px) and (min-height: 640px)";

const pad = (i: number) => String(i + 1).padStart(2, "0");
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
/** The deck's position on the scroll: each card rests in front for 40% of its step, then the next comes forward. */
function staircase(k: number) {
  const i = Math.floor(k);
  return i + smoothstep(clamp((k - i - 0.2) / 0.6, 0, 1));
}

/** The deck's geometry for a screen size (px and degrees). The card's size and padding are in v11.css. */
type Geo = { w: number; h: number; dx: number; dy: number; dz: number; ry: number; rx: number; ax: number; ay: number; az: number; ary: number; arx: number };
const PHONE: Geo = { w: 300, h: 340, dx: 6, dy: -40, dz: -36, ry: 16, rx: 4, ax: -9, ay: 32, az: 60, ary: 7, arx: 2 };
const TABLET: Geo = { w: 440, h: 300, dx: 20, dy: -46, dz: -44, ry: 16, rx: 4, ax: -35, ay: 42, az: 90, ary: 7, arx: 2 };
const DESK: Geo = { w: 520, h: 290, dx: 30, dy: -50, dz: -48, ry: 20, rx: 4, ax: -52, ay: 44, az: 110, ary: 9, arx: 2 };

/**
 * A card's pose from its place in the deck: r = 0 is the front, r = 1, 2 ... the slots behind it, and below 0 the card
 * has swiped away (r = -1: gone). Between two places it moves smoothly, so the deck can follow the scroll.
 */
function pose(r: number, g: Geo) {
  let x: number, y: number, z: number, ry: number, rx: number, rz: number;
  if (r >= 0) {
    const k = Math.min(1, r); // front to the first slot
    const s = Math.max(1, r); // the slots behind
    x = lerp(g.ax, s * g.dx, k);
    y = lerp(g.ay, s * g.dy, k);
    z = lerp(g.az, s * g.dz, k);
    ry = lerp(g.ary, g.ry, k);
    rx = lerp(g.arx, g.rx, k);
    rz = 0;
  } else {
    const u = Math.min(1, -r);
    x = g.ax - u * g.w * 0.62;
    y = g.ay - u * g.h * 0.55;
    z = g.az + u * 40;
    ry = g.ary + u * 16;
    rx = g.arx - u * 6;
    rz = -u * 10;
  }
  return `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
}
const opacityAt = (r: number) => (r >= 0 ? clamp(1 - Math.max(0, r - 1) * 0.08, 0.5, 1) : clamp(1 + r * 1.6, 0, 1));

export function CasesSection() {
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(runway, ["start start", "end end"]);
  const smooth = useSpring(progress, { stiffness: 120, damping: 28, mass: 0.6, skipInitialAnimation: true });
  const pinnedValue = useMotionValue(0);
  const timed = useMotionValue(0);
  const geo = useMotionValue<Geo>(DESK);

  // Where the deck stands: on the scroll where the section pins, else on its own time.
  const deck = useTransform(() => {
    const scrolled = staircase(clamp(smooth.get() * UNITS - REST, 0, COUNT - 1));
    const own = timed.get();
    return pinnedValue.get() ? scrolled : own;
  });

  const [pinned, setPinned] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState(0);
  const [target, setTarget] = useState(0);
  const [run, setRun] = useState(0); // a new number restarts the running line
  const [manual, setManual] = useState(false);
  const [held, setHeld] = useState(false);

  useMotionValueEvent(deck, "change", (k) => setActive(clamp(Math.round(k), 0, COUNT - 1)));

  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    const pinQuery = window.matchMedia(PIN);
    const desk = window.matchMedia("(min-width: 1024px)");
    const tablet = window.matchMedia("(min-width: 640px)");
    const onQuery = () => {
      setPinned(pinQuery.matches);
      pinnedValue.set(pinQuery.matches ? 1 : 0);
      geo.set(desk.matches ? DESK : tablet.matches ? TABLET : PHONE);
    };
    onQuery();
    for (const q of [pinQuery, desk, tablet]) q.addEventListener("change", onQuery);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      for (const q of [pinQuery, desk, tablet]) q.removeEventListener("change", onQuery);
    };
  }, [pinnedValue, geo]);

  // Not pinned: the deck moves to the chosen card.
  useEffect(() => {
    if (pinned) return undefined;
    const controls = animate(timed, target, { duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.9, ease: EASE });
    return () => controls.stop();
  }, [pinned, target, timed]);

  const pick = (i: number) => {
    const el = runway.current;
    if (pinned && el) {
      // Scroll to the middle of that card's rest on the runway.
      const top = el.getBoundingClientRect().top + window.scrollY;
      const travel = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((i + REST) / UNITS) * travel, behavior: "smooth" });
      return;
    }
    setManual(true);
    setTarget(i);
    setRun((r) => r + 1);
  };
  const advance = () => {
    setTarget((t) => (t + 1) % COUNT);
    setRun((r) => r + 1);
  };
  const hold = pinned
    ? {}
    : {
        onPointerEnter: () => setHeld(true),
        onPointerLeave: () => setHeld(false),
        onFocus: () => setHeld(true),
        onBlur: () => setHeld(false),
      };
  const timing: Timing = {
    active,
    run,
    running: !pinned && !manual,
    paused: !onScreen || !visible || held,
    onPick: pick,
    onDone: advance,
  };

  return (
    <Section id="use-cases" className="v11-cases">
      <Container>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end lg:gap-x-16">
          <Heading
            title={CASES.title}
            accent={CASES.accent}
            className="max-w-[760px] text-[2.25rem] md:text-[2.75rem] xl:text-[3rem] [&>.accent]:block"
          />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[520px] lg:mt-0">
            {CASES.text}
          </p>
        </div>
      </Container>

      {/* The runway: on screens where it pins, its stage holds while the deck follows the scroll. */}
      <div ref={runway} className="v11-cases-runway">
        <div ref={stage} className="v11-cases-stage">
          <Container className="w-full">
            <div className="grid gap-y-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-center lg:gap-x-12 xl:gap-x-16">
              <div data-reveal="up" data-rd="2" className="hidden lg:block" {...hold}>
                <AreaList {...timing} />
              </div>
              <div data-reveal="up" data-rd="2" {...hold}>
                <Deck deck={deck} geo={geo} active={active} live={onScreen} />
              </div>
              <div data-reveal="up" data-rd="3" className="lg:hidden" {...hold}>
                <AreaGrid {...timing} />
              </div>
            </div>
          </Container>
        </div>
      </div>

      <ol className="sr-only">
        {ITEMS.map((item) => (
          <li key={item.name}>
            {item.name}: {item.tagline} {item.metrics.map((metric) => `${metric.value} ${metric.label}.`).join(" ")}
          </li>
        ))}
      </ol>
    </Section>
  );
}

type Timing = {
  active: number;
  run: number;
  running: boolean;
  paused: boolean;
  onPick: (i: number) => void;
  onDone: () => void;
};

/** The line under an area: full once current, filling over DWELL while the cards take turns on their own. */
function Line({ on, run, running, paused, onDone }: { on: boolean; run: number; running: boolean; paused: boolean; onDone: () => void }) {
  const state = on ? (running ? "running" : "done") : "idle";
  return (
    <span aria-hidden className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
      <span
        key={on ? run : -1}
        data-state={state}
        data-paused={paused || undefined}
        onAnimationEnd={on && running ? onDone : undefined}
        style={{ "--v11-dwell": `${DWELL}ms` } as CSSProperties}
        className="v11-bar-fill absolute inset-0 bg-sky"
      />
    </span>
  );
}

/** Desktop: the six areas as a quiet list, a small number and the area, hairlines between. */
function AreaList({ active, run, running, paused, onPick, onDone }: Timing) {
  return (
    <ol role="list" className="border-t border-white/10">
      {ITEMS.map((item, i) => {
        const on = i === active;
        return (
          <li key={item.name} className="relative border-b border-white/10">
            <button
              type="button"
              onClick={() => onPick(i)}
              aria-current={on ? "true" : undefined}
              aria-label={item.name}
              className="group flex min-h-12 w-full cursor-pointer items-center gap-4 py-3 text-left"
            >
              <span className={cn("num w-6 text-[14px] transition-colors duration-300", on ? "text-sky" : "text-white/35")}>{pad(i)}</span>
              <span
                className={cn(
                  "text-[19px] leading-snug tracking-[-0.01em] transition-colors duration-300",
                  on ? "text-white" : "text-white/50 group-hover:text-white/85"
                )}
              >
                {item.area}
              </span>
            </button>
            <Line on={on} run={run} running={running} paused={paused} onDone={onDone} />
          </li>
        );
      })}
    </ol>
  );
}

/** Phones and tablets: the six areas as buttons in rows of three, the current one lit. */
function AreaGrid({ active, run, running, paused, onPick, onDone }: Timing) {
  return (
    <ol role="list" className="grid grid-cols-3 gap-2">
      {ITEMS.map((item, i) => {
        const on = i === active;
        return (
          <li key={item.name} className="relative overflow-hidden rounded-button">
            <button
              type="button"
              onClick={() => onPick(i)}
              aria-current={on ? "true" : undefined}
              aria-label={item.name}
              className={cn(
                "flex min-h-11 w-full cursor-pointer items-center justify-center rounded-button px-2 text-[14px] leading-tight transition-colors duration-300",
                on ? "bg-white/[0.08] text-white" : "bg-white/[0.03] text-white/55"
              )}
            >
              {item.area}
            </button>
            <Line on={on} run={run} running={running} paused={paused} onDone={onDone} />
          </li>
        );
      })}
    </ol>
  );
}

/** The deck (see above). Decorative for screen readers; the list after the section carries it. */
function Deck({ deck, geo, active, live }: { deck: MotionValue<number>; geo: MotionValue<Geo>; active: number; live: boolean }) {
  // The pointer moves the point of view a little: the perspective origin follows it on a soft spring.
  const ox = useMotionValue(50);
  const oy = useMotionValue(42);
  const sx = useSpring(ox, { stiffness: 60, damping: 18, mass: 0.8 });
  const sy = useSpring(oy, { stiffness: 60, damping: 18, mass: 0.8 });
  const origin = useMotionTemplate`${sx}% ${sy}%`;
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    ox.set(50 - ((event.clientX - box.left) / box.width - 0.5) * 36);
    oy.set(42 - ((event.clientY - box.top) / box.height - 0.5) * 28);
  };
  const onLeave = () => {
    ox.set(50);
    oy.set(42);
  };

  return (
    <motion.div aria-hidden onPointerMove={onMove} onPointerLeave={onLeave} style={{ perspectiveOrigin: origin }} className="v11-fan">
      {ITEMS.map((item, i) => (
        <Card key={item.name} index={i} item={item} deck={deck} geo={geo} on={i === active} live={live} />
      ))}
    </motion.div>
  );
}

function Card({
  index,
  item,
  deck,
  geo,
  on,
  live,
}: {
  index: number;
  item: (typeof ITEMS)[number];
  deck: MotionValue<number>;
  geo: MotionValue<Geo>;
  on: boolean;
  live: boolean;
}) {
  // Every source is read on every frame, so the card follows the deck and the screen size alike.
  const transform = useTransform(() => pose(index - deck.get(), geo.get()));
  const opacity = useTransform(() => opacityAt(index - deck.get()));
  const zIndex = useTransform(() => {
    const r = index - deck.get();
    return r >= 0 ? 50 - Math.round(r * 4) : 60;
  });
  // The case itself is only on the card in front, fading as the card leaves or before it has arrived.
  const detail = useTransform(() => clamp(1 - Math.abs(index - deck.get()) * 2.6, 0, 1));

  return (
    <motion.div data-on={on || undefined} style={{ transform, opacity, zIndex }} className="v11-fan-layer">
      <div className="flex items-baseline gap-3">
        <span className="num text-[14px] text-sky">{pad(index)}</span>
        <span className="text-[16px] leading-none font-medium tracking-[-0.005em] text-white">{item.name}</span>
      </div>
      <motion.div style={{ opacity: detail }} className="v11-fan-detail">
        <p className="text-[19px] leading-[1.25] font-medium tracking-[-0.015em] text-balance text-white sm:text-[22px] lg:text-[24px]">{item.tagline}</p>
        <ul role="list" className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-5">
          {item.metrics.map((metric) => (
            <li key={metric.label} className="grid grid-cols-[72px_minmax(0,1fr)] items-baseline gap-x-3 sm:block">
              <p className="num text-[24px] leading-none text-white sm:text-[30px] lg:text-[36px]">
                <CountUp value={metric.value} play={on && live} duration={1.3} delay={0.2} />
              </p>
              <p className="text-[13px] leading-snug text-white/65 sm:mt-2">{metric.label}</p>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
