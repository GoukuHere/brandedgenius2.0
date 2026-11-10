"use client";

import { memo } from "react";
import { CASES, type CaseStudy } from "@/content/site";

/*
  v11 Fallstudie card. The client found v1's cards "overloaded with a lot of text, this is not good", so a card now
  holds only its three results and its headline. The paragraph, the quote, the list of what was built, the tools
  and the area line are left out (the area is already in the row of tabs above); the words that remain are unchanged.

  Width: on the scroller (a size container), one card with the next peeking on phones and tablets, two side by side
  from 1280px: half the scroller less its padding (2 x 32px) and the gap (24px).
*/

const COUNT = CASES.items.length;

export const caseCardId = (index: number) => `use-cases-card-${index}`;

export const CaseCard = memo(function CaseCard({ item, index }: { item: CaseStudy; index: number }) {
  return (
    <li className="flex w-[86cqw] shrink-0 snap-start md:w-[min(620px,74cqw)] xl:w-[calc((100cqw-88px)/2)]">
      <article id={caseCardId(index)} tabIndex={0} aria-label={`${index + 1} von ${COUNT}: ${item.name}`} className="v11-tile w-full rounded-[24px]">
        <div className="flex h-full flex-col p-6 sm:p-8">
          <ul role="list" className="border-b border-white/[0.1] pb-6 sm:grid sm:grid-cols-3">
            {item.metrics.map((metric) => (
              <li
                key={metric.label}
                className="grid grid-cols-[84px_minmax(0,1fr)] items-baseline gap-x-4 border-white/[0.1] py-3 first:pt-0 last:pb-0 not-first:border-t sm:block sm:px-5 sm:py-0 sm:first:pl-0 sm:last:pr-0 sm:not-first:border-t-0 sm:not-first:border-l"
              >
                <p className="num text-[32px] leading-none whitespace-nowrap text-white sm:text-[40px]">{metric.value}</p>
                <p className="text-[14px] leading-[1.45] text-white/62 sm:mt-2.5 sm:min-h-[3lh] sm:text-[13.5px]">{metric.label}</p>
              </li>
            ))}
          </ul>

          <h3 className="mt-7 text-[24px] leading-[1.15] font-medium tracking-[-0.02em] text-balance text-white sm:text-[27px]">{item.tagline}</h3>
        </div>
      </article>
    </li>
  );
});
