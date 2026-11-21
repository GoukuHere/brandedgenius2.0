"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Heading, PrimaryLink, Section } from "@/components/system/primitives";
import { useCopy } from "@/i18n/client";

/*
  Trainer: Roman's tall portrait with his seven core competencies around it as a constellation, not a list. Each
  competency is a small glass chip at its own place around the portrait (some over its edge, never over his face),
  and a fine sky line runs from chip to chip once around him, behind the portrait. When the portrait comes into view
  the chips drift out from him into their places one after another and the line draws.

  The places are fixed per screen (a 592 x 660 stage on large screens, 335 x 470 on phones, both scaled with the width),
  so the line's points are the chips' own centres. His heading (his dash became the line break), his two paragraphs
  and his button sit beside it; on phones the heading comes first, then the portrait, then the text.
  Round 5 (DE/EN): copy by language (the chips keep their places in both).
*/

type Place = { x: number; y: number; px: number; py: number };

// Each chip's centre: on the large stage (592 x 660) and on the phone stage (335 x 470), in px of that stage.
const PLACES: Place[] = [
  { x: 110, y: 92, px: 92, py: 40 }, // KI-Automatisierung
  { x: 470, y: 150, px: 236, py: 74 }, // ChatGPT und KI-Tools
  { x: 120, y: 300, px: 102, py: 228 }, // Marketing und Vertrieb
  { x: 466, y: 360, px: 220, py: 290 }, // CRM und digitale Workflows
  { x: 104, y: 470, px: 90, py: 346 }, // Prozessoptimierung
  { x: 300, y: 596, px: 167, py: 420 }, // Team- und Führungskräftetrainings
  { x: 510, y: 482, px: 268, py: 358 }, // AI Literacy
];
const LG = { w: 592, h: 660 };
const SM = { w: 335, h: 470 };
// The line's order once around the portrait.
const LOOP = [0, 1, 3, 6, 5, 4, 2, 0];
const pct = (v: number, of: number) => `${Math.round((v / of) * 10000) / 100}%`;

export function KwTrainer() {
  const copy = useCopy();
  const { KW_MEDIA, KW_TRAINER } = copy.kiWorkshop;
  const { LINKS } = copy.site;
  const stage = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        setOn(true);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Section id="trainer">
      <Container>
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8">
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end">
            <Heading title={KW_TRAINER.title} accent={KW_TRAINER.accent} className="kw-break" />
          </div>

          <div className="relative lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <div aria-hidden className="kw-glow-royal absolute inset-[4%] -z-10" />
            <div ref={stage} data-on={on ? "" : undefined} className="kw-stage">
              <svg aria-hidden viewBox={`0 0 ${SM.w} ${SM.h}`} className="absolute inset-0 size-full overflow-visible lg:hidden">
                <polyline points={LOOP.map((i) => `${PLACES[i].px},${PLACES[i].py}`).join(" ")} pathLength={1} className="kw-web" />
              </svg>
              <svg aria-hidden viewBox={`0 0 ${LG.w} ${LG.h}`} className="absolute inset-0 hidden size-full overflow-visible lg:block">
                <polyline points={LOOP.map((i) => `${PLACES[i].x},${PLACES[i].y}`).join(" ")} pathLength={1} className="kw-web" />
              </svg>

              <div data-reveal="photo" className="frame absolute top-1/2 left-1/2 z-[1] aspect-[3/4] w-[60%] -translate-1/2 rounded-[24px] lg:w-[54%] lg:rounded-[28px]">
                <Image src={KW_MEDIA.trainer} alt={KW_TRAINER.alt} fill quality={85} sizes="(min-width: 1024px) 320px, 60vw" className="object-cover object-[50%_20%]" />
              </div>

              <ul role="list" aria-label={KW_TRAINER.skillsLabel}>
                {KW_TRAINER.skills.map((skill, i) => {
                  const place = PLACES[i];
                  return (
                    <li
                      key={skill}
                      className="kw-skill"
                      style={
                        {
                          "--x": pct(place.x, LG.w),
                          "--y": pct(place.y, LG.h),
                          "--px": pct(place.px, SM.w),
                          "--py": pct(place.py, SM.h),
                          "--dx": `${Math.round((LG.w / 2 - place.x) * 0.3)}px`,
                          "--dy": `${Math.round((LG.h / 2 - place.y) * 0.3)}px`,
                          "--n": i,
                        } as CSSProperties
                      }
                    >
                      {skill}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:self-start">
            <p data-reveal="up" className="t-lead">
              {KW_TRAINER.text[0]}
            </p>
            <p data-reveal="up" data-rd="1" className="t-body mt-5">
              {KW_TRAINER.text[1]}
            </p>
            <div data-reveal="up" data-rd="2" className="mt-9">
              <PrimaryLink href={LINKS.contact}>{KW_TRAINER.cta}</PrimaryLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
