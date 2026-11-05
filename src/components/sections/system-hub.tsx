"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { createRef, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Container, Heading, PrimaryLink, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { LINKS, SYSTEM } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  System: the client's node map, set as type on the page background around one glass hub (the section's only glass).
  The eight tool groups are text labels, four on each side of the hub.

  Signature (lg only): routes play one at a time. A group sends a beam into the hub, then the hub sends one on to
  another group, about 2.6s per route; only the active route's two beams are mounted (keyed by route), so nothing
  else animates. The two groups involved turn from white to sky. Hovering or focusing a group plays the route that
  starts at it, for as long as the pointer or focus stays there. The cycle stops off screen and for reduced motion
  (where hover and focus still show the route as a still line, without the moving light).

  Every beam runs from a zero-size anchor just outside the label's inner edge to a port on the hub's facing side, one
  port per row, so lines never pass under text. Below lg: the hub, then the groups as a two-column text list, no
  beams. Breakpoint and reduced-motion state come from useSyncExternalStore with a server value of false, so the
  server markup and the hydration render always match.
*/

const NODES = SYSTEM.nodes;
const LEFT = NODES.slice(0, 4);
const RIGHT = NODES.slice(4);

const ROUTE_MS = 2600; // one route: in, then out
const LEG_MS = 1100; // when the hub sends the beam on
const BEAM_S = 1.3; // one pass of the light
const PORT_GAP = 40; // px between the four ports on each side of the hub

type Route = { from: number; to: number };

const at = (title: string) => NODES.findIndex((node) => node.title === title);
const route = (from: string, to: string): Route => ({ from: at(from), to: at(to) });

// The cycle, in order: a chain from the website through the CRM and the calendar to e-mail, then two more.
const CYCLE: Route[] = [
  route("Website", "CRM"),
  route("CRM", "Calendar Booking"),
  route("Calendar Booking", "E-Mail"),
  route("WhatsApp", "AI Agents"),
  route("Automation Tools", "Project Management"),
].filter((r) => r.from >= 0 && r.to >= 0);

// The route each group starts when hovered or focused: its cycle route, or a plausible hand-off for the other three.
const EXTRA: Route[] = [route("E-Mail", "CRM"), route("Project Management", "E-Mail"), route("AI Agents", "CRM")];
const ROUTE_FROM: Route[] = NODES.map((_, i) => CYCLE.find((r) => r.from === i) ?? EXTRA.find((r) => r.from === i) ?? { from: i, to: at("CRM") });

/* Breakpoint and reduced motion, read after hydration (server value false). */
const LG = "(min-width: 64rem)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribe = (query: string) => (onChange: () => void) => {
  const list = window.matchMedia(query);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
};
const subscribeLg = subscribe(LG);
const subscribeReduce = subscribe(REDUCE);
const serverFalse = () => false;
const useLg = () => useSyncExternalStore(subscribeLg, () => window.matchMedia(LG).matches, serverFalse);
const useReduce = () => useSyncExternalStore(subscribeReduce, () => window.matchMedia(REDUCE).matches, serverFalse);

// A no-break space before each dot keeps the dot on its tool's line when the list wraps.
const NBSP = String.fromCharCode(0xa0);
const joined = (items: readonly string[]) => items.join(`${NBSP}· `);

export function SystemSection() {
  const diagram = useRef<HTMLDivElement>(null);
  const inView = useInView(diagram, { margin: "0px 0px -10% 0px" });
  const desktop = useLg();
  const reduce = useReduce();

  // Stable ref objects for the label anchors and the hub ports (one each per group).
  const [anchors] = useState(() => NODES.map(() => createRef<HTMLSpanElement>()));
  const [ports] = useState(() => NODES.map(() => createRef<HTMLSpanElement>()));

  const [step, setStep] = useState(0); // position in CYCLE
  const [pinned, setPinned] = useState<number | null>(null); // the hovered or focused group
  const [run, setRun] = useState(0); // a new number for every route that starts
  const [outboundRun, setOutboundRun] = useState(-1); // the run whose second leg has started

  const active = pinned !== null ? ROUTE_FROM[pinned] : CYCLE[step];
  const show = desktop && active !== undefined && (pinned !== null || (inView && !reduce));
  const outbound = outboundRun === run;

  useEffect(() => {
    if (!desktop) return;
    if (pinned === null && !(inView && !reduce)) return;
    const current = run;
    const leg = window.setTimeout(() => setOutboundRun(current), LEG_MS);
    const next =
      pinned === null
        ? window.setTimeout(() => {
            setStep((s) => (s + 1) % CYCLE.length);
            setRun((r) => r + 1);
          }, ROUTE_MS)
        : undefined;
    return () => {
      window.clearTimeout(leg);
      if (next !== undefined) window.clearTimeout(next);
    };
  }, [desktop, inView, reduce, pinned, run]);

  const play = (i: number) => {
    if (pinned === i) return;
    setPinned(i);
    setRun((r) => r + 1);
  };
  const release = (i: number) => {
    if (pinned !== i) return;
    setPinned(null);
    setRun((r) => r + 1);
  };

  const lit = (i: number) => show && (i === active.from || (outbound && i === active.to));

  const label = (node: (typeof NODES)[number], i: number) => {
    const left = i < 4;
    return (
      <li
        key={node.title}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") play(i);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") release(i);
        }}
        className={cn(
          "relative border-t border-white/8 pt-4 lg:max-w-[17rem] lg:self-center lg:border-0 lg:pt-0",
          left ? "lg:justify-self-end lg:text-right" : "lg:justify-self-start"
        )}
      >
        {/* Where the beam meets this group: 16px outside the label's inner edge, at its vertical centre. */}
        <span
          ref={anchors[i]}
          aria-hidden
          className={cn("pointer-events-none absolute top-1/2 hidden size-0 lg:block", left ? "-right-4" : "-left-4")}
        />
        <h3
          className={cn(
            "text-[17px] leading-snug font-medium break-words hyphens-auto transition-colors duration-200 ease-out",
            lit(i) ? "text-sky" : "text-white"
          )}
        >
          <span className="lg:hidden">{node.title}</span>
          {/* On lg the group is a real button: hover, focus or press plays its route. Its hit area covers the whole label. */}
          <button
            type="button"
            onFocus={() => play(i)}
            onBlur={() => release(i)}
            onClick={() => play(i)}
            className="hidden cursor-pointer text-inherit after:absolute after:-inset-3 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-0 focus-visible:after:outline-sky lg:inline"
          >
            {node.title}
          </button>
        </h3>
        <p className="mt-1.5 text-[14px] leading-relaxed break-words text-silver">{joined(node.tools)}</p>
      </li>
    );
  };

  const port = (i: number) => {
    const left = i < 4;
    return (
      <span
        key={i}
        ref={ports[i]}
        aria-hidden
        className={cn("pointer-events-none absolute hidden size-0 lg:block", left ? "left-0" : "right-0")}
        style={{ top: `calc(50% + ${((i % 4) - 1.5) * PORT_GAP}px)` }}
      />
    );
  };

  return (
    <Section id="system">
      <Container>
        <Reveal>
          <Heading title={SYSTEM.title} accent={SYSTEM.accent} className="max-w-[820px]" />
          <p className="t-lead mt-6 max-w-[620px]">{SYSTEM.text}</p>
          <PrimaryLink href={LINKS.analysis} className="mt-9">
            {SYSTEM.cta}
          </PrimaryLink>
        </Reveal>

        {/* The whole diagram enters as one block, so the measured beam positions are never taken mid-transform per label. */}
        <Reveal className="mt-16 md:mt-24">
          <div
            ref={diagram}
            className="relative grid grid-cols-2 gap-x-6 gap-y-10 lg:h-[560px] lg:grid-cols-[minmax(0,1fr)_240px_minmax(0,1fr)] lg:gap-x-28 lg:gap-y-0 xl:gap-x-40"
          >
            <AnimatePresence>
              {show && (
                <motion.div
                  key={run}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 hidden lg:block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <AnimatedBeam
                    containerRef={diagram}
                    fromRef={anchors[active.from]}
                    toRef={ports[active.from]}
                    duration={BEAM_S}
                    pathWidth={1.25}
                    pathOpacity={0.14}
                  />
                  {outbound && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <AnimatedBeam
                        containerRef={diagram}
                        fromRef={ports[active.to]}
                        toRef={anchors[active.to]}
                        duration={BEAM_S}
                        pathWidth={1.25}
                        pathOpacity={0.14}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* The hub: the section's one glass surface. A row on phones, a column in the middle on lg. */}
            <div className="glass glass-lit relative z-10 col-span-2 flex items-center gap-5 rounded-[28px] px-6 py-6 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:flex-col lg:gap-0 lg:self-center lg:px-7 lg:py-10 lg:text-center">
              {NODES.map((_, i) => port(i))}
              {/* eslint-disable-next-line @next/next/no-img-element -- a small static vector mark; next/image adds nothing */}
              <img src="/brand/mark.svg" alt="" width={89} height={56} className="h-14 w-auto shrink-0" />
              <div>
                <p className="text-[18px] leading-tight font-medium tracking-[-0.01em] text-white lg:mt-5">Branded Genius</p>
                <p className="mt-1.5 text-[14px] leading-normal text-balance text-silver lg:mt-2">{SYSTEM.claim}</p>
              </div>
            </div>

            <ul role="list" className="relative z-10 flex flex-col gap-8 lg:col-start-1 lg:row-start-1 lg:grid lg:h-full lg:grid-rows-4 lg:gap-0">
              {LEFT.map((node, i) => label(node, i))}
            </ul>
            <ul role="list" className="relative z-10 flex flex-col gap-8 lg:col-start-3 lg:row-start-1 lg:grid lg:h-full lg:grid-rows-4 lg:gap-0">
              {RIGHT.map((node, i) => label(node, i + 4))}
            </ul>
          </div>
        </Reveal>

        <Reveal className="mt-20 md:mt-28">
          <div aria-hidden className="rule" />
          <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {SYSTEM.qualities.map((quality, i) => (
              <li
                key={quality.title}
                className={cn(
                  "min-w-0 py-6 lg:py-8",
                  // Phones: one column with a hairline between items, so "Unternehmenstauglich" never breaks mid-word.
                  i > 0 && "border-t border-white/8",
                  // sm: 2x2, a vertical hairline between the columns and a horizontal one between the rows.
                  i === 1 && "sm:border-t-0",
                  i % 2 === 1 ? "sm:border-l sm:border-white/8 sm:pl-6" : "sm:pr-6",
                  // lg: one row of four, vertical hairlines between them.
                  "lg:border-t-0 lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pl-0"
                )}
              >
                <h3 className="text-[16px] leading-snug font-medium text-white">{quality.title}</h3>
                <p className="mt-1 text-[14px] leading-normal text-silver">{quality.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
