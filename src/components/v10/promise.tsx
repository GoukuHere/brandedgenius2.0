"use client";

import { Container, Heading } from "@/components/system/primitives";
import { PROMISE } from "@/content/site";

/*
  v10 Unser Versprechen: the statement and the four figures as one screen, in normal scrolling. This is the layout
  the client saw on his screen in v1 (the pinned stage there only runs on screens 720px or taller); he liked it and
  only disliked the lag, so the pin and the 3D card are gone. The figures rise in once with the page's entrance.
*/

// The title ends in a dash: a no-break space keeps it with "schafft", so no line ever starts with it.
const TITLE = PROMISE.title.replace(/ –$/, " –");

export function PromiseSection() {
  return (
    <section id="mehrwert" className="relative py-24 md:py-32">
      <Container>
        <Heading title={TITLE} accent={PROMISE.accent} className="max-w-[880px] text-[length:clamp(2.125rem,1.25rem+2.2vw,3.25rem)]" />
        <ul role="list" data-reveal-group className="mt-12 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 md:mt-16 lg:grid-cols-4">
          {PROMISE.figures.map((figure) => (
            <li key={figure.value} className="v10-card @container rounded-panel p-5 sm:p-6">
              {/* One line always: at most 40px, smaller in a narrow card ("3–6 Monate" is about 5em wide). */}
              <p className="num text-[length:min(40px,18cqi)] leading-none whitespace-nowrap text-white">{figure.value}</p>
              <p className="t-small mt-3 text-pretty">{figure.label}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
