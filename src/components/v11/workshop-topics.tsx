import { PrimaryLink } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { LINKS, WORKSHOP } from "@/content/site";

/*
  v11 round 4: the KI-Workshop topics. The client (Loom of 2026-11-12, 1:20 to 1:38): "this looks strange ... the
  section looks not good ... position strange, space here". The old block had three faults: the "Themenbeispiele"
  label stood alone at the far left with a wide gap before the content; a large line cycled through the topics while
  the same topics stood again in the list under it, so every topic showed twice; and the list ran on as one sentence
  with dots, so its lines broke at random.

  Now: "Themenbeispiele" is a small heading right above the list, on the content's left edge; the seven topics are a
  numbered list, two columns from md (01 to 04, then 05 to 07), each on its own hairline; the booking link under it.
  No loop, nothing repeated. Server-rendered, no script.
*/

const TOPICS = WORKSHOP.topics;
const ROWS = Math.ceil(TOPICS.length / 2);
const pad = (i: number) => String(i + 1).padStart(2, "0");

export function WorkshopTopics() {
  return (
    <Reveal className="mt-16 md:mt-24">
      <div className="rule" />
      <div className="pt-10 md:pt-14">
        <h3 className="text-[20px] leading-tight font-medium tracking-[-0.01em] text-white md:text-[22px]">{WORKSHOP.topicsLabel}</h3>
        <ol
          role="list"
          className="mt-6 grid grid-cols-1 gap-x-12 md:mt-8 md:grid-flow-col md:grid-cols-2 lg:gap-x-20"
          style={{ gridTemplateRows: `repeat(${ROWS}, auto)` }}
        >
          {TOPICS.map((topic, i) => (
            <li key={topic} className="flex items-baseline gap-4 border-b border-white/10 py-4 md:py-5">
              <span className="num w-7 shrink-0 text-[15px] text-sky">{pad(i)}</span>
              <span className="text-[17px] leading-snug text-white/85 md:text-[19px]">{topic}</span>
            </li>
          ))}
        </ol>
        <div className="mt-10 md:mt-12">
          <PrimaryLink href={LINKS.booking}>{WORKSHOP.cta}</PrimaryLink>
        </div>
      </div>
    </Reveal>
  );
}
