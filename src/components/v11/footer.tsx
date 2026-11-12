/* eslint-disable @next/next/no-img-element */
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { Container, Heading, SecondaryLink } from "@/components/system/primitives";
import { CONTACT, FOOTER, HEADER, LINKS } from "@/content/site";

function Column({ title, links, align = "left" }: { title: string; links: { label: string; href: string }[]; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "lg:text-right" : undefined}>
      <h3 className="text-[15px] font-medium text-white">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <a
              href={l.href}
              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
              className="text-[16px] text-ink/75 transition-colors duration-200 hover:text-white"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The client's own footer (brandedgenius.de), on the page background: "Lassen Sie uns sprechen.", Entdecken, the
// logo in the middle with the booking link, Verbinden, the legal links and "Nach oben". No glass here.
// v5: a full-width hairline above it, like the sections, and the page's one texture (FooterStipple) at its foot.
//
// v11 round 4 (the client's Loom of 2026-11-12, 2:06 to 3:00):
// - "This animation in the back ... keep that away. I think it will eat a lot of site-speed performance ... Nobody
//   checked the bottom". The dot canvas is gone; one still sky glow rises from the bottom centre in plain CSS (no
//   script, no animation, no image), so the footer keeps its light at no cost.
// - "it's going up again, I think. Or what is that? ... Ah, it's a contact form": the 64px arrow-only square beside
//   "Lassen Sie uns sprechen." read as "back to top". It is now a labelled button, the header's own "Jetzt Kontakt
//   aufnehmen".
// - "a little bit of text, what is that? Like on the right side": Verbinden held one link. It now lists the client's
//   e-mail and city (both on brandedgenius.de's Impressum; his contact page shows the e-mail) and the contact form.
//   The mobile number on the Impressum is left out, as his own contact page leaves it out.
export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/[0.07] pt-16 pb-8 md:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[520px] bg-[radial-gradient(60%_100%_at_50%_100%,rgb(105_191_248/0.16),rgb(0_75_160/0.1)_45%,transparent_75%)]"
      />
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Heading title={FOOTER.title} accent={FOOTER.accent} />
            <p className="t-lead mt-4 max-w-[440px]">{FOOTER.text}</p>
          </div>
          <SecondaryLink href={LINKS.contact} size="lg" className="shrink-0 self-start md:self-auto">
            {HEADER.cta}
          </SecondaryLink>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-3 lg:items-start">
          <Column title={FOOTER.discover.title} links={FOOTER.discover.links} />
          <div className="flex flex-col items-start lg:items-center">
            <img src="/brand/mark.svg" alt="" width={168} height={96} className="h-20 w-auto md:h-24" />
            <p className="mt-4 text-[15px] font-medium tracking-[0.02em] text-white">BRANDED GENIUS</p>
            <a
              href={LINKS.booking}
              target="_blank"
              rel="noopener"
              className="group mt-2 inline-flex items-center gap-1.5 text-[15px] font-medium text-white transition-colors hover:text-sky"
            >
              {FOOTER.cta}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
          <div className="lg:text-right">
            <h3 className="text-[15px] font-medium text-white">{FOOTER.connect.title}</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="text-[16px] text-ink/75 transition-colors duration-200 hover:text-white">
                  {CONTACT.email}
                </a>
              </li>
              {FOOTER.connect.links.map((l) => (
                <li key={l.href + l.label}>
                  <a href={l.href} target="_blank" rel="noopener" className="text-[16px] text-ink/75 transition-colors duration-200 hover:text-white">
                    Kontaktformular
                  </a>
                </li>
              ))}
              <li className="text-[16px] text-ink/50">{CONTACT.city}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-small">{FOOTER.copyright}</p>
          <nav aria-label="Rechtliches" className="flex gap-6">
            {FOOTER.legal.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener" className="text-[14px] text-ink/60 transition-colors duration-200 hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <a href="#top" className="group inline-flex items-center gap-2 text-[14px] text-ink/70 transition-colors hover:text-white">
            Nach oben
            <ArrowUp className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </Container>
    </footer>
  );
}
