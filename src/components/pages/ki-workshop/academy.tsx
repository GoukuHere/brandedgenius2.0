import { Container, Heading, SecondaryLink, Section } from "@/components/system/primitives";
import { getCopy } from "@/i18n/server";

/*
  KI-Akademie: one compact, quiet band. A single opaque navy plate with a royal light in its corner (the site's plate
  material); on large screens three parts in a row: his heading with his button at its foot, his paragraph, and his
  four advantages as a small numbered set. Phones: the same parts stacked, the button last. No photo and no motion of
  its own beyond the site's gentle rise: it is the pause between the trainer and the questions.
  Round 5 (DE/EN): copy by language.
*/
const pad = (n: number) => String(n).padStart(2, "0");

export async function KwAcademy() {
  const copy = await getCopy();
  const { KW_ACADEMY } = copy.kiWorkshop;
  const { LINKS } = copy.site;
  return (
    <Section id="akademie">
      <Container>
        <div data-reveal="up" className="v11-plate rounded-[24px] px-6 py-9 sm:px-10 sm:py-11 lg:rounded-[28px] lg:px-12 lg:py-12">
          <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-10">
            <div className="lg:col-span-4 lg:flex lg:flex-col lg:justify-between">
              <Heading title={KW_ACADEMY.title} accent={KW_ACADEMY.accent} className="kw-break text-[30px] sm:text-[34px] lg:text-[36px]" />
              <div className="mt-10 hidden lg:block">
                <SecondaryLink href={LINKS.contact}>{KW_ACADEMY.cta}</SecondaryLink>
              </div>
            </div>
            <p className="t-body lg:col-span-4 lg:pt-1.5">{KW_ACADEMY.text}</p>
            <div className="lg:col-span-4 lg:pt-1">
              <ul role="list" aria-label={KW_ACADEMY.perksLabel}>
                {KW_ACADEMY.perks.map((perk, i) => (
                  <li key={perk} className="flex items-baseline gap-4 border-t border-white/10 py-3 text-[15px] leading-[1.45] text-white/85 first:border-t-0 first:pt-0">
                    <span aria-hidden className="num w-6 shrink-0 text-[13px] text-sky">
                      {pad(i + 1)}
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:hidden">
              <SecondaryLink href={LINKS.contact}>{KW_ACADEMY.cta}</SecondaryLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
