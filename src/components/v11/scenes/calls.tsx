import { CalendarDays, Check, PhoneIncoming, User } from "lucide-react";
import { Comet, Glyph, hash, ink, INK, Lines, Mark, NAVY, Panel, Port, rise, type Scene, SKY, sky, Text, tint, Wire } from "./kit";

/*
  KI-Callbots: an incoming call. The phone rings, the AI answers and the timer runs; the live waveform scrolls with
  the conversation, the caller in off-white and the AI in sky taking turns. In its second turn the AI looks through
  the week and books a slot, which fills sky with a check under "Terminvereinbarung".
*/

const LOOP = 12;
const B = {
  answer: 0.9,
  turns: [
    [1.1, 2.6, 0],
    [2.9, 4.6, 1],
    [4.9, 6.0, 0],
    [6.3, 8.4, 1],
    [8.7, 9.5, 0],
    [9.8, 10.7, 1],
  ] as const,
  scan: 6.5,
  step: 0.25,
  wire: [7.2, 7.7] as const,
  book: 7.7,
  reset: [10.9, 11.7] as const,
};
const DAYS = ["Mo", "Di", "Mi", "Do", "Fr"];
const TIMES = ["09:00", "10:00", "11:00"];
/** The cells the AI checks, then the one it books (Do, 10:00). */
const SCAN: [number, number][] = [
  [0, 0],
  [1, 1],
  [2, 0],
];
const BOOKED: [number, number] = [3, 1];

// Syllables per turn: when (seconds into the turn) and how loud.
const SYLLABLES = B.turns.map(([a, b], n) =>
  Array.from({ length: Math.floor((b - a) / 0.2) }, (_, i) => ({ at: a + 0.1 + i * 0.2 + 0.05 * hash(n * 31 + i), loud: 0.45 + 0.55 * hash(n * 17 + i * 7) }))
);

/** Who speaks at time tau (0 caller, 1 AI, -1 nobody) and how loud (0 to 1). */
function voice(tau: number) {
  const n = B.turns.findIndex(([a, b]) => tau >= a && tau < b);
  if (n < 0) return { who: -1, amp: 0 };
  const [a, b, who] = B.turns[n];
  const edge = Math.min(1, (tau - a) / 0.12, (b - tau) / 0.12);
  const amp = SYLLABLES[n].reduce((m, s) => Math.max(m, s.loud * Math.exp(-(((tau - s.at) / 0.085) ** 2))), 0);
  return { who, amp: Math.min(1, amp * edge) };
}

const timer = (t: number) => {
  const secs = Math.max(0, Math.floor(Math.min(t, B.reset[0]) - B.answer));
  return `00:${String(secs).padStart(2, "0")}`;
};

/** The scrolling waveform: one bar per sample, newest on the right, coloured by who spoke. */
function Wave({ t, x0, x1, cy, max, pitch, bar, dt }: { t: number; x0: number; x1: number; cy: number; max: number; pitch: number; bar: number; dt: number }) {
  const n = Math.ceil((x1 - x0) / pitch) + 1;
  const newest = Math.floor(t / dt);
  const keep = 1 - rise(t, B.reset[0], B.reset[1]);
  const bars = [];
  for (let i = 0; i < n; i++) {
    const k = newest - i;
    const tau = k * dt;
    const x = x1 - ((t - tau) / dt) * pitch;
    if (x < x0 - bar) break;
    const live = tau >= B.answer;
    const { who, amp } = live ? voice(tau) : { who: -1, amp: 0 };
    const h = Math.max(bar, bar + (max - bar) * amp * (0.55 + 0.45 * hash(k)));
    const edge = Math.min(1, (x - x0) / (pitch * 6));
    const color = who === 1 ? SKY : INK;
    const alpha = who < 0 ? 0.22 : who === 1 ? 0.95 : 0.8;
    bars.push(<rect key={k} x={x - bar / 2} y={cy - h / 2} width={bar} height={h} rx={bar / 2} fill={color} fillOpacity={alpha * edge * keep} />);
  }
  return <>{bars}</>;
}

type CardSize = { avatar: number; glyph: number; label: number; timer: number; gap: number; pad: number };

/** The call's head: the caller (a person glyph, no face), "Eingehend" and the running timer. */
function CallHead({ t, size, x, y }: { t: number; size: CardSize; x: number; y: number }) {
  const ringing = t < B.answer;
  const live = t >= B.answer && t < B.reset[0];
  const d = size.avatar;
  return (
    <div className="absolute flex items-center" style={{ left: x, top: y, gap: size.gap }}>
      <div className="relative grid shrink-0 place-items-center rounded-full" style={{ width: d, height: d, background: ink(0.06), boxShadow: `inset 0 0 0 1px ${ink(0.16)}` }}>
        <Glyph icon={User} size={size.glyph} color={ink(0.85)} />
        {ringing
          ? [0, 0.45].map((offset) => {
              const p = ((t + offset) % 0.9) / 0.9;
              return (
                <span
                  key={offset}
                  className="absolute rounded-full"
                  style={{ inset: -p * d * 0.32, boxShadow: `inset 0 0 0 1px ${SKY}`, opacity: (1 - p) * 0.8 }}
                />
              );
            })
          : null}
      </div>
      <div className="flex flex-col" style={{ gap: size.label * 0.45 }}>
        <span className="flex items-center leading-none whitespace-nowrap" style={{ gap: size.label * 0.4, fontSize: size.label, color: ink(0.62) }}>
          <Glyph icon={PhoneIncoming} size={Math.round(size.label * 1.05)} color={ringing || live ? SKY : ink(0.62)} />
          Eingehend
        </span>
        <span className="leading-none font-medium" style={{ fontSize: size.timer, color: ink(0.95), fontVariantNumeric: "tabular-nums", letterSpacing: "0.01em" }}>
          {timer(t)}
        </span>
      </div>
    </div>
  );
}

/** A live dot: blinks softly while the call runs. */
function LiveDot({ cx, cy, d, t }: { cx: number; cy: number; d: number; t: number }) {
  const live = t >= B.answer && t < B.reset[0];
  return (
    <span
      className="absolute rounded-full"
      style={{ left: cx - d / 2, top: cy - d / 2, width: d, height: d, background: live ? SKY : ink(0.25), opacity: live ? 0.55 + 0.45 * Math.cos(t * 4) : 1, boxShadow: live ? `0 0 0 ${d * 0.45}px ${sky(0.16)}` : undefined }}
    />
  );
}

type GridSize = { x: number; y: number; w: number; timeW: number; head: number; rowH: number; cellH: number; font: number; check: number; r: number };

/** The week: day columns, time rows; the AI checks a few cells and books one. */
function Week({ t, g }: { t: number; g: GridSize }) {
  const keep = 1 - rise(t, B.reset[0], B.reset[1]);
  const colW = (g.w - g.timeW) / DAYS.length;
  const cell = (c: number, r: number) => ({ left: g.x + g.timeW + c * colW + 3, top: g.y + g.head + r * g.rowH + (g.rowH - g.cellH) / 2, width: colW - 6, height: g.cellH });
  const scanning = t >= B.scan && t < B.book;
  const at = Math.min(SCAN.length, Math.floor((t - B.scan) / B.step));
  const target = at >= SCAN.length ? BOOKED : SCAN[Math.max(0, at)];
  const booked = rise(t, B.book, B.book + 0.35) * keep;
  const check = rise(t, B.book + 0.2, B.book + 0.5) * keep;
  return (
    <>
      {DAYS.map((d, c) => (
        <Text key={d} x={g.x + g.timeW + (c + 0.5) * colW} y={g.y + g.head * 0.45} size={g.font} align="middle" color={ink(0.55)}>
          {d}
        </Text>
      ))}
      {TIMES.map((time, r) => (
        <Text key={time} x={g.x} y={g.y + g.head + (r + 0.5) * g.rowH} size={g.font} color={ink(0.5)} style={{ fontVariantNumeric: "tabular-nums" }}>
          {time}
        </Text>
      ))}
      {TIMES.flatMap((_, r) =>
        DAYS.map((__, c) => {
          const isBooked = c === BOOKED[0] && r === BOOKED[1];
          const looking = scanning && c === target[0] && r === target[1];
          return (
            <div
              key={`${c}-${r}`}
              className="absolute grid place-items-center"
              style={{
                ...cell(c, r),
                borderRadius: g.r,
                background: isBooked && booked > 0.01 ? sky(booked) : "transparent",
                boxShadow: `inset 0 0 0 1px ${looking ? sky(0.9) : isBooked && booked > 0.01 ? SKY : ink(0.1)}`,
              }}
            >
              {isBooked && check > 0.01 ? <Glyph icon={Check} size={g.check} color={NAVY} style={{ opacity: check, strokeWidth: 2, transform: `scale(${0.6 + 0.4 * check})` }} /> : null}
            </div>
          );
        })
      )}
    </>
  );
}

/* Desktop: the call card on the left, the week on the right, a wire between them. */
const CARD = { x: 96, y: 40, w: 520, h: 400 };
const CAL = { x: 704, y: 40, w: 480, h: 400 };
const WIRE = `M${CARD.x + CARD.w} 240H${CAL.x}`;

function wide(t: number) {
  const keep = 1 - rise(t, B.reset[0], B.reset[1]);
  const booked = rise(t, B.book, B.book + 0.35) * keep;
  const speaking = t >= B.answer ? voice(t).who : -1;
  return (
    <>
      <Lines w={1280} h={480}>
        <Wire d={WIRE} done={booked} />
        <Comet d={WIRE} p={(t - B.wire[0]) / (B.wire[1] - B.wire[0])} />
      </Lines>

      <Panel {...CARD} r={24} lit={t >= B.answer ? 0.35 * keep : 0}>
        <svg aria-hidden width={CARD.w} height={CARD.h} className="absolute inset-0" style={{ mixBlendMode: "normal" }}>
          <Wave t={t} x0={28} x1={CARD.w - 28} cy={226} max={150} pitch={8} bar={4} dt={0.09} />
        </svg>
        {/* Who is speaking: the caller on the left, the AI (the mark) on the right. */}
        <div className="absolute flex items-center justify-between" style={{ left: 28, right: 28, bottom: 26 }}>
          <span className="grid place-items-center rounded-full" style={{ width: 34, height: 34, boxShadow: `inset 0 0 0 1px ${speaking === 0 ? ink(0.85) : ink(0.14)}` }}>
            <Glyph icon={User} size={16} color={speaking === 0 ? INK : ink(0.5)} />
          </span>
          <span className="grid place-items-center rounded-full" style={{ width: 34, height: 34, boxShadow: `inset 0 0 0 1px ${speaking === 1 ? SKY : ink(0.14)}` }}>
            <Mark h={12} style={{ opacity: speaking === 1 ? 1 : 0.6 }} />
          </span>
        </div>
      </Panel>
      <CallHead t={t} x={CARD.x + 28} y={CARD.y + 28} size={{ avatar: 64, glyph: 28, label: 17, timer: 30, gap: 18, pad: 28 }} />
      <LiveDot cx={CARD.x + CARD.w - 40} cy={CARD.y + 44} d={9} t={t} />

      <Panel {...CAL} r={24} lit={0.5 * booked}>
        <div className="absolute flex items-center" style={{ left: 28, top: 28, gap: 12 }}>
          <Glyph icon={CalendarDays} size={20} color={tint(booked)} />
          <span className="leading-none font-medium whitespace-nowrap" style={{ fontSize: 17, color: ink(0.75 + 0.2 * booked) }}>
            Terminvereinbarung
          </span>
        </div>
      </Panel>
      <Week t={t} g={{ x: CAL.x + 28, y: CAL.y + 78, w: CAL.w - 56, timeW: 72, head: 40, rowH: 86, cellH: 74, font: 17, check: 22, r: 12 }} />

      <Lines w={1280} h={480}>
        <Port cx={CARD.x + CARD.w} cy={240} on={booked} />
        <Port cx={CAL.x} cy={240} on={booked} />
      </Lines>
    </>
  );
}

/* Phone: the call card alone, the week under it. */
const P_CARD = { x: 4, y: 4, w: 332, h: 92 };
const P_CAL = { x: 4, y: 104, w: 332, h: 120 };
const P_WIRE = `M170 ${P_CARD.y + P_CARD.h}V${P_CAL.y}`;

function phone(t: number) {
  const keep = 1 - rise(t, B.reset[0], B.reset[1]);
  const booked = rise(t, B.book, B.book + 0.35) * keep;
  return (
    <>
      <Lines w={340} h={228}>
        <Wire d={P_WIRE} done={booked} width={1} />
        <Comet d={P_WIRE} p={(t - B.wire[0]) / (B.wire[1] - B.wire[0])} width={1.5} />
      </Lines>
      <Panel {...P_CARD} r={18} lit={t >= B.answer ? 0.35 * keep : 0}>
        <svg aria-hidden width={P_CARD.w} height={P_CARD.h} className="absolute inset-0" style={{ mixBlendMode: "normal" }}>
          <Wave t={t} x0={14} x1={P_CARD.w - 14} cy={70} max={26} pitch={6} bar={3} dt={0.08} />
        </svg>
      </Panel>
      <CallHead t={t} x={P_CARD.x + 14} y={P_CARD.y + 10} size={{ avatar: 34, glyph: 16, label: 12.5, timer: 17, gap: 11, pad: 14 }} />
      <LiveDot cx={P_CARD.x + P_CARD.w - 22} cy={P_CARD.y + 20} d={7} t={t} />
      <Panel {...P_CAL} r={18} lit={0.5 * booked}>
        <div className="absolute flex items-center" style={{ left: 14, top: 13, gap: 8 }}>
          <Glyph icon={CalendarDays} size={14} color={tint(booked)} />
          <span className="leading-none font-medium whitespace-nowrap" style={{ fontSize: 13, color: ink(0.75 + 0.2 * booked) }}>
            Terminvereinbarung
          </span>
        </div>
      </Panel>
      <Week t={t} g={{ x: P_CAL.x + 14, y: P_CAL.y + 34, w: P_CAL.w - 28, timeW: 44, head: 20, rowH: 20, cellH: 16, font: 12, check: 12, r: 6 }} />
    </>
  );
}

export const CALLS: Scene = {
  loop: LOOP,
  still: 8.1,
  wide: { w: 1280, h: 480, draw: wide },
  phone: { w: 340, h: 228, draw: phone },
};
