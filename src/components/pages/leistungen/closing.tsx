import { Container, Heading, PrimaryLink, Section, SecondaryLink } from "@/components/system/primitives";
import { getCopy } from "@/i18n/server";

/*
  The closing statement: his question very large and centred on the open page, his line and his two buttons. No
  panel: a quiet light rises behind it from a single wide orbit arc low in the section, the hero's rings echoed once
  at the end of the page. Static (the heading's own entrance is the only motion).
  Round 5 (DE/EN): copy by language.
*/
export async function ClosingSection() {
  const copy = await getCopy();
  const { CLOSING } = copy.leistungen;
  const { LINKS } = copy.site;
  return (
    <Section id="kontakt-cta" className="ls-closing">
      <div aria-hidden className="ls-closing-light">
        <span className="ls-closing-glow" />
        <span className="ls-closing-arc" />
      </div>
      <Container className="relative">
        <div className="mx-auto max-w-[1100px] text-center">
          <Heading title={CLOSING.title} accent={CLOSING.accent} size="display" className="ls-closing-title mx-auto" />
          <p data-reveal="up" data-rd="2" className="t-lead mx-auto mt-6 max-w-[640px] md:mt-8">
            {CLOSING.text}
          </p>
          <div data-reveal="up" data-rd="3" className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center md:mt-10">
            <PrimaryLink href={LINKS.booking} size="lg">
              {CLOSING.primary}
            </PrimaryLink>
            <SecondaryLink href={LINKS.contact} size="lg">
              {CLOSING.secondary}
            </SecondaryLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
