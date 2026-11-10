"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { CASES } from "@/content/site";
import { cn } from "@/lib/utils";
import { CountUp } from "./count";

/*
  v11 Use Cases (the developer: the carousel "my client doesn't like at all, find some stunning layout ... super
  animated", and of v9's Leistungen: "this component is also good, we can utilize that somewhere, just the text on
  the right cards is very blurry"). v9's fan of glass layers, rebuilt in CSS 3D with real page text, so it is sharp
  and light (v9 painted the text into WebGL textures and looked at them through refracting glass).

  - Desktop: on the left the heading and the six areas as a quiet list (a small number and the area); the current
    area is white and its line fills over its time. On the right the fan: six glass layers standing in depth, each
    with its number and name. The current layer slides out to the front, turns towards the reader, lights its edge
    and shows the case's headline and its three results, which count up from zero.
  - The areas take turns, DWELL ms each, while the section is on screen (the line fills like a story). Picking an
    area shows it and stops the turns; hovering or focusing the list or the fan holds them. The pointer moves the
    point of view over the fan a little (its perspective origin, no tilt of the layers).
  - Phones: the heading, the fan, then the six areas as buttons in two rows of three.
  No pinning and no scroll link. The layers move by transform and opacity only, each drawn on its own (no shared 3D
  space, so a layer never cuts through another while it travels). Reduced motion: no turns and no travel.
  Every case is in the markup for screen readers as one list; the fan is hidden from them.
*/

const ITEMS = CASES.items;
const COUNT = ITEMS.length;
const DWELL = 6000;
const pad = (i: number) => String(i + 1).padStart(2, "0");

export function CasesSection() {
  const root = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0); // a new number restarts the running line
  const [manual, setManual] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const pick = (i: number) => {
    setManual(true);
    setActive(i);
    setRun((r) => r + 1);
  };
  const advance = () => {
    setActive((a) => (a + 1) % COUNT);
    setRun((r) => r + 1);
  };
  const hold = {
    onPointerEnter: () => setHeld(true),
    onPointerLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false),
  };
  const timing = { active, run, running: !manual, paused: !onScreen || !visible || held, onPick: pick, onDone: advance };

  return (
    <Section id="use-cases">
      <div ref={root}>
        <Container>
          <div className="grid gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-x-12 xl:gap-x-16">
            <div>
              <div>
                <Heading
                  title={CASES.title}
                  accent={CASES.accent}
                  className="max-w-[560px] text-[2.25rem] md:text-[2.75rem] xl:text-[3rem] [&>.accent]:block"
                />
              </div>
              <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[520px]">
                {CASES.text}
              </p>
              <div data-reveal="up" data-rd="3" className="mt-10 hidden lg:block" {...hold}>
                <AreaList {...timing} />
              </div>
            </div>

            <div data-reveal="up" data-rd="2" {...hold}>
              <Fan active={active} live={onScreen} />
            </div>

            <div data-reveal="up" data-rd="3" className="lg:hidden" {...hold}>
              <AreaGrid {...timing} />
            </div>
          </div>
        </Container>

        <ol className="sr-only">
          {ITEMS.map((item) => (
            <li key={item.name}>
              {item.name}: {item.tagline}{" "}
              {item.metrics.map((metric) => `${metric.value} ${metric.label}.`).join(" ")}
            </li>
          ))}
        </ol>
      </div>
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

/** The line under an area: full once done, filling over DWELL while it runs, empty otherwise (the Realität bars). */
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

/** Phones and tablets: the six areas as buttons in rows of three, the current one lit, its line filling. */
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

/** The fan of six glass layers (see above). Decorative for screen readers; the list below the section carries it. */
function Fan({ active, live }: { active: number; live: boolean }) {
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
      {ITEMS.map((item, i) => {
        const on = i === active;
        return (
          <div key={item.name} data-on={on || undefined} style={{ "--slot": i, zIndex: on ? 20 : COUNT - i } as CSSProperties} className="v11-fan-layer">
            <div className="flex items-baseline gap-3">
              <span className="num text-[14px] text-sky">{pad(i)}</span>
              <span className="text-[16px] leading-none font-medium tracking-[-0.005em] text-white">{item.name}</span>
            </div>
            <div className="v11-fan-detail">
              <p className="text-[19px] leading-[1.25] font-medium tracking-[-0.015em] text-balance text-white sm:text-[22px] lg:text-[24px]">{item.tagline}</p>
              <ul role="list" className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-5">
                {item.metrics.map((metric) => (
                  <li key={metric.label} className="grid grid-cols-[72px_minmax(0,1fr)] items-baseline gap-x-3 sm:block">
                    <p className="num text-[24px] leading-none text-white sm:text-[30px] lg:text-[36px]">
                      <CountUp value={metric.value} play={on && live} duration={1.3} delay={0.3} />
                    </p>
                    <p className="text-[13px] leading-snug text-white/65 sm:mt-2">{metric.label}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
