"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Container, Heading, PrimaryLink, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { LINKS, WORKSHOP } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  KI-Workshop. Desktop: a sticky left column (headline, quote, topics, booking) beside one photo frame that
  crossfades to the active format, with the four formats listed under it. Hovering, focusing or tapping a format
  makes it active. Phone: no shared frame; each format carries its own photo, and the formats sit between the
  intro and the quote so the booking button closes the section.
*/

const STICKY_TOP = 112; // lg:top-28
const STICKY_AIR = 16; // the column only sticks when it fits below STICKY_TOP with this much room to spare
const HOVER_INTENT_MS = 90; // sweeping the pointer across the list does not flick through every photo

const FRAME_SIZES = "(min-width: 1280px) 595px, 48vw";
const CARD_SIZES = "(min-width: 768px) calc(50vw - 44px), (min-width: 640px) calc(50vw - 32px), calc(100vw - 40px)";

const pad = (n: number) => String(n).padStart(2, "0");

export function WorkshopSection() {
  const [active, setActive] = useState(0);
  const columnRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const topicsId = useId();

  // A sticky column taller than the screen would hide its own booking button, so it only sticks when it fits.
  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;
    const check = () => column.toggleAttribute("data-fits", column.offsetHeight + STICKY_TOP + STICKY_AIR <= window.innerHeight);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(column);
    window.addEventListener("resize", check);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    const timer = hoverTimer;
    return () => window.clearTimeout(timer.current);
  }, []);

  const select = (index: number) => {
    window.clearTimeout(hoverTimer.current);
    setActive(index);
  };

  // Mouse only: a finger that starts a scroll on the list must not change the photo.
  const hoverSelect = (index: number, pointerType: string) => {
    if (pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActive(index), HOVER_INTENT_MS);
  };

  const cancelHover = () => window.clearTimeout(hoverTimer.current);

  return (
    <Section id="ki-workshop">
      <Container>
        <div className="grid gap-y-14 md:gap-y-20 lg:grid-cols-[minmax(0,10fr)_minmax(0,11fr)] lg:gap-x-16 xl:gap-x-20">
          {/* On phones this wrapper dissolves (display: contents) so the formats can sit between its two parts. */}
          <div ref={columnRef} className="contents lg:top-28 lg:block lg:self-start lg:data-fits:sticky">
            <Reveal className="order-1">
              <Heading title={WORKSHOP.title} accent={WORKSHOP.accent} className="max-w-[820px]" />
              <p className="mt-4 text-[20px] leading-[1.4] font-medium tracking-[-0.01em] text-sky">{WORKSHOP.tagline}</p>
              <p className="t-lead mt-5 max-w-[620px]">{WORKSHOP.text}</p>
            </Reveal>

            <div className="order-3 max-w-[620px] lg:mt-8 lg:max-w-none">
              <Reveal delay={0.08}>
                <figure>
                  <blockquote className="border-l-2 border-sky/40 pl-5 text-[19px] leading-[1.55] text-pretty text-white/90">
                    <p>„{WORKSHOP.quote}“</p>
                  </blockquote>
                  <figcaption className="mt-3 pl-[22px] text-[15px] leading-normal text-silver">{WORKSHOP.author}</figcaption>
                </figure>
              </Reveal>

              <Reveal delay={0.12} className="mt-8">
                <p id={topicsId} className="text-[14px] leading-normal text-white/60">
                  {WORKSHOP.topicsLabel}
                </p>
                <ul role="list" aria-labelledby={topicsId} className="mt-3 flex flex-wrap gap-2">
                  {WORKSHOP.topics.map((topic) => (
                    <li
                      key={topic}
                      className="inline-flex min-h-9 items-center rounded-full border border-white/12 px-3.5 py-1.5 text-[14px] leading-[1.35] text-ink/80"
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.16} className="mt-8">
                <PrimaryLink href={LINKS.booking}>{WORKSHOP.cta}</PrimaryLink>
              </Reveal>
            </div>
          </div>

          <div className="order-2 lg:order-none lg:pt-2">
            {/* Desktop: one frame, four formats. pt-2 lines the frame up with the headline's cap height. */}
            <div className="hidden lg:block">
              <Reveal delay={0.08}>
                <div aria-hidden className="relative isolate aspect-[4/3] overflow-hidden rounded-[28px] border border-white/10">
                  {WORKSHOP.formats.map((format, i) => (
                    <Image
                      key={format.img}
                      src={format.img}
                      alt=""
                      fill
                      sizes={FRAME_SIZES}
                      className={cn(
                        "object-cover transition-[opacity,scale] duration-700",
                        // The incoming photo arrives fast and the outgoing one leaves gently, so the frame never dips.
                        i === active ? "scale-100 opacity-100 ease-out-expo" : "scale-104 opacity-0 ease-in-out"
                      )}
                    />
                  ))}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-page/50 to-transparent" />
                </div>
              </Reveal>

              <ul role="list" aria-label={WORKSHOP.formatsLabel} className="mt-8">
                {WORKSHOP.formats.map((format, i) => {
                  const on = i === active;
                  return (
                    <Reveal as="li" key={format.title} delay={0.12 + i * 0.06} className="relative isolate py-5 pl-7">
                      <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-white/10" />
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-y-0 left-0 w-px bg-sky transition-transform duration-500 ease-out-expo",
                          on ? "origin-top scale-y-100" : "origin-bottom scale-y-0"
                        )}
                      />
                      <h3 className="t-h3">
                        {/*
                          The button's ::after covers the whole item (z-10 inside the isolated li, above the dimmed
                          description, which is its own stacking context), so the description is part of the target.
                        */}
                        <button
                          type="button"
                          aria-pressed={on}
                          aria-label={format.title}
                          onClick={() => select(i)}
                          onFocus={() => select(i)}
                          onPointerEnter={(event) => hoverSelect(i, event.pointerType)}
                          onPointerLeave={cancelHover}
                          className="flex w-full cursor-pointer items-baseline text-left after:absolute after:inset-0 after:z-10 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-sky"
                        >
                          <span
                            aria-hidden
                            className={cn("num w-11 shrink-0 text-sky transition-opacity duration-300", on ? "opacity-100" : "opacity-50")}
                          >
                            {pad(i + 1)}
                          </span>
                          <span className={cn("transition-opacity duration-300", on ? "opacity-100" : "opacity-45")}>{format.title}</span>
                        </button>
                      </h3>
                      <p className={cn("t-body mt-2 pl-11 text-ink transition-opacity duration-300", on ? "opacity-70" : "opacity-50")}>
                        {format.text}
                      </p>
                    </Reveal>
                  );
                })}
              </ul>
            </div>

            {/* Phones and tablets: every format with its own photo, nothing to switch. */}
            <ul role="list" aria-label={WORKSHOP.formatsLabel} className="grid gap-y-12 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 lg:hidden">
              {WORKSHOP.formats.map((format, i) => (
                <Reveal as="li" key={format.title} delay={(i % 2) * 0.08}>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-[24px] border border-white/10">
                    <Image src={format.img} alt="" fill sizes={CARD_SIZES} className="object-cover" />
                    <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-page/50 to-transparent" />
                  </div>
                  <h3 className="t-h3 mt-5 flex items-baseline gap-3">
                    <span aria-hidden className="num text-sky">
                      {pad(i + 1)}
                    </span>
                    <span>{format.title}</span>
                  </h3>
                  <p className="t-body mt-2">{format.text}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
