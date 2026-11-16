"use client";

import { useId, type CSSProperties } from "react";
import type { ProjectSlug } from "@/content/pages/use-cases";
import { cn } from "@/lib/utils";

/*
  The seven cover arts (2026-11-16). His site has no screenshots or links for these projects, so each poster carries a
  drawing that names its industry without a word, in the site's palette and line language: hairlines in ice, sky on
  what moves, a royal light behind. One 400 x 600 drawing per project, cropped to any poster (slice), its subject in
  the upper middle so the poster's text below never covers it.

  Loops are CSS only (opacity, strokes and the individual transform properties) and pause off screen: every poster is a
  `.uc-live` box (use-live.ts). Without script or with reduced motion each drawing stands still in a finished state.
*/

const r1 = (v: number) => Math.round(v * 10) / 10;
const vars = (v: Record<string, string | number>) => v as CSSProperties;

type ArtProps = { uid: string };

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false" className={cn("uc-art", className)}>
      {children}
    </svg>
  );
}

/** A soft light in the drawing (a radial gradient on a full rectangle). */
function Light({ id, x, y, r, color, opacity }: { id: string; x: number; y: number; r: number; color: string; opacity: number }) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx={x} cy={y} r={r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={color} stopOpacity={opacity} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill={`url(#${id})`} />
    </>
  );
}

/** A smooth line through points (Catmull-Rom as cubic curves). */
function smooth(points: [number, number][], tension = 0.18) {
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) * tension, p1[1] + (p2[1] - p0[1]) * tension];
    const c2 = [p2[0] - (p3[0] - p1[0]) * tension, p2[1] - (p3[1] - p1[1]) * tension];
    d += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

/* ---------- 01 Mega Screen: an LED wall, a ripple of light running through its pixels ---------- */

const LED = (() => {
  const cols = 12;
  const rows = 14;
  const pitch = 24;
  const size = 16;
  const x0 = 200 - (cols * pitch) / 2 + (pitch - size) / 2;
  const y0 = 262 - (rows * pitch) / 2 + (pitch - size) / 2;
  // The ripple starts at the wall's centre; the wall shows a soft picture of its own, lit from the upper left.
  const origin = { x: 200, y: 262 };
  const light = { x: 104, y: 126 };
  return Array.from({ length: cols * rows }, (_, i) => {
    const x = x0 + (i % cols) * pitch;
    const y = y0 + Math.floor(i / cols) * pitch;
    const d = Math.hypot(x + size / 2 - origin.x, y + size / 2 - origin.y);
    const glow = Math.max(0, 1 - Math.hypot(x + size / 2 - light.x, y + size / 2 - light.y) / 340);
    const base = 0.08 + 0.26 * glow * glow;
    // The still picture (no script, reduced motion): one ring of the ripple, frozen.
    const still = Math.abs(d - 104) < 13 ? 0.72 : base;
    return { x, y, size, delay: `${(d * 0.0062).toFixed(3)}s`, base: base.toFixed(3), still: still.toFixed(3) };
  });
})();

function MegaArt({ uid }: ArtProps) {
  return (
    <Frame className="uc-art-mega">
      <Light id={`${uid}-l`} x={200} y={262} r={280} color="#1a6fe0" opacity={0.5} />
      <rect x="46" y="84" width="308" height="356" rx="14" fill="#04102a" fillOpacity="0.35" stroke="#dcecff" strokeOpacity="0.2" />
      <g fill="#69bff8">
        {LED.map((p, i) => (
          <rect
            key={i}
            className="uc-led"
            x={p.x}
            y={p.y}
            width={p.size}
            height={p.size}
            rx="3"
            style={vars({ "--d": p.delay, "--b": p.base, "--s": p.still })}
          />
        ))}
      </g>
    </Frame>
  );
}

/* ---------- 02 WrapWerk Academy: glossy wrap film flowing over a curve, a sheen running along it ---------- */

const WRAP = "M -90 520 C 30 520, 110 380, 200 318 S 350 206, 490 166";
const BANDS = [-4, -3, -2, -1, 0, 1, 2, 3].map((k, i) => ({ dy: k * 38, opacity: [0.5, 0.3, 0.62, 0.36, 0.56, 0.3, 0.46, 0.26][i] }));

function WrapArt({ uid }: ArtProps) {
  return (
    <Frame className="uc-art-wrap">
      <Light id={`${uid}-l`} x={300} y={190} r={300} color="#1a6fe0" opacity={0.45} />
      <defs>
        <linearGradient id={`${uid}-band`} x1="0" y1="560" x2="400" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1a6fe0" />
          <stop offset="0.55" stopColor="#69bff8" />
          <stop offset="1" stopColor="#dcecff" />
        </linearGradient>
        <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* The film itself, as a mask: the gloss shows only on the bands. */}
        <mask id={`${uid}-film`}>
          {BANDS.map((band) => (
            <path key={band.dy} d={WRAP} transform={`translate(0 ${band.dy})`} fill="none" stroke="#ffffff" strokeWidth="26" />
          ))}
        </mask>
      </defs>
      {BANDS.map((band) => (
        <g key={band.dy} transform={`translate(0 ${band.dy})`}>
          <path d={WRAP} fill="none" stroke={`url(#${uid}-band)`} strokeOpacity={band.opacity} strokeWidth="26" />
          <path d={WRAP} transform="translate(0 -13)" fill="none" stroke="#dcecff" strokeOpacity="0.3" />
        </g>
      ))}
      {/* One soft gloss sweeps across the film, as light runs over a freshly wrapped surface. */}
      <g mask={`url(#${uid}-film)`}>
        <rect className="uc-gloss" x="-180" y="-100" width="180" height="800" fill={`url(#${uid}-gloss)`} transform="rotate(28 0 300)" />
      </g>
    </Frame>
  );
}

/* ---------- 03 LedBow Germany: a calm candlestick chart with its average line ---------- */

const CANDLES = (() => {
  const closes = [372, 360, 366, 344, 330, 338, 316, 300, 306, 284, 268, 276, 252, 236, 218];
  const reach = [10, 8, 12, 9, 11, 7, 10, 12, 8, 10, 9, 11, 10, 8, 12];
  const step = (334 - 66) / (closes.length - 1);
  return closes.map((close, i) => {
    const open = i === 0 ? 386 : closes[i - 1];
    const x = 66 + i * step;
    const top = Math.min(open, close);
    const bottom = Math.max(open, close);
    return { x: r1(x), up: close < open, top, height: Math.max(2, bottom - top), high: top - reach[i], low: bottom + reach[i] * 0.8, delay: `${(i * 0.05).toFixed(2)}s` };
  });
})();

const AVERAGE: [number, number][] = CANDLES.map((c, i, all) => {
  const window = all.slice(Math.max(0, i - 2), i + 1);
  const mean = window.reduce((sum, w) => sum + (w.up ? w.top : w.top + w.height), 0) / window.length;
  return [c.x, mean];
});

function LedbowArt({ uid }: ArtProps) {
  const last = AVERAGE[AVERAGE.length - 1];
  return (
    <Frame className="uc-art-ledbow">
      <Light id={`${uid}-l`} x={110} y={360} r={270} color="#1a6fe0" opacity={0.45} />
      <Light id={`${uid}-s`} x={330} y={220} r={150} color="#69bff8" opacity={0.16} />
      <g stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="2 6">
        {[180, 240, 300, 360, 420].map((y) => (
          <path key={y} d={`M40 ${y} H360`} />
        ))}
      </g>
      {CANDLES.map((c, i) => (
        <g key={i} className={cn("uc-candle", i === CANDLES.length - 1 && "uc-breathe")} style={vars({ "--d": c.delay })}>
          <path d={`M${c.x} ${c.high} V${c.low}`} stroke={c.up ? "#69bff8" : "#dcecff"} strokeOpacity={c.up ? 0.75 : 0.4} />
          <rect
            x={c.x - 4.5}
            y={c.top}
            width="9"
            height={c.height}
            rx="1.5"
            fill={c.up ? "#69bff8" : "none"}
            fillOpacity={c.up ? 0.22 : 0}
            stroke={c.up ? "#69bff8" : "#dcecff"}
            strokeOpacity={c.up ? 0.9 : 0.45}
            strokeWidth="1.2"
          />
        </g>
      ))}
      <path d={smooth(AVERAGE)} fill="none" stroke="#69bff8" strokeOpacity="0.16" strokeWidth="8" strokeLinecap="round" />
      <path d={smooth(AVERAGE)} pathLength={1} className="uc-draw" fill="none" stroke="#69bff8" strokeWidth="1.6" strokeLinecap="round" style={vars({ "--d": "0.5s" })} />
      <circle cx={last[0]} cy={last[1]} r="9" fill="none" stroke="#69bff8" className="uc-ping" style={vars({ "--d": "1.6s" })} />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#eaf6ff" />
    </Frame>
  );
}

/* ---------- 04 Cryptotransfer: two nodes, a value travelling between them on an arc ---------- */

const ARC = "M 104 396 C 104 266, 170 176, 296 176";

function CryptoArt({ uid }: ArtProps) {
  return (
    <Frame className="uc-art-crypto">
      <Light id={`${uid}-l`} x={104} y={396} r={250} color="#1a6fe0" opacity={0.5} />
      <Light id={`${uid}-s`} x={296} y={176} r={170} color="#69bff8" opacity={0.16} />
      <path d="M 104 396 C 226 396, 296 314, 296 176" fill="none" stroke="#ffffff" strokeOpacity="0.1" strokeDasharray="2 7" />
      <path d={ARC} fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeDasharray="2 7" />
      <path d={ARC} pathLength={1} className="uc-draw" fill="none" stroke="#69bff8" strokeOpacity="0.55" strokeWidth="1.3" />
      <path d={ARC} pathLength={1} className="uc-packet" fill="none" stroke="#69bff8" strokeOpacity="0.35" strokeWidth="10" strokeLinecap="round" />
      <path d={ARC} pathLength={1} className="uc-packet" fill="none" stroke="#eaf6ff" strokeWidth="2.4" strokeLinecap="round" />
      {[
        { x: 104, y: 396, core: "#69bff8", spin: "uc-spin" },
        { x: 296, y: 176, core: "#dcecff", spin: "uc-spin uc-spin-back" },
      ].map((node) => (
        <g key={node.x}>
          <circle cx={node.x} cy={node.y} r="48" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeDasharray="2 6" className={node.spin} />
          <circle cx={node.x} cy={node.y} r="28" fill="#071737" stroke="#dcecff" strokeOpacity="0.5" strokeWidth="1.2" />
          <circle cx={node.x} cy={node.y} r="15" fill="none" stroke={node.core} strokeOpacity="0.45" />
          <circle cx={node.x} cy={node.y} r="6.5" fill={node.core} />
        </g>
      ))}
      <circle cx="296" cy="176" r="28" fill="none" stroke="#69bff8" strokeWidth="1.4" className="uc-ping uc-ping-transfer" />
    </Frame>
  );
}

/* ---------- 05 Elysium Agency: a refined geometric mark, made of lines only ---------- */

const ELY = { x: 200, y: 264 };
const RAYS = Array.from({ length: 8 }, (_, k) => {
  const a = ((22.5 + k * 45) * Math.PI) / 180;
  return `M${r1(ELY.x + 72 * Math.cos(a))} ${r1(ELY.y + 72 * Math.sin(a))} L${r1(ELY.x + 100 * Math.cos(a))} ${r1(ELY.y + 100 * Math.sin(a))}`;
});

function ElysiumArt({ uid }: ArtProps) {
  const half = r1(72 * Math.SQRT1_2);
  return (
    <Frame className="uc-art-elysium">
      <Light id={`${uid}-l`} x={ELY.x} y={ELY.y} r={250} color="#1a6fe0" opacity={0.48} />
      <circle cx={ELY.x} cy={ELY.y} r="121" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="7" strokeDasharray="1 9.56" />
      <circle cx={ELY.x} cy={ELY.y} r="134" pathLength={1} className="uc-draw" fill="none" stroke="#dcecff" strokeOpacity="0.3" style={vars({ "--d": "0s" })} />
      <path
        d={`M${ELY.x} ${ELY.y - 134} L${ELY.x + 134} ${ELY.y} L${ELY.x} ${ELY.y + 134} L${ELY.x - 134} ${ELY.y} Z`}
        pathLength={1}
        className="uc-draw"
        fill="none"
        stroke="#dcecff"
        strokeOpacity="0.5"
        style={vars({ "--d": "0.2s" })}
      />
      <rect
        x={ELY.x - half}
        y={ELY.y - half}
        width={half * 2}
        height={half * 2}
        pathLength={1}
        className="uc-draw"
        fill="none"
        stroke="#dcecff"
        strokeOpacity="0.3"
        style={vars({ "--d": "0.45s" })}
      />
      <circle cx={ELY.x} cy={ELY.y} r="72" pathLength={1} className="uc-draw" fill="none" stroke="#69bff8" strokeOpacity="0.8" strokeWidth="1.3" style={vars({ "--d": "0.35s" })} />
      <g stroke="#dcecff" strokeOpacity="0.36">
        {RAYS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx={ELY.x} cy={ELY.y} r="22" fill="none" stroke="#dcecff" strokeOpacity="0.36" />
      <circle cx={ELY.x} cy={ELY.y} r="3.2" fill="#69bff8" />
      <circle cx={ELY.x} cy={ELY.y} r="134" pathLength={1} className="uc-orbit" fill="none" stroke="#69bff8" strokeOpacity="0.35" strokeWidth="9" strokeLinecap="round" />
      <circle cx={ELY.x} cy={ELY.y} r="134" pathLength={1} className="uc-orbit" fill="none" stroke="#eaf6ff" strokeWidth="2" strokeLinecap="round" />
    </Frame>
  );
}

/* ---------- 06 K&M Electronics: a chip and its traces, signals running in ---------- */

const TRACES = [
  { d: "M 138 76 L 138 140 L 168 170 L 168 204" },
  { d: "M 200 60 L 200 204", pulse: "0s" },
  { d: "M 352 146 L 262 146 L 232 176 L 232 204" },
  { d: "M 364 214 L 334 214 L 302 246 L 258 246", pulse: "1.4s" },
  { d: "M 372 278 L 258 278" },
  { d: "M 154 446 L 154 382 L 184 352 L 184 320" },
  { d: "M 306 396 L 250 396 L 216 362 L 216 320", pulse: "2.8s" },
  { d: "M 36 222 L 64 222 L 88 246 L 142 246" },
  { d: "M 74 372 L 74 304 L 100 278 L 142 278" },
];
const PINS = [-32, -16, 0, 16, 32].flatMap((o) => [
  `M${200 + o} 214 V204`,
  `M${200 + o} 310 V320`,
  `M152 ${262 + o} H142`,
  `M248 ${262 + o} H258`,
]);
const via = (d: string) => d.split(" ").slice(1, 3).map(Number) as [number, number];

function KmArt({ uid }: ArtProps) {
  return (
    <Frame className="uc-art-km">
      <defs>
        <pattern id={`${uid}-dots`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.9" fill="#ffffff" fillOpacity="0.09" />
        </pattern>
      </defs>
      <Light id={`${uid}-l`} x={200} y={262} r={260} color="#1a6fe0" opacity={0.42} />
      <rect width="400" height="600" fill={`url(#${uid}-dots)`} />
      <g fill="none" stroke="#dcecff" strokeOpacity="0.34" strokeWidth="1.2" strokeLinejoin="round">
        {TRACES.map((t) => (
          <path key={t.d} d={t.d} />
        ))}
        {PINS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {TRACES.filter((t) => t.pulse).map((t) => (
        <g key={t.d} style={vars({ "--d": t.pulse as string })}>
          <path d={t.d} pathLength={1} className="uc-pulse" fill="none" stroke="#69bff8" strokeOpacity="0.35" strokeWidth="8" strokeLinecap="round" />
          <path d={t.d} pathLength={1} className="uc-pulse" fill="none" stroke="#eaf6ff" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      {TRACES.map((t) => {
        const [x, y] = via(t.d);
        return <circle key={t.d} cx={x} cy={y} r="4.5" fill="#071737" stroke="#dcecff" strokeOpacity="0.55" strokeWidth="1.2" />;
      })}
      <rect x="152" y="214" width="96" height="96" rx="10" fill="#08193d" stroke="#dcecff" strokeOpacity="0.55" strokeWidth="1.2" />
      <rect x="164" y="226" width="72" height="72" rx="6" fill="none" stroke="#ffffff" strokeOpacity="0.1" />
      <rect x="186" y="248" width="28" height="28" rx="4" fill="#69bff8" fillOpacity="0.1" stroke="#69bff8" strokeOpacity="0.75" className="uc-die" />
    </Frame>
  );
}

/* ---------- 07 Martin Wildt: a skyline in fine lines, its windows lighting one by one ---------- */

const HORIZON = 410;
type Tower = { x: number; w: number; h: number; step?: number; spire?: number; windows?: number };
const TOWERS: Tower[] = [
  { x: 28, w: 36, h: 96 },
  { x: 66, w: 46, h: 158, step: 26, windows: 3 },
  { x: 114, w: 32, h: 118 },
  { x: 148, w: 54, h: 226, step: 18, spire: 40, windows: 4 },
  { x: 204, w: 40, h: 176, windows: 3 },
  { x: 246, w: 48, h: 134, step: 22 },
  { x: 296, w: 34, h: 196, windows: 2 },
  { x: 332, w: 40, h: 104 },
];

function towerPath(t: Tower) {
  const top = HORIZON - t.h;
  if (!t.step) return `M${t.x} ${HORIZON} V${top} H${t.x + t.w} V${HORIZON}`;
  const inset = Math.round(t.w * 0.2);
  const shoulder = top + t.step;
  const crown = t.spire ? ` M${t.x + t.w / 2} ${top} V${top - t.spire}` : "";
  return `M${t.x} ${HORIZON} V${shoulder} H${t.x + inset} V${top} H${t.x + t.w - inset} V${shoulder} H${t.x + t.w} V${HORIZON}${crown}`;
}

const WINDOWS = TOWERS.flatMap((t, ti) => {
  const cols = t.windows ?? 0;
  if (!cols) return [];
  const top = HORIZON - t.h + (t.step ?? 0) + 16;
  const gap = t.w / (cols + 1);
  const rows = Math.floor((HORIZON - 14 - top) / 18);
  return Array.from({ length: rows * cols }, (_, i) => ({
    key: `${ti}-${i}`,
    x: r1(t.x + gap * ((i % cols) + 1) - 2),
    y: top + Math.floor(i / cols) * 18,
  }));
});
// The windows that light up, one after another (every seventh, so they spread over the towers).
const LIT = WINDOWS.filter((_, i) => i % 7 === 3).map((w, i) => ({ ...w, delay: `${(i * 0.9).toFixed(1)}s` }));

function WildtArt({ uid }: ArtProps) {
  return (
    <Frame className="uc-art-wildt">
      <Light id={`${uid}-l`} x={210} y={330} r={260} color="#1a6fe0" opacity={0.46} />
      <defs>
        <radialGradient id={`${uid}-h`}>
          <stop offset="0" stopColor="#69bff8" stopOpacity="0.3" />
          <stop offset="1" stopColor="#69bff8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-fade`} x1="0" y1={HORIZON} x2="0" y2={HORIZON + 120} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${uid}-m`}>
          <rect x="0" y={HORIZON} width="400" height="140" fill={`url(#${uid}-fade)`} />
        </mask>
      </defs>
      <ellipse cx="200" cy={HORIZON} rx="230" ry="38" fill={`url(#${uid}-h)`} />
      {/* The reflection: the same skyline, mirrored on the horizon, fading downwards. */}
      <g mask={`url(#${uid}-m)`}>
        <g transform={`translate(0 ${HORIZON * 2}) scale(1 -1)`} fill="none" stroke="#dcecff" strokeOpacity="0.4">
          {TOWERS.map((t) => (
            <path key={t.x} d={towerPath(t)} />
          ))}
        </g>
      </g>
      <g fill="#0a1d44" fillOpacity="0.55" stroke="#dcecff" strokeOpacity="0.55" strokeWidth="1.2" strokeLinejoin="round">
        {TOWERS.map((t, i) => (
          <path key={t.x} d={towerPath(t)} pathLength={1} className="uc-draw" style={vars({ "--d": `${(i * 0.08).toFixed(2)}s` })} />
        ))}
      </g>
      <g fill="#dcecff" fillOpacity="0.13">
        {WINDOWS.map((w) => (
          <rect key={w.key} x={w.x} y={w.y} width="4" height="7" rx="0.6" />
        ))}
      </g>
      <g fill="#69bff8">
        {LIT.map((w) => (
          <rect key={w.key} x={w.x} y={w.y} width="4" height="7" rx="0.6" className="uc-window" style={vars({ "--d": w.delay })} />
        ))}
      </g>
      <path d={`M16 ${HORIZON} H384`} stroke="#dcecff" strokeOpacity="0.4" />
    </Frame>
  );
}

const ARTS: Record<ProjectSlug, (props: ArtProps) => React.ReactElement> = {
  "mega-screen": MegaArt,
  wrapwerk: WrapArt,
  ledbow: LedbowArt,
  cryptotransfer: CryptoArt,
  elysium: ElysiumArt,
  "km-electronics": KmArt,
  "martin-wildt": WildtArt,
};

/** The cover art for a project. Several may be on the page at once (poster and case view), so its ids are unique. */
export function CoverArt({ slug }: { slug: ProjectSlug }) {
  const uid = `uc${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const Art = ARTS[slug];
  return <Art uid={uid} />;
}
