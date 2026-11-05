"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type FocusEvent, type Key, type KeyboardEvent, type Ref } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { REALITY } from "@/content/site";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

// reality/05 is portrait (798x922): keep the face and the clock in the 16:9 crop.
const OBJECT_POSITION: Record<number, string> = { 4: "object-[50%_20%]" };

/*
  Die Realität, v3. As on brandedgenius.de: an accordion with one row open (the first, by default), so only one
  photo shows at a time. Built as an editorial list: the header left (headline over the left 7 columns, the
  paragraph bottom-aligned on the right), then six full-width rows between hairlines.

  Each row's head is a real button inside its h3 (aria-expanded, aria-controls while the panel exists, arrow keys,
  Home and End move between rows). The Motion Primitives Accordion runs the open and close (450ms, ease-out-expo);
  its own trigger cannot carry an id or aria-controls, so the head is a local button driving the same controlled
  value. The open row shows its text on the left and its photo on the right (full width under the text on phones
  and tablets).

  Signature: Motion Primitives AnimatedBackground glides ONE glass highlight between rows on hover and on keyboard
  focus (focus-visible only, so a mouse click does not leave it parked). Row titles stay solid white throughout.
*/
export function RealitySection() {
  const [open, setOpen] = useState<Key | null>(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const heads = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const last = REALITY.items.length - 1;

  const moveFocus = (from: number, event: KeyboardEvent<HTMLButtonElement>) => {
    const to =
      event.key === "ArrowDown"
        ? from === last
          ? 0
          : from + 1
        : event.key === "ArrowUp"
          ? from === 0
            ? last
            : from - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (to === null) return;
    event.preventDefault();
    heads.current[to]?.focus();
  };

  return (
    <Section id="realitaet">
      <Container>
        <Reveal className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-10">
          <Heading title={REALITY.title} accent={REALITY.accent} className="lg:col-span-7" />
          <p className="t-lead mt-6 max-w-[520px] lg:col-span-4 lg:col-start-9 lg:mt-0">{REALITY.text}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14 md:mt-20">
          {/* The rows reach 16 to 24px into the gutter so the highlight has room while the text aligns with the headline. */}
          <Accordion
            expandedValue={open}
            onValueChange={setOpen}
            transition={{ duration: 0.45, ease: EASE }}
            className="-mx-4 md:-mx-6"
          >
            <AnimatedBackground
              enableHover
              value={hovered ?? focused}
              onValueChange={setHovered}
              className="glass rounded-[24px]"
              transition={{ duration: 0.25, ease: EASE }}
            >
              {REALITY.items.map((item, i) => {
                const id = String(i);
                const headId = `${uid}-head-${i}`;
                const panelId = `${uid}-panel-${i}`;
                const expanded = open === i;
                return (
                  <div key={item.title} data-id={id} className="flex w-full flex-col border-t border-white/[0.08] last:border-b">
                    <AccordionItem value={i} className="px-4 md:px-6">
                      <RowHead
                        index={i}
                        title={item.title}
                        expanded={expanded}
                        headId={headId}
                        panelId={panelId}
                        buttonRef={(el) => {
                          heads.current[i] = el;
                        }}
                        onToggle={() => setOpen(expanded ? null : i)}
                        onKeyDown={(event) => moveFocus(i, event)}
                        onFocus={(event: FocusEvent<HTMLButtonElement>) => {
                          if (event.currentTarget.matches(":focus-visible")) setFocused(id);
                        }}
                        onBlur={() => setFocused((current) => (current === id ? null : current))}
                      />
                      <AccordionContent>
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={headId}
                          className="grid gap-6 pb-8 sm:pl-11 md:pb-10 md:pl-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10"
                        >
                          <p className="t-body max-w-[520px]">{item.text}</p>
                          <div className="frame aspect-video w-full sm:max-w-[560px] lg:w-[320px]">
                            <Image
                              src={item.img}
                              alt={item.title}
                              fill
                              sizes="(min-width: 1024px) 320px, (min-width: 640px) 560px, 100vw"
                              className={cn("object-cover", OBJECT_POSITION[i])}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                );
              })}
            </AnimatedBackground>
          </Accordion>
        </Reveal>
      </Container>
    </Section>
  );
}

/*
  The row head. A component (not bare markup) because AccordionItem hands every direct child `value` and
  `expanded` props, which a DOM element would reject. The whole row is the target (well over 44px tall); the 40px
  ring with the plus is its visual toggle and turns the plus 45 degrees when the row is open.
*/
function RowHead({
  index,
  title,
  expanded,
  headId,
  panelId,
  buttonRef,
  onToggle,
  onKeyDown,
  onFocus,
  onBlur,
}: {
  index: number;
  title: string;
  expanded: boolean;
  headId: string;
  panelId: string;
  buttonRef: Ref<HTMLButtonElement>;
  onToggle: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onFocus: (event: FocusEvent<HTMLButtonElement>) => void;
  onBlur: () => void;
}) {
  return (
    <h3>
      <button
        ref={buttonRef}
        id={headId}
        type="button"
        aria-expanded={expanded}
        aria-controls={expanded ? panelId : undefined}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="group flex w-full cursor-pointer items-center gap-4 rounded-[20px] py-6 text-left focus-visible:-outline-offset-2 md:gap-6 md:py-7"
      >
        <span aria-hidden className="num w-7 shrink-0 text-[14px] text-silver md:w-10">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1 text-[22px] leading-[1.2] font-medium tracking-[-0.015em] text-balance text-white sm:text-[26px]">
          {title}
        </span>
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-200 ease-out group-hover:border-white/35"
        >
          <Plus
            strokeWidth={1.5}
            className={cn("size-[18px] transition-transform duration-[450ms] ease-out-expo", expanded && "rotate-45")}
          />
        </span>
      </button>
    </h3>
  );
}
