import { CalendarDays, Contact, ListChecks, Mail, type LucideIcon } from "lucide-react";
import { type Box, CheckBadge, Comet, flash, ink, Lines, Mark, Panel, Port, rise, type Scene, SKY, Text, Well, Wire } from "./kit";

/*
  KI-Agenten & Workflows: a workflow canvas in the manner of n8n or Make. An e-mail triggers the agent, which hands
  the work on to three connected tools. One run per loop: a light travels the wires, each node lights up in turn and
  takes a check when it is done; then the canvas settles back.
*/

const LOOP = 11;
const B = {
  mail: 0.5,
  mailDone: 1.0,
  wire: [1.0, 1.9] as const,
  agent: 1.9,
  agentDone: 3.4,
  tools: [3.4, 3.75, 4.1],
  travel: 0.95,
  settle: 0.35,
  reset: [9.6, 10.4] as const,
};

const TOOLS: { name: string; icon: LucideIcon }[] = [
  { name: "GoHighLevel", icon: Contact },
  { name: "Google Calendar", icon: CalendarDays },
  { name: "ClickUp", icon: ListChecks },
];

function run(t: number) {
  const keep = 1 - rise(t, B.reset[0], B.reset[1]);
  return {
    mail: { lit: flash(t, B.mail) * keep, done: rise(t, B.mailDone, B.mailDone + 0.3) * keep },
    wire: { p: (t - B.wire[0]) / (B.wire[1] - B.wire[0]), done: rise(t, B.wire[1] - 0.15, B.wire[1] + 0.3) * keep },
    agent: {
      lit: flash(t, B.agent, 0.55) * keep,
      thinking: rise(t, B.agent, B.agent + 0.25) * (1 - rise(t, B.agentDone - 0.15, B.agentDone + 0.15)),
      done: rise(t, B.agentDone, B.agentDone + 0.3) * keep,
    },
    tools: B.tools.map((start) => {
      const end = start + B.travel;
      return {
        p: (t - start) / B.travel,
        wire: rise(t, end - 0.15, end + 0.3) * keep,
        lit: flash(t, end) * keep,
        done: rise(t, end + B.settle, end + B.settle + 0.3) * keep,
      };
    }),
  };
}

type Size = { well: number; glyph: number; font: number; pad: number; gap: number; badge: number; r: number };
const WIDE_SIZE: Size = { well: 40, glyph: 20, font: 19, pad: 12, gap: 14, badge: 24, r: 16 };
const PHONE_SIZE: Size = { well: 26, glyph: 15, font: 13, pad: 7, gap: 8, badge: 18, r: 12 };

/** A canvas node: a glyph in its well and the node's name; a check on its corner once its step is done. */
function Node({ box, icon, name, lit, done, size }: { box: Box; icon: LucideIcon; name: string; lit: number; done: number; size: Size }) {
  return (
    <>
      <Panel {...box} r={size.r} lit={lit}>
        <div className="flex h-full items-center" style={{ paddingLeft: size.pad, gap: size.gap }}>
          <Well icon={icon} size={size.well} glyph={size.glyph} lit={lit} r={size.r - 4} />
          <span className="leading-none font-medium whitespace-nowrap" style={{ fontSize: size.font, color: ink(0.92) }}>
            {name}
          </span>
        </div>
      </Panel>
      <CheckBadge cx={box.x + box.w - 4} cy={box.y + 4} d={size.badge} on={done} />
    </>
  );
}

/** A small ring that turns while the agent works. */
function Spinner({ d, angle, on }: { d: number; angle: number; on: number }) {
  if (on <= 0.01) return null;
  const r = d / 2 - 1.5;
  const c = 2 * Math.PI * r;
  return (
    <svg aria-hidden width={d} height={d} viewBox={`0 0 ${d} ${d}`} style={{ opacity: on, transform: `rotate(${angle}deg)`, mixBlendMode: "normal", flexShrink: 0 }}>
      <circle cx={d / 2} cy={d / 2} r={r} fill="none" stroke={ink(0.14)} strokeWidth={1.5} />
      <circle cx={d / 2} cy={d / 2} r={r} fill="none" stroke={SKY} strokeWidth={1.5} strokeLinecap="round" strokeDasharray={`${c * 0.28} ${c}`} />
    </svg>
  );
}

function Agent({ box, lit, thinking, done, size, mark, t }: { box: Box; lit: number; thinking: number; done: number; size: Size; mark: number; t: number }) {
  const wide = size === WIDE_SIZE;
  return (
    <>
      <Panel {...box} r={size.r + 2} lit={lit}>
        <div className="flex h-full items-center" style={{ paddingInline: wide ? 18 : 10, gap: wide ? 14 : 7 }}>
          <Mark h={mark} />
          <span className="flex-1 leading-none font-medium whitespace-nowrap" style={{ fontSize: size.font + 1, color: ink(0.95) }}>
            KI-Agent
          </span>
          <Spinner d={wide ? 22 : 14} angle={t * 400} on={thinking} />
        </div>
      </Panel>
      <CheckBadge cx={box.x + box.w - 4} cy={box.y + 4} d={size.badge} on={done} />
    </>
  );
}

/* Desktop: the trigger and the agent on the line through the middle, the tools fanned out on the right, the two
   ends grouped as on a canvas ("Prozesse", "Systeme"). */
const WIDE = {
  mail: { x: 88, y: 208, w: 216, h: 64 },
  agent: { x: 500, y: 188, w: 280, h: 104 },
  tools: [100, 208, 316].map((y) => ({ x: 980, y, w: 236, h: 64 })),
};
const WIDE_IN = `M${WIDE.mail.x + WIDE.mail.w} 240H${WIDE.agent.x}`;
const WIDE_OUT = WIDE.tools.map((b) => {
  const [x0, x1, y] = [WIDE.agent.x + WIDE.agent.w, b.x, b.y + b.h / 2];
  const mid = (x0 + x1) / 2;
  return `M${x0} 240C${mid} 240 ${mid} ${y} ${x1} ${y}`;
});

function wide(t: number) {
  const s = run(t);
  return (
    <>
      {/* The canvas groups. */}
      <div className="absolute rounded-[22px]" style={{ left: 64, top: 152, width: 264, height: 144, boxShadow: `inset 0 0 0 1px ${ink(0.07)}` }} />
      <div className="absolute rounded-[22px]" style={{ left: 956, top: 50, width: 284, height: 354, boxShadow: `inset 0 0 0 1px ${ink(0.07)}` }} />
      <Text x={88} y={178} size={17}>
        Prozesse
      </Text>
      <Text x={980} y={76} size={17}>
        Systeme
      </Text>

      <Lines w={1280} h={480}>
        <Wire d={WIDE_IN} done={s.wire.done} />
        {WIDE_OUT.map((d, i) => (
          <Wire key={d} d={d} done={s.tools[i].wire} />
        ))}
        <Comet d={WIDE_IN} p={s.wire.p} />
        {WIDE_OUT.map((d, i) => (
          <Comet key={d} d={d} p={s.tools[i].p} />
        ))}
      </Lines>

      <Node box={WIDE.mail} icon={Mail} name="E-Mail" lit={s.mail.lit} done={s.mail.done} size={WIDE_SIZE} />
      <Agent box={WIDE.agent} lit={s.agent.lit} thinking={s.agent.thinking} done={s.agent.done} size={WIDE_SIZE} mark={30} t={t} />
      {TOOLS.map((tool, i) => (
        <Node key={tool.name} box={WIDE.tools[i]} icon={tool.icon} name={tool.name} lit={s.tools[i].lit} done={s.tools[i].done} size={WIDE_SIZE} />
      ))}

      {/* Ports sit over the panel rims. */}
      <Lines w={1280} h={480}>
        <Port cx={WIDE.mail.x + WIDE.mail.w} cy={240} on={s.mail.done} />
        <Port cx={WIDE.agent.x} cy={240} on={s.wire.done} />
        <Port cx={WIDE.agent.x + WIDE.agent.w} cy={240} on={s.agent.done} />
        {WIDE.tools.map((b, i) => (
          <Port key={b.y} cx={b.x} cy={b.y + b.h / 2} on={s.tools[i].wire} />
        ))}
      </Lines>
    </>
  );
}

/* Phone: the trigger above the agent on the left, the three tools stacked on the right. */
const PHONE = {
  mail: { x: 6, y: 14, w: 138, h: 40 },
  agent: { x: 6, y: 84, w: 138, h: 52 },
  tools: [14, 90, 166].map((y) => ({ x: 176, y, w: 158, h: 40 })),
};
const P_MID = PHONE.mail.x + PHONE.mail.w / 2;
const PHONE_IN = `M${P_MID} ${PHONE.mail.y + PHONE.mail.h}V${PHONE.agent.y}`;
const PHONE_OUT = PHONE.tools.map((b) => {
  const [x0, x1, y] = [PHONE.agent.x + PHONE.agent.w, b.x, b.y + b.h / 2];
  const mid = (x0 + x1) / 2;
  return `M${x0} 110C${mid} 110 ${mid} ${y} ${x1} ${y}`;
});

function phone(t: number) {
  const s = run(t);
  return (
    <>
      <Lines w={340} h={220}>
        <Wire d={PHONE_IN} done={s.wire.done} width={1} />
        {PHONE_OUT.map((d, i) => (
          <Wire key={d} d={d} done={s.tools[i].wire} width={1} />
        ))}
        <Comet d={PHONE_IN} p={s.wire.p} width={1.5} />
        {PHONE_OUT.map((d, i) => (
          <Comet key={d} d={d} p={s.tools[i].p} width={1.5} />
        ))}
      </Lines>
      <Node box={PHONE.mail} icon={Mail} name="E-Mail" lit={s.mail.lit} done={s.mail.done} size={PHONE_SIZE} />
      <Agent box={PHONE.agent} lit={s.agent.lit} thinking={s.agent.thinking} done={s.agent.done} size={PHONE_SIZE} mark={18} t={t} />
      {TOOLS.map((tool, i) => (
        <Node key={tool.name} box={PHONE.tools[i]} icon={tool.icon} name={tool.name} lit={s.tools[i].lit} done={s.tools[i].done} size={PHONE_SIZE} />
      ))}
      <Lines w={340} h={220}>
        <Port cx={P_MID} cy={PHONE.mail.y + PHONE.mail.h} on={s.mail.done} r={3.5} />
        <Port cx={P_MID} cy={PHONE.agent.y} on={s.wire.done} r={3.5} />
        <Port cx={PHONE.agent.x + PHONE.agent.w} cy={110} on={s.agent.done} r={3.5} />
        {PHONE.tools.map((b, i) => (
          <Port key={b.y} cx={b.x} cy={b.y + b.h / 2} on={s.tools[i].wire} r={3.5} />
        ))}
      </Lines>
    </>
  );
}

export const AGENTS: Scene = {
  loop: LOOP,
  still: 6.4,
  wide: { w: 1280, h: 480, draw: wide },
  phone: { w: 340, h: 220, draw: phone },
};
