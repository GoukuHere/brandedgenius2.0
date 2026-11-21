import { Container, Heading, PrimaryLink } from "@/components/system/primitives";
import { getCopy } from "@/i18n/server";

/*
  Über uns, the close: no panel, only type on the page's own ground under one soft local light. The client's heading
  centred, his paragraph, his booking button, and his reassurance as three short lines on one hairline that draws out
  from the middle: the two "Keine" lines quiet, the "Nur" line, the promise, in full white.
  Round 5 (DE/EN): copy by language (the last line is the promise in both).
*/
export async function UberClosing() {
  const copy = await getCopy();
  const { UU_CTA } = copy.uberUns;
  const { LINKS } = copy.site;
  return (
    <section id="kontakt-cta" className="relative isolate overflow-hidden py-16 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(48%_60%_at_50%_34%,rgb(105_191_248/0.1),rgb(0_75_160/0.06)_50%,transparent_78%)]"
      />
      <Container className="text-center">
        <Heading title={UU_CTA.title} accent={UU_CTA.accent} className="mx-auto max-w-[940px]" />
        <p data-reveal="up" data-rd="2" className="t-lead mx-auto mt-6 max-w-[640px]">
          {UU_CTA.text}
        </p>
        <div data-reveal="up" data-rd="3" className="mt-10 flex justify-center">
          {/* Phones: slimmer padding, and the label may take two lines (it needed 333px of a 320px column at 360). */}
          <PrimaryLink href={LINKS.booking} size="lg" className="max-sm:h-auto max-sm:min-h-14 max-sm:px-5 max-sm:py-3 max-sm:text-center max-sm:text-[15px] max-sm:whitespace-normal">
            {UU_CTA.cta}
          </PrimaryLink>
        </div>

        <div className="mx-auto mt-16 max-w-[1040px] md:mt-20">
          <div data-reveal="rule" className="uu-rule-centre hairline" />
          <ul role="list" data-reveal-group data-rd="1" className="grid gap-4 pt-8 md:grid-cols-3 md:gap-0 md:pt-10">
            {UU_CTA.assurance.map((line, i) => {
              const promise = i === UU_CTA.assurance.length - 1;
              return (
                <li
                  key={line}
                  className={`px-4 text-[15px] leading-[1.55] text-balance md:px-10 md:text-[16px] md:[&+li]:shadow-[inset_1px_0_0_rgb(255_255_255/0.1)] ${
                    promise ? "font-medium text-white" : "text-white/55"
                  }`}
                >
                  {line}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
