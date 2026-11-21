"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { useCopy, useWords } from "@/i18n/client";

/*
  Ablauf: his five steps as a project plan (Gantt). Each step is a row: his number, title and line on the left, its bar
  on a time line on the right. The bars are staggered and overlap like a real plan (each step starts before the one
  before it ends, joined by a thin link), on a faint twelve-column grid, and the plan ends in a milestone. When the plan
  comes into view the bars grow one after another, each link drawing down just before its bar. Hovering a row
  brightens its bar.

  Phones and tablets: the time runs down. Each step's bar is a thin vertical bar in its own lane at the left, reaching
  into the next step, so the five lanes form the same staircase; the text sits beside them.

  Then his quote, large and calm, centred, with his small round portrait, name and role.
  Reduced motion: the plan stands complete.
  Round 5 (DE/EN): copy by language, and the quote marks of each language.
*/

// Each step's place on the plan as a share of the time line (start, end): staggered and overlapping.
const PLAN: [number, number][] = [
  [0, 20],
  [14, 40],
  [32, 64],
  [56, 82],
  [76, 100],
];
const pad = (n: number) => String(n).padStart(2, "0");

/* The marks around his quote (round 5, DE/EN): German low-high quotes, English curly ones (a display quote at 36px;
   straight marks look like inch signs at that size). */
const WORDS = {
  de: { open: "„", close: "“" },
  en: { open: "“", close: "”" },
};

export function KwSteps() {
  const { KW_MEDIA, KW_STEPS } = useCopy().kiWorkshop;
  const words = useWords(WORDS);
  const chart = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const last = KW_STEPS.items.length - 1;

  useEffect(() => {
    const el = chart.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        setOn(true);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Section id="ablauf">
      <Container>
        <div className="mx-auto max-w-[760px] text-center">
          <Heading title={KW_STEPS.title} accent={KW_STEPS.accent} className="kw-break kw-center" />
        </div>

        <div ref={chart} data-on={on ? "" : undefined} className="kw-gantt mt-12 md:mt-16 lg:mt-20">
          <div aria-hidden className="kw-gantt-lanes" />
          <ol role="list" className="relative">
            {KW_STEPS.items.map((step, i) => (
              <li
                key={step.title}
                className="kw-gantt-row"
                style={{ "--i": i, "--from": PLAN[i][0], "--to": PLAN[i][1] } as CSSProperties}
              >
                <div className="grid grid-cols-[26px_1fr] gap-x-1.5 lg:grid-cols-[44px_1fr] lg:gap-x-0">
                  <span aria-hidden className="num pt-[2px] text-[15px] leading-[1.3] text-sky lg:text-[16px]">
                    {pad(i + 1)}
                  </span>
                  <h3 className="text-[18px] leading-[1.3] font-medium tracking-[-0.01em] text-white lg:text-[20px]">{step.title}</h3>
                  <p className="col-start-2 mt-1 text-[15px] leading-[1.5] text-pretty text-white/65">{step.text}</p>
                </div>
                <div aria-hidden className="kw-gantt-track">
                  {i > 0 && <span className="kw-gantt-link" />}
                  <span className="kw-gantt-bar">{i === last && <span className="kw-gantt-mile" />}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <figure className="mx-auto mt-24 max-w-[960px] text-center md:mt-32 lg:mt-36">
          <blockquote data-reveal="up" className="text-[23px] leading-[1.4] tracking-[-0.015em] text-balance text-white/90 sm:text-[30px] lg:text-[36px] lg:leading-[1.34]">
            <p>
              <span className="text-sky">{words.open}</span>
              {KW_STEPS.quote}
              <span className="text-sky">{words.close}</span>
            </p>
          </blockquote>
          <figcaption data-reveal="up" data-rd="2" className="mt-8 inline-flex items-center gap-4 text-left lg:mt-10">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-full shadow-[0_0_0_1px_rgb(255_255_255/0.16),0_0_0_6px_rgb(105_191_248/0.08)]">
              <Image src={KW_MEDIA.face} alt="" fill sizes="56px" className="object-cover" />
            </span>
            <span>
              <span className="block text-[16px] leading-tight font-medium text-white">{KW_STEPS.author}</span>
              <span className="mt-1 block text-[14px] leading-tight text-silver">{KW_STEPS.role}</span>
            </span>
          </figcaption>
        </figure>
      </Container>
    </Section>
  );
}
