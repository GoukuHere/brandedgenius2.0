import { ArrowUpRight, Check } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { CONTACT, CTA, LINKS } from "@/content/site";

/*
  Kontakt: the closing call to action, composed after arventas.de ("Was ist Ihr nächster Schritt?").

  Desktop (lg): a 12-column grid. Roman's consultation photo fills columns 1 to 5; one large card spans columns 5 to 12,
  so it covers the photo by exactly one column (about 80px) and is centred on it vertically. The card is opaque (page
  navy under the shared surface gradient), so no text ever sits over the photo. Below lg the photo goes on top in a
  16:10 crop and the card follows without overlap.

  The card offers the three ways to start as full-width link rows; each row is a single link.
*/

const [mailUser, mailDomain] = CONTACT.email.split("@");

const ROWS: { href: string; label: ReactNode }[] = [
  { href: LINKS.analysis, label: CTA.primary },
  { href: LINKS.booking, label: CTA.secondary },
  // A soft break after the @ lets the address wrap cleanly on the narrowest phones instead of overflowing the card.
  {
    href: `mailto:${CONTACT.email}`,
    label: (
      <>
        {mailUser}@<wbr />
        {mailDomain}
      </>
    ),
  },
];

// Same rule as the shared link primitives: web links open in a new tab, mailto stays in place.
const external = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});

export function CtaSection() {
  return (
    <Section id="kontakt">
      <Container>
        <div className="grid gap-5 md:gap-6 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-start-1 lg:col-end-6 lg:row-start-1">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] lg:aspect-[4/5]">
              <Image
                src="/media/photos/roman-consult.webp"
                alt="Roman Tränkle im Beratungsgespräch"
                fill
                sizes="(min-width: 1280px) 493px, (min-width: 1024px) 39vw, (min-width: 768px) calc(100vw - 64px), calc(100vw - 40px)"
                // Keeps Roman's face in the wide phone crop; the 4:5 desktop crop barely trims the photo.
                className="object-cover object-[50%_42%]"
              />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-page/50 to-transparent" />
            </div>
          </Reveal>

          <Reveal delay={0.12} className="relative z-10 lg:col-start-5 lg:col-end-13 lg:row-start-1">
            <div className="surface relative rounded-[32px] bg-page p-8 md:p-12">
              <Heading title={CTA.title} accent={CTA.accent} serif className="[&_.accent]:inline-block" />
              <p className="t-lead mt-6 max-w-[620px]">{CTA.text}</p>

              <ul role="list" className="mt-10 divide-y divide-white/10 border-y border-white/10">
                {ROWS.map((row) => (
                  <li key={row.href}>
                    <a href={row.href} {...external(row.href)} className="group flex items-center justify-between gap-4 rounded-lg py-5 md:py-6">
                      {/* 20px on phones: at 26px "Potenzialanalyse" and the address do not fit beside the 52px button at 375px. */}
                      <span className="min-w-0 text-[20px] leading-[1.2] font-medium tracking-[-0.02em] break-words text-white sm:text-[26px]">
                        {row.label}
                      </span>
                      <span
                        aria-hidden
                        className="grid size-[52px] shrink-0 place-items-center rounded-full border border-white/15 text-white transition-[background-color,border-color,color,scale] duration-300 ease-out group-hover:border-sky group-hover:bg-sky group-hover:text-page group-focus-visible:border-sky group-focus-visible:bg-sky group-focus-visible:text-page group-active:scale-[0.96]"
                      >
                        <ArrowUpRight
                          strokeWidth={1.5}
                          className="size-5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <ul role="list" className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {CTA.checks.map((check) => (
                  <li key={check} className="flex items-center gap-2">
                    <Check aria-hidden strokeWidth={1.5} className="size-4 shrink-0 text-sky" />
                    <span className="t-small text-white/70">{check}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
