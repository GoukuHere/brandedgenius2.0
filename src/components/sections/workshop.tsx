"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { WorkshopTopics } from "@/components/sections/workshop-topics";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { WORKSHOP } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  KI-Workshop, an editorial spread. Header: the headline, tagline and intro on the left; on desktop Roman's quote
  stands beside them as a pull quote (a 1px sky rule, no card, no photo). Signature: the four formats as an image
  accordion. Desktop shows four tall photos in a row; the hovered, focused or tapped panel widens from 1fr to 2.4fr
  (flex-grow, 500ms ease-out-expo) and shows its description under the photo, the others keep number and title.
  Phones and tablets: every format with its own 3:2 photo and its text, nothing to switch. Then the topics
  (workshop-topics.tsx): one large display line that shows them one at a time, the full list under it, and the
  booking link.

  The open panel's description has a fixed measure, so it never rewraps while the panel grows; it is clipped by its
  own wrapper and fades in once the panel has room. Collapsed descriptions are visibility: hidden, so assistive
  technology only reads the expanded one. Reduced motion: the global CSS rule cuts every transition to an instant
  change, so the markup is identical on the server and in the browser.
*/

const HOVER_INTENT_MS = 80; // sweeping the pointer across the row does not flick every panel open

// Where each photo's subject sits, so the narrow collapsed panels still show the person, not the wall.
const FOCUS = ["43% 50%", "45% 50%", "45% 50%", "34% 50%"];

// The open panel is 2.4 / 5.4 of the row: about 520px inside the 1280px container.
const PANEL_SIZES = "(min-width: 1280px) 520px, 44vw";
const CARD_SIZES = "(min-width: 768px) calc(50vw - 44px), (min-width: 640px) calc(50vw - 32px), calc(100vw - 40px)";

const pad = (n: number) => String(n).padStart(2, "0");

/** Keeps a hyphenated word (Vor-Ort) on one line in the narrow collapsed panels. */
function Title({ text }: { text: string }) {
  return text.split(/(\s+)/).map((part, i) =>
    part.includes("-") ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function WorkshopSection() {
  const [active, setActive] = useState(0);
  const hoverTimer = useRef<number | undefined>(undefined);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  useEffect(() => {
    const timer = hoverTimer;
    return () => window.clearTimeout(timer.current);
  }, []);

  const open = (index: number) => {
    window.clearTimeout(hoverTimer.current);
    setActive(index);
  };

  // Mouse only: touch opens a panel by tapping it (click), never by the pointer passing over it.
  const hoverOpen = (index: number, pointerType: string) => {
    if (pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActive(index), HOVER_INTENT_MS);
  };

  const cancelHover = () => window.clearTimeout(hoverTimer.current);

  // Left and right arrows move between the panels (focus opens them); Home and End jump to the ends.
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = WORKSHOP.formats.length - 1;
    const target =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (target < 0) return;
    event.preventDefault();
    buttons.current[target]?.focus();
  };

  return (
    <Section id="ki-workshop">
      <Container>
        <Reveal className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-6">
            <Heading title={WORKSHOP.title} accent={WORKSHOP.accent} />
            <p className="mt-4 text-[20px] leading-[1.4] font-medium tracking-[-0.01em] text-sky">{WORKSHOP.tagline}</p>
            <p className="t-lead mt-4 max-w-[560px]">{WORKSHOP.text}</p>
          </div>

          <figure className="lg:col-span-5 lg:col-start-8 lg:pt-1.5">
            <blockquote className="border-l border-sky pl-6 text-[22px] leading-[1.42] tracking-[-0.01em] text-pretty text-white/90 sm:text-[24px] xl:text-[26px]">
              <p>„{WORKSHOP.quote}“</p>
            </blockquote>
            <figcaption className="mt-4 pl-[25px] text-[15px] leading-normal text-silver">{WORKSHOP.author}</figcaption>
          </figure>
        </Reveal>

        <Reveal className="mt-16 md:mt-24">
          {/* Desktop: the image accordion. */}
          <ul role="list" aria-label={WORKSHOP.formatsLabel} className="hidden gap-4 lg:flex">
            {WORKSHOP.formats.map((format, i) => {
              const on = i === active;
              const textId = `${baseId}-format-${i}`;
              return (
                <li
                  key={format.title}
                  style={{ flexGrow: on ? 2.4 : 1 }}
                  className="relative min-w-0 basis-0 transition-[flex-grow] duration-500 ease-out-expo"
                >
                  <div className="frame h-[400px] xl:h-[460px]">
                    <Image
                      src={format.img}
                      alt={format.title}
                      fill
                      sizes={PANEL_SIZES}
                      style={{ objectPosition: FOCUS[i] }}
                      className={cn("object-cover transition-opacity duration-500 ease-out-expo", on ? "opacity-100" : "opacity-70")}
                    />
                  </div>
                  <h3 className="mt-5 min-h-[52px] text-[20px] leading-[1.3] font-medium tracking-[-0.01em]">
                    {/* The button's ::after spans the whole panel (photo and text), so the panel is one target. */}
                    <button
                      ref={(el) => {
                        buttons.current[i] = el;
                      }}
                      type="button"
                      aria-expanded={on}
                      aria-controls={textId}
                      onClick={() => open(i)}
                      onFocus={() => open(i)}
                      onKeyDown={(event) => onKey(event, i)}
                      onPointerEnter={(event) => hoverOpen(i, event.pointerType)}
                      onPointerLeave={cancelHover}
                      className="flex w-full cursor-pointer items-baseline text-left after:absolute after:inset-0 after:rounded-[24px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-sky"
                    >
                      <span aria-hidden className="num w-8 shrink-0 text-silver">
                        {pad(i + 1)}
                      </span>
                      {/* hyphens-auto only acts if a word is wider than the narrowest collapsed panel (lang="de"). */}
                      <span className={cn("min-w-0 hyphens-auto transition-colors duration-200", on ? "text-white" : "text-white/70")}>
                        <Title text={format.title} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={textId}
                    className={cn(
                      "overflow-hidden transition-[opacity,visibility] ease-out-expo",
                      on ? "visible opacity-100 delay-150 duration-500" : "invisible opacity-0 duration-200"
                    )}
                  >
                    <p className="t-small mt-2 w-[300px] pl-8 xl:w-[380px]">{format.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Phones and tablets: every format with its photo and text, nothing to open. */}
          <ul role="list" aria-label={WORKSHOP.formatsLabel} className="grid gap-y-12 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 lg:hidden">
            {WORKSHOP.formats.map((format, i) => (
              <li key={format.title}>
                <div className="frame aspect-[3/2]">
                  <Image
                    src={format.img}
                    alt={format.title}
                    fill
                    sizes={CARD_SIZES}
                    style={{ objectPosition: FOCUS[i] }}
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-5 flex items-baseline text-[20px] leading-[1.3] font-medium tracking-[-0.01em] text-white">
                  <span aria-hidden className="num w-8 shrink-0 text-silver">
                    {pad(i + 1)}
                  </span>
                  <span className="min-w-0">{format.title}</span>
                </h3>
                <p className="t-body mt-2">{format.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <WorkshopTopics />
      </Container>
    </Section>
  );
}
