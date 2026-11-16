import Script from "next/script";
import type { CSSProperties } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { Container, Heading, PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import { LINKS } from "@/content/site";
import { KONTAKT_FORM, KONTAKT_HERO } from "@/content/pages/kontakt";

/*
  Kontakt, first screen: his headline and line, and beside them the real thing, his own contact form (his
  LeadConnector form, the one every "Anfrage" button on the site opens), embedded in the page's one lit glass panel.
  The provider's embed script sizes the frame to the form, so it is never cut off.

  Left, under the headline: his "Direkter Draht", the four steps of an enquiry (Ausgangspunkt, Impuls, Abstimmung,
  Ergebnis) as one line with four stations; a soft light keeps travelling down it and each station brightens as the
  light passes, ending at his promise "Reaktionszeit: innerhalb von 24 Std.". Pure CSS (kontakt.css), still under
  reduced motion. Phones: the headline, the steps, then the form.
*/
export function KontaktHero() {
  const h = KONTAKT_HERO;
  return (
    <section id="anfrage-start" className="relative pt-32 pb-16 md:pt-40 md:pb-24">
      <Container>
        <div className="grid gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-start lg:gap-x-16 xl:gap-x-24">
          <div className="lg:pt-6">
            <Heading as="h1" size="display" title={h.title} accent={h.accent} className="max-w-[640px] [&>.accent]:block" />
            <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[520px]">
              {h.text}
            </p>
            <div data-reveal="up" data-rd="3" className="mt-9 flex flex-wrap gap-3">
              <PrimaryLink href="#anfrage" className="lg:hidden">
                {h.primary}
              </PrimaryLink>
              <SecondaryLink href={LINKS.booking}>{h.secondary}</SecondaryLink>
            </div>

            <div data-reveal="up" data-rd="3" className="mt-14 max-w-[440px]">
              <h2 className="text-[15px] font-medium text-white/60">{h.dialogTitle}</h2>
              <ol role="list" className="kt-path relative mt-6">
                {h.steps.map((step, i) => (
                  <li key={step.label} className="kt-station relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-5 pb-7" style={{ "--kt-i": i } as CSSProperties}>
                    <span aria-hidden className="kt-node relative z-10 mt-1 grid size-[18px] place-items-center rounded-full border border-sky/50 bg-[#0a1d45]">
                      <span className="size-1.5 rounded-full bg-sky" />
                    </span>
                    <div>
                      <p className="flex items-baseline gap-3">
                        <span className="num text-[13px] text-sky">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-[17px] leading-snug font-medium text-white">{step.label}</span>
                      </p>
                      <p className="mt-1 text-[15px] leading-snug text-white/60">{step.text}</p>
                    </div>
                  </li>
                ))}
                <li className="kt-station relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-5" style={{ "--kt-i": 4 } as CSSProperties}>
                  <span aria-hidden className="kt-node kt-node-end relative z-10 mt-1.5 grid size-[18px] place-items-center rounded-full bg-sky">
                    <span className="kt-ping absolute inset-0 rounded-full bg-sky" />
                  </span>
                  <p className="inline-flex flex-wrap items-baseline gap-x-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[15px]">
                    <span className="text-white/60">{h.responseLabel}</span>
                    <span className="font-medium text-white">{h.responseValue}</span>
                  </p>
                </li>
              </ol>
            </div>
          </div>

          <div id="anfrage" className="scroll-mt-28">
            <div className="glass glass-lit relative overflow-hidden rounded-[28px] p-5 sm:p-8">
              <BorderBeam colorFrom="#69bff8" colorTo="#004ba0" duration={14} size={220} />
              <h2 className="t-h3 text-white">{h.formTitle}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/65">{h.formText}</p>
              <div className="mt-6 overflow-hidden rounded-[16px]">
                <iframe
                  src={KONTAKT_FORM.src}
                  id={`inline-${KONTAKT_FORM.id}`}
                  title={KONTAKT_FORM.title}
                  loading="lazy"
                  className="block w-full border-0"
                  style={{ height: 1120 }}
                  data-layout="{'id':'INLINE'}"
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-deactivation-type="neverDeactivate"
                  data-deactivation-value=""
                  data-form-name={KONTAKT_FORM.title}
                  data-height="1120"
                  data-layout-iframe-id={`inline-${KONTAKT_FORM.id}`}
                  data-form-id={KONTAKT_FORM.id}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
      {/* The form provider's own embed script: it sets the frame's height from the form inside it. */}
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
    </section>
  );
}
