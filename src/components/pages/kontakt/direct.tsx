import { ArrowUpRight, CalendarDays, Lock, Mail } from "lucide-react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { LINKS } from "@/content/site";
import { KONTAKT_DIRECT } from "@/content/pages/kontakt";

/*
  Kontakt, "Direkter Kontakt": his two direct channels as one object, a wide glass panel split down the middle by a
  hairline with the bG mark sitting on the seam. Each half is a whole link (booking on the left, e-mail on the right);
  hovering a half floods it with a soft sky light from its outer edge and lifts its arrow. Phones: the halves stack
  and the seam turns horizontal. His privacy promise sits quietly under it.
*/
export function KontaktDirect() {
  const d = KONTAKT_DIRECT;
  return (
    <Section id="direkt">
      <Container>
        <div className="mx-auto max-w-[720px] text-center">
          <Heading title={d.title} accent={d.accent} />
          <p data-reveal="up" data-rd="2" className="t-lead mx-auto mt-5 max-w-[560px]">
            {d.text}
          </p>
        </div>

        <div data-reveal="up" data-rd="2" className="kt-doors glass relative mx-auto mt-12 grid max-w-[1040px] overflow-hidden rounded-[28px] md:mt-16 md:grid-cols-2">
          <a href={LINKS.booking} target="_blank" rel="noopener" className="kt-door kt-door-left group">
            <span aria-hidden className="kt-door-icon">
              <CalendarDays strokeWidth={1.25} className="size-8" />
            </span>
            <span className="mt-8 block text-[15px] text-white/60">{d.booking.label}</span>
            <span className="mt-2 flex items-center gap-3 text-[clamp(1.5rem,1.2rem+1vw,2.125rem)] leading-tight font-medium tracking-[-0.02em] text-white">
              {d.booking.action}
              <ArrowUpRight strokeWidth={1.5} className="kt-door-arrow size-6 shrink-0 text-sky" />
            </span>
          </a>

          <span aria-hidden className="kt-seam">
            {/* eslint-disable-next-line @next/next/no-img-element -- a small static vector mark */}
            <img src="/brand/mark.svg" alt="" width={44} height={28} className="h-6 w-auto" />
          </span>

          <a href={`mailto:${d.email.action}`} className="kt-door kt-door-right group">
            <span aria-hidden className="kt-door-icon">
              <Mail strokeWidth={1.25} className="size-8" />
            </span>
            <span className="mt-8 block text-[15px] text-white/60">{d.email.label}</span>
            <span className="mt-2 flex items-center gap-3 text-[clamp(1.375rem,1.1rem+1vw,2rem)] leading-tight font-medium tracking-[-0.02em] break-all text-white sm:break-normal">
              {d.email.action}
              <ArrowUpRight strokeWidth={1.5} className="kt-door-arrow size-6 shrink-0 text-sky" />
            </span>
          </a>
        </div>

        <p data-reveal="up" data-rd="3" className="mx-auto mt-8 flex max-w-[620px] items-start justify-center gap-3 text-left text-[14px] leading-relaxed text-white/55 md:text-center">
          <Lock strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-sky/80" />
          <span>
            <span className="font-medium text-white/80">{d.privacyTitle}.</span> {d.privacyText}
          </span>
        </p>
      </Container>
    </Section>
  );
}
