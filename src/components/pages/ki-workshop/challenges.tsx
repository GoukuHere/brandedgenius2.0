"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { useCopy } from "@/i18n/client";

/*
  Herausforderungen: his four challenges as four tiles in 3D that turn over one after another as they come into view.
  The front carries the number and the title large; the back carries his line, with the number and title small above
  it, so a turned tile still says everything. Real 3D: each tile has its own perspective, the card keeps its faces in
  3D (preserve-3d) and each face hides its back (backface-visibility), so only one face is ever painted; both faces
  are opaque navy, so nothing shows through mid-turn. At rest the card stands at exactly 0 or 180 degrees, so the text
  is drawn flat and sharp.

  Desktop: four in a row, turning 260ms apart once the row is well in view. Phones: one column, each tile turns as it
  enters. A tile turns once and stays turned. Reduced motion: the turn is instant (the end state).
  Round 5 (DE/EN): copy by language.
  Round 5 (the client's Loom of 2026-11-18, 3:39: "cool AI pictures in their backgrounds"): the back of each tile
  carries a picture made for its challenge across its top, fading into the tile's navy above the line, so the text
  stays on a dark base. The turn reveals it; the front keeps the number and the title alone.
*/

const STEP_MS = 260; // between two tiles
const BEAT_MS = 220; // after a tile is in view, before it turns
const pad = (n: number) => String(n).padStart(2, "0");

export function KwChallenges() {
  const { KW_CHALLENGES } = useCopy().kiWorkshop;
  const list = useRef<HTMLOListElement>(null);
  const [turned, setTurned] = useState<boolean[]>(() => KW_CHALLENGES.items.map(() => false));

  useEffect(() => {
    const el = list.current;
    if (!el) return undefined;
    const tiles = Array.from(el.querySelectorAll<HTMLElement>("[data-tile]"));
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const turn = (index: number) => setTurned((prev) => (prev[index] ? prev : prev.map((v, i) => v || i === index)));
    const timers: number[] = [];
    let next = 0;
    const io = new IntersectionObserver(
      (entries) => {
        // Entries of one pass arrive in page order; each tile waits for the one before it.
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          const index = Number((entry.target as HTMLElement).dataset.tile);
          if (calm) {
            turn(index);
            continue;
          }
          const now = performance.now();
          const at = Math.max(now + BEAT_MS, next);
          next = at + STEP_MS;
          timers.push(window.setTimeout(() => turn(index), at - now));
        }
      },
      { threshold: 0.6 }
    );
    tiles.forEach((tile) => io.observe(tile));
    return () => {
      io.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <Section id="herausforderungen">
      <Container>
        <div className="mx-auto max-w-[860px] text-center">
          <Heading title={KW_CHALLENGES.title} accent={KW_CHALLENGES.accent} className="kw-break kw-center" />
          <p data-reveal="up" data-rd="2" className="t-lead mx-auto mt-6 max-w-[620px]">
            {KW_CHALLENGES.text}
          </p>
        </div>

        <ol ref={list} role="list" className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 lg:mt-20 lg:grid-cols-4 lg:gap-5">
          {KW_CHALLENGES.items.map((item, i) => (
            <li key={item.title} data-tile={i} data-turned={turned[i] ? "" : undefined} className="kw-flip">
              <div className="kw-flip-card">
                <div className="kw-face kw-face-front">
                  <span aria-hidden className="kw-flip-num">
                    {pad(i + 1)}
                  </span>
                  <h3 className="kw-flip-title">{item.title}</h3>
                </div>
                <div className="kw-face kw-face-back">
                  <span aria-hidden className="kw-flip-photo">
                    <Image src={item.img} alt="" fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </span>
                  <p aria-hidden className="kw-flip-mini">
                    <span className="num text-sky">{pad(i + 1)}</span>
                    {item.title}
                  </p>
                  <p className="kw-flip-text">{item.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
