import Script from "next/script";
import type { CSSProperties } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { Container, Heading, PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import { getCopy } from "@/i18n/server";

/*
  Kontakt, first screen: his headline and line, and beside them the real thing, his own contact form (his
  LeadConnector form, the one every "Anfrage" button on the site opens). The panel takes the form card's own colour
  and the frame hides the card's white edge, so form and panel read as one surface (kontakt.css). His form keeps its
  white labels only in a frame at least 500px wide; under that it falls back to dark grey labels, on his own site too.
  The provider's embed script sizes the frame to the form, so it is never cut off.

  Left, under the headline: his "Direkter Draht", the four steps of an enquiry (Ausgangspunkt, Impuls, Abstimmung,
  Ergebnis) as hairline rows, the site's quiet list style, with one sky light running along them in turn, and his
  promise "Reaktionszeit: innerhalb von 24 Std." under them. Round 5 (2026-11-18, Roman: only the contact form on this
  page, the left side "maybe other style to make it more fitting"): this is the whole page now, so on desktop the left
  column stays in view beside the long form (sticky). Pure CSS (kontakt.css), still under reduced motion. Phones: the
  headline, the steps, then the form.
  Round 5 (DE/EN): copy by language. The form itself is his German form in both languages (same id and address).
*/
export async function KontaktHero() {
  const copy = await getCopy();
  const { KONTAKT_HERO: h, KONTAKT_FORM } = copy.kontakt;
  const { LINKS } = copy.site;
  return (
    <section id="anfrage-start" className="relative pt-32 pb-16 md:pt-40 md:pb-24">
      <Container>
        <div className="grid gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-start lg:gap-x-16 xl:gap-x-24">
          <div className="kt-left lg:pt-6">
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

            <div data-reveal="up" data-rd="3" className="mt-12 max-w-[520px] md:mt-14">
              <h2 className="text-[15px] font-medium text-white/60">{h.dialogTitle}</h2>
              <ol role="list" className="mt-4 border-t border-white/10">
                {h.steps.map((step, i) => (
                  <li
                    key={step.label}
                    className="kt-step grid grid-cols-[36px_minmax(0,1fr)] items-baseline gap-x-3 border-b border-white/10 py-4"
                    style={{ "--kt-i": i } as CSSProperties}
                  >
                    <span className="num text-[14px] text-sky">{String(i + 1).padStart(2, "0")}</span>
                    <p className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <span className="text-[17px] leading-snug font-medium text-white">{step.label}</span>
                      <span className="text-[15px] leading-snug text-white/55">{step.text}</span>
                    </p>
                  </li>
                ))}
              </ol>
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
                <span aria-hidden className="relative grid size-2 place-items-center">
                  <span className="kt-ping absolute inset-0 rounded-full bg-sky" />
                  <span className="relative size-2 rounded-full bg-sky" />
                </span>
                <span className="text-white/60">{h.responseLabel}</span>
                <span className="font-medium text-white">{h.responseValue}</span>
              </p>
            </div>
          </div>

          {/* Under 600px wide on tablets (his card stops at 800px and its white frame would show beside it); the
              frame stays at least 500px wide from small tablets up, the width his form keeps its white labels at. */}
          <div id="anfrage" className="w-full max-w-[600px] scroll-mt-28 lg:max-w-none">
            <div className="kt-form-panel relative overflow-hidden rounded-[28px]">
              <BorderBeam colorFrom="#69bff8" colorTo="#004ba0" duration={14} size={220} />
              <div className="px-5 pt-7 text-center sm:px-8 sm:pt-9">
                <h2 className="t-h3 text-white">{h.formTitle}</h2>
                <p className="mx-auto mt-3 max-w-[440px] text-[15px] leading-relaxed text-white/65">{h.formText}</p>
              </div>
              <div className="px-1 pt-5 pb-4 sm:px-4 sm:pb-6">
                <div className="kt-form-crop">
                  <iframe
                    src={KONTAKT_FORM.src}
                    id={`inline-${KONTAKT_FORM.id}`}
                    title={KONTAKT_FORM.title}
                    loading="lazy"
                    className="kt-form-frame"
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
        </div>
      </Container>
      {/* The form provider's own embed script: it sets the frame's height from the form inside it. */}
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
    </section>
  );
}
