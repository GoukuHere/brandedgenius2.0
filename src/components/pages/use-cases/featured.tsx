"use client";

import { ArrowUpRight } from "lucide-react";
import { useId, useRef, type CSSProperties, type MouseEvent } from "react";
import { BUTTON_RADIUS, Container, Heading, Section } from "@/components/system/primitives";
import { SpecularButton } from "@/components/ui/specular-button";
import { UC_FEATURED } from "@/content/pages/use-cases";
import { caseStore } from "./case-store";
import { useLive } from "./use-live";

/*
  Mega Screen, featured (2026-11-16): his "Case Study Architecture / Live Systeme" block for project 01, drawn as the
  system it describes. Three glass plates float one above another in isometric view, his pipeline from top to bottom:
  Web, KI-Agent, CRM. A lit lead drops through them in turn; each plate lights as it passes, a ring spreads on its
  surface, and the lead comes to rest in the CRM. His two figures sit beside it as annotations whose leader lines meet
  the plates they belong to (Strukturierung at the web layer, the qualified inquiry path where the lead lands), and
  lighten when the lead passes; his context facts stand quietly on the other side.

  One SVG (sharp at any size) with the plate names as page text on top. CSS keyframes only, one 6.4s cycle, paused
  off screen. Below 1280px the stack stands alone and the annotations follow under it. Reduced motion: no lead, the
  plates stand softly lit.
*/

const W = 200;
const H = 115;
const T = 12;
const C = 300;
const PLATES = [145, 275, 405];

const top = (cy: number) => `M${C} ${cy - H} L${C + W} ${cy} L${C} ${cy + H} L${C - W} ${cy} Z`;
const inner = (cy: number, k = 0.72) => `M${C} ${cy - H * k} L${C + W * k} ${cy} L${C} ${cy + H * k} L${C - W * k} ${cy} Z`;
const leftFace = (cy: number) => `M${C - W} ${cy} L${C} ${cy + H} L${C} ${cy + H + T} L${C - W} ${cy + T} Z`;
const rightFace = (cy: number) => `M${C + W} ${cy} L${C} ${cy + H} L${C} ${cy + H + T} L${C + W} ${cy + T} Z`;
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

/** The two figures and the plate each one belongs to (0 web, 2 CRM). */
const FACTS = [
  { ...UC_FEATURED.facts[0], plate: 0 },
  { ...UC_FEATURED.facts[1], plate: 2 },
];
const CONTEXT = [UC_FEATURED.focus, UC_FEATURED.individual, UC_FEATURED.verified];

export function FeaturedSection() {
  const stage = useRef<HTMLDivElement>(null);
  useLive(stage);
  const open = (event: MouseEvent<HTMLButtonElement>) => caseStore.open("mega-screen", event.currentTarget);

  return (
    <Section id="mega-screen">
      <Container>
        <div ref={stage} className="uc-live">
        <div className="flex flex-col items-center text-center">
          <Heading title={UC_FEATURED.title} accent={UC_FEATURED.accent} className="max-w-[760px]" />
          <p data-reveal="up" data-rd="2" className="uc-arch-meta">
            <span>{UC_FEATURED.project}</span>
            <span aria-hidden className="uc-arch-sep" />
            <span className="uc-arch-status">
              <span aria-hidden className="uc-arch-pulse" />
              {UC_FEATURED.status}
            </span>
          </p>
        </div>

        <div className="uc-arch mt-12 md:mt-16">
          {/* Desktop: the two figures, their leader lines meeting the plates (the value line is 34px tall). */}
          <div className="uc-arch-left" aria-hidden>
            {FACTS.map((fact) => (
              <div key={fact.label} className="uc-arch-fact" data-i={fact.plate} style={{ top: `${PLATES[fact.plate] - 17}px` } as CSSProperties}>
                <span className="uc-arch-label">{fact.label}</span>
                <span className="uc-arch-value-row">
                  <span className="uc-arch-value">{fact.value}</span>
                  <span className="uc-arch-leader" />
                  <span className="uc-arch-node" />
                </span>
              </div>
            ))}
          </div>

          <figure className="uc-stack" data-reveal="up" data-rd="1">
            <Stack />
            <figcaption className="uc-stack-caption">{UC_FEATURED.pipeline}</figcaption>
          </figure>

          {/* Desktop: the context, quiet, on the other side. */}
          <ul role="list" className="uc-arch-right" aria-hidden>
            {CONTEXT.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        </div>

        {/* The same facts for every screen and for screen readers; shown below the stack under 1280px. */}
        <div className="uc-arch-below">
          <dl className="uc-arch-figures">
            {UC_FEATURED.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <ul role="list" className="uc-arch-context">
            {CONTEXT.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div data-reveal="up" className="mt-12 flex justify-center md:mt-14">
          <SpecularButton
            onClick={open}
            aria-haspopup="dialog"
            data-kind="secondary"
            size="md"
            radius={BUTTON_RADIUS}
            tint="#ffffff"
            tintOpacity={0.045}
            lineColor="#69bff8"
            baseColor="#555555"
            textColor="#f1f1ee"
            idleIntensity={0.3}
            className="group hover:bg-white/[0.08]"
          >
            {UC_FEATURED.cta}
            <ArrowUpRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </SpecularButton>
        </div>
      </Container>
    </Section>
  );
}

/** The three plates, the lead and the layer names. */
function Stack() {
  const id = `uc${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div className="uc-stack-art">
      <svg viewBox="0 0 600 560" aria-hidden focusable="false" className="block h-auto w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#16427f" />
            <stop offset="1" stopColor="#0a2352" />
          </linearGradient>
          <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="#69bff8" stopOpacity="0.26" />
            <stop offset="0.55" stopColor="#69bff8" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-shadow`}>
            <stop offset="0" stopColor="#01040c" stopOpacity="0.55" />
            <stop offset="1" stopColor="#01040c" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-trail`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#69bff8" stopOpacity="0" />
            <stop offset="1" stopColor="#69bff8" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor="#69bff8" stopOpacity="0.6" />
            <stop offset="1" stopColor="#69bff8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* The stack's shadow, and the path the lead takes, under the glass. */}
        <ellipse cx={C} cy={PLATES[2] + H + 30} rx={W + 30} ry={60} fill={`url(#${id}-shadow)`} />
        <path d={`M${C} 0 V${PLATES[2]}`} stroke="#dcecff" strokeOpacity="0.3" strokeDasharray="3 6" />

        {/* Bottom plate first, so each plate above lies over the one below. */}
        {[2, 1, 0].map((i) => {
          const cy = PLATES[i];
          return (
            <g key={i} className="uc-plate" data-i={i}>
              <path d={leftFace(cy)} fill="#0e3168" stroke="#dcecff" strokeOpacity="0.3" strokeLinejoin="round" />
              <path d={rightFace(cy)} fill="#081d47" stroke="#dcecff" strokeOpacity="0.22" strokeLinejoin="round" />
              <path d={top(cy)} fill={`url(#${id}-top)`} fillOpacity="0.95" stroke="#dcecff" strokeOpacity="0.4" strokeLinejoin="round" />
              <path d={top(cy)} fill={`url(#${id}-sheen)`} />
              <path d={inner(cy)} fill="none" stroke="#ffffff" strokeOpacity="0.1" />
              <path d={`M${C - W} ${cy} L${C} ${cy + H} L${C + W} ${cy}`} fill="none" stroke="#dcecff" strokeOpacity="0.7" strokeWidth="1.2" strokeLinejoin="round" />
              <g className="uc-plate-lit" data-i={i}>
                <path d={top(cy)} fill="#69bff8" fillOpacity="0.2" stroke="#69bff8" strokeWidth="1.6" strokeLinejoin="round" />
                <path d={inner(cy)} fill="none" stroke="#69bff8" strokeOpacity="0.55" />
              </g>
              <ellipse cx={C} cy={cy} rx="64" ry="37" fill="none" stroke="#69bff8" strokeWidth="1.4" className="uc-ripple" data-i={i} />
            </g>
          );
        })}

        <g className="uc-lead">
          <path d={`M${C} -30 V6`} stroke={`url(#${id}-trail)`} strokeWidth="2" strokeLinecap="round" />
          <circle cx={C} cy="10" r="22" fill={`url(#${id}-glow)`} />
          <circle cx={C} cy="10" r="5" fill="#f4f9ff" />
        </g>
      </svg>

      {UC_FEATURED.layers.map((layer, i) => (
        <span key={layer} className="uc-layer" data-i={i} style={{ top: pct(PLATES[i] + 62, 560) }}>
          {layer}
        </span>
      ))}
    </div>
  );
}
