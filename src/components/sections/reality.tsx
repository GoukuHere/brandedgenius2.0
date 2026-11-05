"use client";

import { motion, useReducedMotion, type Variant } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { InView } from "@/components/ui/in-view";
import { Tilt } from "@/components/ui/tilt";
import { REALITY } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Die Realität, v4. One big object per screen: the six reasons are an editorial index on the left (large outlined
  numbers, 36px titles, hairlines between), and ONE photo holds the right side in a sticky panel.

  Desktop (lg): the active reason is the row crossing the middle of the screen (an IntersectionObserver on a thin
  band at 50%). Clicking a row, or reaching it with the keyboard, activates it too; for a moment after
  that the scroll spy stands back, so the scroll that brings a focused row into view does not take the choice away.
  The active row turns white, its number's stroke brightens and a sky dot with a short line slides in at its left
  edge. The panel follows: the new photo wipes up over the old one (clip-path from the bottom, 450ms, ease-out-expo,
  with a 1.04 to 1 settle) and the text crossfades. All six photos stay mounted in the frame, so a change never
  waits for an image to load. Motion Primitives Tilt turns the photo slightly under the pointer.

  Phones and tablets: no panel. Every reason shows its photo and its text directly under its title, and each row
  rises in with Motion Primitives InView.
*/

type Reason = (typeof REALITY.items)[number];
type Layer = "on" | "under" | "off";

const ITEMS = REALITY.items;
const EASE = [0.16, 1, 0.3, 1] as const;

// The photo wipe: the new photo opens upwards from the bottom edge over the one it replaces.
const REVEAL = 0.45;
const SHOWN = "inset(0% 0% 0% 0%)";
const HIDDEN = "inset(100% 0% 0% 0%)";

// After a click or a keyboard focus the scroll spy waits this long, so the focus scroll cannot override the choice.
const LOCK_MS = 700;

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
  const rowId = (index: number) => `${uid}-row-${index}`;

  const [view, setView] = useState({ active: 0, previous: -1 });
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const lockUntil = useRef(0);
  // Only the timing of the photo wipe depends on it, never the markup.
  const reduce = useReducedMotion();
  const reveal = reduce ? 0 : REVEAL;

  const select = useCallback((next: number) => {
    setView((current) => (current.active === next ? current : { active: next, previous: current.active }));
  }, []);

  const pick = useCallback(
    (index: number) => {
      lockUntil.current = performance.now() + LOCK_MS;
      select(index);
    },
    [select]
  );

  // Scroll spy: the row whose box crosses the middle line of the screen becomes the active one.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (performance.now() < lockUntil.current) return;
        const middle = window.innerHeight / 2;
        let best = -1;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const box = entry.boundingClientRect;
          const distance = Math.abs(box.top + box.height / 2 - middle);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = Number((entry.target as HTMLElement).dataset.row);
          }
        }
        if (best >= 0) select(best);
      },
      // A band 1% of the screen tall at its middle.
      { rootMargin: "-49.5% 0px -49.5% 0px" }
    );
    for (const row of rows.current) if (row) observer.observe(row);
    return () => observer.disconnect();
  }, [select]);

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

        {/* Desktop: the index on the left, the sticky panel on the right. */}
        <div className="mt-20 hidden lg:grid lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-7">
            <ol role="list">
              {ITEMS.map((item, index) => (
                <InView key={item.img} as="li" variants={RISE} transition={{ duration: 0.7, ease: EASE }} viewOptions={VIEW}>
                  <div aria-hidden className="rule" />
                  <h3>
                    <ReasonRow
                      index={index}
                      title={item.title}
                      on={index === view.active}
                      id={rowId(index)}
                      controls={panelId}
                      buttonRef={(element) => {
                        rows.current[index] = element;
                      }}
                      onPick={pick}
                    />
                  </h3>
                </InView>
              ))}
            </ol>
            <div aria-hidden className="rule" />
          </div>

          <div className="lg:col-span-5">
            <div
              id={panelId}
              role="region"
              aria-labelledby={rowId(view.active)}
              className="sticky top-[18vh] ml-auto w-full max-w-[460px]"
            >
              <Tilt
                rotationFactor={6}
                springOptions={{ stiffness: 220, damping: 24, mass: 0.6 }}
                className="rounded-[24px] motion-reduce:!transform-none"
              >
                <div className="frame aspect-[4/3] w-full bg-deep shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]">
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
                      animate={{ opacity: on ? 1 : 0 }}
                      transition={{ duration: on ? 0.4 : 0.2, delay: on ? 0.1 : 0, ease: EASE }}
                      className="col-start-1 row-start-1 flex gap-4"
                    >
                      <span className="num text-[17px] leading-[1.65] font-medium text-sky">{numberOf(index)}</span>
                      <p className="t-body max-w-[440px]">{item.text}</p>
                    </motion.div>
                  );
                })}
              </div>
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
  One row of the desktop index: a real button that shows its reason in the panel. The whole row is the target (about
  140px tall). A mouse click activates it; so does keyboard focus (focus-visible only, so a click does not count
  twice).
*/
function ReasonRow({
  index,
  title,
  on,
  id,
  controls,
  buttonRef,
  onPick,
}: {
  index: number;
  title: string;
  on: boolean;
  id: string;
  controls: string;
  buttonRef: (element: HTMLButtonElement | null) => void;
  onPick: (index: number) => void;
}) {
  return (
    <button
      ref={buttonRef}
      id={id}
      type="button"
      data-row={index}
      aria-controls={controls}
      aria-current={on ? "true" : undefined}
      onClick={() => onPick(index)}
      onFocus={(event: FocusEvent<HTMLButtonElement>) => {
        if (event.currentTarget.matches(":focus-visible")) onPick(index);
      }}
      className="group flex w-full cursor-pointer items-center gap-5 rounded-[14px] py-7 text-left focus-visible:-outline-offset-2 xl:gap-6 xl:py-8"
    >
      <Marker on={on} />
      <span
        aria-hidden
        className={cn(
          "ghost-num shrink-0 text-[64px] transition-[-webkit-text-stroke-color] duration-300 ease-out xl:text-[72px]",
          on ? "[-webkit-text-stroke-color:rgb(105_191_248/0.95)]" : "[-webkit-text-stroke-color:rgb(105_191_248/0.38)]"
        )}
      >
        {numberOf(index)}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 text-[32px] leading-[1.12] font-medium tracking-[-0.02em] text-balance transition-colors duration-300 ease-out xl:text-[36px]",
          // 55% white on the page navy is about 6:1, above the 4.5:1 floor even for small text.
          on ? "text-white" : "text-white/55 group-hover:text-white/80"
        )}
      >
        {title}
      </span>
    </button>
  );
}

/* The active marker at the row's left edge: a 6px sky dot slides in and a 32px sky line draws out of it. */
function Marker({ on }: { on: boolean }) {
  return (
    <span aria-hidden className="relative h-1.5 w-[38px] shrink-0">
      <span
        className={cn(
          "absolute top-0 left-0 size-1.5 rounded-full bg-sky transition-[opacity,translate] duration-300 ease-out-expo",
          on ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"
        )}
      />
      <span
        className={cn(
          "absolute top-[2.5px] left-1.5 h-px w-8 origin-left bg-sky/60 transition-[opacity,scale] duration-500 ease-out-expo",
          on ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
        )}
      />
    </span>
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
          sizes="(min-width: 1024px) 460px, 100vw"
          className={cn("object-cover", FOCUS[index])}
        />
      </motion.div>
    </motion.div>
  );
}
