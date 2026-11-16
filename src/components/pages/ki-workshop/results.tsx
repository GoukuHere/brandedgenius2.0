"use client";

import { Check } from "lucide-react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SCROLL_SPRING } from "@/components/sections/system-circuit";
import { Container, Heading, PrimaryLink, Section } from "@/components/system/primitives";
import { KW_RESULTS } from "@/content/pages/ki-workshop";
import { LINKS } from "@/content/site";

/*
  Ergebnisse: a course-progress composition. A large ring fills from 0 to 100% while the composition scrolls up the
  screen (scroll-linked and reversible; nothing holds the page). Six nodes sit on the ring, one per result, the last
  one where the ring closes at the top; as the arc reaches a node it lights, and the result beside the ring ticks off.
  The middle counts the reached results in his own "01 / 06" form, and at 100% his "Praxistransfer garantiert"
  appears under the count. His button follows the list.

  The progress is measured from the composition itself every frame (its top from 80% of the screen up to 24%, on phones
  14%), so it is complete while the whole composition is in view. Reduced motion: the ring stands full, every result
  ticked.
*/

const ITEMS = KW_RESULTS.items;
const N = ITEMS.length;
const pad = (n: number) => String(n).padStart(2, "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// The ring in a 400 box: centre 200, radius 176; a dial of fine ticks just outside it.
const C = 200;
const R = 176;
const DIAL = 191;
const NODES = ITEMS.map((_, i) => {
  const angle = ((i + 1) / N) * Math.PI * 2;
  return { x: C + R * Math.sin(angle), y: C - R * Math.cos(angle) };
});

/** How many results the ring has reached at a progress (each one at its sixth of the ring). */
const reached = (p: number) => ITEMS.filter((_, i) => p >= (i + 1) / N - 0.004).length;

export function KwResults() {
  const stage = useRef<HTMLDivElement>(null);
  const live = useMotionValue(1);
  const [count, setCount] = useState(0);
  const { scrollY } = useScroll();

  const raw = useTransform(() => {
    scrollY.get();
    const el = stage.current;
    if (!el || typeof window === "undefined") return 0;
    const vh = window.innerHeight;
    const top = el.getBoundingClientRect().top;
    const from = 0.8 * vh;
    const to = (window.innerWidth >= 1024 ? 0.24 : 0.14) * vh;
    return clamp01((from - top) / (from - to));
  });
  const smooth = useSpring(raw, SCROLL_SPRING);
  const shown = useTransform(() => (live.get() ? smooth.get() : 1));
  // A round cap would leave a dot at the start while the arc is still empty.
  const arcOpacity = useTransform(() => (shown.get() > 0.004 ? 1 : 0));

  useMotionValueEvent(shown, "change", (v) => setCount(reached(v)));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) live.set(0);
  }, [live]);

  return (
    <Section id="ergebnisse">
      <Container>
        <div className="grid gap-y-6 lg:grid-cols-12 lg:items-end lg:gap-x-8">
          <div className="lg:col-span-6">
            <Heading title={KW_RESULTS.title} accent={KW_RESULTS.accent} className="kw-break" />
          </div>
          <p data-reveal="up" data-rd="2" className="t-lead max-w-[560px] lg:col-span-5 lg:col-start-8">
            {KW_RESULTS.text}
          </p>
        </div>

        <div ref={stage} className="mt-12 grid items-center gap-y-10 md:mt-16 lg:mt-20 lg:grid-cols-12 lg:gap-x-8">
          {/* The ring */}
          <div className="relative mx-auto aspect-square w-full max-w-[248px] sm:max-w-[340px] lg:col-span-5 lg:max-w-[460px]">
            <div aria-hidden className="kw-glow absolute -inset-[16%] -z-10" />
            <svg viewBox="0 0 400 400" aria-hidden className="absolute inset-0 size-full overflow-visible">
              <defs>
                <linearGradient id="kw-ring-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#dcecff" />
                  <stop offset="1" stopColor="#69bff8" />
                </linearGradient>
              </defs>
              <circle cx={C} cy={C} r={DIAL} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth={7} pathLength={360} strokeDasharray="0.5 5.5" />
              <circle cx={C} cy={C} r={R - 36} fill="none" stroke="rgb(255 255 255 / 0.05)" strokeWidth={1} />
              <circle cx={C} cy={C} r={R} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth={1.5} />
              <g transform={`rotate(-90 ${C} ${C})`}>
                <motion.circle
                  cx={C}
                  cy={C}
                  r={R}
                  fill="none"
                  stroke="rgb(105 191 248 / 0.16)"
                  strokeWidth={14}
                  strokeLinecap="round"
                  style={{ pathLength: shown, opacity: arcOpacity }}
                />
                <motion.circle
                  cx={C}
                  cy={C}
                  r={R}
                  fill="none"
                  stroke="url(#kw-ring-grad)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  style={{ pathLength: shown, opacity: arcOpacity }}
                />
              </g>
              {NODES.map((node, i) => {
                const on = i < count ? "" : undefined;
                return (
                  <g key={i}>
                    <circle cx={node.x} cy={node.y} r={6} className="kw-ring-halo" data-on={on} />
                    <circle cx={node.x} cy={node.y} r={6} className="kw-ring-node" data-on={on} />
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p aria-hidden className="num leading-none text-white">
                  <span key={count} className="kw-count inline-block text-[60px] sm:text-[76px] lg:text-[92px]">
                    {pad(count)}
                  </span>
                  <span className="text-[20px] text-white/40 sm:text-[26px] lg:text-[30px]"> / {pad(N)}</span>
                </p>
                <p data-on={count === N ? "" : undefined} className="kw-ring-done mt-2 inline-flex items-center gap-2 text-[13.5px] text-sky sm:mt-3 lg:mt-4 lg:text-[16px]">
                  <Check aria-hidden strokeWidth={1.75} className="size-4" />
                  {KW_RESULTS.done}
                </p>
              </div>
            </div>
          </div>

          {/* The results */}
          <div className="lg:col-span-6 lg:col-start-7">
            <ol role="list">
              {ITEMS.map((item, i) => (
                <li key={item} data-on={i < count ? "" : undefined} className="kw-result">
                  <span aria-hidden className="kw-result-check">
                    <svg viewBox="0 0 24 24" className="size-[18px]">
                      <path d="M6.5 12.5l3.6 3.6 7.4-8.2" pathLength={1} />
                    </svg>
                  </span>
                  <span className="text-[16px] leading-[1.35] font-medium tracking-[-0.01em] sm:text-[17px] lg:text-[20px]">{item}</span>
                </li>
              ))}
            </ol>
            <div data-reveal="up" className="mt-8 lg:mt-10">
              <PrimaryLink href={LINKS.booking}>{KW_RESULTS.cta}</PrimaryLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
