import { Globe, Mail, MessageCircle, Send, type LucideIcon } from "lucide-react";
import { CheckBadge, easeInOut, Glyph, ink, lerp, Lines, prog, rise, type Scene, SKY, sky, Text, tint } from "./kit";

/*
  KI-Marketing & Vertriebsautomatisierung: a CRM pipeline that runs itself. Leads, labelled by where they came from,
  enter Leadgenerierung and move on alone, all in step, one to a column: at Kommunikation a message goes out (a small
  send mark), at Follow-ups the follow-up is done (a check), and they land at the top of CRM, whose count goes up by
  one. Under the board, Conversion steps up each time a lead lands.
*/

const LOOP = 12;
const COLUMNS = ["Leadgenerierung", "Kommunikation", "Follow-ups", "CRM"];
const SOURCES: { name: string; icon: LucideIcon }[] = [
  { name: "Website", icon: Globe },
  { name: "E-Mail", icon: Mail },
  { name: "WhatsApp", icon: MessageCircle },
  { name: "Website", icon: Globe },
  { name: "E-Mail", icon: Mail },
];
/**
 * The board moves in steps, every `step` seconds from `first`: each lead moves on a column, all at once, and a new
 * lead enters Leadgenerierung just after the one before has left it.
 */
const B = { first: 0.5, step: 1.2, enter: 0.3, move: 0.5, reset: [10.8, 11.6] as const };

/** When lead i starts moving into column c (it enters column 0 a moment after its first step). */
const moveAt = (i: number, c: number) => B.first + (i + c) * B.step;
const enterAt = (i: number) => moveAt(i, 0) + B.enter;
const landedAt = (i: number) => moveAt(i, 3) + B.move;

type Lead = { col: number; from: number; p: number; moving: boolean; landed: boolean; seen: number; send: number; check: number };

/** Where each lead is at time t: the column it is in or moving into (with the move's progress p), and its marks. */
function leads(t: number): Lead[] {
  return SOURCES.map((_, i) => {
    let col = 0;
    let p = 1;
    for (let c = 1; c <= 3; c++) {
      if (t >= moveAt(i, c)) {
        col = c;
        p = easeInOut(prog(t, moveAt(i, c), moveAt(i, c) + B.move));
      }
    }
    const moving = col > 0 && p < 1;
    const arrive = (c: number) => moveAt(i, c) + B.move;
    return {
      col,
      from: col === 0 ? 0 : col - 1,
      p,
      moving,
      landed: col === 3 && !moving,
      seen: rise(t, enterAt(i), enterAt(i) + 0.4),
      send: rise(t, arrive(1), arrive(1) + 0.2),
      check: rise(t, arrive(2), arrive(2) + 0.2),
    };
  });
}

type Size = {
  colW: number;
  gap: number;
  x0: number;
  y0: number;
  colH: number;
  head: number;
  cardH: number;
  cardGap: number;
  font: number;
  head2: number;
  count: number;
  well: number;
  glyph: number;
  r: number;
  pad: number;
  badge: number;
};

function Card({ name, icon, send, check, lit, size }: { name: string; icon: LucideIcon; send: number; check: number; lit: number; size: Size }) {
  return (
    <div
      className="relative flex items-center"
      style={{
        width: size.colW - size.pad * 2,
        height: size.cardH,
        gap: size.pad * 0.8,
        paddingInline: size.pad * 0.75,
        borderRadius: 12,
        background: `linear-gradient(180deg, rgb(255 255 255 / 0.09), rgb(255 255 255 / 0.04)), #0c2149`,
        boxShadow: `inset 0 0 0 1px ${lit > 0.01 ? sky(0.2 + 0.6 * lit) : ink(0.14)}${lit > 0.01 ? `, 0 0 24px -10px ${sky(0.6 * lit)}` : ""}`,
      }}
    >
      <span className="grid shrink-0 place-items-center" style={{ width: size.well, height: size.well, borderRadius: size.well * 0.3, background: ink(0.06), boxShadow: `inset 0 0 0 1px ${ink(0.1)}` }}>
        <Glyph icon={icon} size={size.glyph} color={tint(lit)} />
      </span>
      <span className="flex-1 leading-none font-medium whitespace-nowrap" style={{ fontSize: size.font, color: ink(0.92) }}>
        {name}
      </span>
      {send > 0.01 && check <= 0.01 ? (
        <span style={{ opacity: send, transform: `translateX(${(1 - send) * -6}px)` }}>
          <Glyph icon={Send} size={size.glyph} color={SKY} />
        </span>
      ) : null}
      {check > 0.01 ? (
        <span className="relative shrink-0" style={{ width: size.badge, height: size.badge }}>
          <CheckBadge cx={size.badge / 2} cy={size.badge / 2} d={size.badge} on={check} />
        </span>
      ) : null}
    </div>
  );
}

/** The board: four columns with their counts and the leads on it, shifted left by `pan` stage pixels (phones). */
function Board({ t, size, pan = 0, width }: { t: number; size: Size; pan?: number; width: number }) {
  const keep = 1 - rise(t, B.reset[0], B.reset[1]);
  // The counts leave with the leads in the reset and come back (at zero) as the next story starts.
  const shown = Math.max(keep, t < B.reset[0] ? rise(t, 0, 0.3) : 0);
  const all = leads(t);
  const colX = (c: number) => size.x0 + c * (size.colW + size.gap) - pan;
  const slotY = (k: number) => size.y0 + size.head + k * (size.cardH + size.cardGap);

  // CRM: the landed leads, newest first; they move down a slot as the next one sets off, so the top slot is free.
  const landed = all.map((l, i) => (l.landed ? i : -1)).filter((i) => i >= 0).reverse();
  const incoming = all.findIndex((l) => l.moving && l.col === 3);
  const makeRoom = incoming < 0 ? 0 : easeInOut(prog(t, moveAt(incoming, 3), moveAt(incoming, 3) + 0.4));
  const slots = Math.floor((size.colH - size.head) / (size.cardH + size.cardGap));
  const crmLit = Math.max(0, ...landed.map((i) => 1 - prog(t, landedAt(i), landedAt(i) + 1.2))) * keep;

  // A lead counts in the column it is in, or more than halfway into; CRM counts the leads that have landed.
  const count = (c: number) => (c === 3 ? landed.length : all.filter((l) => l.seen > 0.5 && !l.landed && (l.moving && l.p < 0.5 ? l.from : l.col) === c).length);

  return (
    <div className="absolute top-0 left-0 overflow-hidden" style={{ width, height: size.y0 + size.colH + 1 }}>
      {COLUMNS.map((name, c) => {
        const lit = c === 3 ? crmLit : 0;
        return (
          <div
            key={name}
            className="absolute"
            style={{
              left: colX(c),
              top: size.y0,
              width: size.colW,
              height: size.colH,
              borderRadius: size.r,
              background: `linear-gradient(180deg, rgb(255 255 255 / 0.05), rgb(255 255 255 / 0.015)), #081a3d`,
              boxShadow: `inset 0 0 0 1px ${lit > 0.01 ? sky(0.15 + 0.5 * lit) : ink(0.1)}`,
            }}
          >
            <div className="flex items-center justify-between" style={{ height: size.head - size.pad * 0.5, paddingInline: size.pad }}>
              <span className="leading-none font-medium whitespace-nowrap" style={{ fontSize: size.head2, color: ink(0.85) }}>
                {name}
              </span>
              <span
                className="grid place-items-center leading-none"
                style={{
                  minWidth: size.badge + 4,
                  height: size.badge,
                  paddingInline: 6,
                  borderRadius: 12,
                  fontSize: size.count,
                  fontVariantNumeric: "tabular-nums",
                  color: lit > 0.01 ? SKY : ink(0.62),
                  background: lit > 0.01 ? sky(0.06 + 0.12 * lit) : ink(0.06),
                  boxShadow: `inset 0 0 0 1px ${lit > 0.01 ? sky(0.1 + 0.5 * lit) : ink(0.1)}`,
                }}
              >
                <span style={{ opacity: shown }}>{count(c)}</span>
              </span>
            </div>
          </div>
        );
      })}

      {/* The leads on their way. */}
      {all.map((l, i) => {
        if (l.seen <= 0.01 || l.landed) return null;
        const x = lerp(colX(l.from), colX(l.col), l.moving ? l.p : 1) + size.pad;
        const y = slotY(0) - (1 - l.seen) * 10;
        const fresh = 1 - prog(t, enterAt(i), enterAt(i) + 1);
        return (
          <div key={i} className="absolute" style={{ left: x, top: y, opacity: l.seen * keep, zIndex: l.moving ? 2 : 1 }}>
            <Card name={SOURCES[i].name} icon={SOURCES[i].icon} send={l.send} check={l.check} lit={l.moving ? 1 : 0.6 * fresh} size={size} />
          </div>
        );
      })}
      {landed.map((i, k) => {
        const slot = k + makeRoom;
        return (
          <div key={`crm-${i}`} className="absolute" style={{ left: colX(3) + size.pad, top: slotY(slot), opacity: keep * (1 - prog(slot, slots - 1, slots - 0.4)) }}>
            <Card name={SOURCES[i].name} icon={SOURCES[i].icon} send={1} check={1} lit={0.8 * (1 - prog(t, landedAt(i), landedAt(i) + 1.2))} size={size} />
          </div>
        );
      })}
    </div>
  );
}

/** Conversion: a thin line drawn along the story's time, a step up each time a lead lands; its head is sky. */
function Conversion({ t, x0, x1, base, step, labelX, labelY, font, w, h }: { t: number; x0: number; x1: number; base: number; step: number; labelX: number; labelY: number; font: number; w: number; h: number }) {
  const keep = 1 - rise(t, B.reset[0], B.reset[1]);
  const end = B.reset[0];
  const xAt = (time: number) => x0 + (x1 - x0) * Math.min(1, time / end);
  const head = Math.min(t, end);
  let d = `M${x0} ${base}`;
  let level = 0;
  for (let i = 0; i < SOURCES.length && landedAt(i) <= head; i++) {
    d += `H${xAt(landedAt(i)).toFixed(1)}V${base - (level + 1) * step}`;
    level++;
  }
  d += `H${xAt(head).toFixed(1)}`;
  return (
    <>
      <Text x={labelX} y={labelY} size={font} color={ink(0.62)}>
        Conversion
      </Text>
      <Lines w={w} h={h}>
        <path d={`M${x0} ${base}H${x1}`} fill="none" stroke={ink(0.16)} strokeWidth={1} strokeDasharray="2 5" />
        <path d={d} fill="none" stroke={SKY} strokeOpacity={0.85 * keep} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={xAt(head)} cy={base - level * step} r={3.5} fill={SKY} fillOpacity={keep} />
      </Lines>
    </>
  );
}

const WIDE_SIZE: Size = { colW: 278, gap: 18, x0: 57, y0: 16, colH: 264, head: 60, cardH: 56, cardGap: 10, font: 17, head2: 17, count: 17, well: 32, glyph: 17, r: 18, pad: 12, badge: 26 };

function wide(t: number) {
  return (
    <>
      <Board t={t} size={WIDE_SIZE} width={1280} />
      <Conversion t={t} x0={57} x1={1223} base={456} step={22} labelX={57} labelY={322} font={17} w={1280} h={480} />
    </>
  );
}

/* Phone: two columns in view; the board pans along with the first lead, from Leadgenerierung to CRM. */
const PHONE_SIZE: Size = { colW: 158, gap: 12, x0: 6, y0: 2, colH: 120, head: 34, cardH: 36, cardGap: 6, font: 13, head2: 12.5, count: 12, well: 24, glyph: 14, r: 14, pad: 8, badge: 19 };
const PAN = PHONE_SIZE.colW + PHONE_SIZE.gap;

function phone(t: number) {
  const step = (c: number) => easeInOut(prog(t, moveAt(0, c), moveAt(0, c) + B.move));
  const pan = (step(1) + step(2)) * (1 - easeInOut(prog(t, B.reset[0], B.reset[1] + 0.3)));
  return (
    <>
      <Board t={t} size={PHONE_SIZE} pan={pan * PAN} width={340} />
      <Conversion t={t} x0={98} x1={332} base={160} step={4} labelX={6} labelY={148} font={12.5} w={340} h={166} />
    </>
  );
}

export const MARKETING: Scene = {
  loop: LOOP,
  // Every column holds a lead, the first has landed in CRM, and no card is moving.
  still: 4.9,
  wide: { w: 1280, h: 480, draw: wide },
  phone: { w: 340, h: 166, draw: phone },
};
