"use client";

import { Container, Heading } from "@/components/system/primitives";
import { PROBLEM } from "@/content/site";
import { cn } from "@/lib/utils";
import { IconWell, useIconTurns } from "./icon-well";
import type { IconName } from "./icons";

/*
  v11 Problem: the top of v1's Problem section, exactly as v1 lays it out (the client at 2:11 on it: "This is what I
  like most. I like this layout style"): the headline in 7 of 12 columns, the paragraph to its right, bottom-aligned
  with it, and the three facts under the paragraph as one plain line. v1's six problem cards on the broken circuit
  are left out (the developer: "he doesnt like this").

  It is what the hero zooms into (hero.tsx), so it fills one screen and stands in the middle of it, on the page's
  background. It has no entrance of its own: arriving out of the depth is its entrance. `active` is true once it has
  arrived; only then do its icons play.
*/
export function ProblemTop({ active = true }: { active?: boolean }) {
  return (
    <div className="flex h-full items-center py-24 md:py-28">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-10">
          <div className="lg:col-span-7">
            <Heading title={PROBLEM.title} accent={PROBLEM.accent} />
          </div>
          <p className="t-lead mt-6 lg:col-span-5 lg:mt-0">{PROBLEM.text}</p>
          <div className="mt-8 lg:col-span-5 lg:col-start-8">
            <Facts active={active} />
          </div>
        </div>
      </Container>
    </div>
  );
}

/*
  The three facts as one plain line, as in v1 (label over value, thin vertical hairlines between); v11 sets a small
  animated icon over each: a pulled plug for the tools, stacked layers for the data, a hand for the manual work.
*/
const FACT_ICONS: IconName[] = ["unplug", "layers", "hand"];

function Facts({ active }: { active: boolean }) {
  const { area, well, trigger } = useIconTurns<HTMLDListElement>(PROBLEM.reality.length, active);
  return (
    <dl ref={area} className="grid grid-cols-3">
      {PROBLEM.reality.map((fact, i) => (
        <div key={fact.label} {...trigger(i)} className={cn("min-w-0 px-3 first:pl-0 last:pr-0 sm:px-5", i > 0 && "border-l border-white/12")}>
          <IconWell ref={well(i)} name={FACT_ICONS[i]} size="sm" className="mb-3" />
          <dt className="text-[13px] leading-snug text-silver">{fact.label}</dt>
          <dd className="mt-1 text-[15px] leading-snug hyphens-auto text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
