"use client";

import { useIsPresent, type MotionValue } from "motion/react";
import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  The four looping line drawings from v1 (services-stack.tsx), one per service. Each scene is a pure function of
  time: draw(t) returns the frame at t seconds, and steps names what the drawing is acting out at that moment.
  The timings and choreography are v1's. What changed for v2: everything is drawn to be read on the navy panel
  (outlines in white at 95%, connectors and details in sky, strokes about 1.5x heavier, labels in the page face at 24 to 30
  units instead of 19 in a dim monospace), a few labels moved so the larger type never touches a line, and the
  caption under the drawing is gone because the section lists the steps beside it.
*/

type Pt = [number, number];
type Curve = [Pt, Pt, Pt, Pt];
export type Step = [from: number, to: number, label: string];
export type Scene = {
  /** Length of one loop in seconds. */
  loop: number;
  /** The frame shown instead of the loop when the visitor prefers reduced motion. */
  still: number;
  steps: Step[];
  draw: (t: number) => ReactNode;
};
export type SceneId = "agents" | "chat" | "calls" | "marketing";

/** The drawing's frame: v1's 1280-wide canvas, trimmed to the area the scenes use. */
const VIEW = { x: 10, y: 24, w: 1280, h: 488 };
/** CSS aspect ratio of a drawing, for placeholders that must take the same space. */
export const SCENE_ASPECT = `${VIEW.w} / ${VIEW.h}`;

// Brand colours only: white, Sky, and the page navys for fills that sit on the panel.
const WHITE = "#ffffff";
const SKY = "#69bff8";
const NODE = "#081224"; // --color-deep: fill behind nodes, so lines pass under them
const ON_SKY = "#050a14"; // --color-page: marks drawn on a sky fill

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const inOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
const out = (p: number) => 1 - (1 - p) ** 3;
const back = (p: number) => 1 + 2.70158 * (p - 1) ** 3 + 1.70158 * (p - 1) ** 2;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const mix = (a: Pt, b: Pt, p: number): Pt => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
const quad = (a: Pt, c: Pt, b: Pt, p: number): Pt => mix(mix(a, c, p), mix(c, b, p), p);
const cubic = (a: Pt, c1: Pt, c2: Pt, b: Pt, p: number): Pt => quad(mix(a, c1, p), mix(c1, c2, p), mix(c2, b, p), p);
const along = ([a, c1, c2, b]: Curve, p: number) => cubic(a, c1, c2, b, p);
const pt = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const curve = ([a, c1, c2, b]: Curve) => `M${pt(a)}C${pt(c1)} ${pt(c2)} ${pt(b)}`;
const fade = (t: number, loop: number) => prog(t, 0, 0.25) * (1 - prog(t, loop - 0.7, loop));

/** Stroke-draw a shape from 0 (nothing) to 1 (whole outline). */
const draw = (p: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - p, visibility: p > 0 ? "visible" : "hidden" }) as const;

/** Main outlines. */
const line = { fill: "none", stroke: WHITE, strokeOpacity: 0.95, strokeWidth: 3.75, strokeLinecap: "round", strokeLinejoin: "round" } as const;
/** Connectors and fine detail: sky, so the hierarchy comes from colour instead of dimming. */
const hair = { ...line, stroke: SKY, strokeOpacity: 0.85, strokeWidth: 3 } as const;
/** Labels: the page face (General Sans), inherited. */
const label = { fill: WHITE, fillOpacity: 0.92, fontSize: 26, fontWeight: 500 } as const;

function Person({ at, color = WHITE, s = 1, opacity = 1 }: { at: Pt; color?: string; s?: number; opacity?: number }) {
  return (
    <g transform={`translate(${pt(at)}) scale(${s})`} opacity={opacity}>
      <circle cy={-13} r={9} fill={color} />
      <path d="M-14 17Q0 -5 14 17" {...line} stroke={color} />
    </g>
  );
}

/** A piece of work moving through a drawing: a white dot, or a sky dot in a ring when it goes to a person. */
function Token({ at, rare = false }: { at: Pt; rare?: boolean }) {
  return rare ? (
    <g>
      <circle cx={at[0]} cy={at[1]} r={13} {...line} strokeWidth={3} />
      <circle cx={at[0]} cy={at[1]} r={7} fill={SKY} />
    </g>
  ) : (
    <circle cx={at[0]} cy={at[1]} r={8} fill={WHITE} />
  );
}

/* KI-Agenten & Workflows: a task and connected data feed an agent; it routes the work through tools on its own,
   and only the rare case goes to a person. */

const A_AGENT: Pt = [600, 270];
const A_FEED: Pt = [410, 323];
const A_TOOLS: Pt[] = [[850, 120], [850, 270], [850, 420]];
const A_DONE: Pt = [1110, 330];
const A_TEAM: Pt = [1110, 110];
const A_SEG = 0.5;
const A_PROMPT = "> Leads qualifizieren";
const A_DATA = Array.from({ length: 16 }, (_, i) => ({
  from: [100 + ((i * 97) % 280), 210 + ((i * 53) % 240)] as Pt,
  to: [130 + (i % 4) * 80, 230 + Math.floor(i / 4) * 62] as Pt,
}));
const A_TOKENS = Array.from({ length: 14 }, (_, k) => {
  const rare = k % 5 === 3;
  const b = [1, 0, 2, 1, 2, 0][k % 6];
  const next = b === 2 ? 1 : b + 1;
  const path = rare ? [A_FEED, A_AGENT, A_TOOLS[0], A_TEAM] : k % 4 === 1 ? [A_FEED, A_AGENT, A_TOOLS[b], A_TOOLS[next], A_DONE] : [A_FEED, A_AGENT, A_TOOLS[b], A_DONE];
  const start = 4.8 + k * 0.4;
  return { rare, path, start, end: start + (path.length - 1) * A_SEG };
});
// The top tool is labelled above its node, the middle one in the gap between its two exit lines, the bottom one below.
const A_TOOL_LABELS: [text: string, x: number, y: number, anchor: "start" | "middle"][] = [
  ["qualifizieren", -22, -36, "start"],
  ["antworten", 34, -2, "start"],
  ["buchen", 0, 56, "middle"],
];

function agents(t: number) {
  const typed = Math.floor(prog(t, 0.4, 2) * A_PROMPT.length);
  const cursor = t < 2.8 && (t * 2) % 1 < 0.5 ? "_" : "";
  const finished = A_TOKENS.filter((k) => !k.rare && k.end <= t);
  const lastDone = Math.max(-1, ...finished.map((k) => k.end));
  const lastUp = Math.max(-1, ...A_TOKENS.filter((k) => k.rare && k.end <= t).map((k) => k.end));
  const doneFlash = prog(t, lastDone, lastDone + 0.5);
  const upFlash = prog(t, lastUp, lastUp + 0.7);
  const edges = inOut(prog(t, 3.6, 4.4));
  const exits = inOut(prog(t, 4.1, 4.8));

  return (
    <g opacity={fade(t, 12)}>
      {/* Aufgaben definieren */}
      <rect x={80} y={80} width={356} height={76} rx={12} {...line} {...draw(inOut(prog(t, 0.1, 0.7)))} />
      <text x={102} y={128} {...label} fontSize={28}>
        {A_PROMPT.slice(0, typed)}
        {cursor}
      </text>

      {/* Daten anbinden */}
      {A_DATA.map(({ from, to }, i) => {
        const [x, y] = mix(from, to, inOut(prog(t, 1.8 + i * 0.04, 2.8 + i * 0.04)));
        return <circle key={i} cx={x} cy={y} r={7} fill={WHITE} opacity={0.9 * prog(t, 1.1 + i * 0.03, 1.5 + i * 0.03)} />;
      })}
      <path d={`M436 118L${pt(A_AGENT)}M${pt(A_FEED)}L${pt(A_AGENT)}`} {...hair} {...draw(prog(t, 2.8, 3.5))} />

      {/* Workflows and the systems they connect */}
      {A_TOOLS.map((p, i) => (
        <g key={i}>
          <line x1={A_AGENT[0]} y1={A_AGENT[1]} x2={p[0]} y2={p[1]} {...hair} {...draw(edges)} />
          <line x1={p[0]} y1={p[1]} x2={A_DONE[0]} y2={A_DONE[1]} {...hair} {...draw(exits)} />
        </g>
      ))}
      <line x1={850} y1={120} x2={850} y2={420} {...hair} strokeDasharray="5 13" opacity={exits} />
      <line x1={A_TOOLS[0][0]} y1={A_TOOLS[0][1]} x2={A_TEAM[0] - 36} y2={A_TEAM[1]} {...hair} {...draw(exits)} />

      {/* KI-Agent */}
      <circle cx={A_AGENT[0]} cy={A_AGENT[1]} r={38} {...line} fill={NODE} {...draw(inOut(prog(t, 2.6, 3.2)))} />
      <circle cx={A_AGENT[0]} cy={A_AGENT[1]} r={54} {...hair} strokeDasharray="6 18" opacity={0.9 * prog(t, 3, 3.4)} transform={`rotate(${(t * 40).toFixed(1)} ${pt(A_AGENT)})`} />
      <circle cx={A_AGENT[0]} cy={A_AGENT[1]} r={9 * back(prog(t, 3, 3.3))} fill={WHITE} />

      {A_TOOLS.map(([x, y], i) => {
        const p = back(prog(t, 3.9 + i * 0.15, 4.3 + i * 0.15));
        const shape = [
          <rect key="s" x={-20} y={-20} width={40} height={40} rx={6} />,
          <rect key="d" x={-17} y={-17} width={34} height={34} rx={4} transform="rotate(45)" />,
          <circle key="c" r={22} />,
        ][i];
        const [text, lx, ly, anchor] = A_TOOL_LABELS[i];
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <g transform={`scale(${p})`} {...line} fill={NODE}>
              {shape}
            </g>
            <text x={lx} y={ly} textAnchor={anchor} {...label} opacity={prog(t, 4.2, 4.6)}>
              {text}
            </text>
          </g>
        );
      })}

      {/* Prozesse uebernehmen: the work is done, the rare case goes up to the team */}
      <g opacity={prog(t, 4.4, 4.8)}>
        <circle cx={A_DONE[0]} cy={A_DONE[1]} r={26} {...line} />
        <circle cx={A_DONE[0]} cy={A_DONE[1]} r={12} fill={WHITE} />
        {doneFlash > 0 && doneFlash < 1 && <circle cx={A_DONE[0]} cy={A_DONE[1]} r={26 + 20 * out(doneFlash)} {...line} strokeWidth={3} strokeOpacity={1 - doneFlash} />}
        <text x={A_DONE[0]} y={A_DONE[1] + 64} textAnchor="middle" {...label}>
          {finished.length} erledigt
        </text>
        <circle cx={A_TEAM[0]} cy={A_TEAM[1] - 20} r={14} {...line} />
        <path d={`M${A_TEAM[0] - 26} ${A_TEAM[1] + 24}Q${A_TEAM[0]} ${A_TEAM[1] - 14} ${A_TEAM[0] + 26} ${A_TEAM[1] + 24}`} {...line} />
        {upFlash > 0 && upFlash < 1 && <circle cx={A_TEAM[0]} cy={A_TEAM[1]} r={40 + 24 * out(upFlash)} {...hair} strokeOpacity={1 - upFlash} />}
        <text x={A_TEAM[0] + 44} y={A_TEAM[1] + 8} {...label}>
          Ihr Team
        </text>
      </g>

      {A_TOKENS.map(({ rare, path, start, end }, k) => {
        if (t < start || t > end + 0.15) return null;
        const e = Math.min((t - start) / A_SEG, path.length - 1.0001);
        const i = Math.floor(e);
        return <Token key={k} at={mix(path[i], path[i + 1], inOut(e - i))} rare={rare} />;
      })}
    </g>
  );
}

/* KI-Chatbots: a website opens its chat, the question is recognised, the answer comes from the company's
   knowledge, the lead gets qualified, the rare case goes to a person, and the clock keeps turning. */

const C_INTENTS: [string, number][] = [["Preis", 120], ["Termin", 205], ["Support", 290]];
const C_ROUTE: Curve = [[810, 92], [720, 20], [560, 30], [505, 140]];
const C_HANDOVER: Curve = [[515, 360], [700, 360], [900, 452], [1068, 446]];
const C_CHECKS = ["Bedarf", "Budget", "Zeitraum"];

function chat(t: number) {
  const widget = back(prog(t, 1.1, 1.45));
  const panel = inOut(prog(t, 1.4, 2.1));
  const question = out(prog(t, 2.2, 2.6));
  const picked = prog(t, 3.4, 3.8);
  const reply = out(prog(t, 5.4, 6.1));
  const handover = inOut(prog(t, 8.3, 9));
  const ping = prog(t, 8.9, 9.6);
  const clock = inOut(prog(t, 10, 10.5));

  return (
    <g opacity={fade(t, 12)}>
      {/* Website-Chat */}
      <rect x={80} y={60} width={460} height={390} rx={14} {...line} {...draw(inOut(prog(t, 0.1, 1)))} />
      <line x1={80} y1={100} x2={540} y2={100} {...hair} {...draw(prog(t, 0.8, 1.1))} />
      {[106, 128, 150].map((x, i) => (
        <circle key={x} cx={x} cy={80} r={5.5} fill={WHITE} opacity={0.85 * prog(t, 0.9 + i * 0.08, 1.1 + i * 0.08)} />
      ))}
      <path d="M110 132H250M110 156H210" {...hair} {...draw(prog(t, 1, 1.4))} />
      <rect x={110} y={186} width={160} height={110} rx={8} {...hair} {...draw(inOut(prog(t, 1, 1.5)))} />
      <path d="M110 330H260M110 352H230M110 374H245" {...hair} {...draw(prog(t, 1.2, 1.6))} />
      <rect x={295} y={128} width={220} height={262} rx={14} {...line} fill={NODE} fillOpacity={panel} {...draw(panel)} />
      <circle cx={505} cy={420} r={22 * widget} fill={SKY} />
      <path d="M496 415h18M496 424h11" stroke={ON_SKY} strokeWidth={3.5} strokeLinecap="round" opacity={widget} />

      {/* Anfrage-Erkennung: the visitor's question is read and sorted */}
      <g opacity={question} transform={`translate(0 ${((1 - question) * 10).toFixed(1)})`}>
        <rect x={372} y={150} width={128} height={46} rx={16} fill={WHITE} fillOpacity={0.14} />
        <path d="M388 167H484M388 180H452" {...line} strokeWidth={3} />
      </g>
      {C_INTENTS.map(([name, y], i) => {
        const p = inOut(prog(t, 2.7 + i * 0.15, 3.2 + i * 0.15));
        const on = name === "Termin" ? picked : 0;
        return (
          <g key={name}>
            <path d={`M515 175C565 175 570 ${y} 620 ${y}`} {...hair} {...draw(p)} />
            <rect x={620} y={y - 24} width={150} height={48} rx={24} {...line} strokeWidth={3} fill={SKY} fillOpacity={on} {...draw(p)} />
            <text x={695} y={y + 9} textAnchor="middle" {...label} fill={on > 0.5 ? ON_SKY : WHITE} fillOpacity={1} opacity={prog(t, 3 + i * 0.15, 3.3 + i * 0.15)}>
              {name}
            </text>
          </g>
        );
      })}

      {/* Antwort-Workflows: the answer is written from the company's own knowledge */}
      {[0, 1, 2].map((i) => {
        const x = 830 + i * 72;
        return (
          <g key={i}>
            <rect x={x} y={56} width={54} height={70} rx={6} {...line} strokeWidth={3} fill={NODE} {...draw(inOut(prog(t, 4.2 + i * 0.15, 4.7 + i * 0.15)))} />
            <path d={`M${x + 12} 77H${x + 42}M${x + 12} 91H${x + 36}M${x + 12} 105H${x + 29}`} {...hair} strokeWidth={2.5} {...draw(prog(t, 4.5 + i * 0.15, 4.9 + i * 0.15))} />
          </g>
        );
      })}
      <text x={1064} y={100} {...label} opacity={prog(t, 4.7, 5)}>
        Wissen
      </text>
      <path d={curve(C_ROUTE)} {...hair} {...draw(inOut(prog(t, 4.8, 5.4)))} />
      {t > 5.4 &&
        [0, 1].map((k) => {
          const u = ((t - 5.4) * 0.5 + k / 2) % 1;
          const [x, y] = along(C_ROUTE, u);
          return <circle key={k} cx={x} cy={y} r={7} fill={WHITE} opacity={prog(t, 5.4, 5.7) * Math.sin(Math.PI * u)} />;
        })}
      <g opacity={reply} transform={`translate(0 ${((1 - reply) * 10).toFixed(1)})`}>
        <rect x={310} y={214} width={170} height={72} rx={16} fill={SKY} fillOpacity={0.18} />
        <path d="M326 236H452M326 250H462M326 264H410" {...hair} strokeOpacity={1} {...draw(prog(t, 5.6, 6.2))} />
      </g>

      {/* Lead-Qualifizierung */}
      {C_CHECKS.map((name, i) => {
        const y = 220 + i * 54;
        const s = 6.3 + i * 0.45;
        return (
          <g key={name}>
            <rect x={880} y={y - 19} width={38} height={38} rx={10} {...line} strokeWidth={3} {...draw(inOut(prog(t, s - 0.2, s + 0.1)))} />
            <path d={`M889 ${y}l7 8l13 -15`} {...line} stroke={SKY} strokeOpacity={1} strokeWidth={4.5} {...draw(prog(t, s + 0.15, s + 0.4))} />
            <text x={936} y={y + 9} {...label} opacity={prog(t, s, s + 0.25)}>
              {name}
            </text>
          </g>
        );
      })}

      {/* Uebergabe an Mitarbeiter: only the rare case goes to a person */}
      <path d={curve(C_HANDOVER)} {...hair} strokeDasharray="6 12" opacity={handover} />
      {handover > 0 && handover < 1 && <Token at={along(C_HANDOVER, handover)} rare />}
      <Person at={[1100, 446]} s={back(prog(t, 8.1, 8.5))} />
      {ping > 0 && ping < 1 && <circle cx={1100} cy={440} r={30 + 26 * out(ping)} {...hair} strokeOpacity={0.9 * (1 - ping)} />}
      <text x={1128} y={454} {...label} opacity={prog(t, 8.4, 8.7)}>
        Ihr Team
      </text>

      {/* Rund um die Uhr */}
      <circle cx={660} cy={455} r={30} {...line} strokeWidth={3} {...draw(clock)} />
      <line x1={660} y1={455} x2={660 + 18 * Math.sin(t * 3)} y2={455 - 18 * Math.cos(t * 3)} {...line} stroke={SKY} strokeOpacity={1} opacity={clock} />
      <line x1={660} y1={455} x2={660 + 11 * Math.sin(t * 0.5)} y2={455 - 11 * Math.cos(t * 0.5)} {...line} opacity={clock} />
      <text x={708} y={466} {...label} fontSize={30} opacity={prog(t, 10.3, 10.6)}>
        24/7
      </text>
    </g>
  );
}

/* KI-Callbots: the phone rings, the assistant answers and talks, the caller is qualified, a slot gets booked,
   the call is routed, follow-ups go out. */

const K_CHECKS = ["Anliegen", "Budget", "Rückruf"];
const K_CONTACTS: Pt[] = [[1130, 340], [1190, 395], [1130, 450]];
const K_FROM: Pt = [1010, 373];
// v1 had 30 bars 10 apart; with heavier strokes, 24 bars 12.5 apart keep the gaps open over the same width.
const K_BARS = 24;

function calls(t: number) {
  const talking = prog(t, 2.1, 2.5) * (1 - prog(t, 11, 11.5));
  const cal = inOut(prog(t, 6.2, 6.9));
  const booked = back(prog(t, 7.4, 7.8));
  const route = inOut(prog(t, 8.5, 9.1));
  const routePing = prog(t, 9, 9.7);

  return (
    <g opacity={fade(t, 12)}>
      {/* Eingehende Anrufe */}
      <rect x={110} y={66} width={170} height={350} rx={28} {...line} {...draw(inOut(prog(t, 0.1, 0.9)))} />
      <line x1={170} y1={90} x2={220} y2={90} {...line} {...draw(prog(t, 0.8, 1))} />
      <circle cx={195} cy={170} r={30} {...hair} {...draw(inOut(prog(t, 0.8, 1.2)))} />
      <path d="M160 224H230M170 244H220" {...hair} {...draw(prog(t, 1, 1.3))} />
      <circle cx={195} cy={348} r={24 * back(prog(t, 1.1, 1.4))} fill={SKY} />
      <path d="M185 342c3 7 9 13 16 16l5 -5" stroke={ON_SKY} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={prog(t, 1.2, 1.4)} />
      {t > 0.9 &&
        t < 2.6 &&
        [0, 1, 2].map((k) => {
          const u = ((t - 0.9) * 0.9 + k / 3) % 1;
          return <circle key={k} cx={195} cy={241} r={110 + 70 * u} {...hair} strokeOpacity={0.85 * (1 - u) * (1 - prog(t, 2.2, 2.6))} />;
        })}

      {/* Sprachassistent: the assistant answers, the waveform talks */}
      <line x1={290} y1={241} x2={350} y2={241} {...hair} {...draw(prog(t, 2, 2.3))} />
      {Array.from({ length: K_BARS }, (_, i) => {
        const x = 362 + i * 12.5;
        const h = 8 + 64 * Math.abs(Math.sin(t * 5.2 + i * 0.69)) * Math.abs(Math.sin(t * 1.3 + i * 0.26)) * talking;
        return <line key={i} x1={x} y1={241 - h / 2} x2={x} y2={241 + h / 2} stroke={i % 5 === 0 ? SKY : WHITE} strokeOpacity={0.95 * prog(t, 2.1, 2.4)} strokeWidth={6.5} strokeLinecap="round" />;
      })}

      {/* Lead-Qualifizierung */}
      {K_CHECKS.map((name, i) => {
        const y = 110 + i * 52;
        const s = 4.4 + i * 0.5;
        return (
          <g key={name}>
            <rect x={720} y={y - 19} width={38} height={38} rx={10} {...line} strokeWidth={3} {...draw(inOut(prog(t, s - 0.2, s + 0.1)))} />
            <path d={`M729 ${y}l7 8l13 -15`} {...line} stroke={SKY} strokeOpacity={1} strokeWidth={4.5} {...draw(prog(t, s + 0.15, s + 0.4))} />
            <text x={776} y={y + 9} {...label} opacity={prog(t, s, s + 0.25)}>
              {name}
            </text>
          </g>
        );
      })}

      {/* Terminvereinbarung: a free slot gets booked */}
      <rect x={720} y={280} width={290} height={186} rx={14} {...line} strokeWidth={3} {...draw(cal)} />
      <line x1={720} y1={318} x2={1010} y2={318} {...hair} {...draw(prog(t, 6.6, 6.9))} />
      {Array.from({ length: 15 }, (_, k) => {
        const x = 738 + (k % 5) * 54;
        const y = 334 + Math.floor(k / 5) * 42;
        const o = prog(t, 6.6 + k * 0.03, 6.9 + k * 0.03);
        return k === 7 && booked > 0 ? (
          <rect key={k} x={-21} y={-15} width={42} height={30} rx={6} fill={SKY} opacity={o} transform={`translate(${x + 21} ${y + 15}) scale(${booked.toFixed(3)})`} />
        ) : (
          <rect key={k} x={x} y={y} width={42} height={30} rx={6} {...hair} strokeWidth={2.5} opacity={o} />
        );
      })}
      <path d="M858 391l6 6l11 -12" stroke={ON_SKY} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={prog(t, 7.7, 7.9)} />

      {/* Weiterleitung: the right person takes over */}
      <line x1={880} y1={160} x2={1080} y2={148} {...hair} strokeDasharray="6 12" opacity={route} />
      <Person at={[1120, 150]} s={back(prog(t, 8.3, 8.7))} />
      {routePing > 0 && routePing < 1 && <circle cx={1120} cy={144} r={30 + 26 * out(routePing)} {...hair} strokeOpacity={0.9 * (1 - routePing)} />}
      <text x={1152} y={158} {...label} opacity={prog(t, 8.6, 8.9)}>
        Team
      </text>

      {/* Follow-ups: calls go back out to the leads */}
      {K_CONTACTS.map((c, i) => {
        const to: Pt = [c[0] - 24, c[1] - 4];
        const u = (((t - 10.5) * 0.8 + i / 3) % 1 + 1) % 1;
        return (
          <g key={i}>
            <line x1={K_FROM[0]} y1={K_FROM[1]} x2={to[0]} y2={to[1]} {...hair} {...draw(inOut(prog(t, 10 + i * 0.2, 10.5 + i * 0.2)))} />
            {t > 10.5 && <circle cx={lerp(K_FROM[0], to[0], u)} cy={lerp(K_FROM[1], to[1], u)} r={6} fill={WHITE} opacity={Math.sin(Math.PI * u)} />}
            <Person at={c} s={back(prog(t, 10.3 + i * 0.2, 10.6 + i * 0.2))} />
          </g>
        );
      })}
    </g>
  );
}

/* KI-Marketing & Vertrieb: find the audience on the market map, position the offer, put it on channels,
   personalise the content, fill the funnel, and keep the customers coming back. */

const G_YOU: Pt = [310, 150];
const G_BRAND: Pt = [540, 150];
const G_AXES: [name: string, x: number, y: number, anchor: "start" | "middle" | "end"][] = [
  ["Premium", 230, 74, "middle"],
  ["Budget", 230, 404, "middle"],
  ["Einsteiger", 92, 260, "start"],
  ["Profis", 368, 260, "end"],
];
const G_RIVALS: Pt[] = [[130, 130], [175, 160], [150, 195], [200, 120], [120, 290], [170, 310], [140, 345], [205, 335], [185, 280], [260, 285], [300, 325], [340, 290], [280, 350]];
const G_CHANNELS = [110, 230, 350];
const G_ICONS = [
  <>
    <rect x={-40} y={-20} width={80} height={40} rx={20} />
    <circle cx={-18} cy={-2} r={8} />
    <path d="M-12 4l6 6" />
    <path d="M2 0H24" stroke={SKY} strokeWidth={3} />
  </>,
  <>
    <rect x={-40} y={-28} width={80} height={56} rx={8} />
    <path d="M-8 -14L14 0L-8 14Z" />
  </>,
  <>
    <rect x={-40} y={-26} width={80} height={52} rx={6} />
    <path d="M-40 -26L0 4L40 -26" />
  </>,
];
const G_SPOUT: Pt = [1080, 300];
const G_LOOP = { cx: 1082, cy: 444, rx: 172, ry: 46 };
const gSlot = (k: number): Pt => [950 + k * 44, 440];
const G_WON = [0, 4, 8, 10];
const G_LEADS = Array.from({ length: 12 }, (_, i) => ({
  start: 6.3 + i * 0.18,
  from: [910, G_CHANNELS[i % 3]] as Pt,
  rim: [985 + ((i * 71) % 190), 114] as Pt,
  won: G_WON.indexOf(i),
}));
const G_REFERRERS = [1, 2, 3];

function leadAt(e: number, from: Pt, rim: Pt, won: number): { at: Pt; o: number } {
  if (e < 0.7) return { at: quad(from, [(from[0] + rim[0]) / 2, 40], rim, inOut(prog(e, 0, 0.7))), o: prog(e, 0, 0.2) };
  if (e < 1.2) return { at: mix(rim, G_SPOUT, inOut(prog(e, 0.7, 1.2))), o: won < 0 ? 1 - prog(e, 0.8, 1.1) : 1 };
  return { at: quad(G_SPOUT, [1080, 380], [gSlot(won)[0], 428], inOut(prog(e, 1.2, 1.7))), o: 1 };
}

function marketing(t: number) {
  const axes = inOut(prog(t, 0.1, 0.9));
  const aim = quad([150, 300], [380, 400], G_YOU, inOut(prog(t, 0.5, 1.8)));
  const lock = prog(t, 1.8, 2.2);
  const hop = inOut(prog(t, 2.3, 2.8));
  const leads = G_LEADS.filter((l) => t >= l.start + 0.7).length;

  return (
    <g opacity={fade(t, 13)}>
      {/* Zielgruppenanalyse: the market map, the competitors, and the gap the offer aims at */}
      <rect x={232} y={92} width={136} height={136} fill={SKY} fillOpacity={0.1 * lock} />
      <line x1={90} y1={230} x2={370} y2={230} {...hair} {...draw(axes)} />
      <line x1={230} y1={370} x2={230} y2={90} {...hair} {...draw(axes)} />
      {G_AXES.map(([name, x, y, anchor]) => (
        <text key={name} x={x} y={y} textAnchor={anchor} {...label} fontSize={24} fill={SKY} fillOpacity={0.95} opacity={prog(t, 0.5, 0.9)}>
          {name}
        </text>
      ))}
      {G_RIVALS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill={SKY} opacity={0.8 * prog(t, 0.3 + i * 0.05, 0.6 + i * 0.05)} />
      ))}
      <g transform={`translate(${pt(aim)})`} opacity={prog(t, 0.3, 0.6) * (1 - prog(t, 2.2, 2.5))}>
        <circle r={26 - 8 * prog(t, 1.6, 1.9)} {...line} strokeWidth={3} />
        <path d="M-42 0H-32M32 0H42M0 -42V-32M0 32V42" {...line} strokeWidth={3} />
      </g>
      {lock > 0 && <circle cx={G_YOU[0]} cy={G_YOU[1]} r={10 * back(lock)} fill={WHITE} />}
      <text x={G_YOU[0] + 18} y={G_YOU[1] - 18} {...label} opacity={prog(t, 2, 2.3)}>
        Zielgruppe
      </text>

      {/* Positionierung: the offer takes its place */}
      <line x1={G_YOU[0] + 14} y1={150} x2={490} y2={150} {...hair} strokeDasharray="5 11" opacity={prog(t, 2.3, 2.6)} />
      {hop > 0 && hop < 1 && <circle cx={lerp(G_YOU[0], G_BRAND[0], hop)} cy={150} r={9} fill={WHITE} />}
      <rect x={490} y={100} width={100} height={100} rx={22} {...line} {...draw(inOut(prog(t, 2.4, 3)))} />
      <circle cx={G_BRAND[0]} cy={G_BRAND[1]} r={24} {...line} strokeWidth={3} {...draw(inOut(prog(t, 2.6, 3)))} transform={`rotate(-90 ${pt(G_BRAND)})`} />
      <path d="M540 126A24 24 0 0 1 564 150" {...line} stroke={SKY} strokeOpacity={1} strokeWidth={7} {...draw(prog(t, 3, 3.3))} />
      <circle cx={G_BRAND[0]} cy={G_BRAND[1]} r={10 * back(prog(t, 2.8, 3.1))} fill={WHITE} />
      <line x1={490} y1={232} x2={580} y2={232} {...line} strokeWidth={8} {...draw(prog(t, 3.1, 3.4))} />
      <line x1={490} y1={256} x2={550} y2={256} {...hair} {...draw(prog(t, 3.3, 3.5))} />
      {[WHITE, SKY, ""].map((fill, i) => (
        <circle key={i} cx={502 + i * 38} cy={292} r={12 * back(prog(t, 3.3 + i * 0.1, 3.6 + i * 0.1))} {...(fill ? { fill } : hair)} />
      ))}

      {/* Kampagnensteuerung: the offer goes out on search, video and e-mail */}
      {G_CHANNELS.map((y, i) => (
        <path key={y} d={`M590 150C640 150 640 ${y} 690 ${y}`} {...hair} {...draw(inOut(prog(t, 3.6 + i * 0.15, 4.2 + i * 0.15)))} />
      ))}
      {G_CHANNELS.map((y, i) => (
        <g key={y} transform={`translate(730 ${y}) scale(${back(prog(t, 3.9 + i * 0.15, 4.3 + i * 0.15)).toFixed(3)})`} {...line} fill={NODE}>
          {G_ICONS[i]}
        </g>
      ))}
      {t > 4.3 &&
        G_CHANNELS.flatMap((y, i) =>
          [0, 1].map((k) => {
            const u = ((t - 4.3) * 0.6 + k / 2 + i * 0.2) % 1;
            const [x, py] = cubic([590, 150], [640, 150], [640, y], [690, y], u);
            return <circle key={`${i}-${k}`} cx={x} cy={py} r={6} fill={WHITE} opacity={prog(t, 4.3, 4.6) * Math.sin(Math.PI * u)} />;
          })
        )}

      {/* Personalisierte Inhalte: one piece of content per channel */}
      {G_CHANNELS.map((y, i) => {
        const s = 4.8 + i * 0.3;
        return (
          <g key={y}>
            <line x1={770} y1={y} x2={800} y2={y} {...hair} {...draw(prog(t, s - 0.1, s + 0.1))} />
            <rect x={800} y={y - 40} width={110} height={80} rx={8} {...line} strokeWidth={3} {...draw(inOut(prog(t, s, s + 0.5)))} />
            <g opacity={prog(t, s + 0.3, s + 0.6)}>
              <rect x={810} y={y - 30} width={42} height={34} rx={4} {...hair} strokeWidth={2.5} />
              <path d={`M814 ${y}l11 -11l8 8l6 -5l9 8`} {...hair} strokeWidth={2.5} />
              <circle cx={843} cy={y - 22} r={4} fill={WHITE} />
            </g>
            <path d={`M862 ${y - 22}H898M862 ${y - 10}H886M810 ${y + 18}H898M810 ${y + 30}H868`} {...hair} strokeWidth={2.5} {...draw(prog(t, s + 0.4, s + 0.9))} />
          </g>
        );
      })}

      {/* Leadgenerierung: the channels fill the funnel, the right leads come out as customers */}
      <path d="M960 110H1200M960 110L1060 290V330M1200 110L1100 290V330" {...line} strokeWidth={3} {...draw(inOut(prog(t, 5.9, 6.6)))} />
      <text x={1116} y={324} {...label} opacity={prog(t, 6.4, 6.8)}>
        {leads} Leads
      </text>
      {G_LEADS.map(({ start, from, rim, won }, i) => {
        const e = t - start;
        if (e < 0 || e > (won >= 0 ? 1.7 : 1.2)) return null;
        const { at, o } = leadAt(e, from, rim, won);
        return <circle key={i} cx={at[0]} cy={at[1]} r={7} fill={WHITE} opacity={o} />;
      })}
      {G_WON.map((i, k) => {
        const s = back(prog(t, G_LEADS[i].start + 1.7, G_LEADS[i].start + 2));
        return s > 0 ? <Person key={k} at={gSlot(k)} s={s} /> : null;
      })}

      {/* Follow-ups & CRM: customers come back and bring others */}
      <ellipse cx={G_LOOP.cx} cy={G_LOOP.cy} rx={G_LOOP.rx} ry={G_LOOP.ry} {...hair} {...draw(inOut(prog(t, 9.8, 10.5)))} />
      <path d={`M${G_LOOP.cx + G_LOOP.rx - 9} ${G_LOOP.cy - 7}l9 11l9 -11`} {...hair} opacity={prog(t, 10.4, 10.7)} />
      {[0, 1].map((k) => {
        const theta = (t - 10) * 1.4 + k * Math.PI;
        return <circle key={k} cx={G_LOOP.cx + G_LOOP.rx * Math.cos(theta)} cy={G_LOOP.cy + G_LOOP.ry * Math.sin(theta)} r={6} fill={WHITE} opacity={prog(t, 10.4, 10.7)} />;
      })}
      {G_REFERRERS.map((k, j) => {
        const start = 10.2 + j * 0.35;
        const ping = prog(t, start, start + 0.6);
        const p = prog(t, start + 0.3, start + 1);
        if (ping <= 0) return null;
        const from = gSlot(k);
        const to = gSlot(4 + j);
        return (
          <g key={j}>
            {ping < 1 && <circle cx={from[0]} cy={from[1] - 12} r={10 + 24 * out(ping)} {...hair} strokeOpacity={0.9 * (1 - ping)} />}
            {p > 0 && <Person at={quad(from, [(from[0] + to[0]) / 2, 350], to, inOut(p))} color={SKY} s={lerp(0.6, 1, p)} opacity={prog(t, start + 0.3, start + 0.5)} />}
          </g>
        );
      })}
    </g>
  );
}

/** The scene registry, keyed by the service ids in SERVICES.items. */
export const SCENES: Record<SceneId, Scene> = {
  agents: {
    loop: 12,
    still: 10.2,
    draw: agents,
    steps: [
      [0, 2, "Aufgaben definieren"],
      [2, 3.6, "Daten anbinden"],
      [3.6, 5, "KI-Agenten"],
      [5, 7, "Workflows automatisieren"],
      [7, 8.8, "Systeme verbinden"],
      [8.8, 12, "Prozesse übernehmen"],
    ],
  },
  chat: {
    loop: 12,
    still: 9.4,
    draw: chat,
    steps: [
      [0, 2.2, "Website-Chat"],
      [2.2, 4.2, "Anfrage-Erkennung"],
      [4.2, 6.2, "Antwort-Workflows"],
      [6.2, 8.2, "Lead-Qualifizierung"],
      [8.2, 10, "Übergabe an Mitarbeiter"],
      [10, 12, "Rund um die Uhr"],
    ],
  },
  calls: {
    loop: 12,
    still: 10.8,
    draw: calls,
    steps: [
      [0, 2, "Eingehende Anrufe"],
      [2, 4.2, "Sprachassistent"],
      [4.2, 6.2, "Lead-Qualifizierung"],
      [6.2, 8.4, "Terminvereinbarung"],
      [8.4, 10, "Weiterleitung"],
      [10, 12, "Follow-ups"],
    ],
  },
  marketing: {
    loop: 13,
    still: 11.9,
    draw: marketing,
    steps: [
      [0, 2.2, "Zielgruppenanalyse"],
      [2.2, 3.6, "Positionierung"],
      [3.6, 4.8, "Kampagnensteuerung"],
      [4.8, 6.2, "Personalisierte Inhalte"],
      [6.2, 9.8, "Leadgenerierung"],
      [9.8, 13, "Follow-ups & CRM"],
    ],
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
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
}

/**
 * Plays one scene in a loop. The clock runs only while at least a fifth of the drawing is on screen, stops while
 * the drawing is leaving an AnimatePresence, and never starts for reduced motion (the scene's still frame shows).
 * The rest of the page is told about the drawing through callbacks, so the drawing re-renders alone.
 */
export function ServiceAnimation({
  id,
  label: name,
  className,
  onStep,
  onLoopEnd,
  progress,
}: {
  id: SceneId;
  /** Accessible name. Leave it out when the steps are listed next to the drawing: it is then hidden from assistive tech. */
  label?: string;
  className?: string;
  /** The index of the step on screen, whenever it changes. */
  onStep?: (index: number) => void;
  /** Called at the end of every loop. Return true when the caller moves on: the drawing then holds its last frame. */
  onLoopEnd?: () => boolean;
  /** Receives the loop's progress (0 to 1) every frame, without a re-render. */
  progress?: MotionValue<number>;
}) {
  const scene = SCENES[id];
  const svg = useRef<SVGSVGElement>(null);
  const [clock, setClock] = useState(0);
  const reduced = usePrefersReducedMotion();
  const present = useIsPresent();
  const reportStep = useEffectEvent((index: number) => onStep?.(index));
  const reportProgress = useEffectEvent((p: number) => progress?.set(p));
  const endLoop = useEffectEvent(() => onLoopEnd?.() ?? false);

  useEffect(() => {
    const el = svg.current;
    if (!el || reduced || !present) return;
    const { loop, steps } = scene;
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let step = -1;
    let held = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // About 60 renders a second is plenty for line drawings, also on 120 and 144 Hz screens.
      if (last && now - last < 12) return;
      if (last) elapsed += Math.min(0.1, (now - last) / 1000);
      last = now;
      if (elapsed >= loop) {
        if (endLoop()) {
          held = true;
          cancelAnimationFrame(raf);
          setClock(loop - 0.001);
          return;
        }
        elapsed %= loop;
      }
      setClock(elapsed);
      reportProgress(elapsed / loop);
      const index = steps.findIndex(([a, b]) => elapsed >= a && elapsed < b);
      if (index !== step) {
        step = index;
        reportStep(index);
      }
    };
    const io = new IntersectionObserver(
      (entries) => {
        cancelAnimationFrame(raf);
        last = 0;
        // A batch can hold several records for the drawing; the last one is its current state.
        if (entries[entries.length - 1].isIntersecting && !held) raf = requestAnimationFrame(tick);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [scene, reduced, present]);

  const t = reduced ? scene.still : clock;
  return (
    <svg
      ref={svg}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      className={cn("block h-auto w-full select-none", className)}
      {...(name ? { role: "img", "aria-label": name } : { "aria-hidden": true })}
    >
      {scene.draw(t)}
    </svg>
  );
}
