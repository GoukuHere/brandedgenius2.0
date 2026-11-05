"use client";

import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { createRef, useCallback, useEffect, useRef, useState, useSyncExternalStore, type FocusEvent, type ReactNode, type RefObject } from "react";
import { isSceneId, ServiceAnimation, type SceneId } from "@/components/sections/service-scenes";
import { Container, Heading, Section, TextLink } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { MagicCard } from "@/components/ui/magic-card";
import { LINKS, SERVICES } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Leistungen: four full-width glass plates that stack as the reader scrolls. On desktop windows at least 720px tall
  each plate is sticky, its top 20px lower than the one before, so the top edges of the earlier plates stay in view
  above the one in front. Each plate carries its service's line drawing across its full width, then the number and
  title on the left and the original text and link on the right.

  Only the front plate plays its drawing (from its still frame, so it never blanks). As the next plate slides over
  a plate, the covered one rests on its still frame, scales to 0.97 from its top edge and dims to 60%, all tied to
  the scroll and fully reversible. The plates are opaque (only their sheen and rim are glass), so a covered drawing never shows through the plate
  in front, while the uncovered top strip keeps its still frame in view. The front plate carries the page's only MagicCard: a cursor-lit
  edge for mouse users. On phones and short windows nothing sticks: the plates follow one after another.

  Every visual state that depends on the window (stacking, fine pointer) is read after hydration, so the server
  HTML and the first browser render always match.
*/

type Service = (typeof SERVICES.items)[number] & { id: SceneId };
const ITEMS = SERVICES.items.filter((s): s is Service => isSceneId(s.id));

/** Sticky tops in px, 20px apart, below the fixed header. */
const TOPS = [112, 132, 152, 172];
const topOf = (i: number) => TOPS[Math.min(i, TOPS.length - 1)];

/** Must match the `lg:[@media(min-height:720px)]:` classes below. */
const STACKED = "(min-width: 1024px) and (min-height: 720px)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";


/** A media query that is safe to hydrate: false on the server and while hydrating, then the real value. */
function useMedia(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

/** Keeps hyphenated compounds (KI-Agenten) whole, so a title never breaks after "KI-". */
function keepCompounds(text: string): ReactNode {
  return text.split(/(\s+)/).map((part, i) =>
    part.includes("-") && part.trim() ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    )
  );
}

function Plate({
  service,
  index,
  spacer,
  next,
  front,
  stacked,
  magic,
  stack,
  onCover,
}: {
  service: Service;
  index: number;
  /** The gap in front of this plate. Its bottom edge is where the plate sits in the flow, sticky or not. */
  spacer: RefObject<HTMLDivElement | null>;
  /** The next plate's gap, whose bottom edge is where that plate sits: it measures how far it has covered this one. */
  next?: RefObject<HTMLDivElement | null>;
  front: boolean;
  stacked: boolean;
  magic: boolean;
  /** 1 while the plates stack, 0 otherwise: the covered look only applies to a stack. */
  stack: MotionValue<number>;
  onCover: (index: number, covered: boolean) => void;
}) {
  const top = topOf(index);

  // 0 while the next plate is a screen away, 1 once it rests 20px below this one's top. Measured on the next gap,
  // which never sticks, so the numbers stay true while the plates themselves are stuck.
  const arriving = useSectionProgress(next ?? spacer, ["end end", `end ${topOf(index + 1)}px`]);
  const cover = useTransform(() => (next ? arriving.get() : 0));
  const scale = useTransform(() => 1 - 0.03 * cover.get() * stack.get());
  const dim = useTransform(() => 1 - 0.4 * cover.get() * stack.get());

  // Hand the front over once the next plate is halfway across; report only the moments it flips.
  const reported = useRef(false);
  useMotionValueEvent(cover, "change", (v) => {
    const on = v >= 0.5;
    if (on === reported.current) return;
    reported.current = on;
    onCover(index, on);
  });

  // A keyboard user tabbing into a plate that is covered (or still below the front one) brings it to the front, so
  // the focused link is never hidden under another plate. Mouse focus never scrolls, so clicks land where aimed.
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (front || !stacked || !e.target.matches(":focus-visible")) return;
    const edge = spacer.current?.getBoundingClientRect().bottom;
    if (edge === undefined) return;
    window.scrollTo({ top: window.scrollY + edge - top, behavior: "instant" });
  };

  // With the cursor light on, the content lets the pointer through to it; the link takes it back.
  const lit = magic && front;

  return (
    <>
      <div ref={spacer} aria-hidden className={index === 0 ? "h-14 md:h-20" : "h-6 md:h-8 lg:[@media(min-height:720px)]:h-24"} />
      <div role="listitem" style={{ top }} onFocus={onFocus} className="lg:[@media(min-height:720px)]:sticky">
        <motion.div
          style={{ scale, opacity: dim }}
          className={cn(
            "glass origin-top rounded-panel bg-[#191919]! p-5 sm:p-7 lg:p-10 motion-reduce:!transform-none lg:[@media(min-height:720px)]:will-change-transform",
            front && "glass-lit"
          )}
        >
          {lit && (
            <div aria-hidden className="absolute inset-0 rounded-[inherit]">
              <MagicCard className="h-full rounded-[inherit]" gradientSize={320} gradientOpacity={0} />
            </div>
          )}
          <div className={cn("relative", lit && "pointer-events-none")}>
            {/* On phones the drawing runs to the plate's edges; on short stacked windows it is capped so the whole plate fits. */}
            <div className="-mx-5 sm:mx-0">
              <ServiceAnimation id={service.id} playing={front} className="lg:[@media(min-height:720px)]:max-h-[calc(100svh_-_440px)]" />
            </div>
            <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 lg:mt-9 lg:gap-14">
              <h3 className="text-[26px] leading-[1.15] font-medium tracking-[-0.015em] text-balance text-white sm:text-[30px] lg:text-[32px]">
                <span aria-hidden className="num mr-3 text-silver">
                  {String(index + 1).padStart(2, "0")}.
                </span>
                {keepCompounds(service.title)}
              </h3>
              <div>
                <p className="t-body">{service.text}</p>
                <TextLink href={LINKS.contact} className="pointer-events-auto mt-3 min-h-11">
                  {service.cta}
                </TextLink>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export function ServicesSection() {
  const stacked = useMedia(STACKED);
  const magic = useMedia(FINE_POINTER);
  const stack = useMotionValue(0);
  const [spacers] = useState(() => ITEMS.map(() => createRef<HTMLDivElement>()));
  const [covered, setCovered] = useState(() => ITEMS.map(() => false));

  useEffect(() => {
    stack.set(stacked ? 1 : 0);
  }, [stack, stacked]);

  const onCover = useCallback((index: number, on: boolean) => {
    setCovered((prev) => (prev[index] === on ? prev : prev.map((v, i) => (i === index ? on : v))));
  }, []);

  // The front plate is the first one nothing has slid over yet.
  const first = covered.indexOf(false);
  const front = first < 0 ? ITEMS.length - 1 : first;

  return (
    <Section id="leistungen">
      <Container>
        <Reveal y={12} className="max-w-[820px]">
          <Heading title={SERVICES.title} accent={SERVICES.accent} />
          <p className="t-lead mt-6 max-w-[620px]">{SERVICES.text}</p>
          <TextLink href={LINKS.contact} className="mt-5 min-h-11">
            {SERVICES.cta}
          </TextLink>
        </Reveal>

        <div role="list" className="relative">
          {ITEMS.map((service, i) => (
            <Plate
              key={service.id}
              service={service}
              index={i}
              spacer={spacers[i]}
              next={spacers[i + 1]}
              front={i === front}
              stacked={stacked}
              magic={magic}
              stack={stack}
              onCover={onCover}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
