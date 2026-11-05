"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  The four service drawings (v5, 2026-11-06). The developer found v1's drawings cartoonish (3 to 4px white outlines,
  icon figures, big words in boxes) and asked for all four to be redesigned. They now share one fine-line language
  on the matte plate:
  - 1px hairlines in off-white at low opacity carry the structure; sky marks only what moves or is active; a faint
    dot grid sits behind (the developer's reference uses one in its cards); soft comets travel along the lines.
  - Strokes keep their screen width at every size: the drawing measures itself and hands each frame its scale (u,
    drawing units per CSS pixel), so a line is as fine on a phone as on a desktop. Shapes scale with the drawing.
  - Labels are HTML over the drawing (the page face at 13px, from sm up), and each is a word from that service's own
    text in SERVICES.items; nothing is invented:
      agents     "Prozesse", "Systeme"
      chat       "Website", "Support", "Kundenservice", "Lead-Qualifizierung"
      calls      "Lead-Qualifizierung", "Terminvereinbarung", "Support", "Follow-ups"
      marketing  "Leadgenerierung", "Kommunikation", "Follow-ups", "CRM"
  The compositions:
  - agents: five process lanes feed a processor chip, which routes each piece of work to one of three systems.
  - chat: three channels feed a live conversation; messages rise, a reply types, and the answer goes out.
  - calls: a voice waveform, the caller in off-white and the AI in sky taking turns, over the call's progress line,
    with the call's topic below.
  - marketing: a funnel drawn as flowing lines; leads drop off at four gates and the rest converge into one point.
  Each scene is a pure function of time and scale: draw(t, u) is the frame at t seconds.
*/

export type Label = {
  text: string;
  /** The anchor in drawing units. */
  x: number;
  y: number;
  align?: "start" | "middle" | "end";
  opacity?: number;
  /** Off-white instead of the quiet grey. */
  bright?: boolean;
};

export type Scene = {
  /** Length of one loop in seconds. */
  loop: number;
  /** The frame shown while the drawing is not playing (plates behind, reduced motion). Playing resumes from it. */
  still: number;
  draw: (t: number, u: number) => ReactNode;
  labels: (t: number) => Label[];
};
export type SceneId = "agents" | "chat" | "calls" | "marketing";

const W = 1280;
const H = 480;
/** CSS aspect ratio of a drawing. */
export const SCENE_ASPECT = `${W} / ${H}`;

// Brand colours only: off-white, Sky, and the plate's own matte fill (so lines pass under shapes).
const INK = "#f1f1ee";
const SKY = "#69bff8";
const PLATE = "#191919";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
const mod = (a: number, n: number) => ((a % n) + n) % n;
/** 1 at the moment of an event, fading to 0 over `span` seconds after it. */
const glow = (since: number, span: number) => (since >= 0 && since < span ? 1 - since / span : 0);

/** A hairline: off-white at a low opacity, `w` CSS pixels wide at every size. */
const hair = (u: number, opacity = 0.16, w = 1) =>
  ({ fill: "none", stroke: INK, strokeOpacity: opacity, strokeWidth: w * u, strokeLinecap: "round", strokeLinejoin: "round" }) as const;

/** The faint dot grid behind every drawing, fading out towards the edges. */
function Grid({ id, u }: { id: string; u: number }) {
  return (
    <>
      <defs>
        <pattern id={`${id}-dots`} width={40} height={40} patternUnits="userSpaceOnUse">
          <circle cx={20} cy={20} r={1.1 * u} fill={INK} fillOpacity={0.1} />
        </pattern>
        <radialGradient id={`${id}-fade`} cx="50%" cy="50%" r="62%">
          <stop offset="0.45" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={`${id}-mask`}>
          <rect width={W} height={H} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-dots)`} mask={`url(#${id}-mask)`} />
    </>
  );
}

/**
 * A soft comet on a path: a short bright head over a longer faint tail. `p` runs from 0 (the head at the start) to
 * 1 (at the end) and a little past, so the tail leaves too. The path is measured as 1 (pathLength).
 */
function Comet({ d, p, u, color = SKY }: { d: string; p: number; u: number; color?: string }) {
  if (p <= 0 || p >= 1.3) return null;
  const head = 0.05;
  const tail = 0.22;
  return (
    <g fill="none" stroke={color} strokeLinecap="round">
      <path d={d} pathLength={1} strokeOpacity={0.28} strokeWidth={1.5 * u} strokeDasharray={`${tail} 3`} strokeDashoffset={tail - p} />
      <path d={d} pathLength={1} strokeWidth={2 * u} strokeDasharray={`${head} 3`} strokeDashoffset={head - p} />
    </g>
  );
}

/* KI-Agenten & Workflows: recurring processes feed an agent (a processor chip); it routes each piece of work through
   one of the connected systems on its own. */

const AG = {
  loop: 9,
  every: 0.9,
  travelIn: 1.3,
  hold: 0.25,
  travelOut: 1.1,
  lanes: [120, 180, 240, 300, 360],
  pins: [200, 220, 240, 260, 280],
  outs: [210, 240, 270],
  nodes: [140, 240, 340],
};
const AG_LANE = AG.lanes.map((y, i) => `M60 ${y}H300C420 ${y} 440 ${AG.pins[i]} 560 ${AG.pins[i]}`);
const AG_OUT = AG.nodes.map((y, j) => `M720 ${AG.outs[j]}C840 ${AG.outs[j]} 850 ${y} 960 ${y}`);
const AG_WORK = Array.from({ length: Math.round(AG.loop / AG.every) }, (_, k) => ({ start: k * AG.every, lane: k % 5, out: (k * 2) % 3 }));
const AG_PINS_X = [600, 620, 640, 660, 680];
const AG_ROW = [92, 64, 80];

function agents(t: number, u: number) {
  const leave = AG.travelIn + AG.hold;
  const land = leave + AG.travelOut;
  const work = AG_WORK.map((w) => ({ ...w, tau: mod(t - w.start, AG.loop) }));
  const core = Math.max(0, ...work.map((w) => glow(w.tau - AG.travelIn, 0.7)));
  const lit = [0, 1, 2].map((j) => Math.max(0, ...work.filter((w) => w.out === j).map((w) => glow(w.tau - land, 0.9))));
  const scan = mod(t * 0.45, 1);
  return (
    <>
      <Grid id="agents" u={u} />
      {AG_LANE.map((d) => (
        <path key={d} d={d} {...hair(u)} />
      ))}
      {AG_OUT.map((d) => (
        <path key={d} d={d} {...hair(u)} />
      ))}
      {work.map((w, k) => (
        <Fragment key={k}>
          <Comet d={AG_LANE[w.lane]} p={w.tau / AG.travelIn} u={u} />
          <Comet d={AG_OUT[w.out]} p={(w.tau - leave) / AG.travelOut} u={u} />
        </Fragment>
      ))}

      {/* The agent: a chip with fine pins, a sky core that flashes as work arrives, and a slow scan line. */}
      {AG_PINS_X.map((x) => (
        <Fragment key={x}>
          <path d={`M${x} 146V160`} {...hair(u, 0.26)} />
          <path d={`M${x} 320V334`} {...hair(u, 0.26)} />
        </Fragment>
      ))}
      <rect x={560} y={160} width={160} height={160} rx={22} {...hair(u, 0.26)} fill={PLATE} />
      <rect x={600} y={200} width={80} height={80} rx={14} fill="none" stroke={SKY} strokeOpacity={0.45} strokeWidth={u} />
      <path d={`M606 ${204 + 72 * scan}H674`} stroke={SKY} strokeOpacity={0.22 * Math.sin(Math.PI * scan)} strokeWidth={u} />
      <rect x={632} y={232} width={16} height={16} rx={4} fill={SKY} fillOpacity={0.35 + 0.65 * core} />

      {/* The systems: quiet rows that light up as the work lands. */}
      {AG.nodes.map((y, j) => (
        <g key={y}>
          <rect x={960} y={y - 26} width={200} height={52} rx={12} {...hair(u, 0.2)} fill={PLATE} />
          <rect x={960} y={y - 26} width={200} height={52} rx={12} fill="none" stroke={SKY} strokeOpacity={0.6 * lit[j]} strokeWidth={u} />
          <rect x={980} y={y - 4} width={8} height={8} rx={2} fill={SKY} fillOpacity={0.25 + 0.75 * lit[j]} />
          <path d={`M1004 ${y}H${1004 + AG_ROW[j]}`} {...hair(u, 0.16, 2)} />
        </g>
      ))}
    </>
  );
}

/* KI-Chatbots: the website, support and customer service channels feed one conversation; messages rise, the reply
   types and settles, and each answer goes out to lead qualification. */

const CH = { loop: 12, typing: 1.1, gap: 14, left: 548, right: 872, bottom: 412 };
const CH_ROWS = [150, 240, 330];
const CH_ENTRY = [200, 240, 280];
const CH_LINE = CH_ROWS.map((y, i) => `M80 ${y}H250C380 ${y} 400 ${CH_ENTRY[i]} 520 ${CH_ENTRY[i]}`);
const CH_OUT = "M900 240H1160";
const CH_CHANNELS = ["Website", "Support", "Kundenservice"];

type Message = { side: "in" | "out"; w: number; lines: 1 | 2; at: number; channel?: number };
const CH_MESSAGES: Message[] = [
  { side: "in", w: 220, lines: 1, at: 0.6, channel: 0 },
  { side: "out", w: 290, lines: 2, at: 2.4 },
  { side: "in", w: 184, lines: 1, at: 4.6, channel: 1 },
  { side: "out", w: 250, lines: 2, at: 6.4 },
  { side: "in", w: 236, lines: 2, at: 8.6, channel: 2 },
  { side: "out", w: 210, lines: 1, at: 10.4 },
];
const msgHeight = (m: Message) => (m.lines === 1 ? 40 : 64);

function chat(t: number, u: number) {
  // This loop's messages and the last loop's (still in view above them), newest first.
  const shown = [-CH.loop, 0]
    .flatMap((shift) => CH_MESSAGES.map((m) => ({ ...m, at: m.at + shift })))
    .filter((m) => (m.side === "out" ? m.at - CH.typing : m.at) <= t)
    .sort((a, b) => b.at - a.at);

  let stack = 0;
  const placed = shown.map((m) => {
    const start = m.side === "out" ? m.at - CH.typing : m.at;
    const enter = ease(prog(t, start, start + 0.4));
    const settle = m.side === "out" ? ease(prog(t, m.at, m.at + 0.35)) : 1;
    const h = m.side === "out" ? 36 + (msgHeight(m) - 36) * settle : msgHeight(m);
    const w = m.side === "out" ? 76 + (m.w - 76) * settle : m.w;
    const bottom = CH.bottom - stack + (1 - enter) * 16;
    stack += (h + CH.gap) * enter;
    return { m, h, w, top: bottom - h, enter, settle };
  });

  const inbound = CH_MESSAGES.filter((m) => m.side === "in");
  const outbound = CH_MESSAGES.filter((m) => m.side === "out");
  const answered = Math.max(0, ...outbound.map((m) => glow(mod(t - (m.at + 0.9), CH.loop), 1)));

  return (
    <>
      <Grid id="chat" u={u} />
      {CH_LINE.map((d) => (
        <path key={d} d={d} {...hair(u)} />
      ))}
      <path d={CH_OUT} {...hair(u)} />
      {inbound.map((m) => (
        <Comet key={m.at} d={CH_LINE[m.channel ?? 0]} p={mod(t - (m.at - 0.9), CH.loop) / 0.9} u={u} />
      ))}
      {outbound.map((m) => (
        <Comet key={m.at} d={CH_OUT} p={mod(t - m.at, CH.loop) / 0.9} u={u} />
      ))}
      {CH_ROWS.map((y, i) => {
        const m = inbound.find((x) => x.channel === i);
        const on = m ? glow(mod(t - (m.at - 0.9), CH.loop), 1.4) : 0;
        return <circle key={y} cx={80} cy={y} r={4} fill={SKY} fillOpacity={0.3 + 0.7 * on} />;
      })}
      <circle cx={1160} cy={240} r={5} fill={SKY} fillOpacity={0.35 + 0.65 * answered} />
      <circle cx={1160} cy={240} r={12 + 6 * (1 - answered)} fill="none" stroke={SKY} strokeOpacity={0.35 * answered} strokeWidth={u} />

      {/* The conversation: a matte panel; messages are clipped to it and fade out at its top. */}
      <defs>
        <clipPath id="chat-clip">
          <rect x={521} y={41} width={378} height={398} rx={27} />
        </clipPath>
        <linearGradient id="chat-fade" x1="0" y1="40" x2="0" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="chat-mask">
          <rect x={520} y={40} width={380} height={400} fill="url(#chat-fade)" />
        </mask>
      </defs>
      <rect x={520} y={40} width={380} height={400} rx={28} {...hair(u, 0.2)} fill={PLATE} />
      <g clipPath="url(#chat-clip)" mask="url(#chat-mask)">
        {placed.map(({ m, h, w, top, enter, settle }) => {
          const reply = m.side === "out";
          const x = reply ? CH.right - w : CH.left;
          const text = reply ? settle : 1;
          const bar = w - 48;
          return (
            <g key={m.at} opacity={enter}>
              <rect
                x={x}
                y={top}
                width={w}
                height={h}
                rx={18}
                fill={reply ? SKY : INK}
                fillOpacity={reply ? 0.1 : 0.035}
                stroke={reply ? SKY : INK}
                strokeOpacity={reply ? 0.42 : 0.16}
                strokeWidth={u}
              />
              {reply && settle < 1
                ? [0, 1, 2].map((k) => (
                    <circle
                      key={k}
                      cx={x + 22 + k * 16}
                      cy={top + 18}
                      r={4}
                      fill={SKY}
                      fillOpacity={(1 - settle) * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (t * 1.6 - k * 0.18))))}
                    />
                  ))
                : null}
              <g opacity={text}>
                <rect x={x + 24} y={top + (m.lines === 1 ? 17 : 20)} width={bar} height={6} rx={3} fill={INK} fillOpacity={reply ? 0.32 : 0.22} />
                {m.lines === 2 ? <rect x={x + 24} y={top + 38} width={bar * 0.6} height={6} rx={3} fill={INK} fillOpacity={reply ? 0.32 : 0.22} /> : null}
              </g>
            </g>
          );
        })}
      </g>
    </>
  );
}

function chatLabels(t: number): Label[] {
  const inbound = CH_MESSAGES.filter((m) => m.side === "in");
  return [
    ...CH_CHANNELS.map((text, i) => {
      const m = inbound.find((x) => x.channel === i);
      const on = m ? glow(mod(t - (m.at - 0.9), CH.loop), 1.6) : 0;
      return { text, x: 80, y: CH_ROWS[i] - 22, bright: on > 0.2 };
    }),
    { text: "Lead-Qualifizierung", x: 1160, y: 278, align: "middle" as const },
  ];
}

/* KI-Callbots: a call as a voice waveform. The caller (off-white) and the AI (sky) take turns; the line below fills
   with the call, and the call's topic changes every two turns. */

const CL = { loop: 20, turn: 2.5, bars: 72, x0: 232, x1: 1048, cy: 206, max: 236, track: 392 };
const CL_TOPICS = ["Lead-Qualifizierung", "Terminvereinbarung", "Support", "Follow-ups"];
// Syllables per turn: when (seconds into the turn) and how loud, varied by turn.
const CL_SYLLABLES = Array.from({ length: 8 }, (_, n) =>
  [0.18, 0.5, 0.82, 1.18, 1.52, 1.86].map((at, i) => ({ at: at + 0.06 * ((n * 7 + i * 3) % 5) - 0.12, loud: 0.55 + 0.45 * (((n * 5 + i * 7) % 9) / 8) }))
);

function calls(t: number, u: number) {
  const n = Math.floor(t / CL.turn) % 8;
  const tau = t - Math.floor(t / CL.turn) * CL.turn;
  const loud = Math.min(1, CL_SYLLABLES[n].reduce((sum, s) => sum + s.loud * Math.exp(-(((tau - s.at) / 0.15) ** 2)), 0));
  // The AI speaks on odd turns; the colour crosses over in the first quarter second of a turn.
  const ai = n % 2 === 1 ? ease(prog(tau, 0, 0.25)) : 1 - ease(prog(tau, 0, 0.25));
  const step = (CL.x1 - CL.x0) / (CL.bars - 1);
  const done = t / CL.loop;
  const live = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 4));
  return (
    <>
      <Grid id="calls" u={u} />
      {Array.from({ length: CL.bars }, (_, i) => {
        const envelope = Math.sin((Math.PI * (i + 0.5)) / CL.bars) ** 1.2;
        const wobble = 0.55 + 0.45 * Math.sin(i * 0.83 + t * 7.1) * Math.sin(i * 0.29 - t * 4.3 + n);
        const h = Math.max(6, 6 + CL.max * loud * envelope * wobble);
        const x = CL.x0 + i * step;
        return (
          <g key={i}>
            <rect x={x - 2} y={CL.cy - h / 2} width={4} height={h} rx={2} fill={INK} fillOpacity={(1 - ai) * (0.18 + 0.4 * envelope)} />
            <rect x={x - 2} y={CL.cy - h / 2} width={4} height={h} rx={2} fill={SKY} fillOpacity={ai * (0.3 + 0.6 * envelope)} />
          </g>
        );
      })}
      <path d={`M${CL.x0} ${CL.track}H${CL.x1}`} {...hair(u, 0.14)} />
      <path d={`M${CL.x0} ${CL.track}H${CL.x0 + (CL.x1 - CL.x0) * done}`} stroke={SKY} strokeOpacity={0.6} strokeWidth={1.25 * u} strokeLinecap="round" />
      <circle cx={CL.x0 + (CL.x1 - CL.x0) * done} cy={CL.track} r={3.5 * u} fill={SKY} />
      <circle cx={CL.x0 - 28} cy={CL.track} r={3 * u} fill={SKY} fillOpacity={live} />
    </>
  );
}

function callLabels(t: number): Label[] {
  const span = CL.loop / CL_TOPICS.length;
  const i = Math.floor(t / span) % CL_TOPICS.length;
  const into = t - Math.floor(t / span) * span;
  return [{ text: CL_TOPICS[i], x: 640, y: 446, align: "middle", bright: true, opacity: Math.min(prog(into, 0, 0.4), 1 - prog(into, span - 0.4, span)) }];
}

/* KI-Marketing & Vertriebsautomatisierung: a funnel drawn as flowing lines. Leads enter across the full height, some
   drop off at each gate (a small end dot), and the rest converge into one point that lights as each one arrives. */

const MK = { loop: 9.6, every: 0.8, travel: 3.4, cy: 244 };
const MK_X = [40, 290, 540, 790, 1040, 1240];
const MK_HALF = [176, 128, 92, 62, 38, 0];
// How many lines reach each stage: all 20 reach the first gate, where 5 end; 6 reach the meeting point.
const MK_PRESENT = [20, 20, 15, 11, 8, 6];
const MK_GATES = ["Leadgenerierung", "Kommunikation", "Follow-ups", "CRM"];

/** One line: its path, the last stage it reaches, and where it ends. */
type Flow = { d: string; end: number; x: number; y: number };
const MK_FLOWS: Flow[] = (() => {
  // The more central a line, the further it gets.
  const order = Array.from({ length: 20 }, (_, r) => r).sort((a, b) => Math.abs(a - 9.5) - Math.abs(b - 9.5) || a - b);
  const reach = new Map<number, number>();
  order.forEach((r, c) => {
    let last = 0;
    MK_PRESENT.forEach((n, s) => {
      if (c < n) last = s;
    });
    reach.set(r, last);
  });
  // A line's height at a stage: spread evenly over the lines that reach it.
  const at = (r: number, s: number) => {
    const present = Array.from({ length: 20 }, (_, x) => x).filter((x) => (reach.get(x) ?? 0) >= s);
    const idx = present.indexOf(r);
    const count = present.length;
    return count > 1 && MK_HALF[s] > 0 ? MK.cy - MK_HALF[s] + (idx * 2 * MK_HALF[s]) / (count - 1) : MK.cy;
  };
  return Array.from({ length: 20 }, (_, r) => {
    const end = reach.get(r) ?? 0;
    let d = `M${MK_X[0]} ${at(r, 0).toFixed(1)}`;
    for (let s = 1; s <= end; s++) {
      const [xa, xb] = [MK_X[s - 1], MK_X[s]];
      const [ya, yb] = [at(r, s - 1), at(r, s)];
      const mid = (xa + xb) / 2;
      d += `C${mid} ${ya.toFixed(1)} ${mid} ${yb.toFixed(1)} ${xb} ${yb.toFixed(1)}`;
    }
    return { d, end, x: MK_X[end], y: at(r, end) };
  });
})();
const MK_FINAL = MK_FLOWS.filter((f) => f.end === MK_X.length - 1);
const MK_DROPS = MK_FLOWS.filter((f) => f.end < MK_X.length - 1);
const MK_PULSES = Array.from({ length: Math.round(MK.loop / MK.every) }, (_, k) => {
  const drop = k % 3 === 2;
  const flow = drop ? MK_DROPS[(k * 5) % MK_DROPS.length] : MK_FINAL[k % MK_FINAL.length];
  const travel = (MK.travel * (MK_X[flow.end] - MK_X[0])) / (MK_X[MK_X.length - 1] - MK_X[0]);
  return { start: k * MK.every, flow, travel, drop };
});

function marketing(t: number, u: number) {
  const pulses = MK_PULSES.map((p) => ({ ...p, tau: mod(t - p.start, MK.loop) }));
  const arrived = Math.max(0, ...pulses.filter((p) => !p.drop).map((p) => glow(p.tau - p.travel, 0.9)));
  const end = MK_X[MK_X.length - 1];
  return (
    <>
      <Grid id="marketing" u={u} />
      <defs>
        <linearGradient id="marketing-flow" x1={MK_X[0]} y1="0" x2={end} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={INK} stopOpacity={0.08} />
          <stop offset="1" stopColor={INK} stopOpacity={0.34} />
        </linearGradient>
      </defs>
      {MK_X.slice(1, -1).map((x) => (
        <path key={x} d={`M${x} 56V432`} {...hair(u, 0.1)} strokeDasharray={`${2 * u} ${6 * u}`} />
      ))}
      {MK_FLOWS.map((f) => (
        <path key={f.d} d={f.d} fill="none" stroke="url(#marketing-flow)" strokeWidth={u} strokeLinecap="round" />
      ))}
      {MK_DROPS.map((f) => (
        <circle key={f.d} cx={f.x} cy={f.y} r={3} fill={INK} fillOpacity={0.28} />
      ))}
      {pulses.map((p, k) => (
        <Comet key={k} d={p.flow.d} p={p.tau / p.travel} u={u} />
      ))}
      <circle cx={end} cy={MK.cy} r={6} fill={SKY} fillOpacity={0.45 + 0.55 * arrived} />
      <circle cx={end} cy={MK.cy} r={14 + 8 * (1 - arrived)} fill="none" stroke={SKY} strokeOpacity={0.4 * arrived} strokeWidth={u} />
    </>
  );
}

/** The scene registry, keyed by the service ids in SERVICES.items. */
export const SCENES: Record<SceneId, Scene> = {
  agents: {
    loop: AG.loop,
    still: 4.95,
    draw: agents,
    labels: () => [
      { text: "Prozesse", x: 60, y: 86 },
      { text: "Systeme", x: 960, y: 92 },
    ],
  },
  chat: { loop: CH.loop, still: 7.2, draw: chat, labels: chatLabels },
  calls: { loop: CL.loop, still: 3.3, draw: calls, labels: callLabels },
  marketing: {
    loop: MK.loop,
    still: 5.1,
    draw: marketing,
    labels: () => MK_GATES.map((text, i) => ({ text, x: MK_X[i + 1], y: 34, align: "middle" as const })),
  },
};

export const isSceneId = (id: string): id is SceneId => id in SCENES;

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** prefers-reduced-motion that is safe to hydrate: false on the server and while hydrating, then the real value. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
}

const ALIGN = { start: "0", middle: "-50%", end: "-100%" } as const;

/**
 * One service drawing. While `playing` it loops, starting from its still frame so it never blanks when it takes
 * over, and its clock runs only while at least a fifth of it is on screen. While not playing, and always for
 * reduced motion, it shows the still frame and runs no clock at all. The drawing re-renders alone; nothing else on
 * the page is told about its frames. `className` sizes the box (it keeps the drawing's aspect ratio).
 */
export function ServiceAnimation({ id, playing, className }: { id: SceneId; playing: boolean; className?: string }) {
  const scene = SCENES[id];
  const box = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState(scene.still);
  const [wasPlaying, setWasPlaying] = useState(playing);
  // Drawing units per CSS pixel; the desktop plate's width until the drawing has measured itself.
  const [unit, setUnit] = useState(W / 1136);
  const reduced = usePrefersReducedMotion();
  const live = playing && !reduced;

  // Each time playing starts or stops, the clock goes back to the still frame (adjusted during render, so a stale
  // frame from the last run never shows for a frame).
  if (wasPlaying !== playing) {
    setWasPlaying(playing);
    setClock(scene.still);
  }

  // Lines keep their screen width: the scale follows the drawing's own width.
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) setUnit(W / width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || !live) return undefined;
    const { loop, still } = scene;
    let raf = 0;
    let last = 0;
    let elapsed = still;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // About 60 renders a second is plenty for line drawings, also on 120 and 144 Hz screens.
      if (last && now - last < 12) return;
      if (last) elapsed = (elapsed + Math.min(0.1, (now - last) / 1000)) % loop;
      last = now;
      setClock(elapsed);
    };
    const io = new IntersectionObserver(
      (entries) => {
        cancelAnimationFrame(raf);
        last = 0;
        // A batch can hold several records for the drawing; the last one is its current state.
        if (entries[entries.length - 1].isIntersecting) raf = requestAnimationFrame(tick);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [scene, live]);

  const t = live ? clock : scene.still;
  return (
    <div ref={box} aria-hidden style={{ aspectRatio: SCENE_ASPECT }} className={cn("relative mx-auto w-full select-none", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 block size-full">
        {scene.draw(t, unit)}
      </svg>
      <div className="hidden sm:block">
        {scene.labels(t).map((label) => (
          <span
            key={label.text}
            className={cn("absolute text-[13px] leading-none whitespace-nowrap", label.bright ? "text-white/85" : "text-silver")}
            style={{
              left: `${(label.x / W) * 100}%`,
              top: `${(label.y / H) * 100}%`,
              opacity: label.opacity ?? 1,
              transform: `translate(${ALIGN[label.align ?? "start"]}, -50%)`,
              transition: "color 300ms ease-out",
            }}
          >
            {label.text}
          </span>
        ))}
      </div>
    </div>
  );
}
