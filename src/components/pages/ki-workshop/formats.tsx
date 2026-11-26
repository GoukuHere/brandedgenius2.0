"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import type { FormatKey } from "@/content/pages/ki-workshop";
import { useCopy } from "@/i18n/client";

/*
  Formate: his four formats as a Venn diagram. Two large circles, "Vor-Ort-Workshop" and "Online-Seminar"; where they
  overlap, "Hybrid-Workshop"; around both, an outer ring, "Individuelles Training". Fine sky lines with soft fills; the
  lines draw when the diagram comes into view. Every region is selectable (hover, focus, tap, arrow keys): it lights
  (its own fill and a brighter edge drawn around exactly that region) and the panel shows the format's photo, his
  label and his description. Vor-Ort-Workshop is selected at first. His four notes stand as a quiet line under it.

  The regions are computed from the two circles (their crossing points and arcs), so each one is a real shape you can
  hit; the outer ring is the ellipse with both circles cut out. Two geometries: wide from 640px, tall below it (the
  circles stacked, so every name still fits inside its region on a phone). The names are HTML buttons laid over the
  drawing (a tab list), so they stay sharp and reachable by keyboard; the drawing itself is decorative.

  The photos: Roman on site in a seminar room, an online seminar, a hybrid session and a tailored session with a small
  team. Round 6 (Roman, 2026-11-24, of the two generated pictures of him: "this is not me ... remove that"): online
  and tailored show the format without him (GPT Image 2.5) until his own photos come.
  Round 8: both made again at 2K through higgscheap; the online slide now names each step of its workflow.
  Round 9 (the developer, 2026-11-26: "looks very blurry and doesnt makes sense"): hybrid was the on-site and the
  online photo cut in half side by side, each half loaded at 245px and stretched to about 400px to fill its tall
  frame. It is now one picture made for it (GPT Image 2.5 Sunburst, 2K): the group at the table, the trainer from
  behind, the remote participants and his workflow slide on the wall display.
  Round 5 (DE/EN): copy by language; the regions and photos key on the format's key, never its name.
*/

type Format = { key: FormatKey; title: string; label: string; text: string; alt: string };
const HOVER_INTENT_MS = 90;

type Point = { x: number; y: number };
type Venn = {
  w: number;
  h: number;
  ell: { cx: number; cy: number; rx: number; ry: number };
  a: Point;
  b: Point;
  r: number;
  at: Record<FormatKey, Point>;
};

const WIDE: Venn = {
  w: 720,
  h: 500,
  ell: { cx: 360, cy: 262, rx: 350, ry: 230 },
  a: { x: 265, y: 276 },
  b: { x: 455, y: 276 },
  r: 180,
  at: { onsite: { x: 180, y: 276 }, online: { x: 540, y: 276 }, hybrid: { x: 360, y: 276 }, custom: { x: 360, y: 76 } },
};

const TALL: Venn = {
  w: 340,
  h: 500,
  ell: { cx: 170, cy: 252, rx: 168, ry: 246 },
  a: { x: 170, y: 196 },
  b: { x: 170, y: 324 },
  r: 110,
  at: { onsite: { x: 170, y: 150 }, online: { x: 170, y: 370 }, hybrid: { x: 170, y: 260 }, custom: { x: 170, y: 46 } },
};

const f = (v: number) => Math.round(v * 100) / 100;

/**
 * The four regions of two equal circles A and B inside an ellipse. P1 and P2 are where the circles cross; each region
 * is bounded by arcs between them (the far side of one circle, the near side of the other). The outer region is the
 * ellipse with the union of both circles cut out (even-odd fill).
 */
function regionPaths({ a, b, r, ell }: Venn): Record<FormatKey, string> {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / d;
  const uy = (b.y - a.y) / d;
  const h = Math.sqrt(r * r - (d / 2) ** 2);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const p1 = `${f(mx - uy * h)} ${f(my + ux * h)}`;
  const p2 = `${f(mx + uy * h)} ${f(my - ux * h)}`;
  const arc = (large: number, sweep: number, to: string) => `A ${r} ${r} 0 ${large} ${sweep} ${to}`;
  const union = `M ${p1} ${arc(1, 1, p2)} ${arc(1, 1, p1)} Z`;
  const { cx, cy, rx, ry } = ell;
  const ellipse = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  return {
    onsite: `M ${p1} ${arc(1, 1, p2)} ${arc(0, 0, p1)} Z`,
    online: `M ${p1} ${arc(1, 0, p2)} ${arc(0, 1, p1)} Z`,
    hybrid: `M ${p1} ${arc(0, 0, p2)} ${arc(0, 0, p1)} Z`,
    custom: `${ellipse} ${union}`,
  };
}

const WIDE_PATHS = regionPaths(WIDE);
const TALL_PATHS = regionPaths(TALL);
// Painted from the back: the outer ring first, the overlap last.
const ORDER: FormatKey[] = ["custom", "onsite", "online", "hybrid"];
const pct = (v: number, of: number) => `${f((v / of) * 100)}%`;

function Diagram({
  geo,
  paths,
  on,
  onPick,
  onHover,
  className,
}: {
  geo: Venn;
  paths: Record<FormatKey, string>;
  on: FormatKey;
  onPick: (key: FormatKey) => void;
  onHover: (key: FormatKey, pointerType: string) => void;
  className: string;
}) {
  const { a, b, r, ell } = geo;
  return (
    <svg aria-hidden viewBox={`0 0 ${geo.w} ${geo.h}`} className={className}>
      {ORDER.map((key) => (
        <path
          key={key}
          d={paths[key]}
          fillRule="evenodd"
          className="kw-venn-region"
          data-on={key === on ? "" : undefined}
          onClick={() => onPick(key)}
          onPointerEnter={(event) => onHover(key, event.pointerType)}
        />
      ))}
      <ellipse cx={ell.cx} cy={ell.cy} rx={ell.rx} ry={ell.ry} pathLength={1} className="kw-venn-ring kw-venn-ring-outer" style={{ "--d": "0ms" } as CSSProperties} />
      <circle cx={a.x} cy={a.y} r={r} pathLength={1} className="kw-venn-ring" style={{ "--d": "220ms" } as CSSProperties} />
      <circle cx={b.x} cy={b.y} r={r} pathLength={1} className="kw-venn-ring" style={{ "--d": "380ms" } as CSSProperties} />
      <path key={on} d={paths[on]} fillRule="evenodd" pathLength={1} className="kw-venn-edge" />
    </svg>
  );
}

/** The photo for a format: one picture each. */
function FormatPhoto({ item }: { item: Format }) {
  const { KW_MEDIA } = useCopy().kiWorkshop;
  const sizes = "(min-width: 1280px) 490px, (min-width: 1024px) 38vw, calc(100vw - 40px)";
  const src = KW_MEDIA[item.key];
  return <Image src={src} alt={item.alt} fill quality={85} sizes={sizes} className="object-cover object-[50%_38%]" />;
}

export function KwFormats() {
  const { KW_FORMATS } = useCopy().kiWorkshop;
  const ITEMS: Format[] = KW_FORMATS.items;
  const box = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const hover = useRef<number | undefined>(undefined);
  const [active, setActive] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const baseId = useId();

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        setDrawn(true);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(hover.current), []);

  const indexOf = (key: FormatKey) => ITEMS.findIndex((item) => item.key === key);
  const select = (index: number) => {
    window.clearTimeout(hover.current);
    setActive(index);
  };
  const hoverSelect = (key: FormatKey, pointerType: string) => {
    if (pointerType !== "mouse") return;
    window.clearTimeout(hover.current);
    hover.current = window.setTimeout(() => setActive(indexOf(key)), HOVER_INTENT_MS);
  };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = ITEMS.length - 1;
    const next = index === last ? 0 : index + 1;
    const prev = index === 0 ? last : index - 1;
    const keys: Record<string, number> = { ArrowRight: next, ArrowDown: next, ArrowLeft: prev, ArrowUp: prev, Home: 0, End: last };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    tabs.current[target]?.focus();
  };

  const on = ITEMS[active].key;

  return (
    <Section id="formate">
      <Container>
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-12">
          <div className="lg:col-span-5 lg:row-start-1">
            <Heading title={KW_FORMATS.title} accent={KW_FORMATS.accent} className="kw-break" />
          </div>

          <div className="relative lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center">
            <div aria-hidden className="kw-glow absolute inset-[6%] -z-10" />
            <svg aria-hidden width="0" height="0" className="absolute">
              <defs>
                <radialGradient id="kw-venn-fill" cx="50%" cy="45%" r="70%">
                  <stop offset="0" stopColor="#69bff8" stopOpacity="0.34" />
                  <stop offset="1" stopColor="#1a6fe0" stopOpacity="0.12" />
                </radialGradient>
              </defs>
            </svg>
            <div ref={box} data-drawn={drawn ? "" : undefined} className="kw-venn kw-venn-box">
              <Diagram geo={TALL} paths={TALL_PATHS} on={on} onPick={(key) => select(indexOf(key))} onHover={hoverSelect} className="absolute inset-0 size-full sm:hidden" />
              <Diagram
                geo={WIDE}
                paths={WIDE_PATHS}
                on={on}
                onPick={(key) => select(indexOf(key))}
                onHover={hoverSelect}
                className="absolute inset-0 hidden size-full sm:block"
              />
              <div role="tablist" aria-label={`${KW_FORMATS.title} ${KW_FORMATS.accent}`}>
                {ITEMS.map((item, i) => {
                  const tall = TALL.at[item.key];
                  const wide = WIDE.at[item.key];
                  const selected = i === active;
                  return (
                    <button
                      key={item.key}
                      ref={(el) => {
                        tabs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`${baseId}-tab-${i}`}
                      aria-selected={selected}
                      aria-controls={`${baseId}-panel-${i}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => select(i)}
                      onFocus={() => select(i)}
                      onKeyDown={(event) => onKey(event, i)}
                      onPointerEnter={(event) => hoverSelect(item.key, event.pointerType)}
                      onPointerLeave={() => window.clearTimeout(hover.current)}
                      className="kw-venn-label"
                      style={
                        {
                          "--tx": pct(tall.x, TALL.w),
                          "--ty": pct(tall.y, TALL.h),
                          "--wx": pct(wide.x, WIDE.w),
                          "--wy": pct(wide.y, WIDE.h),
                          "--d": `${700 + i * 120}ms`,
                        } as CSSProperties
                      }
                    >
                      <span className="kw-venn-title">{item.title}</span>
                      <span className="kw-venn-sub">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* The chosen format: Roman's photo, his label and his description. */}
          <div className="kw-stack lg:col-span-5 lg:row-start-2">
            {ITEMS.map((item, i) => (
              <div
                key={item.key}
                role="tabpanel"
                id={`${baseId}-panel-${i}`}
                aria-labelledby={`${baseId}-tab-${i}`}
                data-on={i === active ? "" : undefined}
                className="kw-panel"
              >
                <div className="frame relative aspect-[16/10] rounded-[22px]">
                  <FormatPhoto item={item} />
                </div>
                <h3 className="mt-6 text-[24px] leading-[1.2] font-medium tracking-[-0.015em] text-white lg:text-[26px]">{item.title}</h3>
                <p className="mt-1.5 text-[14px] leading-snug text-sky">{item.label}</p>
                <p className="t-body mt-3 max-w-[480px]">{item.text}</p>
              </div>
            ))}
          </div>

          <ul role="list" className="flex flex-wrap gap-x-6 gap-y-2.5 text-[14px] leading-snug text-white/60 lg:col-span-7 lg:col-start-6 lg:row-start-3 lg:justify-center">
            {KW_FORMATS.notes.map((note) => (
              <li key={note} className="flex items-center gap-2.5">
                <span aria-hidden className="size-1 rounded-full bg-sky/80" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
