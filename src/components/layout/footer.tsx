import { ArrowUp } from "lucide-react";
import { Container, Heading, PrimaryLink } from "@/components/system/primitives";
import { CONTACT, FOOTER, LINKS } from "@/content/site";

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[15px] text-ink/45">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
              className="text-[16px] text-ink/80 transition-colors duration-200 hover:text-white"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// After the client's own footer (Lassen Sie uns sprechen / Entdecken / Verbinden / legal), set like arventas.de's closing.
export function Footer() {
  return (
    <footer className="relative overflow-hidden pt-24 md:pt-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Heading title={FOOTER.title} accent={FOOTER.accent} />
            <p className="t-lead mt-5 max-w-[440px]">{FOOTER.text}</p>
            <PrimaryLink href={LINKS.booking} className="mt-8">
              {FOOTER.cta}
            </PrimaryLink>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:col-start-8">
            <Column title={FOOTER.discover.title} links={FOOTER.discover.links} />
            <Column title={FOOTER.connect.title} links={FOOTER.connect.links} />
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-small">
            {FOOTER.copyright} {CONTACT.city}
          </p>
          <nav aria-label="Rechtliches" className="flex gap-6">
            {FOOTER.legal.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener" className="text-[14px] text-ink/60 transition-colors duration-200 hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="#top"
            aria-label="Nach oben"
            className="group grid size-12 place-items-center self-start rounded-full border border-white/15 transition-colors duration-300 hover:border-sky/50 hover:bg-sky/10 sm:self-auto"
          >
            <ArrowUp className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </Container>

      {/* The name set huge and quiet at the very bottom, as arventas.de closes its page. */}
      <p
        aria-hidden
        className="pointer-events-none mt-4 translate-y-[18%] text-center text-[11.6vw] leading-[0.8] font-semibold tracking-[-0.055em] whitespace-nowrap text-white/[0.045] select-none"
      >
        BRANDED GENIUS
      </p>
    </footer>
  );
}
