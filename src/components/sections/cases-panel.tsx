"use client";

import { Check } from "lucide-react";
import { memo } from "react";
import { MagicCard } from "@/components/ui/magic-card";
import { CASES, type CaseStudy } from "@/content/site";

/*
  One Fallstudie as a matte card (v5, 2026-11-06), after the success stories in the developer's reference: one
  column, read top to bottom.
  - The three results lead, between hairlines: the figures are the case's picture.
  - Then the headline and the text, the client's voice on a sky rule, and what was built.
  - At the foot, under a hairline: the tools, and the area and kind (on the right). The area is not printed above
    the headline (no eyebrows); the section's navigation names it too.
  Inside Magic UI's MagicCard, whose edge lights up in the brand blues where the pointer is.

  Width: on the scroller (a size container), one card with the next peeking on phones and tablets, two side by side
  from 1280px: half the scroller less its padding (2 x 32px) and the gap (24px).
*/

const COUNT = CASES.items.length;

export const caseCardId = (index: number) => `use-cases-card-${index}`;

export const CaseCard = memo(function CaseCard({ item, index }: { item: CaseStudy; index: number }) {
  const lastTool = item.tools.length - 1;
  return (
    <li className="flex w-[86cqw] shrink-0 snap-start md:w-[min(620px,74cqw)] xl:w-[calc((100cqw-88px)/2)]">
      <article id={caseCardId(index)} tabIndex={0} aria-label={`${index + 1} von ${COUNT}: ${item.name}`} className="w-full rounded-panel">
        <MagicCard className="glass h-full rounded-[inherit]" gradientSize={320} gradientOpacity={0}>
          <div className="flex h-full flex-col p-6 sm:p-7">
            {/*
              Phones: one result per row (figure left, label right) between hairlines. From sm: three columns between
              vertical hairlines, the figure over its label. The figures never wrap.
            */}
            <ul role="list" className="border-b border-white/[0.08] pb-5 sm:grid sm:grid-cols-3">
              {item.metrics.map((metric) => (
                <li
                  key={metric.label}
                  className="grid grid-cols-[84px_minmax(0,1fr)] items-baseline gap-x-4 border-white/[0.08] py-3 first:pt-0 last:pb-0 not-first:border-t sm:block sm:px-5 sm:py-0 sm:first:pl-0 sm:last:pr-0 sm:not-first:border-t-0 sm:not-first:border-l"
                >
                  <p className="num text-[30px] leading-none whitespace-nowrap text-white sm:text-[36px]">{metric.value}</p>
                  <p className="text-[14px] leading-[1.45] text-silver sm:mt-2 sm:min-h-[3lh] sm:text-[13px]">{metric.label}</p>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-[24px] leading-[1.15] font-medium tracking-[-0.02em] text-balance text-white sm:text-[26px]">
              {item.tagline}
            </h3>
            <p className="mt-2.5 text-[16px] leading-[1.6] text-pretty text-white/70 sm:text-[15px]">{item.text}</p>

            <figure className="mt-6 border-l border-sky/60 pl-5">
              <blockquote>
                <p className="text-[17px] leading-[1.5] text-pretty text-white/90 sm:text-[16px]">„{item.quote}“</p>
              </blockquote>
              <figcaption className="mt-2 text-[14px] leading-[1.5] text-silver">
                <span aria-hidden>– </span>
                {item.role}
              </figcaption>
            </figure>

            {/* What was built and the foot: at the bottom from xl, so the two cards side by side line up; below that each card is as tall as its content. */}
            <div className="pt-7 xl:mt-auto">
              <h4 className="text-[14px] leading-[1.5] text-silver">{CASES.doneLabel}</h4>
              <ul role="list" className="mt-2.5 grid gap-1.5">
                {item.done.map((entry) => (
                  <li key={entry} className="flex gap-3 text-[15px] leading-[22px] text-white/85">
                    <Check aria-hidden strokeWidth={1.5} className="mt-[3px] size-4 shrink-0 text-sky" />
                    <span className="min-w-0">{entry}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-white/[0.08] pt-4">
                <div className="min-w-0">
                  <h4 className="text-[14px] leading-[1.5] text-silver">{CASES.toolsLabel}</h4>
                  {/* Plain text joined by middle dots: each name keeps its dot, and the space after it is the only place a line breaks. */}
                  <ul role="list" className="mt-1.5 text-[15px] leading-[26px] text-white/85">
                    {item.tools.map((tool, i) => (
                      <li key={tool} className="inline">
                        <span className="whitespace-nowrap">
                          {tool}
                          {i < lastTool ? (
                            <span aria-hidden className="text-silver">
                              {" ·"}
                            </span>
                          ) : null}
                        </span>
                        {i < lastTool ? " " : null}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="shrink-0 text-[14px] leading-[26px]">
                  <span className="font-medium text-white">{item.area}</span> <span className="text-silver">{item.kind}</span>
                </p>
              </div>
            </div>
          </div>
        </MagicCard>
      </article>
    </li>
  );
});
