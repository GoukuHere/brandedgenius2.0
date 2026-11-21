/* eslint-disable @next/next/no-img-element */
import { Check } from "lucide-react";
import { Fragment } from "react";
import { Container, Heading } from "@/components/system/primitives";
import { getCopy } from "@/i18n/server";
import { OnScreen } from "./on-screen";

/*
  Über uns, Vertrauen. A seal: two rings of the client's promises set on circular paths, turning very slowly in
  opposite directions (CSS rotation of each ring's own layer, only while the seal is on screen, still for reduced
  motion); its centre holds the bG mark and his "Verlässliche Standards". Beside it (under it on phones) his heading,
  his paragraph and his seven promises in full as two quiet columns with small sky checks. The rings carry the same
  promises shortened by omission, so each ring holds its share at a readable size; the list is what screen readers get.

  Two drawings of the seal: one for wide screens and one for phones, each sized so the ring text renders at 13px or
  more. Every ring's text is spaced to close its circle exactly (textLength).
  Round 5 (DE/EN): copy by language; each drawing gets its rings' text from the copy when it renders.
*/

type Variant = { box: number; rings: { r: number; font: number }[]; hair: number[]; ticks: [number, number]; disc: number };
type RingText = readonly (readonly string[])[];

/*
  Text rings (baseline radius and type size), hairline circles, the bezel ticks and the centre disc, in the drawing's
  own units. The type sizes were measured in General Sans so each ring's text is a little shorter than its circle and
  textLength only opens the spacing slightly. Wide: about 15 and 14px on screen; phones: about 13.5px.
*/
const LG: Variant = {
  box: 520,
  rings: [
    { r: 230, font: 16.4 },
    { r: 196, font: 15.2 },
  ],
  hair: [252, 218, 184],
  ticks: [168, 174],
  disc: 158,
};
const SM: Variant = {
  box: 360,
  rings: [
    { r: 158, font: 14.6 },
    { r: 131, font: 14.6 },
  ],
  hair: [176, 150, 124],
  ticks: [110, 115],
  disc: 104,
};

const TAU = Math.PI * 2;

function circlePath(c: number, r: number) {
  // A full circle, clockwise from twelve o'clock, so the text reads along the top.
  return `M ${c} ${c - r} A ${r} ${r} 0 1 1 ${c} ${c + r} A ${r} ${r} 0 1 1 ${c} ${c - r}`;
}

function SealArt({ v, text, id, className }: { v: Variant; text: RingText; id: string; className: string }) {
  const c = v.box / 2;
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * TAU;
    const [r0, r1] = v.ticks;
    return { x1: c + r0 * Math.sin(a), y1: c - r0 * Math.cos(a), x2: c + r1 * Math.sin(a), y2: c - r1 * Math.cos(a), major: i % 12 === 0 };
  });
  return (
    <div aria-hidden className={className}>
      {/* The still parts: hairlines, the bezel and the centre's light. */}
      <svg viewBox={`0 0 ${v.box} ${v.box}`} className="absolute inset-0 h-full w-full" fill="none">
        <defs>
          <radialGradient id={`${id}-disc`} cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#1a6fe0" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0a2150" stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <circle cx={c} cy={c} r={v.hair[0]} stroke="rgb(255 255 255 / 0.14)" />
        <circle cx={c} cy={c} r={v.hair[1]} stroke="rgb(255 255 255 / 0.08)" />
        <circle cx={c} cy={c} r={v.hair[2]} stroke="rgb(105 191 248 / 0.35)" />
        <circle cx={c} cy={c} r={v.disc} fill={`url(#${id}-disc)`} stroke="rgb(255 255 255 / 0.1)" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.major ? "rgb(105 191 248 / 0.7)" : "rgb(255 255 255 / 0.16)"} strokeWidth={t.major ? 1.5 : 1} />
        ))}
      </svg>

      {/* The two rings of promises, each its own layer so it can turn without repainting. */}
      {text.map((ring, k) => {
        const { r, font } = v.rings[k];
        return (
          <svg key={k} viewBox={`0 0 ${v.box} ${v.box}`} className={`uu-seal-ring absolute inset-0 h-full w-full ${k ? "uu-seal-ring-b" : "uu-seal-ring-a"}`}>
            <defs>
              <path id={`${id}-ring-${k}`} d={circlePath(c, r)} />
            </defs>
            <text
              fontSize={font}
              fontWeight={500}
              fill={k ? "rgb(241 241 238 / 0.62)" : "rgb(241 241 238 / 0.82)"}
              textLength={Math.round(TAU * r * 10) / 10}
              lengthAdjust="spacing"
              style={{ whiteSpace: "pre" }}
            >
              <textPath href={`#${id}-ring-${k}`}>
                {ring.map((promise) => (
                  <Fragment key={promise}>
                    {promise}
                    <tspan fill="#69bff8">{"  •  "}</tspan>
                  </Fragment>
                ))}
              </textPath>
            </text>
          </svg>
        );
      })}
    </div>
  );
}

export async function UberTrust() {
  const { UU_TRUST } = (await getCopy()).uberUns;
  const half = Math.ceil(UU_TRUST.promises.length / 2);
  return (
    <section id="vertrauen" className="relative py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-x-8">
          <OnScreen className="uu-seal relative mx-auto aspect-square w-full max-w-[340px] md:max-w-[460px] lg:col-span-5 lg:max-w-[480px]">
            <SealArt v={SM} text={UU_TRUST.rings.short} id="uu-seal-sm" className="absolute inset-0 md:hidden" />
            <SealArt v={LG} text={UU_TRUST.rings.full} id="uu-seal-lg" className="absolute inset-0 hidden md:block" />
            {/* The centre: the bG mark and the client's standard. */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center text-center">
                <img src="/brand/mark.svg" alt="" width={721} height={454} className="h-auto w-[64px] md:w-[92px]" draggable={false} />
                <p className="mt-3 max-w-[9em] text-[17px] leading-[1.15] font-medium tracking-[-0.01em] text-white md:mt-4 md:text-[22px]">{UU_TRUST.standard}</p>
              </div>
            </div>
          </OnScreen>

          <div className="lg:col-span-7 lg:col-start-6 lg:pl-10 xl:pl-16">
            <Heading title={UU_TRUST.title} accent={UU_TRUST.accent} />
            <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[580px]">
              {UU_TRUST.text}
            </p>

            <p className="mt-10 text-[15px] text-white/60 md:mt-12">{UU_TRUST.listLabel}</p>
            <div className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {[UU_TRUST.promises.slice(0, half), UU_TRUST.promises.slice(half)].map((col, c) => (
                <ul key={c} role="list" className="flex flex-col gap-4">
                  {col.map((promise, i) => (
                    <li key={promise} data-reveal="tick" data-rd={Math.min(5, c * half + i + 1)} className="flex gap-3 text-[15px] leading-[1.5] text-white/80 md:text-[16px]">
                      <Check aria-hidden strokeWidth={1.5} className="mt-[3px] size-4 shrink-0 text-sky" />
                      {promise}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
