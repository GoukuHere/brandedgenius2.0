"use client";

import { animate, motion, useMotionValue, useReducedMotion, type Variant } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { InView } from "@/components/ui/in-view";
import { Tilt } from "@/components/ui/tilt";
import { REALITY } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Die Realität, v5. The developer found v4's left column too heavy (six 36px titles with large outlined numbers),
  so the reasons are now a quiet index and the photo is the one big object.

  Desktop (lg): a vertical tab list on the left (sky number + 19px title, hairlines between) and, on the right, a
  large photo with the active reason's text under it. A thin sky line fills under the active reason; when it is
  full the next reason takes over, so the section moves on its own. It pauses while the pointer is over it, while a
  tab has keyboard focus, while the section is off screen and while the browser tab is hidden. A click or the arrow
  keys choose a reason directly. The new photo wipes up over the old one (clip-path from the bottom, 450ms,
  ease-out-expo, settling from 1.04); all six stay mounted, so a change never waits for an image. Motion Primitives
  Tilt turns the photo slightly under the pointer. Reduced motion: no auto-advance, instant swaps.

  Phones and tablets: every reason shows its photo and its text directly under its title, and each row rises in
  with Motion Primitives InView.
*/

type Reason = (typeof REALITY.items)[number];
type Layer = "on" | "under" | "off";

const ITEMS = REALITY.items;
const EASE = [0.16, 1, 0.3, 1] as const;

// Seconds each reason stays before the next one takes over.
const DWELL = 6;

// The photo wipe: the new photo opens upwards from the bottom edge over the one it replaces.
const REVEAL = 0.45;
const SHOWN = "inset(0% 0% 0% 0%)";
const HIDDEN = "inset(100% 0% 0% 0%)";

// reality/05 is portrait (798x922): keep the face and the clock in the landscape crops.
const FOCUS: Partial<Record<number, string>> = { 4: "object-[50%_20%]" };

const RISE: { hidden: Variant; visible: Variant } = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};
const VIEW = { once: true, margin: "0px 0px -10% 0px" } as const;

const numberOf = (index: number) => String(index + 1).padStart(2, "0");

export function RealitySection() {
  const uid = useId();
  const panelId = `${uid}-panel`;
  const tabId = (index: number) => `${uid}-tab-${index}`;

  const [view, setView] = useState({ active: 0, previous: -1 });
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const block = useRef<HTMLDivElement>(null);
  // Only timing depends on it, never the markup.
  const reduce = useReducedMotion();
  const reveal = reduce ? 0 : REVEAL;

  // How far the active reason's line has filled (0 to 1).
  const progress = useMotionValue(0);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  const select = useCallback(
    (next: number) => {
      // Under reduced motion there is no timer: the active reason's line simply shows full.
      progress.set(reduce ? 1 : 0);
      setView((current) => (current.active === next ? current : { active: next, previous: current.active }));
    },
    [progress, reduce]
  );

  useEffect(() => {
    if (reduce) progress.set(1);
  }, [reduce, progress]);

  useEffect(() => {
    const element = block.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(element);
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // The line fills over the reason's remaining time; when it is full, the next reason takes over.
  const running = inView && !hovered && !focused && !pageHidden && !reduce;
  useEffect(() => {
    if (!running) return;
    const controls = animate(progress, 1, {
      duration: DWELL * (1 - progress.get()),
      ease: "linear",
      onComplete: () => select((view.active + 1) % ITEMS.length),
    });
    return () => controls.stop();
  }, [running, view.active, progress, select]);

  // Roving focus: Up/Down (and Left/Right) move between the tabs, Home/End jump to the ends.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next = -1;
    if (event.key in keys) next = (view.active + keys[event.key] + ITEMS.length) % ITEMS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = ITEMS.length - 1;
    if (next < 0) return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }

  const layerOf = (index: number): Layer =>
    index === view.active ? "on" : index === view.previous ? "under" : "off";

  return (
    <Section id="realitaet">
      <Container>
        <InView variants={RISE} transition={{ duration: 0.8, ease: EASE }} viewOptions={VIEW}>
          <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-10">
            <Heading title={REALITY.title} accent={REALITY.accent} variant="outline" className="lg:col-span-7" />
            <p className="t-lead mt-6 max-w-[520px] lg:col-span-4 lg:col-start-9 lg:mt-0">{REALITY.text}</p>
          </div>
        </InView>

        {/* Desktop: a quiet index on the left, the photo as the one big object on the right. */}
        <div
          ref={block}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          className="mt-16 hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-16"
        >
          <div className="lg:col-span-5">
          <InView variants={RISE} transition={{ duration: 0.8, ease: EASE }} viewOptions={VIEW}>
            <div
              role="tablist"
              aria-orientation="vertical"
              aria-label={`${REALITY.title} ${REALITY.accent}`}
              onKeyDown={onKeyDown}
              onFocus={(event) => setFocused((event.target as HTMLElement).matches(":focus-visible"))}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
              }}
              className="border-t border-white/[0.08]"
            >
              {ITEMS.map((item, index) => {
                const on = index === view.active;
                return (
                  <button
                    key={item.img}
                    ref={(element) => {
                      tabs.current[index] = element;
                    }}
                    id={tabId(index)}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={panelId}
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(index)}
                    className="group relative flex w-full cursor-pointer items-baseline gap-5 py-[22px] text-left focus-visible:-outline-offset-2"
                  >
                    <span
                      className={cn(
                        "num w-6 shrink-0 text-[14px] transition-colors duration-300",
                        on ? "text-sky" : "text-sky/50"
                      )}
                    >
                      {numberOf(index)}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 text-[19px] leading-snug font-medium tracking-[-0.01em] transition-colors duration-300 ease-out",
                        // 55% white on the page navy is about 6:1.
                        on ? "text-white" : "text-white/55 group-hover:text-white/85"
                      )}
                    >
                      {item.title}
                    </span>
                    {/* The row's hairline; under the active reason a sky line fills it while the reason is shown. */}
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.08]">
                      {on && (
                        <motion.span
                          style={{ scaleX: progress }}
                          className="absolute inset-0 origin-left bg-sky"
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </InView>
          </div>

          <div id={panelId} role="tabpanel" aria-labelledby={tabId(view.active)} className="lg:col-span-7">
            <Tilt
              rotationFactor={4}
              springOptions={{ stiffness: 220, damping: 24, mass: 0.6 }}
              className="rounded-[28px] motion-reduce:!transform-none"
            >
              <div className="frame aspect-[16/10] w-full rounded-[28px] bg-deep shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]">
                {ITEMS.map((item, index) => (
                  <PanelPhoto key={item.img} item={item} index={index} layer={layerOf(index)} duration={reveal} />
                ))}
              </div>
            </Tilt>

            {/* All six texts share one grid cell, so the panel never changes height. */}
            <div className="mt-7 grid">
              {ITEMS.map((item, index) => {
                const on = index === view.active;
                return (
                  <motion.div
                    key={item.img}
                    aria-hidden={!on}
                    initial={false}
                    animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6 }}
                    transition={{ duration: on ? 0.45 : 0.2, delay: on ? 0.12 : 0, ease: EASE }}
                    className="col-start-1 row-start-1 flex gap-4"
                  >
                    <span className="num text-[17px] leading-[1.65] font-medium text-sky">{numberOf(index)}</span>
                    <p className="t-body max-w-[560px]">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Phones and tablets: every reason with its photo and text, all visible. */}
        <ol role="list" className="mt-12 md:mt-16 lg:hidden">
          {ITEMS.map((item, index) => (
            <InView key={item.img} as="li" variants={RISE} transition={{ duration: 0.7, ease: EASE }} viewOptions={VIEW}>
              <div aria-hidden className="rule" />
              <div className="py-8 md:py-10">
                <h3 className="flex items-center gap-4 md:gap-6">
                  <span aria-hidden className="ghost-num shrink-0 text-[52px] md:text-[64px]">
                    {numberOf(index)}
                  </span>
                  <span className="min-w-0 text-[24px] leading-[1.18] font-medium tracking-[-0.015em] text-balance text-white md:text-[30px]">
                    {item.title}
                  </span>
                </h3>
                <div className="frame mt-6 aspect-[3/2] w-full bg-deep md:max-w-[640px]">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    sizes="(min-width: 768px) 640px, 100vw"
                    className={cn("object-cover", FOCUS[index])}
                  />
                </div>
                <p className="t-body mt-5 max-w-[560px]">{item.text}</p>
              </div>
            </InView>
          ))}
        </ol>
        <div aria-hidden className="rule lg:hidden" />
      </Container>
    </Section>
  );
}

/*
  One photo in the panel's stack. "on" wipes up from the bottom (and settles from 1.04) above everything; "under" is
  the photo it replaces, kept whole beneath it until the wipe has finished; "off" is hidden, but only once a wipe
  that may still need it as a backdrop has had time to end.
*/
function PanelPhoto({ item, index, layer, duration }: { item: Reason; index: number; layer: Layer; duration: number }) {
  const clip =
    layer === "on"
      ? { clipPath: [HIDDEN, SHOWN], transition: { duration, ease: EASE } }
      : layer === "under"
        ? { clipPath: SHOWN, transition: { duration, ease: EASE } }
        : { clipPath: HIDDEN, transition: { duration: 0, delay: duration } };

  return (
    <motion.div
      aria-hidden={layer !== "on"}
      initial={false}
      animate={clip}
      style={{ zIndex: layer === "on" ? 3 : layer === "under" ? 2 : 1 }}
      className="absolute inset-0"
    >
      <motion.div
        initial={false}
        animate={{ scale: layer === "on" ? [1.04, 1] : 1 }}
        transition={{ duration, ease: EASE }}
        className="absolute inset-0"
      >
        <Image
          src={item.img}
          alt={item.title}
          fill
          sizes="(min-width: 1024px) 720px, 100vw"
          className={cn("object-cover", FOCUS[index])}
        />
      </motion.div>
    </motion.div>
  );
}
