import { CalendarDays, Contact, ListChecks, Mail, Receipt, type LucideIcon } from "lucide-react";
import { type Box, CheckBadge, Comet, flash, ink, Lines, Mark, Panel, Port, rise, type Scene, sky, SKY, Text, Well, Wire } from "./kit";

/*
  KI-Agenten & Workflows: a workflow canvas in the manner of n8n or Make. An e-mail triggers the agent, which hands
  the work on to the connected systems, one after another. One run per loop: a light travels the wires, each block
  lights up in turn and takes a check when its step is done; then the canvas settles back.

  Round 5 (the client's Loom of 2026-11-18, 2:58 to 3:47): "Put CRM here ... on German ... project management tool
  ... finance tool ... better that workflow", and bigger blocks with a little more explanation. The systems are now
  four German categories (CRM, Kalender, Projektmanagement, and the new Finanz-Tool) in place of the brand names, the
  blocks are larger, each carries one short line of what happens there, and the run reaches the systems in that
  order: the contact is created, the appointment booked, the task opened, the invoice prepared.
*/

const LOOP = 12.5;
const B = {
  mail: 0.5,
  mailDone: 1.0,
  wire: [1.0, 1.8] as const,
  agent: 1.8,
  agentDone: 3.2,
  // The systems, one after another.
  tools: [3.2, 4.1, 5.0, 5.9],
  travel: 0.75,
  settle: 0.3,
  reset: [11.4, 12.2] as const,
};

type Step = { name: string; line: string; icon: LucideIcon };
const MAIL: Step = { name: "E-Mail", line: "Anfrage kommt an", icon: Mail };
const AGENT_LINE = "Liest und sortiert die Anfrage";
const TOOLS: Step[] = [
  { name: "CRM", line: "Kontakt angelegt", icon: Contact },
  { name: "Kalender", line: "Termin gebucht", icon: CalendarDays },
  { name: "Projektmanagement", line: "Aufgabe erstellt", icon: ListChecks },
  { name: "Finanz-Tool", line: "Rechnung vorbereitet", icon: Receipt },
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

type Size = { well: number; glyph: number; name: number; line: number; pad: number; gap: number; badge: number; r: number };
const WIDE_SIZE: Size = { well: 48, glyph: 24, name: 21, line: 16, pad: 16, gap: 16, badge: 26, r: 18 };
const PHONE_SIZE: Size = { well: 30, glyph: 16, name: 14, line: 12, pad: 9, gap: 10, badge: 18, r: 12 };

/**
 * A canvas block: a glyph in its well, the block's name and its line of what happens there (quiet until its step is
 * done, then bright); a check on its corner once done.
 */
function Node({ box, step, lit, done, size }: { box: Box; step: Step; lit: number; done: number; size: Size }) {
  return (
    <>
      <Panel {...box} r={size.r} lit={lit}>
        <div className="flex h-full items-center" style={{ paddingLeft: size.pad, paddingRight: size.pad, gap: size.gap }}>
          <Well icon={step.icon} size={size.well} glyph={size.glyph} lit={lit} r={size.r - 5} />
          <div className="min-w-0">
            <p className="leading-none font-medium whitespace-nowrap" style={{ fontSize: size.name, color: ink(0.95) }}>
              {step.name}
            </p>
            <p className="leading-none whitespace-nowrap" style={{ fontSize: size.line, marginTop: size.line * 0.5, color: done > 0.01 ? sky(0.55 + 0.45 * done) : ink(0.55) }}>
              {step.line}
            </p>
          </div>
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
        <div className="flex h-full items-center" style={{ paddingInline: wide ? 22 : 11, gap: wide ? 16 : 9 }}>
          <Mark h={mark} />
          <div className="min-w-0 flex-1">
            <p className="leading-none font-medium whitespace-nowrap" style={{ fontSize: size.name + 2, color: ink(0.97) }}>
              KI-Agent
            </p>
            <p className="leading-none whitespace-nowrap" style={{ fontSize: size.line, marginTop: size.line * 0.55, color: done > 0.01 ? sky(0.55 + 0.45 * done) : ink(0.55) }}>
              {AGENT_LINE}
            </p>
          </div>
          <Spinner d={wide ? 24 : 15} angle={t * 400} on={thinking} />
        </div>
      </Panel>
      <CheckBadge cx={box.x + box.w - 4} cy={box.y + 4} d={size.badge} on={done} />
    </>
  );
}

/* Desktop: the trigger and the agent on the line through the middle, the four systems stacked on the right in the
   order the run reaches them; the two ends grouped as on a canvas ("Prozess", "Systeme"). */
const MID = 240;
const WIDE = {
  mail: { x: 52, y: MID - 44, w: 268, h: 88 },
  agent: { x: 420, y: MID - 58, w: 352, h: 116 },
  tools: [34, 138, 242, 346].map((y) => ({ x: 912, y, w: 336, h: 84 })),
};
const WIDE_IN = `M${WIDE.mail.x + WIDE.mail.w} ${MID}H${WIDE.agent.x}`;
const WIDE_OUT = WIDE.tools.map((b) => {
  const [x0, x1, y] = [WIDE.agent.x + WIDE.agent.w, b.x, b.y + b.h / 2];
  const mid = (x0 + x1) / 2;
  return `M${x0} ${MID}C${mid} ${MID} ${mid} ${y} ${x1} ${y}`;
});

function wide(t: number) {
  const s = run(t);
  return (
    <>
      {/* The canvas groups. */}
      <div className="absolute rounded-[24px]" style={{ left: 32, top: 132, width: 308, height: 172, boxShadow: `inset 0 0 0 1px ${ink(0.07)}` }} />
      <Text x={52} y={160} size={16}>
        Prozess
      </Text>
      <Text x={1248} y={14} size={16} align="end">
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

      <Node box={WIDE.mail} step={MAIL} lit={s.mail.lit} done={s.mail.done} size={WIDE_SIZE} />
      <Agent box={WIDE.agent} lit={s.agent.lit} thinking={s.agent.thinking} done={s.agent.done} size={WIDE_SIZE} mark={34} t={t} />
      {TOOLS.map((tool, i) => (
        <Node key={tool.name} box={WIDE.tools[i]} step={tool} lit={s.tools[i].lit} done={s.tools[i].done} size={WIDE_SIZE} />
      ))}

      {/* Ports sit over the panel rims. */}
      <Lines w={1280} h={480}>
        <Port cx={WIDE.mail.x + WIDE.mail.w} cy={MID} on={s.mail.done} />
        <Port cx={WIDE.agent.x} cy={MID} on={s.wire.done} />
        <Port cx={WIDE.agent.x + WIDE.agent.w} cy={MID} on={s.agent.done} />
        {WIDE.tools.map((b, i) => (
          <Port key={b.y} cx={b.x} cy={b.y + b.h / 2} on={s.tools[i].wire} />
        ))}
      </Lines>
    </>
  );
}

/* Phone: the trigger above the agent, then the four systems down a spine on the left, in the order the run reaches
   them, each branching off it. */
/* Inset from the stage's edges, so the corner checks (radius 9) stay whole inside the plate. */
const PHONE = {
  mail: { x: 10, y: 16, w: 318, h: 54 },
  agent: { x: 10, y: 94, w: 318, h: 62 },
  tools: [184, 246, 308, 370].map((y) => ({ x: 44, y, w: 284, h: 50 })),
};
const SPINE_X = 26;
const P_IN = `M${SPINE_X} ${PHONE.mail.y + PHONE.mail.h}V${PHONE.agent.y}`;
const PHONE_OUT = PHONE.tools.map((b) => `M${SPINE_X} ${PHONE.agent.y + PHONE.agent.h}V${b.y + b.h / 2}H${b.x}`);

function phone(t: number) {
  const s = run(t);
  return (
    <>
      <Lines w={340} h={432}>
        <Wire d={P_IN} done={s.wire.done} width={1} />
        {PHONE_OUT.map((d, i) => (
          <Wire key={d} d={d} done={s.tools[i].wire} width={1} />
        ))}
        <Comet d={P_IN} p={s.wire.p} width={1.5} />
        {PHONE_OUT.map((d, i) => (
          <Comet key={d} d={d} p={s.tools[i].p} width={1.5} />
        ))}
      </Lines>
      <Node box={PHONE.mail} step={MAIL} lit={s.mail.lit} done={s.mail.done} size={PHONE_SIZE} />
      <Agent box={PHONE.agent} lit={s.agent.lit} thinking={s.agent.thinking} done={s.agent.done} size={PHONE_SIZE} mark={20} t={t} />
      {TOOLS.map((tool, i) => (
        <Node key={tool.name} box={PHONE.tools[i]} step={tool} lit={s.tools[i].lit} done={s.tools[i].done} size={PHONE_SIZE} />
      ))}
      <Lines w={340} h={432}>
        <Port cx={SPINE_X} cy={PHONE.mail.y + PHONE.mail.h} on={s.mail.done} r={3.5} />
        <Port cx={SPINE_X} cy={PHONE.agent.y} on={s.wire.done} r={3.5} />
        <Port cx={SPINE_X} cy={PHONE.agent.y + PHONE.agent.h} on={s.agent.done} r={3.5} />
        {PHONE.tools.map((b, i) => (
          <Port key={b.y} cx={b.x} cy={b.y + b.h / 2} on={s.tools[i].wire} r={3.5} />
        ))}
      </Lines>
    </>
  );
}

export const AGENTS: Scene = {
  loop: LOOP,
  still: 8,
  wide: { w: 1280, h: 480, draw: wide },
  phone: { w: 340, h: 432, draw: phone },
};
