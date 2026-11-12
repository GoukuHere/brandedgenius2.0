import { Check as CheckIcon, type LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

/*
  The parts the four v11 service drawings share (2026-11-13). Each drawing is a small product interface on a stage of
  fixed logical size (1280 x 480 on desktop, a narrower and taller one on phones), scaled as a whole to its box, so
  every coordinate below is in stage pixels. Interface panels are HTML (real text in the page face, lucide glyphs);
  wires, lights and the waveform are one SVG layer under them.

  Colour: off-white ink, Sky only for what is active or moving, Royal for the visitor's own chat bubbles, navy panels
  with a 1px rim on the plate's navy.
*/

export const INK = "#f1f1ee";
export const SKY = "#69bff8";
export const ROYAL = "#004BA0";
export const NAVY = "#06142f";

export const ink = (a: number) => `rgb(241 241 238 / ${a.toFixed(3)})`;
export const sky = (a: number) => `rgb(105 191 248 / ${a.toFixed(3)})`;
/** Off-white at 0, Sky at 1. */
export const tint = (p: number) => {
  const q = clamp01(p);
  const c = (a: number, b: number) => Math.round(a + (b - a) * q);
  return `rgb(${c(241, 105)} ${c(241, 191)} ${c(238, 248)})`;
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 before a, 1 after b, linear between. */
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (p: number) => 1 - (1 - p) ** 3;
export const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
/** Eased 0 to 1 between a and b. */
export const rise = (t: number, a: number, b: number) => easeOut(prog(t, a, b));
/** A light that flashes at `at` and settles to `rest`. */
export const flash = (t: number, at: number, rest = 0.45) => rise(t, at, at + 0.3) * (rest + (1 - rest) * (1 - rise(t, at + 0.5, at + 1.5)));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** A stable pseudo-random number in [0, 1) for an integer. */
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export type Comp = {
  /** Stage size in stage pixels. */
  w: number;
  h: number;
  draw: (t: number) => ReactNode;
};

export type Scene = {
  /** One story in seconds, ending in a soft reset. */
  loop: number;
  /** The frame shown while the drawing is not playing (plates behind, reduced motion). Playing resumes from it. */
  still: number;
  wide: Comp;
  phone: Comp;
};

const PANEL_BG = `linear-gradient(180deg, rgb(255 255 255 / 0.075), rgb(255 255 255 / 0.03)), #0a1d44`;
const RIM = `inset 0 0 0 1px ${ink(0.13)}, inset 0 1px 0 ${ink(0.1)}`;
const LIT = `inset 0 0 0 1px ${sky(0.8)}, 0 0 30px -10px ${sky(0.6)}`;

export type Box = { x: number; y: number; w: number; h: number };

/** An interface panel: opaque navy with a 1px rim; `lit` (0 to 1) brings up a sky rim. */
export function Panel({
  x,
  y,
  w,
  h,
  r = 16,
  lit = 0,
  children,
  style,
}: Box & { r?: number; lit?: number; children?: ReactNode; style?: CSSProperties }) {
  return (
    <div className="absolute" style={{ left: x, top: y, width: w, height: h, borderRadius: r, background: PANEL_BG, boxShadow: RIM, ...style }}>
      {children}
      {lit > 0.01 ? (
        <div className="pointer-events-none absolute inset-0" style={{ borderRadius: r, boxShadow: LIT, opacity: Math.min(1, lit) }} />
      ) : null}
    </div>
  );
}

/** A lucide glyph at a 1.5px stroke. The plate screens its drawings; the glyphs opt out so their colours stay true. */
export function Glyph({ icon: Icon, size, color = INK, style }: { icon: LucideIcon; size: number; color?: string; style?: CSSProperties }) {
  return (
    <Icon
      aria-hidden
      size={size}
      color={color}
      strokeWidth={1.5}
      absoluteStrokeWidth
      style={{ display: "block", flexShrink: 0, mixBlendMode: "normal", ...style }}
    />
  );
}

/** A square well for a node's glyph: quiet in off-white, sky while lit. */
export function Well({ icon, size, glyph, lit = 0, r = 12 }: { icon: LucideIcon; size: number; glyph: number; lit?: number; r?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: lit > 0.01 ? sky(0.06 + 0.12 * lit) : ink(0.06),
        boxShadow: `inset 0 0 0 1px ${lit > 0.01 ? sky(0.15 + 0.35 * lit) : ink(0.12)}`,
      }}
    >
      <Glyph icon={icon} size={glyph} color={tint(lit)} />
    </div>
  );
}

/** The bG mark (public/brand/mark.svg, 721 x 454). */
export function Mark({ h, style }: { h: number; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a small static vector mark; next/image adds nothing
    <img src="/brand/mark.svg" alt="" draggable={false} width={Math.round((h * 721) / 454)} height={h} style={{ display: "block", height: h, width: "auto", ...style }} />
  );
}

/** A small sky disc with a check, scaling in with `on` (0 to 1). Positioned by its centre. */
export function CheckBadge({ cx, cy, d, on, glyph }: { cx: number; cy: number; d: number; on: number; glyph?: number }) {
  if (on <= 0.01) return null;
  return (
    <div
      className="absolute grid place-items-center rounded-full"
      style={{
        left: cx - d / 2,
        top: cy - d / 2,
        width: d,
        height: d,
        background: SKY,
        boxShadow: `0 0 0 3px ${NAVY}`,
        opacity: on,
        transform: `scale(${0.55 + 0.45 * on})`,
      }}
    >
      <Glyph icon={CheckIcon} size={glyph ?? Math.round(d * 0.62)} color={NAVY} style={{ strokeWidth: 2 }} />
    </div>
  );
}

/** Keeps hyphenated compounds (KI-Potenzialanalyse) whole, so a line never breaks after "KI-". */
export function keepCompounds(text: string): ReactNode {
  return text.split(/(\s+)/).map((part, i) =>
    part.includes("-") && part.trim() ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    )
  );
}

/** HTML text placed by an anchor point (vertically centred on y). */
export function Text({
  x,
  y,
  size,
  children,
  align = "start",
  color = ink(0.6),
  style,
}: {
  x: number;
  y: number;
  size: number;
  children: ReactNode;
  align?: "start" | "middle" | "end";
  color?: string;
  style?: CSSProperties;
}) {
  const shift = align === "middle" ? "-50%" : align === "end" ? "-100%" : "0";
  return (
    <span
      className="absolute leading-none whitespace-nowrap"
      style={{ left: x, top: y, fontSize: size, color, transform: `translate(${shift}, -50%)`, ...style }}
    >
      {children}
    </span>
  );
}

/** The SVG layer under the panels, in stage pixels. */
export function Lines({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  return (
    <svg
      aria-hidden
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="absolute top-0 left-0 overflow-visible"
      style={{ mixBlendMode: "normal" }}
    >
      {children}
    </svg>
  );
}

/** A wire: a quiet hairline, and over it the sky of a finished run (`done`, 0 to 1). */
export function Wire({ d, done = 0, width = 1.25 }: { d: string; done?: number; width?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={ink(0.2)} strokeWidth={width} strokeLinecap="round" />
      {done > 0.01 ? <path d={d} fill="none" stroke={SKY} strokeOpacity={0.6 * done} strokeWidth={width} strokeLinecap="round" /> : null}
    </>
  );
}

/**
 * A soft light travelling a path: a bright head over a faint tail. `p` runs from 0 (the head at the start) to 1 (at
 * the end) and a little past, so the tail leaves too. The path is measured as 1.
 */
export function Comet({ d, p, width = 2 }: { d: string; p: number; width?: number }) {
  if (p <= 0 || p >= 1.3) return null;
  const head = 0.08;
  const tail = 0.3;
  return (
    <g fill="none" stroke={SKY} strokeLinecap="round">
      <path d={d} pathLength={1} strokeOpacity={0.3} strokeWidth={width} strokeDasharray={`${tail} 3`} strokeDashoffset={tail - p} />
      <path d={d} pathLength={1} strokeWidth={width * 1.25} strokeDasharray={`${head} 3`} strokeDashoffset={head - p} />
    </g>
  );
}

/** A port on a node's edge: a small ring that fills sky once a run has passed it. */
export function Port({ cx, cy, on = 0, r = 4.5 }: { cx: number; cy: number; on?: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill={on > 0.01 ? sky(0.25 + 0.75 * on) : NAVY} stroke={on > 0.01 ? SKY : ink(0.38)} strokeWidth={1.25} />;
}

/** The faint dot grid behind a drawing, fading out towards its edges. */
export function DotGrid({ gap = 32 }: { gap?: number }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle at center, ${ink(0.1)} 1px, transparent 1.5px)`,
        backgroundSize: `${gap}px ${gap}px`,
        backgroundPosition: `${gap / 2}px ${gap / 2}px`,
        maskImage: "radial-gradient(ellipse 70% 75% at 50% 50%, #000 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 75% at 50% 50%, #000 40%, transparent 100%)",
      }}
    />
  );
}

