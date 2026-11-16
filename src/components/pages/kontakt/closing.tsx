import { Container, Heading, PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import { LINKS } from "@/content/site";
import { KONTAKT_CLOSING } from "@/content/pages/kontakt";

/*
  Kontakt, the close: his sentence, centred and large, over a quiet beacon, three thin sky rings that keep widening
  out from behind it and fading (CSS, three staggered loops, paused under reduced motion), as if the page were still
  listening. His two buttons: book the call, or go back up to the form.
*/
export function KontaktClosing() {
  const c = KONTAKT_CLOSING;
  return (
    <section id="naechster-schritt" className="relative overflow-hidden py-28 md:py-40">
      <span aria-hidden className="kt-beacon">
        <span />
        <span />
        <span />
      </span>
      <Container className="relative">
        <div className="mx-auto max-w-[820px] text-center">
          <Heading title={c.title} accent={c.accent} className="text-balance [&>.accent]:block" />
          <p data-reveal="up" data-rd="2" className="t-lead mx-auto mt-6 max-w-[560px]">
            {c.text}
          </p>
          <div data-reveal="up" data-rd="3" className="mt-10 flex flex-wrap justify-center gap-3">
            <PrimaryLink href={LINKS.booking}>{c.primary}</PrimaryLink>
            <SecondaryLink href="#anfrage">{c.secondary}</SecondaryLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
