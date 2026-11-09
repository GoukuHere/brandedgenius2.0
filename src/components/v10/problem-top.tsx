import { Container, Heading } from "@/components/system/primitives";
import { PROBLEM } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  v10 Problem: the top of v1's Problem section, exactly as v1 lays it out (the client at 2:11 on it: "This is what I
  like most. I like this layout style"): the headline in 7 of 12 columns, the paragraph to its right, bottom-aligned
  with it, and the three facts under the paragraph as one plain line. v1's six problem cards on the broken circuit
  are left out (the developer: "he doesnt like this").

  It is what the hero zooms into (hero.tsx), so it fills one screen and stands in the middle of it, on the page's
  background. It has no entrance of its own: arriving out of the depth is its entrance.
*/
export function ProblemTop() {
  return (
    <div className="flex h-full items-center py-24 md:py-28">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-10">
          <div className="lg:col-span-7">
            <Heading title={PROBLEM.title} accent={PROBLEM.accent} />
          </div>
          <p className="t-lead mt-6 lg:col-span-5 lg:mt-0">{PROBLEM.text}</p>
          <div className="mt-8 lg:col-span-5 lg:col-start-8">
            <Facts />
          </div>
        </div>
      </Container>
    </div>
  );
}

/* The three facts as one plain line: label (13px silver) over value (15px white), thin vertical hairlines between. */
function Facts() {
  return (
    <dl className="grid grid-cols-3">
      {PROBLEM.reality.map((fact, i) => (
        <div key={fact.label} className={cn("min-w-0 px-3 first:pl-0 last:pr-0 sm:px-5", i > 0 && "border-l border-white/12")}>
          <dt className="text-[13px] leading-snug text-silver">{fact.label}</dt>
          <dd className="mt-1 text-[15px] leading-snug hyphens-auto text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
