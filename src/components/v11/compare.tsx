"use client";

import { Check, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { COMPARE } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  v11 Vorher / Nachher, "Zwei Wege" (the developer: "too much text, need new stunning layout", then of the two
  tiles: "simple cards sucks"). No cards, no panel, no slider and no morphing text (both turned down before): the
  client's own line "Zwei Wege. Zwei Ergebnisse." becomes the picture. One drawing across the width, both ways
  leaving one start point:
  - the classic way, a thin grey dashed line that runs into loops, tangles and breaks off with an X, its result
    ("Viel Aufwand. Wenig Wirkung. Kein Fortschritt.") above the break on desktop (round 5: the mirror of the sky
    way's result), under the knot on phones;
  - the Branded Genius way, one clean sky line through five points, each labelled with one of its steps, ending at
    its result ("Klare Strategie. Messbare Ergebnisse. Nachhaltiges Wachstum.").
  The classic way's five points and the "VS" are cut (the knot says it; they stay for screen readers).

  Motion: when the drawing comes into view both ways draw from the start; the grey one loses itself in the loops
  and snaps off, the sky one lights its points in turn and arrives. From then on, while it is on screen, a light
  keeps running: on the grey way it circles into the knot and dies out, on the sky way it runs to the end and each
  point pings as it passes. SVG strokes only, paused off screen. Reduced motion: drawn at once, no lights.

  Phones and tablets: the ways run downwards; the grey one curls into its knot to the right of the start, the sky
  one runs down the left through its points to its result.
*/

type Pt = [number, number];
type Label = { x: number; y: number; ax?: "start" | "middle" | "end"; ay?: "top" | "middle" | "bottom"; w?: number };

type Layout = {
  w: number;
  h: number;
  start: Pt;
  knot: Pt[];
  way: string;
  nodes: Pt[];
  end: Pt;
  along: "x" | "y";
  classicTitle: Label;
  classicResult: Label;
  oursTitle: Label;
  oursResult: Label;
  points: Label[];
};

/*
  Desktop, round 5 (Roman, 2026-11-18: the bottom line is good; the classic way should match it, "maybe in the same
  line ... it's not like looking equal"). The two ways now mirror each other around the shared start point: the
  classic way rises as far (112) as the Branded Genius way falls, runs to the same end x and breaks off there with its
  X; each way's name sits 22 above its own line at the same x (200), and each result sits 22 above its line,
  right-aligned to the end (1170), with its mark. The tangle keeps clear of the two labels above it: it only leaves
  its line upwards (to 52) between them.
*/
const START_Y = 174;
const TOP_Y = START_Y - 112;
const BOT_Y = START_Y + 112;
const GAP = 22;
const DESK: Layout = {
  w: 1200,
  h: 352,
  start: [24, START_Y],
  // A scribble, not a pattern: it climbs to its line, then loops of different sizes (two running back over it), a
  // zigzag, one wide loop and a messy tail to the break.
  knot: [
    [24, 174], [60, 172], [92, 160], [116, 130], [140, 92], [164, 68], [200, 62], [250, 64], [290, 80], [312, 112],
    [296, 138], [262, 134], [250, 106], [276, 82], [320, 70], [370, 64], [410, 74], [430, 100], [414, 122], [388, 116],
    [384, 92], [408, 72], [452, 62], [490, 70], [516, 56], [540, 80], [566, 52], [592, 82], [618, 58], [646, 72],
    [690, 64], [730, 84], [748, 120], [726, 150], [690, 144], [680, 112], [706, 86], [752, 70], [800, 64], [850, 70],
    [880, 92], [902, 74], [930, 96], [956, 72], [990, 84], [1030, 66], [1070, 72], [1110, 60], [1140, 66], [1170, 62],
  ],
  way: `M24 ${START_Y} C84 ${START_Y} 100 ${BOT_Y} 180 ${BOT_Y} L1170 ${BOT_Y}`,
  nodes: [300, 490, 680, 870, 1060].map((x) => [x, BOT_Y] as Pt),
  end: [1170, BOT_Y],
  along: "x",
  classicTitle: { x: 200, y: TOP_Y - GAP, ay: "bottom" },
  classicResult: { x: 1170, y: TOP_Y - GAP, ax: "end", ay: "bottom" },
  oursTitle: { x: 200, y: BOT_Y - GAP, ay: "bottom" },
  oursResult: { x: 1170, y: BOT_Y - GAP, ax: "end", ay: "bottom" },
  points: [300, 490, 680, 870, 1060].map((x) => ({ x, y: BOT_Y + 20, ax: "middle" as const, w: 172 })),
};

const PHONE: Layout = {
  w: 340,
  h: 786,
  start: [10, 64],
  knot: [
    [10, 64], [40, 66], [74, 80], [96, 106], [90, 134], [66, 128], [72, 100], [108, 86], [150, 92], [172, 122],
    [160, 156], [124, 158], [112, 128], [140, 100], [188, 84], [222, 96], [230, 122], [208, 134], [198, 110], [226, 88],
    [262, 92], [278, 114], [292, 86], [306, 110], [322, 98],
  ],
  way: "M10 64 L10 748",
  nodes: [
    [10, 336],
    [10, 416],
    [10, 496],
    [10, 576],
    [10, 656],
  ],
  end: [10, 748],
  along: "y",
  classicTitle: { x: 0, y: 0 },
  classicResult: { x: 34, y: 186, w: 290 },
  oursTitle: { x: 34, y: 268, ay: "middle" },
  oursResult: { x: 34, y: 748, ay: "middle", w: 296 },
  points: [336, 416, 496, 576, 656].map((y) => ({ x: 34, y, ay: "middle" as const, w: 296 })),
};

const EASE = [0.16, 1, 0.3, 1] as const;
const WAY_DRAW = 2.2; // s, eased out (fast, then settling)
const KNOT_DRAW = 3; // s
const PERIOD = 3.8; // s, one run of the light along the sky way (it runs for RUN of it, then rests)
const RUN = 0.72;
const DASH = 0.12; // the light's length, as a share of the way
const KNOT_PERIOD = 5;

const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
/** When the eased draw reaches a share of the way. */
const drawTime = (share: number) => WAY_DRAW * (1 - Math.sqrt(Math.max(0, 1 - share)));
/** When the running light's head reaches a share of the way, within one period. */
const lightTime = (share: number) => (share * RUN * PERIOD) / (1 + DASH);

/** A smooth line through the points (Catmull-Rom, as cubic Béziers). */
function smooth(points: Pt[]) {
  const r = (v: number) => Math.round(v * 10) / 10;
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    d += ` C${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)} ${r(p2[0] - (p3[0] - p1[0]) / 6)} ${r(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function CompareSection() {
  return (
    // Where the Versprechen below pins (its stage centres the card in the screen), v1's smaller foot keeps v1's gap.
    <Section id="unterschied" className="lg:[@media(min-height:720px)]:pb-12">
      <Container>
        {/* Round 4 ("not every time left, left, left, the header"): centred from md up, above the two ways. */}
        <div className="max-w-[920px] md:mx-auto md:text-center">
          <Heading title={COMPARE.title} accent={COMPARE.accent} className="text-balance" />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[600px] md:mx-auto">
            {COMPARE.text}
          </p>
        </div>

        <div className="mt-12 md:mt-16">
          <div className="hidden lg:block">
            <Ways layout={DESK} />
          </div>
          <div className="max-w-[440px] md:mx-auto lg:hidden">
            <Ways layout={PHONE} />
          </div>
        </div>

        <div className="sr-only">
          {[COMPARE.classic, COMPARE.ours].map((way) => (
            <div key={way.title}>
              <h3>{way.title}</h3>
              <ul>
                {way.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p>{way.result}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Ways({ layout }: { layout: Layout }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const measure = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [live, setLive] = useState(false);
  const [lit, setLit] = useState(false);
  // Each point's share of the way (measured on the drawn path; until then, from its position).
  const [shares, setShares] = useState<number[]>(() => layout.nodes.map(([x, y]) => (layout.along === "x" ? x / layout.end[0] : y / layout.end[1])));

  useEffect(() => {
    const path = measure.current;
    if (!path) return;
    const total = path.getTotalLength();
    const at = (target: number) => {
      let lo = 0;
      let hi = total;
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2;
        const p = path.getPointAtLength(mid);
        if ((layout.along === "x" ? p.x : p.y) >= target) hi = mid;
        else lo = mid;
      }
      return hi / total;
    };
    setShares(layout.nodes.map(([x, y]) => at(layout.along === "x" ? x : y)));
  }, [layout]);

  // Drawn once when it comes into view; the lights run while it stays on screen.
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        setLive(entry.isIntersecting);
        if (entry.isIntersecting) setDrawn(true);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!drawn || reduced) return undefined;
    const t = window.setTimeout(() => setLit(true), (Math.max(WAY_DRAW, KNOT_DRAW) + 0.2) * 1000);
    return () => window.clearTimeout(t);
  }, [drawn, reduced]);

  const show = drawn || !!reduced;
  const instant = !!reduced;
  const knot = smooth(layout.knot);
  const [ex, ey] = layout.knot[layout.knot.length - 1];
  const fill = { transformBox: "fill-box", transformOrigin: "center" } as const;
  const after = (delay: number) => ({ duration: instant ? 0 : 0.6, delay: instant ? 0 : delay, ease: EASE });

  return (
    <div
      ref={box}
      data-live={live || undefined}
      data-lit={lit || undefined}
      className="v11-ways relative"
      style={{ aspectRatio: `${layout.w} / ${layout.h}`, "--period": `${PERIOD}s`, "--knot-period": `${KNOT_PERIOD}s` } as CSSProperties}
    >
      <svg aria-hidden viewBox={`0 0 ${layout.w} ${layout.h}`} className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <mask id={`${id}-knot`} maskUnits="userSpaceOnUse">
            <motion.path
              d={knot}
              fill="none"
              stroke="#fff"
              strokeWidth={16}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: show ? 1 : 0 }}
              transition={{ duration: instant ? 0 : KNOT_DRAW, ease: "easeInOut" }}
            />
          </mask>
        </defs>

        {/* The classic way: dashed and grey, revealed as it is drawn; its light, and the X where it breaks off. */}
        <path d={knot} mask={`url(#${id}-knot)`} className="v11-knot" />
        <path d={knot} pathLength={1} className="v11-knot-light" />
        <motion.path
          d={`M${ex - 6} ${ey - 6} L${ex + 6} ${ey + 6} M${ex + 6} ${ey - 6} L${ex - 6} ${ey + 6}`}
          className="v11-knot-x"
          style={fill}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
          transition={after(KNOT_DRAW)}
        />

        {/* The Branded Genius way: a soft glow under a solid sky line, then the running light. */}
        <path ref={measure} d={layout.way} fill="none" stroke="none" />
        <motion.path
          d={layout.way}
          className="v11-way-glow"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: show ? 1 : 0 }}
          transition={{ duration: instant ? 0 : WAY_DRAW, ease: easeOutQuad }}
        />
        <motion.path
          d={layout.way}
          className="v11-way"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: show ? 1 : 0 }}
          transition={{ duration: instant ? 0 : WAY_DRAW, ease: easeOutQuad }}
        />
        <path d={layout.way} pathLength={1} className="v11-way-halo" />
        <path d={layout.way} pathLength={1} className="v11-way-light" />

        {layout.nodes.map(([x, y], i) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={6} className="v11-way-ping" style={{ animationDelay: `${lightTime(shares[i]).toFixed(3)}s` }} />
            <motion.circle
              cx={x}
              cy={y}
              r={5}
              className="v11-way-node"
              style={fill}
              initial={{ opacity: 0, scale: 0 }}
              animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={after(drawTime(shares[i]))}
            />
          </g>
        ))}
        <circle cx={layout.end[0]} cy={layout.end[1]} r={9} className="v11-way-ping" style={{ animationDelay: `${lightTime(1).toFixed(3)}s` }} />
        <motion.circle
          cx={layout.end[0]}
          cy={layout.end[1]}
          r={7}
          className="v11-way-end"
          style={fill}
          initial={{ opacity: 0, scale: 0 }}
          animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={after(WAY_DRAW - 0.1)}
        />
        <circle cx={layout.start[0]} cy={layout.start[1]} r={6} className="v11-way-start" />
      </svg>

      {/* The words, placed on the drawing (percentages of it, so they stay on their points at any width). */}
      <Place at={layout.classicTitle} layout={layout} show={show} transition={after(0.1)}>
        <p className="flex items-center gap-2.5 text-[15px] font-medium whitespace-nowrap text-silver">
          <X aria-hidden strokeWidth={1.75} className="size-4" />
          {COMPARE.classic.title}
        </p>
      </Place>
      <Place at={layout.classicResult} layout={layout} show={show} transition={after(KNOT_DRAW + 0.15)}>
        <p className={cn("flex gap-2.5 text-[15px] leading-snug text-silver", layout.along === "x" ? "items-center whitespace-nowrap" : "items-start")}>
          {layout.along === "x" && <X aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />}
          {COMPARE.classic.result}
        </p>
      </Place>
      <Place at={layout.oursTitle} layout={layout} show={show} transition={after(0.25)}>
        <p className="flex items-center gap-2.5 text-[15px] font-medium whitespace-nowrap text-white">
          <Check aria-hidden strokeWidth={2} className="size-4 text-sky" />
          {COMPARE.ours.title}
        </p>
      </Place>
      {layout.points.map((point, i) => (
        <Place key={COMPARE.ours.points[i]} at={point} layout={layout} show={show} transition={after(drawTime(shares[i]) + 0.1)}>
          <p className={cn("text-[15px] leading-snug text-white/85", layout.along === "x" && "text-center text-balance")}>{COMPARE.ours.points[i]}</p>
        </Place>
      ))}
      <Place at={layout.oursResult} layout={layout} show={show} transition={after(WAY_DRAW)}>
        <p className={cn("flex gap-2.5 text-[16px] leading-snug font-medium text-white", layout.along === "x" ? "items-center whitespace-nowrap" : "items-start")}>
          <Check aria-hidden strokeWidth={2} className={cn("size-4 shrink-0 text-sky", layout.along === "y" && "mt-1")} />
          {COMPARE.ours.result}
        </p>
      </Place>
    </div>
  );
}

/** A label placed at a point of the drawing, anchored by its start, middle or end and its top, middle or bottom. */
function Place({
  at,
  layout,
  show,
  transition,
  children,
}: {
  at: Label;
  layout: Layout;
  show: boolean;
  transition: object;
  children: ReactNode;
}) {
  const tx = at.ax === "middle" ? "-50%" : at.ax === "end" ? "-100%" : "0%";
  const ty = at.ay === "middle" ? "-50%" : at.ay === "bottom" ? "-100%" : "0%";
  return (
    <div
      aria-hidden
      className="absolute"
      style={{
        left: `${(at.x / layout.w) * 100}%`,
        top: `${(at.y / layout.h) * 100}%`,
        width: at.w ? `${(at.w / layout.w) * 100}%` : undefined,
        transform: `translate(${tx}, ${ty})`,
      }}
    >
      <motion.div initial={{ opacity: 0, y: 8 }} animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={transition}>
        {children}
      </motion.div>
    </div>
  );
}
