import { Check, X } from "lucide-react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { COMPARE } from "@/content/site";
import { cn } from "@/lib/utils";
import { Tile } from "./bento";

/*
  v11 Vorher / Nachher: v1's panel and content with all of its motion taken out. In v1 the classic points drifted in
  a tilted pile and the Branded Genius points pulled into line with the scroll; on this panel the client said "only
  thing from that layout, what I don't like, it's really lagging", and the developer turned the moving version down.
  Here both columns stand in order: the classic points as dim chips on a broken, dashed line with open rings, the
  Branded Genius points as bright chips on a solid sky line with filled dots, each column closed by its result.
  Only the page's usual entrance remains. Phones: the two halves stack.
*/

type Way = typeof COMPARE.classic;

export function CompareSection() {
  return (
    <Section id="unterschied" className="pb-12 md:pb-16">
      <Container>
        <div className="max-w-[920px]">
          <Heading title={COMPARE.title} accent={COMPARE.accent} />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[600px]">
            {COMPARE.text}
          </p>
        </div>

        {/* v11: two tiles side by side, the classic way quiet, the Branded Genius way lit (a slow border light round it). */}
        <div data-reveal="up" data-rd="3" className="relative mt-12 grid gap-3 sm:gap-4 md:mt-16 lg:grid-cols-2">
          <Tile>
            <Column way={COMPARE.classic} ours={false} />
          </Tile>
          <Tile featured>
            <Column way={COMPARE.ours} ours />
          </Tile>
          {/* The original's "VS", where the two tiles meet. */}
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 z-20 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-button bg-[#0a2150] text-[12px] font-medium text-sky shadow-[inset_0_0_0_1px_rgb(105_191_248/0.35),0_10px_24px_-10px_rgb(0_0_0/0.8)]"
          >
            {COMPARE.vs}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Column({ way, ours }: { way: Way; ours: boolean }) {
  const Mark = ours ? Check : X;
  return (
    <div className={cn("relative px-6 pb-9 sm:px-10 md:pb-11", ours ? "pt-10" : "pt-8 md:pt-10")}>
      <h3 className={cn("flex items-center gap-2.5 text-[16px] font-medium", ours ? "text-white" : "text-silver")}>
        <Mark aria-hidden strokeWidth={ours ? 2 : 1.75} className={cn("size-4", ours && "text-sky")} />
        {way.title}
      </h3>
      <ol className="relative mt-8 space-y-3.5 pl-8 md:mt-10">
        {/* The classic line is broken and dashed (the steps never connect); ours is one solid sky line. */}
        <span
          aria-hidden
          className={cn(
            "absolute top-2 bottom-2 left-[5px] w-px",
            ours
              ? "bg-sky/55"
              : "bg-[repeating-linear-gradient(180deg,rgb(255_255_255/0.22)_0_6px,transparent_6px_14px)] [mask-image:linear-gradient(180deg,#000_0_18%,transparent_18%_30%,#000_30%_62%,transparent_62%_72%,#000_72%_100%)]"
          )}
        />
        {way.points.map((point) => (
          <li key={point} className="relative">
            <span aria-hidden className={cn("absolute top-1/2 -left-8 size-[11px] -translate-y-1/2 rounded-full border", ours ? "border-sky/60" : "border-white/25")}>
              {ours && <span className="absolute inset-[2px] rounded-full bg-sky" />}
            </span>
            <div
              className={cn(
                "inline-flex max-w-full items-center gap-3 rounded-[10px] bg-white/[0.045] px-4 py-3 text-[15px] leading-snug shadow-[inset_0_0_0_1px_rgb(241_241_238/0.08)]",
                ours ? "text-white" : "text-silver"
              )}
            >
              <Mark aria-hidden strokeWidth={ours ? 2 : 1.75} className={cn("size-4 shrink-0", ours ? "text-sky" : "text-silver")} />
              <span className="min-w-0">{point}</span>
            </div>
          </li>
        ))}
      </ol>
      <p
        className={cn(
          "mt-9 flex items-start gap-2.5 border-t pt-5 leading-snug md:mt-10",
          ours ? "border-white/10 text-[16px] font-medium text-white" : "border-white/[0.07] text-[15px] text-silver"
        )}
      >
        {ours && <Check aria-hidden strokeWidth={2} className="mt-[3px] size-4 shrink-0 text-sky" />}
        {way.result}
      </p>
    </div>
  );
}
