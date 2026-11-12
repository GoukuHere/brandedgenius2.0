import type { CSSProperties } from "react";
import { Container, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { Marquee } from "@/components/ui/marquee";
import { PARTNERS } from "@/content/site";

/*
  Unsere Partner: the partners' own marks and names on a slow Magic UI Marquee, straight on the page background
  (no band, no glass), faded out at both edges. The Marquee pauses off screen and under the pointer, and only its
  first copy is read by screen readers. With reduced motion there is no loop: the extra copies are hidden and the
  one list wraps in place.

  v11 round 4 (the client: "this is fine so far. It could be bigger"): marks 38px instead of 24, names 30px, both
  brighter, and "Unsere Partner" centred above the strip instead of beside it.
*/

// Monochrome marks, turned white with brightness(0) invert(1). HighLevel has no mark and Zapier's only available file is
// a badge with its name cut out (a grey box once whitened), so both names stand alone, as on the original site.
const LOGOS: Record<string, string> = {
  ElevenLabs: "/logos/elevenlabs.svg",
  Google: "/logos/google.svg",
  OpenAI: "/logos/openai.svg",
};

/*
  runway.svg is a white mark on a solid black 300px square, so the filter above would paint a white square. It is
  drawn through a luminance mask instead (white shows, black drops out), scaled so the mark itself is 38px tall
  (it fills 133 of the 300 units). Browsers without mask-mode show the name alone.
*/
const RUNWAY_MASK: CSSProperties = {
  maskImage: "url(/logos/runway.svg)",
  maskMode: "luminance",
  maskSize: "86px 86px",
  maskPosition: "center",
  maskRepeat: "no-repeat",
};

const MARK = "size-7 shrink-0 opacity-75 transition-opacity duration-200 group-hover/partner:opacity-100 md:size-[38px]";

function Partner({ name }: { name: string }) {
  const logo = LOGOS[name];
  return (
    <div className="group/partner flex shrink-0 items-center gap-3 whitespace-nowrap md:gap-4">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- a 24px monochrome SVG gains nothing from the image optimiser
        <img src={logo} alt="" width={38} height={38} loading="lazy" decoding="async" className={`${MARK} brightness-0 invert`} />
      ) : name === "Runway" ? (
        <span aria-hidden className={`${MARK} hidden bg-white supports-[mask-mode:luminance]:block`} style={RUNWAY_MASK} />
      ) : null}
      <span className="text-[22px] leading-[1.3] font-medium tracking-[-0.015em] text-white/75 transition-colors duration-200 group-hover/partner:text-white md:text-[30px]">
        {name}
      </span>
    </div>
  );
}

export function PartnersSection() {
  return (
    <Section id="partner" className="py-14 md:py-20">
      <Container>
        <Reveal className="flex flex-col items-center gap-8 md:gap-10">
          <h2 className="text-center text-[15px] leading-normal font-normal text-white/65 md:text-[16px]">{PARTNERS.title}</h2>
          {/* Full bleed on phones so the marks run off both screen edges under the fade. */}
          <div className="-mx-5 w-[calc(100%+40px)] min-w-0 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] md:mx-0 md:w-full motion-reduce:mx-0 motion-reduce:[mask-image:none]">
            <Marquee
              pauseOnHover
              className="[--duration:46s] [--gap:3.5rem] md:[--gap:5.5rem] motion-reduce:[--gap:2.5rem] motion-reduce:[&>*:not(:first-child)]:hidden motion-reduce:[&>div]:shrink motion-reduce:[&>div]:flex-wrap motion-reduce:[&>div]:justify-start motion-reduce:[&>div]:gap-y-4"
            >
              {PARTNERS.names.map((name) => (
                <Partner key={name} name={name} />
              ))}
            </Marquee>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
