import { Container, Heading, Section } from "@/components/system/primitives";
import { KONTAKT_FAQ } from "@/content/pages/kontakt";

/*
  Kontakt, his five questions before an enquiry, answered in the open: no accordion to click through (each answer is a
  sentence or two). Desktop: his heading and line hold on the left while the five questions run down the right, each
  under a sky number on a hairline. Phones: the heading, then the questions.
*/
export function KontaktFaq() {
  const f = KONTAKT_FAQ;
  return (
    <Section id="fragen">
      <Container>
        <div className="grid gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Heading title={f.title} accent={f.accent} className="[&>.accent]:block" />
            <p data-reveal="up" data-rd="2" className="t-lead mt-5 max-w-[420px]">
              {f.text}
            </p>
          </div>
          <dl className="divide-y divide-white/10 border-t border-white/10">
            {f.items.map((item, i) => (
              <div key={item.q} data-reveal="up" data-rd={String(Math.min(4, i + 1))} className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 py-7 md:py-8">
                <span aria-hidden className="num pt-1 text-[14px] text-sky">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <dt className="text-[18px] leading-snug font-medium tracking-[-0.01em] text-white md:text-[20px]">{item.q}</dt>
                  <dd className="mt-2.5 text-[15px] leading-relaxed text-white/65 md:text-[16px]">{item.a}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}
