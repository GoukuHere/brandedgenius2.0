"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Heading } from "@/components/system/primitives";
import { UU_EXPERTISE } from "@/content/pages/uber-uns";
import { cn } from "@/lib/utils";

/*
  Über uns, Expertise. The client's six areas as large type rows, one quiet line each (number, title, his short
  benefit). One row is active at a time: on a desktop the one under the mouse, otherwise the one at the reading line as
  the page scrolls (also the default on desktop when the mouse is elsewhere). The active row lights; its photo (a real
  photo of that work) and its paragraph appear in one floating frame, so only one paragraph is ever open.

  Wide screens: the frame floats beside the rows and glides to the active one. Phones: the frame stays at the top of
  the screen while the rows pass under it (sticky inside this section only; the page keeps scrolling). The rows never
  change height, so nothing jumps as the active row changes.
*/

const AREAS = UU_EXPERTISE.areas;
const pad = (i: number) => String(i + 1).padStart(2, "0");
const SPRING = { type: "spring", stiffness: 150, damping: 24, mass: 0.9 } as const;

export function UberExpertise() {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const [scrollActive, setScrollActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [frameY, setFrameY] = useState(0);
  const active = hovered ?? scrollActive;

  // The row at the reading line: the middle of the screen on wide screens; on phones just under the docked frame.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      // Nothing to do while the section is well off screen.
      const area = box.current?.getBoundingClientRect();
      if (area && (area.bottom < -200 || area.top > vh + 200)) return;
      const wide = window.matchMedia("(min-width: 768px)").matches;
      let line = vh * 0.5;
      if (!wide && frame.current) line = Math.max(frame.current.getBoundingClientRect().bottom + 72, vh * 0.6);
      let best = 0;
      let dist = Infinity;
      rows.current.forEach((row, i) => {
        if (!row) return;
        const b = row.getBoundingClientRect();
        const d = Math.abs(b.top + b.height / 2 - line);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setScrollActive(best);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // Wide screens: the frame's offset so its middle meets the active row's middle, kept inside the list.
  const place = useCallback(() => {
    const host = box.current;
    const el = frame.current;
    const row = rows.current[active];
    if (!host || !el || !row || !window.matchMedia("(min-width: 768px)").matches) {
      setFrameY(0);
      return;
    }
    const listTop = rows.current[0]?.offsetTop ?? 0;
    const last = rows.current[AREAS.length - 1];
    const listBottom = last ? last.offsetTop + last.offsetHeight : host.offsetHeight;
    const centre = row.offsetTop + row.offsetHeight / 2;
    const y = centre - el.offsetHeight / 2;
    setFrameY(Math.round(Math.min(Math.max(y, listTop), Math.max(listTop, listBottom - el.offsetHeight))));
  }, [active]);
  useEffect(() => {
    place();
    const ro = new ResizeObserver(place);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [place]);

  const pick = (i: number) => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setHovered(i);
      return;
    }
    // Phones: bring the row to the reading line under the frame; the scroll then makes it the active one.
    const row = rows.current[i];
    const el = frame.current;
    if (!row) return;
    const b = row.getBoundingClientRect();
    const line = el ? Math.max(84 + el.offsetHeight + 72, window.innerHeight * 0.6) : window.innerHeight * 0.6;
    window.scrollTo({ top: window.scrollY + b.top + b.height / 2 - line, behavior: "smooth" });
  };

  return (
    <section id="expertise" className="relative py-16 md:py-24">
      <Container>
        <div className="grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-x-8">
          <Heading title={UU_EXPERTISE.title} accent={UU_EXPERTISE.accent} className="lg:col-span-7" />
          <p data-reveal="up" data-rd="2" className="t-lead max-w-[520px] lg:col-span-5 lg:pb-1">
            {UU_EXPERTISE.text}
          </p>
        </div>

        <div ref={box} className="relative mt-12 grid md:mt-20 md:grid-cols-12 md:gap-x-8" onPointerLeave={() => setHovered(null)}>
          {/* The floating frame: the active area's photo and paragraph. First in the markup, so on phones it can dock above the rows. */}
          <div className="uu-ex-dock relative z-[2] md:order-2 md:col-span-5 lg:col-span-4 lg:col-start-9">
            <motion.div ref={frame} aria-hidden initial={false} animate={{ y: frameY }} transition={SPRING} className="uu-ex-frame">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[14px] md:aspect-[5/4]">
                {AREAS.map((area, i) => (
                  <Image
                    key={area.img}
                    src={area.img}
                    alt=""
                    fill
                    quality={85}
                    sizes="(min-width: 1280px) 400px, (min-width: 768px) 38vw, 92vw"
                    className={cn(
                      "object-cover transition-[opacity,scale] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                      i === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
                    )}
                  />
                ))}
                <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]" />
              </div>
              {/* All six paragraphs share one cell, so the frame never changes height while they cross. */}
              <div className="grid px-1 pt-4 pb-1 md:px-2 md:pt-5">
                {AREAS.map((area, i) => (
                  <p
                    key={area.title}
                    className={cn(
                      "col-start-1 row-start-1 text-[15px] leading-[1.6] text-pretty text-white/80 transition-[opacity,translate] ease-out md:text-[16px]",
                      i === active ? "translate-y-0 opacity-100 delay-150 duration-500" : "translate-y-2 opacity-0 delay-0 duration-150"
                    )}
                  >
                    {area.text}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>

          <ol role="list" className="relative md:order-1 md:col-span-7 lg:col-span-8">
            {AREAS.map((area, i) => {
              const on = i === active;
              return (
                <li
                  key={area.title}
                  ref={(el) => {
                    rows.current[i] = el;
                  }}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setHovered(i);
                  }}
                  className="group relative border-t border-white/[0.08] py-6 last:border-b md:py-7"
                >
                  {/* The lit row's rule: a sky line draws along its top. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -top-px left-0 h-px w-full origin-left bg-[linear-gradient(90deg,#69bff8,rgb(105_191_248/0))] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      on ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                  <div className="flex items-baseline gap-4 md:gap-6">
                    <span className={cn("num w-7 shrink-0 text-[14px] transition-colors duration-500 md:text-[15px]", on ? "text-sky" : "text-white/35")}>{pad(i)}</span>
                    <div className="min-w-0">
                      <h3>
                        <button
                          type="button"
                          onClick={() => pick(i)}
                          // Keyboard focus picks the row; a tap's focus does not, so on phones the scroll keeps leading.
                          onFocus={(e) => {
                            if (e.currentTarget.matches(":focus-visible")) setHovered(i);
                          }}
                          onBlur={() => setHovered(null)}
                          className={cn(
                            "uu-ex-title cursor-pointer text-left transition-colors duration-500 after:absolute after:inset-0 after:content-['']",
                            on ? "text-white" : "text-white/30 group-hover:text-white/60"
                          )}
                        >
                          {area.title}
                        </button>
                      </h3>
                      <p className={cn("mt-2 text-[14px] transition-colors duration-500 md:text-[15px]", on ? "text-sky" : "text-white/40")}>{area.tag}</p>
                      {/* For screen readers the paragraph sits with its area (the frame above is hidden from them). */}
                      <p className="sr-only">{area.text}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
