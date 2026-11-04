"use client";

import { Building2, Network, ShieldCheck, TrendingUp } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Container, Heading, IconChip, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { SYSTEM } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  The hub diagram. Desktop: the eight tool groups in two columns of four around the Branded Genius hub. An SVG behind
  the grid joins each card's inner edge to the hub with a cubic curve, built from the cards' measured positions
  (ResizeObserver), so the curves meet the cards exactly at every width and after the fonts load. A short sky light
  runs along each curve from the tool into the hub (CSS stroke-dashoffset on a pathLength=1 path), paused while the
  diagram is off screen and left out entirely for reduced motion. Mobile: hub first, tools in two columns, no SVG.
*/

const QUALITY_ICONS = [ShieldCheck, Network, TrendingUp, Building2];
const QUALITIES = SYSTEM.qualities.map((quality, i) => ({ ...quality, Icon: QUALITY_ICONS[i] }));

const ROW_START = ["lg:row-start-1", "lg:row-start-2", "lg:row-start-3", "lg:row-start-4"];
const DESKTOP = "(min-width: 64rem)"; // Tailwind's lg: the only layout that shows the SVG
const PORT_GAP = 40; // px between the four landing points on each side of the hub
const LIGHT_STEP = 0.45; // s between departures: one 3.6s loop shared by eight curves

// Lights leave in turn, alternating sides from the top row down: left 1, right 1, left 2, right 2, ...
const lightDelay = (i: number) => ((i % 4) * 2 + (i < 4 ? 0 : 1)) * LIGHT_STEP;

// Hoisted into <head> once by React. Lights park at their card until the diagram is on screen.
const FLOW_CSS = `
@keyframes hub-flow { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.hub-flow { animation: hub-flow 3.6s linear infinite both; animation-play-state: paused; }
[data-on="true"] > svg .hub-flow { animation-play-state: running; }
@media (prefers-reduced-motion: reduce) { .hub-flow { display: none; } }
`;

const px = (n: number) => Math.round(n * 10) / 10;

/** A cubic from the card to the hub, level at both ends, so it leaves the card and enters the hub straight. */
function curve(x0: number, y0: number, x1: number, y1: number) {
  const c = (x1 - x0) / 2;
  return `M${px(x0)} ${px(y0)}C${px(x0 + c)} ${px(y0)} ${px(x1 - c)} ${px(y1)} ${px(x1)} ${px(y1)}`;
}

export function SystemSection() {
  const reduce = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const onScreen = useInView(gridRef, { margin: "0px 0px -10% 0px" });

  useEffect(() => {
    const grid = gridRef.current;
    const hub = hubRef.current;
    if (!grid || !hub) return;
    const desktop = window.matchMedia(DESKTOP);

    // Measured relative to the grid, so the entrance transform on the wrapping Reveal cancels out.
    const measure = () => {
      if (!desktop.matches) return;
      const g = grid.getBoundingClientRect();
      const h = hub.getBoundingClientRect();
      const hubMid = h.top + h.height / 2 - g.top;
      setPaths(
        nodeRefs.current.map((card, i) => {
          if (!card) return "";
          const c = card.getBoundingClientRect();
          const left = i < 4;
          return curve(
            (left ? c.right : c.left) - g.left,
            c.top + c.height / 2 - g.top,
            (left ? h.left : h.right) - g.left,
            hubMid + ((i % 4) - 1.5) * PORT_GAP
          );
        })
      );
    };

    // Fires once when observing starts, then on every size change (viewport, breakpoint, fonts, content).
    const observer = new ResizeObserver(measure);
    for (const el of [grid, hub, ...nodeRefs.current]) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Section id="system">
      <style href="bg-system-hub-flow" precedence="default">
        {FLOW_CSS}
      </style>
      <Container>
        <Reveal>
          <Heading title={SYSTEM.title} accent={SYSTEM.accent} className="max-w-[820px]" />
          <p className="t-lead mt-6 max-w-[620px]">{SYSTEM.text}</p>
        </Reveal>

        <Reveal className="mt-14 md:mt-20">
          <div
            ref={gridRef}
            data-on={onScreen ? "true" : "false"}
            className="relative grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-[minmax(0,1fr)_240px_minmax(0,1fr)] lg:grid-rows-4 lg:gap-x-24 lg:gap-y-5 xl:grid-cols-[minmax(0,1fr)_280px_minmax(0,1fr)] xl:gap-x-36"
          >
            <svg
              aria-hidden
              fill="none"
              className={cn(
                "pointer-events-none absolute inset-0 hidden size-full overflow-visible transition-opacity duration-700 lg:block",
                paths.length ? "opacity-100" : "opacity-0"
              )}
            >
              {paths.map((d, i) =>
                d ? (
                  <g key={i}>
                    <path d={d} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={1} />
                    <path
                      d={d}
                      stroke="#69bff8"
                      strokeOpacity={0.55}
                      strokeWidth={1}
                      className={cn("transition-opacity duration-300", active === i ? "opacity-100" : "opacity-0")}
                    />
                    {reduce ? null : (
                      <>
                        <path
                          d={d}
                          pathLength={1}
                          className="hub-flow"
                          stroke="#69bff8"
                          strokeOpacity={0.22}
                          strokeWidth={6}
                          strokeLinecap="round"
                          strokeDasharray="0.07 0.93"
                          style={{ animationDelay: `${lightDelay(i)}s` }}
                        />
                        <path
                          d={d}
                          pathLength={1}
                          className="hub-flow"
                          stroke="#69bff8"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeDasharray="0.07 0.93"
                          style={{ animationDelay: `${lightDelay(i)}s` }}
                        />
                      </>
                    )}
                  </g>
                ) : null
              )}
            </svg>

            <div
              ref={hubRef}
              className="surface relative z-10 col-span-2 flex flex-col items-center border-sky/25 px-6 py-9 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_30px_80px_-36px_rgb(105_191_248/0.5)] lg:col-span-1 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:self-center lg:py-11"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a small static vector mark; next/image adds nothing */}
              <img src="/brand/mark.svg" alt="" width={89} height={56} className="h-14 w-auto" />
              <p className="mt-5 text-[20px] leading-tight font-medium tracking-[-0.01em] text-white">Branded Genius</p>
              <p className="t-small mt-2 max-w-[15rem] text-balance">{SYSTEM.claim}</p>
            </div>

            {SYSTEM.nodes.map((node, i) => (
              <div
                key={node.title}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setActive(i);
                }}
                onPointerLeave={() => setActive(null)}
                className={cn(
                  "surface relative z-10 p-5 transition-colors duration-300 hover:border-sky/30",
                  i < 4 ? "lg:col-start-1" : "lg:col-start-3",
                  ROW_START[i % 4]
                )}
              >
                <h3 className="text-[16px] leading-snug font-medium text-white hyphens-auto sm:text-[17px]">{node.title}</h3>
                {/* A no-break space keeps each dot on its tool's line when the list wraps. */}
                <p className="mt-1.5 text-[14px] leading-relaxed text-silver">{node.tools.join(" · ")}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div aria-hidden className="hairline mt-16" />
        <ul role="list" className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {QUALITIES.map((quality, i) => (
            <Reveal key={quality.title} as="li" delay={i * 0.08} className="flex items-center gap-4">
              <IconChip>
                <quality.Icon strokeWidth={1.5} aria-hidden />
              </IconChip>
              <div>
                <h3 className="text-[17px] leading-snug font-medium text-white">{quality.title}</h3>
                <p className="mt-0.5 text-[15px] leading-normal text-silver">{quality.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
