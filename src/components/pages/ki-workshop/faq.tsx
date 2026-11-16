"use client";

import { useId, useState } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { KW_FAQ } from "@/content/pages/ki-workshop";

/*
  FAQ: every question with his answer, as an accordion in one centred column. Each question is a button with
  aria-expanded that controls its answer region; the answer opens with a smooth height (grid rows from 0fr to 1fr) and
  is hidden from assistive technology while closed. The first answer stands open; any number can be open at once.
*/
export function KwFaq() {
  const [open, setOpen] = useState<number[]>([0]);
  const baseId = useId();
  const toggle = (index: number) => setOpen((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));

  return (
    <Section id="faq">
      <Container>
        <div className="mx-auto max-w-[820px]">
          <div className="text-center">
            <Heading title={KW_FAQ.title} accent={KW_FAQ.accent} className="kw-break kw-center" />
          </div>
          <ul role="list" data-reveal-group className="mt-12 md:mt-16">
            {KW_FAQ.items.map((item, i) => {
              const on = open.includes(i);
              const qId = `${baseId}-q${i}`;
              const aId = `${baseId}-a${i}`;
              return (
                <li key={item.q} className="border-b border-white/10 first:border-t">
                  <h3>
                    <button
                      id={qId}
                      type="button"
                      aria-expanded={on}
                      aria-controls={aId}
                      onClick={() => toggle(i)}
                      className="kw-faq-q flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left md:py-6"
                    >
                      <span className="text-[17px] leading-[1.35] font-medium tracking-[-0.01em] text-white md:text-[19px]">{item.q}</span>
                      <span aria-hidden className="kw-faq-icon" />
                    </button>
                  </h3>
                  <div id={aId} role="region" aria-labelledby={qId} data-on={on ? "" : undefined} className="kw-faq-panel">
                    <div className="overflow-hidden">
                      <p className="t-body max-w-[680px] pr-12 pb-6 md:pb-7">{item.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
