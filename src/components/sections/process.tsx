"use client";

import { motion, useInView, useMotionValueEvent, useReducedMotion, useSpring, type MotionValue } from "motion/react";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { PROCESS } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  The client's favourite from brandedgenius.de: a centre line with the steps alternating photo and text, made into a
  better timeline. A fill runs down the line with the reader (its tip holds 65% down the screen), each node lights up
  when the fill reaches it, and photo and text slide in once from their own side. On phones the line moves to the left
  edge and every step stacks to its right: node, number and title, text, photo.

  Geometry (desktop, container 1216px): two 520px columns around a 176px channel, so the photos sit flush with the
  container edges and the line runs through the exact centre. Number, title, node and the photo's midline share one
  horizontal axis per step.
*/

type Step = (typeof PROCESS.steps)[number];
type Side = "left" | "right";

/* Every photo crops well to 4:3 from its centre except 05, whose graphic sits on the right edge. */
const FOCUS: Partial<Record<string, string>> = { "/media/process/05.webp": "object-[85%_50%]" };

export function ProcessSection() {
  const listRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const marks = useRef<number[]>([]);
  const reachedRef = useRef(0);
  const [reached, setReached] = useState(0);

  const reduce = useReducedMotion();
  const progress = useSectionProgress(listRef, ["start 0.65", "end 0.65"]);
  // Overdamped (no overshoot past a node), settles in about half a second after the scroll stops.
  const smooth = useSpring(progress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const fill = reduce ? progress : smooth;

  // Count the nodes the fill has passed. Only a change of that count re-renders: seven times across the whole list.
  const sync = useCallback((value: number) => {
    let count = 0;
    while (count < marks.current.length && value >= marks.current[count]) count += 1;
    if (count === reachedRef.current) return;
    reachedRef.current = count;
    setReached(count);
  }, []);

  useMotionValueEvent(fill, "change", sync);

  // Where each node sits along the list (0 top, 1 bottom). The observer reports once on start and again on any resize.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => {
      const box = list.getBoundingClientRect();
      if (!box.height) return;
      marks.current = nodes.current.map((node) => {
        if (!node) return Number.POSITIVE_INFINITY;
        const r = node.getBoundingClientRect();
        return (r.top + r.height / 2 - box.top) / box.height;
      });
      sync(fill.get());
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [fill, sync]);

  const registerNode = useCallback((index: number, node: HTMLSpanElement | null) => {
    nodes.current[index] = node;
  }, []);

  return (
    <Section id="prozess" className="overflow-x-clip">
      <Container>
        <Reveal>
          <Heading title={PROCESS.title} accent={PROCESS.accent} className="max-w-[820px]" />
          <p className="t-lead mt-6 max-w-[620px]">{PROCESS.text}</p>
        </Reveal>

        <div ref={listRef} className="relative mt-14 md:mt-20">
          <Line fill={fill} />
          <ol role="list" className="flex flex-col gap-14 lg:gap-24">
            {PROCESS.steps.map((step, index) => (
              <ProcessStep key={step.img} step={step} index={index} reached={index < reached} registerNode={registerNode} />
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

/*
  The line: a 1px track and a 2px fill scaled from the top. The 40px wrapper is centred on the track so its mask
  fades both ends without clipping the fill's glow. Phones: track at 15px from the list edge, a short fade at the top
  (the first node sits there) and a long one at the bottom. Desktop: the centre, with the same long fade at both ends.
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
        className="absolute inset-y-0 left-[19px] w-[2px] origin-top rounded-full bg-linear-to-b from-sky to-royal-bright shadow-[0_0_14px_rgb(105_191_248/0.45)] will-change-transform"
      />
    </div>
  );
}

const ProcessStep = memo(function ProcessStep({
  step,
  index,
  reached,
  registerNode,
}: {
  step: Step;
  index: number;
  reached: boolean;
  registerNode: (index: number, node: HTMLSpanElement | null) => void;
}) {
  // Desktop alternates: even steps put the photo left of the line, odd steps put it right.
  const photoSide: Side = index % 2 === 0 ? "left" : "right";
  const textSide: Side = photoSide === "left" ? "right" : "left";

  return (
    <li className="relative grid gap-y-6 pl-12 lg:grid-cols-2 lg:gap-x-44 lg:pl-0">
      {/*
        The node. Phones: centred on the number (36px serif, its figures centre 17px below the top of the line).
        Desktop: centred on the row, 1px up so it meets the 40px figures rather than the line box.
      */}
      <span
        ref={(node) => {
          registerNode(index, node);
        }}
        aria-hidden
        className="absolute top-[9px] left-[7.5px] size-4 lg:top-[calc(50%-9px)] lg:left-[calc(50%-7.5px)]"
      >
        <span className="absolute inset-0 rounded-full border border-white/25 bg-page" />
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-sky shadow-[0_0_0_4px_rgb(105_191_248/0.14),0_0_18px_rgb(105_191_248/0.55)] transition-[opacity,scale] duration-400 ease-out-expo",
            reached ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>

      {/* Text. Desktop: a 1fr / auto / 1fr grid puts the number and title on the row's midline, the text hangs below. */}
      <Slide
        side={textSide}
        delay={0.08}
        className={cn(
          "lg:row-start-1 lg:grid lg:w-full lg:max-w-[420px] lg:grid-rows-[1fr_auto_1fr]",
          textSide === "right" ? "lg:col-start-2 lg:justify-self-start" : "lg:col-start-1 lg:justify-self-end"
        )}
      >
        <h3 className="flex items-baseline gap-4 lg:row-start-2">
          <span className="num shrink-0 text-[36px] leading-none text-sky lg:text-[40px]">{String(index + 1).padStart(2, "0")}</span>
          <span className="t-h3 min-w-0 lg:text-[28px]">{step.title}</span>
        </h3>
        <p className="t-body mt-3 max-w-[420px] lg:row-start-3 lg:mt-4">{step.text}</p>
      </Slide>

      {/* Photo. The heading beside it names the step, so the image is decorative to a screen reader. */}
      <Slide
        side={photoSide}
        className={cn("w-full max-w-[520px] lg:row-start-1 lg:self-center", photoSide === "left" ? "lg:col-start-1" : "lg:col-start-2")}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-white/10">
          <Image
            src={step.img}
            alt=""
            fill
            sizes="(min-width:1024px) 520px, 100vw"
            className={cn("object-cover saturate-[0.85]", FOCUS[step.img])}
          />
          <div className="absolute inset-0 bg-linear-to-t from-page/40 to-transparent" />
        </div>
      </Slide>
    </li>
  );
});

/*
  Slides in once from its side (40px and a fade). Plain CSS transitions on translate and opacity run on the
  compositor, and the direction can follow the breakpoint: on phones everything sits right of the line, so it all
  arrives from the right. The hidden state only exists under motion-safe, so reduced motion shows everything at once.
*/
function Slide({ side, delay = 0, className, children }: { side: Side; delay?: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={cn(
        "transition-[translate,opacity] duration-900 ease-out-expo",
        shown
          ? "translate-x-0 opacity-100"
          : cn("motion-safe:translate-x-10 motion-safe:opacity-0", side === "left" && "motion-safe:lg:-translate-x-10"),
        className
      )}
    >
      {children}
    </div>
  );
}
