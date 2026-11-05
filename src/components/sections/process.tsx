"use client";

import { motion, useMotionValue, useMotionValueEvent, useSpring, type MotionValue } from "motion/react";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { PROCESS } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  The client's own timeline from brandedgenius.de, made better: a centre line with the steps alternating photo and
  text, and focus that follows the reader. A fill runs down the line with the scroll (its tip holds the middle of the
  screen). The step whose row holds the tip is in focus: white title, brighter text, photo at full strength, a soft
  sky halo on its node. Every other step rests at 60% text and 70% photo, passed nodes stay filled sky, upcoming
  nodes stay hollow. Everything is reversible: scrolling back up hands the focus back.

  Geometry (desktop, container 1216px): two 520px columns around a 176px channel, so the photos sit flush with the
  container edges and the line runs through the exact centre. Number, title, node and the photo's midline share one
  horizontal axis per step. Phones: the line moves to the left edge and every step stacks to its right (node, number
  and title, text, photo).
*/

type Step = (typeof PROCESS.steps)[number];

/* Every photo crops well to 4:3 from its centre except 05, whose graphic sits on the right edge. */
const FOCUS: Partial<Record<string, string>> = { "/media/process/05.webp": "object-[85%_50%]" };

/** How many of the ascending marks the value has reached. */
function countReached(marks: number[], value: number) {
  let count = 0;
  while (count < marks.length && value >= marks[count]) count += 1;
  return count;
}

type Focus = { reached: number; active: number };

export function ProcessSection() {
  const listRef = useRef<HTMLDivElement>(null);
  // Positions along the list (0 top, 1 bottom): each node's centre, and where each step's row begins (half way
  // through the gap above it). Measured by the ResizeObserver below, never during render.
  const marks = useRef<{ nodes: number[]; rows: number[] }>({ nodes: [], rows: [] });
  const focusRef = useRef<Focus>({ reached: 0, active: 0 });
  const [focus, setFocus] = useState<Focus>({ reached: 0, active: 0 });

  // The tip of the fill sits at the middle of the screen, so the step in focus is always fully in view at 1659x900.
  const progress = useSectionProgress(listRef, ["start 0.5", "end 0.5"]);
  // Overdamped (no overshoot past a node), settles in about half a second after the scroll stops.
  const smooth = useSpring(progress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // The fill follows the spring, or the scroll itself for visitors who asked for reduced motion. Chosen in an effect,
  // so the server markup and the first browser render are identical.
  const fill = useMotionValue(0);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => fill.set(query.matches ? progress.get() : smooth.get());
    update();
    const stopProgress = progress.on("change", update);
    const stopSmooth = smooth.on("change", update);
    query.addEventListener("change", update);
    return () => {
      stopProgress();
      stopSmooth();
      query.removeEventListener("change", update);
    };
  }, [fill, progress, smooth]);

  // Only a change of the passed count or the focused step re-renders, and then only the steps that change.
  const sync = useCallback((value: number) => {
    const reached = countReached(marks.current.nodes, value);
    const active = Math.max(0, countReached(marks.current.rows, value) - 1);
    const current = focusRef.current;
    if (reached === current.reached && active === current.active) return;
    focusRef.current = { reached, active };
    setFocus(focusRef.current);
  }, []);

  useMotionValueEvent(fill, "change", sync);

  // The observer reports once on start and again on any resize (fonts loading, a rotated phone).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => {
      const box = list.getBoundingClientRect();
      if (!box.height) return;
      const at = (y: number) => (y - box.top) / box.height;
      const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-step]"), (row) => row.getBoundingClientRect());
      const nodes = Array.from(list.querySelectorAll<HTMLElement>("[data-node]"), (node) => node.getBoundingClientRect());
      marks.current = {
        nodes: nodes.map((r) => at(r.top + r.height / 2)),
        // The first step holds the focus until the tip reaches the second row.
        rows: rows.map((r, i) => (i === 0 ? Number.NEGATIVE_INFINITY : at((rows[i - 1].bottom + r.top) / 2))),
      };
      sync(fill.get());
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [fill, sync]);

  return (
    <Section id="prozess" className="overflow-x-clip lg:pb-14">
      <Container>
        <Reveal y={12}>
          <Heading title={PROCESS.title} accent={PROCESS.accent} className="max-w-[820px]" />
          <p className="t-lead mt-6 max-w-[620px]">{PROCESS.text}</p>
        </Reveal>

        <div ref={listRef} className="relative mt-14 md:mt-20">
          <Line fill={fill} />
          <ol role="list" className="flex flex-col gap-14 lg:gap-24">
            {PROCESS.steps.map((step, index) => (
              <ProcessStep
                key={step.img}
                step={step}
                index={index}
                reached={index < focus.reached}
                active={index === focus.active}
              />
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

/*
  The line: a 1px track and a 2px fill, drawn at full height and scaled from the top (transform only, no layout per
  frame). Brand blues only: royal where the fill began, sky at its tip, so the light leads. The 40px wrapper is
  centred on the track so its mask fades both ends without clipping the fill's glow. Phones: track at 15px from the
  list edge, a short fade at the top (the first node sits there) and a long one at the bottom. Desktop: the centre,
  with the same long fade at both ends.
*/
function Line({ fill }: { fill: MotionValue<number> }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 -left-[4.5px] w-10 [--rail-fade:linear-gradient(to_bottom,transparent,#000_16px,#000_calc(100%_-_120px),transparent)] [-webkit-mask-image:var(--rail-fade)] [mask-image:var(--rail-fade)] lg:left-[calc(50%-19.5px)] lg:[--rail-fade:linear-gradient(to_bottom,transparent,#000_120px,#000_calc(100%_-_120px),transparent)]"
    >
      <div className="absolute inset-y-0 left-[19.5px] w-px bg-white/10" />
      <motion.div
        style={{ scaleY: fill }}
        className="absolute inset-y-0 left-[19px] w-[2px] origin-top rounded-full bg-linear-to-t from-sky to-royal shadow-[0_0_14px_rgb(105_191_248/0.35)] will-change-transform"
      />
    </div>
  );
}

/* One state change fades over 300ms; the global reduced-motion rule makes it instant. */
const FADE = "transition-colors duration-300 ease-out";

const ProcessStep = memo(function ProcessStep({
  step,
  index,
  reached,
  active,
}: {
  step: Step;
  index: number;
  /** The fill has passed this step's node. */
  reached: boolean;
  /** The fill's tip is in this step's row. */
  active: boolean;
}) {
  // Desktop alternates: even steps put the photo left of the line, odd steps put it right.
  const photoLeft = index % 2 === 0;

  return (
    <li data-step className="relative grid gap-y-6 pl-12 lg:grid-cols-2 lg:gap-x-44 lg:pl-0">
      {/*
        The node. Phones: centred on the number (36px, its figures centre 17px below the top of the line).
        Desktop: centred on the row, 1px up so it meets the 40px figures rather than the line box.
        Layers: the halo (focus), the ring (hollow until passed or in focus), the sky dot (passed).
      */}
      <span
        data-node
        aria-hidden
        className="absolute top-[9px] left-[7.5px] size-4 lg:top-[calc(50%-9px)] lg:left-[calc(50%-7.5px)]"
      >
        <span
          className={cn(
            "absolute inset-0 rounded-full shadow-[0_0_0_5px_rgb(105_191_248/0.12),0_0_22px_3px_rgb(105_191_248/0.45)] transition-opacity duration-300 ease-out",
            active ? "opacity-100" : "opacity-0"
          )}
        />
        <span className={cn("absolute inset-0 rounded-full border bg-page", FADE, reached || active ? "border-sky/70" : "border-white/25")} />
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-sky transition-[opacity,scale] duration-300 ease-out-expo",
            reached ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>

      {/*
        Text, straight on the page background. Desktop: a 1fr / auto / 1fr grid puts the number and title on the
        row's midline and the text hangs below. Resting colours stay above 4.5:1 on the navy (white 60% is about
        7:1, sky 70% about 5:1).
      */}
      <div
        className={cn(
          "lg:row-start-1 lg:grid lg:w-full lg:max-w-[420px] lg:grid-rows-[1fr_auto_1fr]",
          photoLeft ? "lg:col-start-2 lg:justify-self-start" : "lg:col-start-1 lg:justify-self-end"
        )}
      >
        <h3 className="flex items-baseline gap-4 lg:row-start-2">
          <span className={cn("num shrink-0 text-[36px] leading-none lg:text-[40px]", FADE, active ? "text-sky" : "text-silver")}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={cn("t-h3 min-w-0 break-words lg:text-[28px]", FADE, active ? "text-white" : "text-white/60")}>{step.title}</span>
        </h3>
        <p className={cn("t-body mt-3 max-w-[420px] lg:row-start-3 lg:mt-4", FADE, active ? "text-ink/85" : "text-ink/60")}>{step.text}</p>
      </div>

      {/*
        Photo in the shared frame. A fill image covers the frame's own inset hairline, so the same hairline is drawn
        again above the photo. The photo dims by opacity onto the page; the heading beside it names the step, so the
        image is decorative to a screen reader.
      */}
      <div
        className={cn(
          "frame aspect-[4/3] w-full max-w-[520px] lg:row-start-1 lg:self-center",
          photoLeft ? "lg:col-start-1" : "lg:col-start-2"
        )}
      >
        <Image
          src={step.img}
          alt=""
          fill
          sizes="(min-width:1024px) 520px, 100vw"
          className={cn("object-cover transition-opacity duration-300 ease-out", FOCUS[step.img], active ? "opacity-100" : "opacity-70")}
        />
      </div>
    </li>
  );
});
