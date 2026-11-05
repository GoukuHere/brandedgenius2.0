/* eslint-disable @next/next/no-img-element */
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { Container, Heading } from "@/components/system/primitives";
import { FOOTER, LINKS } from "@/content/site";
import { FooterStipple } from "./footer-stipple";

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
export function Footer() {
  return (
    <footer className="relative isolate border-t border-white/[0.07] pt-16 pb-8 md:pt-24">
      <FooterStipple />
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Heading title={FOOTER.title} accent={FOOTER.accent} />
            <p className="t-lead mt-4 max-w-[440px]">{FOOTER.text}</p>
          </div>
          <a
            href={LINKS.contact}
            target="_blank"
            rel="noopener"
            aria-label="Kontakt aufnehmen"
            className="group grid size-16 shrink-0 place-items-center rounded-button border border-white/15 text-white transition-colors duration-300 hover:border-cream hover:bg-cream hover:text-page"
          >
            <ArrowUpRight className="size-6 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
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
          <Column title={FOOTER.connect.title} links={FOOTER.connect.links} align="right" />
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
