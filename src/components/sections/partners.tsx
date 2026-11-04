"use client";

import { useEffect, useRef } from "react";
import { Container, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { PARTNERS } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Partner names as quiet wordmarks on a slow CSS loop. The track holds the list twice and one cycle moves it by
  exactly one copy, so the loop has no seam. It runs only while on screen (data-on) and pauses under the pointer.
  With reduced motion there is no loop: the single list wraps in place.
*/

// Hoisted into <head> once by React.
const REEL_CSS = `
@keyframes partners-reel { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-50%, 0, 0); } }
.partners-reel { animation: partners-reel 36s linear infinite; animation-play-state: paused; }
[data-on] > .partners-reel { animation-play-state: running; }
[data-on]:hover > .partners-reel { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .partners-reel { animation: none; } }
`;

function Names({ copy = false }: { copy?: boolean }) {
  return (
    <ul
      role="list"
      aria-hidden={copy || undefined}
      className={cn(
        "flex shrink-0 items-center",
        copy ? "motion-reduce:hidden" : "motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:gap-y-3"
      )}
    >
      {PARTNERS.names.map((name) => (
        <li key={name} className="shrink-0 pr-14 md:pr-24">
          <span className="block text-[22px] leading-[1.3] font-medium tracking-[-0.02em] whitespace-nowrap text-white opacity-45 transition-opacity duration-300 hover:opacity-90 md:text-[28px]">
            {name}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function PartnersSection() {
  const reelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;
    if (typeof IntersectionObserver === "undefined") {
      reel.setAttribute("data-on", "");
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) reel.toggleAttribute("data-on", entry.isIntersecting);
    });
    observer.observe(reel);
    return () => observer.disconnect();
  }, []);

  return (
    <Section className="py-14 md:py-16">
      <style href="bg-partners-reel" precedence="default">
        {REEL_CSS}
      </style>
      <Container>
        <Reveal className="flex flex-col gap-5 md:flex-row md:items-center md:gap-12">
          <h2 className="shrink-0 text-[15px] leading-normal font-normal text-white/60">{PARTNERS.title}</h2>
          {/* Full bleed on phones so the names run off both screen edges under the fade. */}
          <div
            ref={reelRef}
            className="-mx-5 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)] md:mx-0 md:min-w-0 md:flex-1 motion-reduce:mx-0 motion-reduce:[mask-image:none]"
          >
            <div className="partners-reel flex w-max select-none motion-reduce:w-auto">
              <Names />
              <Names copy />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
