"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

/*
  v11 round 4: the Versprechen card's drawings. The client (Loom of 2026-11-12, 1:33): "here is cool, great idea ...
  the idea with the scrolling and the text overall is cool, but we need an other effect. This is too less". The card
  kept its figure and lost its plain grid; under each figure a small line drawing now shows what the figure says,
  and it draws with the scroll (or on arrival, where the section does not pin):

  - "3–6 Monate" (bis zu ersten messbaren Ergebnissen): a six-month line; months three to six light up and a result
    line rises out of month three.
  - "40–70 %" (weniger manuelle Aufwände): six bars of manual work, each falling by 40 to 70 percent; what is saved
    stays as a dashed outline.
  - "100 %" (Befähigung Ihrer Teams): a team of eighteen, every one of them lit by the end.
  - "Nachhaltig" (Prozesse, die bleiben und skalieren): a curve that keeps rising, its points settling on it.

  Each drawing is a pure function of `draw` (0 to 1). No words, no invented numbers: the figure above says it.
  Brand colours only: off-white #f1f1ee and Sky #69bff8 on the card's navy.
*/

const INK = "#f1f1ee";
const SKY = "#69bff8";
const W = 320;
const H = 200;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - (1 - t) ** 3;
/** The share of `draw` between a and b, eased. */
const span = (draw: number, a: number, b: number) => ease(clamp01((draw - a) / (b - a)));

export function PromiseArt({ index, draw }: { index: number; draw: MotionValue<number> }) {
  return (
    <svg aria-hidden viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" fill="none" className="block h-full w-full overflow-visible">
      {index === 0 && <Months draw={draw} />}
      {index === 1 && <Effort draw={draw} />}
      {index === 2 && <Team draw={draw} />}
      {index === 3 && <Rising draw={draw} />}
    </svg>
  );
}

/* ---------- 3–6 Monate ---------- */

const BASE_Y = 188;
const monthX = (m: number) => 12 + (m * (W - 24)) / 6;
// The result line: flat until month three, then rising to the right edge.
const RISE = 150;
const RESULT = `M ${monthX(3)} ${BASE_Y} C ${monthX(4)} ${BASE_Y - 12}, ${monthX(4.6)} ${BASE_Y - 76}, ${monthX(6)} ${BASE_Y - RISE}`;

function Months({ draw }: { draw: MotionValue<number> }) {
  const base = useTransform(() => span(draw.get(), 0, 0.45));
  const band = useTransform(() => span(draw.get(), 0.35, 0.7));
  const result = useTransform(() => span(draw.get(), 0.55, 1));
  const head = useTransform(() => (draw.get() > 0.97 ? 1 : 0));
  const glow = useTransform(() => 0.1 * band.get());
  return (
    <g>
      {/* months three to six, lit */}
      <motion.rect x={monthX(3)} y={BASE_Y - 176} width={monthX(6) - monthX(3)} height={176} rx={8} fill={SKY} style={{ opacity: glow }} />
      <motion.line x1={monthX(0)} y1={BASE_Y} x2={monthX(6)} y2={BASE_Y} stroke={INK} strokeOpacity={0.35} strokeWidth={1.25} style={{ pathLength: base }} />
      {Array.from({ length: 7 }, (_, m) => (
        <Tick key={m} m={m} base={base} band={band} />
      ))}
      <motion.path d={RESULT} stroke={SKY} strokeWidth={2} strokeLinecap="round" style={{ pathLength: result }} />
      <motion.circle cx={monthX(6)} cy={BASE_Y - RISE} r={5} fill={SKY} style={{ opacity: head }} />
    </g>
  );
}

function Tick({ m, base, band }: { m: number; base: MotionValue<number>; band: MotionValue<number> }) {
  const lit = m >= 3;
  const shown = useTransform(() => (base.get() * 6 >= m - 0.01 ? 1 : 0));
  const color = useTransform(() => (lit && band.get() > 0.5 ? SKY : INK));
  const opacity = useTransform(() => shown.get() * (lit ? 0.5 + 0.5 * band.get() : 0.45));
  return (
    <motion.circle
      cx={monthX(m)}
      cy={BASE_Y}
      r={lit ? 4 : 3}
      style={{ opacity, fill: color }}
    />
  );
}

/* ---------- 40–70 % ---------- */

// Six weeks of manual work; each falls by 40 to 70 percent (the remaining share of the full height).
const REMAIN = [0.45, 0.6, 0.35, 0.5, 0.3, 0.4];
const BAR_W = 34;
const BAR_GAP = (W - 24 - REMAIN.length * BAR_W) / (REMAIN.length - 1);
const BAR_H = 176;

function Effort({ draw }: { draw: MotionValue<number> }) {
  return (
    <g>
      <line x1={8} y1={BASE_Y + 0.5} x2={W - 8} y2={BASE_Y + 0.5} stroke={INK} strokeOpacity={0.25} strokeWidth={1} />
      {REMAIN.map((remain, i) => (
        <Bar key={i} i={i} remain={remain} draw={draw} />
      ))}
    </g>
  );
}

function Bar({ i, remain, draw }: { i: number; remain: number; draw: MotionValue<number> }) {
  const x = 12 + i * (BAR_W + BAR_GAP);
  // Each bar rises to full, then falls to what is left, one after the other.
  const rise = useTransform(() => span(draw.get(), 0, 0.35));
  const fall = useTransform(() => span(draw.get(), 0.35 + i * 0.07, 0.65 + i * 0.07));
  const scale = useTransform(() => rise.get() * (1 - (1 - remain) * fall.get()));
  const outline = useTransform(() => 0.55 * fall.get());
  return (
    <g>
      <motion.rect
        x={x + 0.5}
        y={BASE_Y - BAR_H + 0.5}
        width={BAR_W - 1}
        height={BAR_H - 1}
        rx={6}
        stroke={INK}
        strokeWidth={1}
        strokeDasharray="3 4"
        style={{ opacity: outline }}
      />
      <motion.rect
        x={x}
        y={BASE_Y - BAR_H}
        width={BAR_W}
        height={BAR_H}
        rx={6}
        fill={SKY}
        fillOpacity={0.85}
        style={{ scaleY: scale, originX: 0.5, originY: 1 }}
      />
    </g>
  );
}

/* ---------- 100 % ---------- */

const COLS = 6;
const ROWS = 3;
const PERSON_STEP = (W - 64) / (COLS - 1);

function Team({ draw }: { draw: MotionValue<number> }) {
  return (
    <g>
      {Array.from({ length: COLS * ROWS }, (_, i) => (
        <Person key={i} i={i} draw={draw} />
      ))}
    </g>
  );
}

function Person({ i, draw }: { i: number; draw: MotionValue<number> }) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x = 32 + col * PERSON_STEP;
  const y = 40 + row * 62;
  // Lit in order from the left, the second row a beat behind the first; all lit by the end.
  const order = col + row * 0.6;
  const lit = useTransform(() => span(draw.get(), 0.05 + order * 0.1, 0.22 + order * 0.1));
  const stroke = useTransform(() => (lit.get() > 0.5 ? SKY : INK));
  const opacity = useTransform(() => 0.3 + 0.7 * lit.get());
  const fill = useTransform(() => 0.35 * lit.get());
  return (
    <motion.g style={{ opacity }}>
      <motion.circle cx={x} cy={y - 14} r={11} strokeWidth={1.5} style={{ stroke, fill: SKY, fillOpacity: fill }} />
      <motion.path d={`M ${x - 21} ${y + 26} C ${x - 21} ${y + 5}, ${x + 21} ${y + 5}, ${x + 21} ${y + 26}`} strokeWidth={1.5} strokeLinecap="round" style={{ stroke }} />
    </motion.g>
  );
}

/* ---------- Nachhaltig ---------- */

const POINTS: [number, number][] = [
  [12, 176],
  [76, 158],
  [140, 132],
  [204, 98],
  [258, 62],
  [308, 22],
];
const CURVE = POINTS.reduce((d, [x, y], i) => {
  if (i === 0) return `M ${x} ${y}`;
  const [px, py] = POINTS[i - 1];
  const mx = (px + x) / 2;
  return `${d} C ${mx} ${py}, ${mx} ${y}, ${x} ${y}`;
}, "");
const AREA = `${CURVE} L ${POINTS[POINTS.length - 1][0]} ${BASE_Y + 4} L ${POINTS[0][0]} ${BASE_Y + 4} Z`;

function Rising({ draw }: { draw: MotionValue<number> }) {
  const line = useTransform(() => span(draw.get(), 0.05, 0.85));
  const area = useTransform(() => 0.16 * span(draw.get(), 0.4, 1));
  return (
    <g>
      {[50, 100, 150].map((y) => (
        <line key={y} x1={8} y1={y} x2={W - 8} y2={y} stroke={INK} strokeOpacity={0.1} strokeWidth={1} />
      ))}
      <motion.path d={AREA} fill="url(#v11-rise)" style={{ opacity: area }} />
      <defs>
        <linearGradient id="v11-rise" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SKY} stopOpacity={1} />
          <stop offset="100%" stopColor={SKY} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path d={CURVE} stroke={SKY} strokeWidth={2} strokeLinecap="round" style={{ pathLength: line }} />
      {POINTS.map(([x, y], i) => (
        <Point key={x} x={x} y={y} at={0.05 + (0.8 * i) / (POINTS.length - 1)} draw={draw} />
      ))}
    </g>
  );
}

function Point({ x, y, at, draw }: { x: number; y: number; at: number; draw: MotionValue<number> }) {
  const on = useTransform(() => span(draw.get(), at - 0.02, at + 0.08));
  return <motion.circle cx={x} cy={y} r={5} fill={SKY} stroke="#0a1a3a" strokeWidth={2} style={{ opacity: on, scale: on }} />;
}
