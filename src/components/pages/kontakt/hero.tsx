import Script from "next/script";
import type { CSSProperties } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { Container, Heading, PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import { getCopy } from "@/i18n/server";

/*
  Kontakt: his headline and line, his "Direkter Draht", and his own contact form (his LeadConnector form, the one every
  "Anfrage" button on the site opens). The form panel is glass and the frame is blended onto it ("lighten"), so his
  dark card gives way to the glass, and the frame hides the card's white edge: form and panel read as one surface
  (kontakt.css, round 5). His form keeps its white labels only in a frame at least 500px wide; under that it falls
  back to dark grey labels, on his own site too. The provider's embed script sizes the frame to the form, so it is
  never cut off.

  "Direkter Draht": the four steps of an enquiry (Ausgangspunkt, Impuls, Abstimmung, Ergebnis) as hairline rows, the
  site's quiet list style, with one sky light running along them in turn, and his promise "Reaktionszeit: innerhalb von
  24 Std." under them. Pure CSS (kontakt.css), still under reduced motion.
  Round 5 (DE/EN): copy by language. The form itself is his German form in both languages (same id and address).

  Round 7 (Roman's Loom of 2026-11-24): "put that centralized or left side and this right side in one section, and the
  second section, long form format, this form directly under it", and "remove the logo here inside". Two sections now:
  first his headline, line and buttons on the left with "Direkter Draht" beside them on the right (phones: one under
  the other); then the form across the page under them, as wide as his form card goes (800px: wider, its white edge
  would show beside it). The logo at the head of his form is cropped off (kontakt.css). "Anfrage senden" now shows on
  every screen size and leads down to the form.
*/
export async function KontaktHero() {
  const copy = await getCopy();
  const { KONTAKT_HERO: h, KONTAKT_FORM } = copy.kontakt;
  const { LINKS } = copy.site;
  return (
    <>
      <section id="anfrage-start" className="relative pt-32 pb-14 md:pt-40 md:pb-20">
        <Container>
          <div className="grid gap-y-12 lg:grid-cols-12 lg:items-end lg:gap-x-12">
            <div className="lg:col-span-7">
              <Heading as="h1" size="display" title={h.title} accent={h.accent} className="max-w-[640px] [&>.accent]:block" />
              <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[540px]">
                {h.text}
              </p>
              <div data-reveal="up" data-rd="3" className="mt-9 flex flex-wrap gap-3">
                <PrimaryLink href="#anfrage">{h.primary}</PrimaryLink>
                <SecondaryLink href={LINKS.booking}>{h.secondary}</SecondaryLink>
              </div>
            </div>

            <div data-reveal="up" data-rd="3" className="max-w-[540px] lg:col-span-5 lg:max-w-none">
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
        </Container>
      </section>

      <section id="anfrage" aria-labelledby="anfrage-title" className="relative scroll-mt-24 pb-20 md:pb-28">
        <Container>
          {/* His card is at most 800px wide and must fill the frame, or its white edge shows beside it (the crop hides
              the edge only at the frame's own sides): an 800px frame is a 792px crop plus the panel's 16px sides; on
              phones the panel spans the page. */}
          <div className="kt-form-panel relative mx-auto w-full max-w-[824px] overflow-hidden rounded-[28px]">
            <BorderBeam colorFrom="#69bff8" colorTo="#004ba0" duration={14} size={220} />
            <div className="px-5 pt-7 text-center sm:px-8 sm:pt-10">
              <h2 id="anfrage-title" className="t-h3 text-white">
                {h.formTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-relaxed text-white/65">{h.formText}</p>
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
        </Container>
        {/* The form provider's own embed script: it sets the frame's height from the form inside it. */}
        <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
      </section>
    </>
  );
}
