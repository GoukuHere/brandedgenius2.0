import { Check } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Comet, flash, Glyph, ink, INK, keepCompounds, Lines, Mark, NAVY, Panel, Port, rise, ROYAL, type Scene, SKY, sky, Text, Wire } from "./kit";

/*
  KI-Chatbots: a chat widget qualifying a lead. The bot greets, the visitor taps a quick reply, the bot asks one
  question, the visitor taps again, the bot proposes the analysis appointment, and the qualified lead leaves the
  widget for lead qualification. On desktop the three channels the bot serves run into the widget from the left.
*/

/** Every word of the conversation, in one place. Drafts: the client still approves these lines. */
export const CHAT_SCRIPT = {
  brand: "Branded Genius",
  greeting: "Willkommen bei Branded Genius. Worum geht es?",
  topics: ["Website", "Support", "Kundenservice"],
  /** The quick reply the visitor taps (an index into topics). */
  topic: 2,
  question: "Wie viele Anfragen erhalten Sie pro Woche?",
  volumes: ["unter 100", "100 bis 500", "über 500"],
  volume: 1,
  closing: "Danke. Ich schlage Ihnen einen Termin für die KI-Potenzialanalyse vor.",
  lead: "Lead qualifiziert",
  /** Where the lead goes (desktop), and the channels running in (desktop). */
  destination: "Lead-Qualifizierung",
  channels: ["Website", "Support", "Kundenservice"],
} as const;

const LOOP = 14;
const B = {
  type1: 0.4,
  bot1: 1.3,
  chips1: 1.9,
  tap1: 3.1,
  me1: 3.5,
  type2: 4.2,
  bot2: 5.1,
  chips2: 5.7,
  tap2: 6.9,
  me2: 7.3,
  type3: 8.0,
  bot3: 8.9,
  lead: 9.8,
  travel: [10.1, 11.1] as const,
  reset: [12.6, 13.4] as const,
};

type Size = {
  font: number;
  chip: number;
  chipH: number;
  pad: string;
  max: number;
  gap: number;
  dot: number;
  r: number;
};
const WIDE_SIZE: Size = { font: 17, chip: 16, chipH: 36, pad: "10px 15px", max: 272, gap: 10, dot: 7, r: 16 };
const PHONE_SIZE: Size = { font: 13, chip: 12.5, chipH: 28, pad: "7px 11px", max: 236, gap: 8, dot: 5, r: 14 };

/** A row that opens its own height (0 to 1) as it enters, pushing the conversation up. */
function Row({ open, side, children, gap }: { open: number; side: "bot" | "me"; children: ReactNode; gap: number }) {
  if (open <= 0.001) return null;
  return (
    <div style={{ display: "grid", gridTemplateRows: `${open}fr`, opacity: Math.min(1, open * 1.4) }}>
      <div style={{ minHeight: 0, overflow: "hidden" }}>
        <div
          className="flex"
          style={{ paddingTop: gap, justifyContent: side === "me" ? "flex-end" : "flex-start", transform: `translateY(${(1 - open) * 10}px)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, size, children }: { side: "bot" | "me"; size: Size; children: ReactNode }) {
  const me = side === "me";
  const style: CSSProperties = {
    maxWidth: size.max,
    padding: size.pad,
    fontSize: size.font,
    lineHeight: 1.4,
    borderRadius: size.r,
    color: me ? "#fff" : ink(0.92),
    background: me ? ROYAL : ink(0.06),
    boxShadow: me ? `inset 0 0 0 1px ${sky(0.3)}` : `inset 0 0 0 1px ${ink(0.1)}`,
  };
  if (me) style.borderBottomRightRadius = 6;
  else style.borderBottomLeftRadius = 6;
  return <div style={style}>{children}</div>;
}

function Typing({ t, size }: { t: number; size: Size }) {
  return (
    <Bubble side="bot" size={size}>
      <div className="flex items-center" style={{ gap: size.dot - 1, height: size.font * 1.4 }}>
        {[0, 1, 2].map((k) => (
          <span
            key={k}
            className="block rounded-full"
            style={{ width: size.dot, height: size.dot, background: INK, opacity: 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (t * 1.5 - k * 0.2))) }}
          />
        ))}
      </div>
    </Bubble>
  );
}

/** Quick replies: the tapped one fills sky, the others fade as the reply is sent. */
function Chips({ options, pick, tap, leave, t, size }: { options: readonly string[]; pick: number; tap: number; leave: number; t: number; size: Size }) {
  const pressed = rise(t, tap, tap + 0.2);
  const away = rise(t, leave - 0.1, leave + 0.2);
  return (
    <div className="flex flex-wrap justify-end" style={{ gap: size.gap - 4 }}>
      {options.map((text, i) => {
        const chosen = i === pick;
        const on = chosen ? pressed : 0;
        return (
          <span
            key={text}
            className="flex items-center whitespace-nowrap"
            style={{
              height: size.chipH,
              paddingInline: size.chipH * 0.35,
              borderRadius: 12,
              fontSize: size.chip,
              color: on > 0.5 ? NAVY : ink(0.9),
              background: on > 0.01 ? sky(on) : "transparent",
              boxShadow: `inset 0 0 0 1px ${on > 0.01 ? SKY : sky(0.45)}`,
              opacity: chosen ? 1 : 1 - away,
              transform: chosen ? `scale(${1 - 0.05 * Math.sin(Math.PI * pressed)})` : undefined,
            }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
}

function LeadCard({ size, wide }: { size: Size; wide: boolean }) {
  const d = wide ? 22 : 18;
  return (
    <div
      className="flex items-center whitespace-nowrap"
      style={{
        gap: wide ? 10 : 8,
        height: wide ? 48 : 36,
        paddingInline: wide ? 14 : 10,
        borderRadius: 14,
        fontSize: size.font,
        fontWeight: 500,
        color: ink(0.95),
        background: `linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.03)), #0b2149`,
        boxShadow: `inset 0 0 0 1px ${sky(0.7)}, 0 0 26px -10px ${sky(0.6)}`,
      }}
    >
      <span className="grid place-items-center rounded-full" style={{ width: d, height: d, background: SKY }}>
        <Glyph icon={Check} size={Math.round(d * 0.62)} color={NAVY} style={{ strokeWidth: 2 }} />
      </span>
      {CHAT_SCRIPT.lead}
    </div>
  );
}

/** The conversation at time t, oldest first; bottom-anchored, so new rows push the old ones up and out. */
function conversation(t: number, size: Size, wide: boolean) {
  const S = CHAT_SCRIPT;
  const enter = (at: number) => rise(t, at, at + 0.45);
  const between = (from: number, to: number) => rise(t, from, from + 0.3) * (1 - rise(t, to - 0.05, to + 0.2));
  return (
    <>
      <Row open={enter(B.bot1)} side="bot" gap={size.gap}>
        <Bubble side="bot" size={size}>
          {S.greeting}
        </Bubble>
      </Row>
      <Row open={between(B.chips1, B.me1)} side="me" gap={size.gap}>
        <Chips options={S.topics} pick={S.topic} tap={B.tap1} leave={B.me1} t={t} size={size} />
      </Row>
      <Row open={enter(B.me1)} side="me" gap={size.gap}>
        <Bubble side="me" size={size}>
          {S.topics[S.topic]}
        </Bubble>
      </Row>
      <Row open={enter(B.bot2)} side="bot" gap={size.gap}>
        <Bubble side="bot" size={size}>
          {S.question}
        </Bubble>
      </Row>
      <Row open={between(B.chips2, B.me2)} side="me" gap={size.gap}>
        <Chips options={S.volumes} pick={S.volume} tap={B.tap2} leave={B.me2} t={t} size={size} />
      </Row>
      <Row open={enter(B.me2)} side="me" gap={size.gap}>
        <Bubble side="me" size={size}>
          {S.volumes[S.volume]}
        </Bubble>
      </Row>
      <Row open={enter(B.bot3)} side="bot" gap={size.gap}>
        <Bubble side="bot" size={size}>
          {keepCompounds(S.closing)}
        </Bubble>
      </Row>
      {/* On phones the lead card closes the conversation; on desktop it leaves the widget instead. */}
      {wide ? null : (
        <Row open={enter(B.lead)} side="bot" gap={size.gap + 2}>
          <LeadCard size={size} wide={false} />
        </Row>
      )}
      {/* The bot types before each of its lines; the dots sit below the newest row. */}
      {[
        [B.type1, B.bot1],
        [B.type2, B.bot2],
        [B.type3, B.bot3],
      ].map(([from, to]) => (
        <Row key={from} open={between(from, to)} side="bot" gap={size.gap}>
          <Typing t={t} size={size} />
        </Row>
      ))}
    </>
  );
}

/** The widget: header with the mark, the name and the online dot; the conversation under it. */
function Widget({ x, y, w, h, t, wide }: { x: number; y: number; w: number; h: number; t: number; wide: boolean }) {
  const size = wide ? WIDE_SIZE : PHONE_SIZE;
  const head = wide ? 64 : 44;
  const keep = 1 - rise(t, B.reset[0], B.reset[1]);
  return (
    <Panel x={x} y={y} w={w} h={h} r={wide ? 24 : 18}>
      <div className="absolute inset-x-0 top-0 flex items-center" style={{ height: head, paddingInline: wide ? 20 : 14, gap: wide ? 12 : 9, boxShadow: `inset 0 -1px 0 ${ink(0.08)}` }}>
        <Mark h={wide ? 24 : 16} />
        <span className="leading-none font-medium whitespace-nowrap" style={{ fontSize: wide ? 17 : 13.5, color: ink(0.95) }}>
          {CHAT_SCRIPT.brand}
        </span>
        <span className="block rounded-full" style={{ width: wide ? 8 : 6, height: wide ? 8 : 6, background: SKY, boxShadow: `0 0 0 ${wide ? 3 : 2.5}px ${sky(0.18)}` }} />
      </div>
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col justify-end overflow-hidden"
        style={{
          top: head,
          padding: wide ? "0 18px 18px" : "0 12px 12px",
          opacity: keep,
          maskImage: `linear-gradient(180deg, transparent 0, #000 ${wide ? 40 : 34}px)`,
          WebkitMaskImage: `linear-gradient(180deg, transparent 0, #000 ${wide ? 40 : 34}px)`,
        }}
      >
        {conversation(t, size, wide)}
      </div>
    </Panel>
  );
}

/* Desktop: the channels on the left, the widget in the middle, the lead leaving to the right. */
const W = { x: 456, y: 14, w: 368, h: 452 };
const ROWS = [150, 240, 330];
const ENTRY = [196, 240, 284];
const IN = ROWS.map((y, i) => `M96 ${y}H260C370 ${y} 380 ${ENTRY[i]} ${W.x} ${ENTRY[i]}`);
const OUT = `M${W.x + W.w} 240H1196`;
const CARD = { w: 206, from: W.x + W.w - 206, to: 964 };
const LANDING = CARD.to + CARD.w / 2;

function wide(t: number) {
  const keep = 1 - rise(t, B.reset[0], B.reset[1]);
  const go = rise(t, B.travel[0], B.travel[1]);
  const landed = rise(t, B.travel[1] - 0.1, B.travel[1] + 0.3) * keep;
  const lead = rise(t, B.lead, B.lead + 0.3) * keep;
  return (
    <>
      <Lines w={1280} h={480}>
        {IN.map((d, i) => (
          <Wire key={d} d={d} done={i === CHAT_SCRIPT.topic ? flash(t, B.tap1 + 0.7, 0) : 0} />
        ))}
        <Wire d={OUT} done={landed} />
        <Comet d={IN[CHAT_SCRIPT.topic]} p={(t - B.tap1) / 0.8} />
        <Comet d={OUT} p={(t - B.travel[0]) / (B.travel[1] - B.travel[0])} />
        {ROWS.map((y, i) => (
          <Port key={y} cx={96} cy={y} r={4} on={i === CHAT_SCRIPT.topic ? flash(t, B.tap1, 0.0) : 0} />
        ))}
        <Port cx={1196} cy={240} r={4.5} on={landed} />
      </Lines>
      {CHAT_SCRIPT.channels.map((text, i) => (
        <Text key={text} x={96} y={ROWS[i] - 26} size={17} color={i === CHAT_SCRIPT.topic ? ink(0.6 + 0.35 * flash(t, B.tap1, 0)) : ink(0.6)}>
          {text}
        </Text>
      ))}
      <Text x={LANDING} y={294} size={17} align="middle" color={ink(0.6 + 0.35 * landed)}>
        {CHAT_SCRIPT.destination}
      </Text>

      {/* The lead card slides out from under the widget along the line. */}
      {lead > 0.01 ? (
        <div className="absolute" style={{ left: CARD.from + (CARD.to - CARD.from) * go, top: 240 - 24, opacity: lead }}>
          <LeadCard size={WIDE_SIZE} wide />
        </div>
      ) : null}

      <Widget {...W} t={t} wide />
    </>
  );
}

function phone(t: number) {
  return <Widget x={4} y={4} w={332} h={228} t={t} wide={false} />;
}

export const CHAT: Scene = {
  loop: LOOP,
  still: 11.8,
  wide: { w: 1280, h: 480, draw: wide },
  phone: { w: 340, h: 236, draw: phone },
};
