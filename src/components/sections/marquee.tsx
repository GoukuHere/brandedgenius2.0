"use client";

/* eslint-disable @next/next/no-img-element */

import { ScrollVelocityContainer, ScrollVelocityRow } from "@/components/ui/scroll-based-velocity";

// The service-word marquee the client said was okay: two rows that run faster the faster you scroll and flip with the direction.
const WORDS = ["KI-Agenten", "KI-Chatbots", "KI-Callbots", "Workflows", "Automatisierung", "KI-Workshops"];

export function Marquee() {
  return (
    <section
      aria-label="Leistungen im Überblick"
      className="relative overflow-hidden py-14 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)] md:py-24"
    >
      <ScrollVelocityContainer className="space-y-1 md:space-y-2">
        <ScrollVelocityRow baseVelocity={2.2} direction={1}>
          {WORDS.map((w) => (
            <span
              key={w}
              className="mx-5 inline-flex items-center gap-10 text-[56px] leading-none font-medium tracking-[-0.05em] text-white md:mx-8 md:gap-16 md:text-[120px]"
            >
              {w}
              <img src="/brand/mark.svg" alt="" className="h-[0.28em] opacity-80" />
            </span>
          ))}
        </ScrollVelocityRow>
        <ScrollVelocityRow baseVelocity={2.2} direction={-1}>
          {WORDS.map((w) => (
            <span key={w} className="mx-5 inline-flex items-center gap-10 text-[56px] leading-none md:mx-8 md:gap-16 md:text-[120px]">
              <span className="accent">{w}</span>
              <span aria-hidden className="size-[0.14em] rounded-[3px] bg-sky/60" />
            </span>
          ))}
        </ScrollVelocityRow>
      </ScrollVelocityContainer>
    </section>
  );
}
