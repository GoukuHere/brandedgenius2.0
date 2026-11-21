import type { CSSProperties, ReactNode } from "react";

/*
  The Use Cases deck's infographics (round 5, the client's Loom of 2026-11-18, 4:16 to V3 0:26): "the picture behind
  lead generation, you need to put an infographic ... sales automatization, put kind of CRM ... customer service ...
  chatbot infographic ... back office ... automate process ... CRM dashboard with the follow-up ... an error or
  something like that". One small drawing per card, in the free band between the card's label and its case, in the
  site's interface style (navy panels, hairline rims, sky for what the system does), German labels:
    Marketing      qualified leads per week, rising, with the trend line drawn over the bars
    Vertrieb       a CRM pipeline (Neu, Qualifiziert, Termin, Abschluss); one deal moves through to the close
    Kundenservice  a customer's question, the bot typing, the bot's answer
    Backoffice     a document's way: erfasst, geprüft, freigegeben, archiviert, each ticked in turn
    CRM            the day's follow-ups with their statuses; one send failed, the system flags it and sends again
  Telefonie keeps a picture (cases.tsx).

  The band is wide and short (about 500 x 100 on desktop, 300 x 60 on phones, less where the card's headline takes
  two lines), so each drawing is composed for it: an SVG that keeps its proportions inside the band, a full
  composition (480 x 100) and a slimmer one with fewer parts (300 x 56), so the words stay 11 to 13px. The band picks
  by its own size (a container query in v11.css): the full one where it fits, the slim one on phones and wherever the
  band is too short for the full one, none in a band too short for either. At
  rest each shows its finished state (the cards behind the front one show it); when its card comes to the front
  (`play`) it plays once: transform and opacity animations only (v11.css, .ca-*), nothing under reduced motion.
*/

const INK = (a: number) => `rgb(241 241 238 / ${a})`;
const SKY = "#69bff8";
const PANEL = "#0a1d44";
const AMBER = "#f2b84b";

export const CASE_ART_AREAS = ["Marketing", "Vertrieb", "Kundenservice", "Backoffice", "CRM"] as const;
export type CaseArtArea = (typeof CASE_ART_AREAS)[number];
export const hasCaseArt = (area: string): area is CaseArtArea => (CASE_ART_AREAS as readonly string[]).includes(area);

const delay = (i: number, base = 0, step = 70) => ({ "--d": `${base + i * step}ms` }) as CSSProperties;
const W = 480;
const H = 100;
const PW = 300;
const PH = 56;

function Art({ desk, phone, play }: { desk: ReactNode; phone: ReactNode; play: boolean }) {
  return (
    <div aria-hidden data-play={play || undefined} className="v11-case-art">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="ca-desk h-full w-full">
        {desk}
      </svg>
      <svg viewBox={`0 0 ${PW} ${PH}`} preserveAspectRatio="xMidYMid meet" className="ca-phone h-full w-full">
        {phone}
      </svg>
    </div>
  );
}

const Label = ({ x, y, size, children, color = INK(0.62), anchor = "start" }: { x: number; y: number; size: number; children: ReactNode; color?: string; anchor?: "start" | "middle" | "end" }) => (
  <text x={x} y={y} fontSize={size} fill={color} textAnchor={anchor}>
    {children}
  </text>
);

/* ---------- Marketing: qualified leads per week ---------- */
const LEADS = [22, 26, 24, 31, 35, 33, 41, 46, 44, 53, 61, 68];
function Bars({ w, top, h, gap, count, big }: { w: number; top: number; h: number; gap: number; count: number; big: boolean }) {
  const data = LEADS.slice(LEADS.length - count);
  const bw = (w - gap * (count - 1)) / count;
  const max = Math.max(...data);
  const pts = data.map((v, i) => [i * (bw + gap) + bw / 2, top + h - (v / max) * h]);
  const last = pts[pts.length - 1];
  return (
    <>
      {data.map((v, i) => {
        const bh = (v / max) * h;
        const recent = i >= count - 3;
        return <rect key={i} className="ca-bar" style={delay(i)} x={i * (bw + gap)} y={top + h - bh} width={bw} height={bh} rx={3} fill={recent ? SKY : INK(0.16)} fillOpacity={recent ? 0.85 : 1} />;
      })}
      <polyline className="ca-draw" pathLength={1} points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={SKY} strokeWidth={big ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle className="ca-pop" style={delay(0, 1000)} cx={last[0]} cy={last[1]} r={big ? 4.5 : 3.5} fill={SKY} />
    </>
  );
}
function Marketing({ play }: { play: boolean }) {
  return (
    <Art
      play={play}
      desk={
        <>
          <Label x={0} y={13} size={13}>
            Qualifizierte Leads pro Woche
          </Label>
          <Label x={W} y={13} size={13} color={SKY} anchor="end">
            90 Tage
          </Label>
          <Bars w={W} top={26} h={72} gap={8} count={12} big />
        </>
      }
      phone={<Bars w={PW} top={6} h={48} gap={6} count={10} big={false} />}
    />
  );
}

/* ---------- Vertrieb: a CRM pipeline ---------- */
const STAGES = ["Neu", "Qualifiziert", "Termin", "Abschluss"];
function Pipeline({ w, gap, font, head, card, filled }: { w: number; gap: number; font: number; head: number; card: number; filled: number[] }) {
  const cw = (w - gap * 3) / 4;
  const step = card + 6;
  const at = (c: number) => ({ x: c * (cw + gap), y: head + filled[c] * step });
  const end = at(3);
  // The moving deal rests in "Abschluss"; while playing it starts in "Neu" and moves one column at a time, each time
  // into that column's free slot.
  const path = Object.assign({}, ...[0, 1, 2].map((c) => ({ [`--x${c}`]: `${at(c).x - end.x}px`, [`--y${c}`]: `${at(c).y - end.y}px` }))) as CSSProperties;
  return (
    <>
      {STAGES.map((s, c) => (
        <g key={s}>
          <Label x={c * (cw + gap)} y={font} size={font} color={c === 3 ? SKY : INK(0.62)}>
            {s}
          </Label>
          {Array.from({ length: filled[c] }, (_, r) => (
            <rect key={r} x={c * (cw + gap)} y={head + r * step} width={cw} height={card} rx={5} fill={PANEL} stroke={INK(0.14)} />
          ))}
        </g>
      ))}
      <g className="ca-deal" style={path}>
        <rect x={end.x} y={end.y} width={cw} height={card} rx={5} fill={SKY} fillOpacity={0.18} stroke={SKY} />
        <circle cx={end.x + card * 0.42} cy={end.y + card / 2} r={card * 0.13} fill={SKY} />
        <rect x={end.x + card * 0.8} y={end.y + card / 2 - 2} width={cw * 0.45} height={4} rx={2} fill={SKY} fillOpacity={0.7} />
      </g>
    </>
  );
}
function Vertrieb({ play }: { play: boolean }) {
  return (
    <Art
      play={play}
      desk={<Pipeline w={W} gap={12} font={13} head={24} card={30} filled={[1, 1, 0, 0]} />}
      phone={<Pipeline w={PW} gap={8} font={11} head={18} card={16} filled={[1, 1, 0, 0]} />}
    />
  );
}

/* ---------- Kundenservice: the chatbot answers ---------- */
function Chat({ w, font, h, gap, q, a, qw, aw }: { w: number; font: number; h: number; gap: number; q: string; a: string; qw: number; aw: number }) {
  const ty = (y: number) => y + h / 2 + font * 0.36;
  return (
    <>
      <g className="ca-rise" style={delay(0, 100)}>
        <rect x={0} y={0} width={qw} height={h} rx={h / 2.4} fill={INK(0.08)} stroke={INK(0.14)} />
        <text x={h * 0.45} y={ty(0)} fontSize={font} fill={INK(0.85)}>
          {q}
        </text>
      </g>
      {/* The bot typing, then its answer in its place. */}
      <g className="ca-typing" style={delay(0, 700)}>
        <rect x={w - h * 1.9} y={h + gap} width={h * 1.9} height={h} rx={h / 2.4} fill={SKY} fillOpacity={0.14} stroke={SKY} strokeOpacity={0.5} />
        {[0, 1, 2].map((i) => (
          <circle key={i} className="ca-dot" style={delay(i, 700, 160)} cx={w - h * 1.32 + i * h * 0.36} cy={h + gap + h / 2} r={h * 0.075} fill={SKY} />
        ))}
      </g>
      <g className="ca-answer" style={delay(0, 1700)}>
        <rect x={w - aw} y={h + gap} width={aw} height={h} rx={h / 2.4} fill={SKY} fillOpacity={0.16} stroke={SKY} strokeOpacity={0.6} />
        <text x={w - aw + h * 0.45} y={ty(h + gap)} fontSize={font} fill={INK(0.95)}>
          {a}
        </text>
      </g>
    </>
  );
}
function Kundenservice({ play }: { play: boolean }) {
  return (
    <Art
      play={play}
      desk={
        <>
          <Chat w={W} font={13} h={32} gap={10} q="Wann kommt meine Bestellung?" a="Morgen bis 12 Uhr. Hier ist Ihr Sendungslink." qw={226} aw={308} />
          <Label x={0} y={96} size={12} color={INK(0.5)}>
            KI-Chatbot, rund um die Uhr
          </Label>
        </>
      }
      phone={<Chat w={PW} font={11} h={24} gap={7} q="Wann kommt meine Bestellung?" a="Morgen bis 12 Uhr. Ihr Sendungslink." qw={180} aw={214} />}
    />
  );
}

/* ---------- Backoffice: a document's way through the process ---------- */
const STEPS = ["Beleg erfasst", "Daten geprüft", "Freigegeben", "Archiviert"];
function Steps({ w, cy, r, font, labelY }: { w: number; cy: number; r: number; font: number; labelY: number }) {
  const xs = STEPS.map((_, i) => r + (i * (w - 2 * r)) / (STEPS.length - 1));
  return (
    <>
      <line x1={xs[0]} y1={cy} x2={xs[3]} y2={cy} stroke={INK(0.16)} strokeWidth={2} />
      <line className="ca-fill" x1={xs[0]} y1={cy} x2={xs[3]} y2={cy} stroke={SKY} strokeWidth={2} pathLength={1} />
      {STEPS.map((s, i) => (
        <g key={s}>
          <circle cx={xs[i]} cy={cy} r={r} fill={PANEL} stroke={SKY} strokeOpacity={0.6} />
          <g className="ca-pop" style={delay(i, 250, 330)}>
            <circle cx={xs[i]} cy={cy} r={r - 3.5} fill={SKY} />
            <path d={`M${xs[i] - r * 0.34} ${cy + 0.5}l${r * 0.25} ${r * 0.25} ${r * 0.45} -${r * 0.5}`} fill="none" stroke={PANEL} strokeWidth={r > 12 ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <Label x={xs[i] + (i === 0 ? -r : i === STEPS.length - 1 ? r : 0)} y={labelY} size={font} color={INK(0.82)} anchor={i === 0 ? "start" : i === STEPS.length - 1 ? "end" : "middle"}>
            {s}
          </Label>
        </g>
      ))}
    </>
  );
}
function Backoffice({ play }: { play: boolean }) {
  return (
    <Art
      play={play}
      desk={
        <>
          <Label x={0} y={13} size={13}>
            Eingangsrechnung
          </Label>
          <Label x={W} y={13} size={13} color={SKY} anchor="end">
            automatisch
          </Label>
          <Steps w={W} cy={50} r={16} font={13} labelY={93} />
        </>
      }
      phone={<Steps w={PW} cy={14} r={12} font={11} labelY={50} />}
    />
  );
}

/* ---------- CRM: the day's follow-ups; one failed send caught and sent again ---------- */
type Row = { lead: string; via: string; status: string; tone: "sky" | "due" | "error" };
const ROWS: Row[] = [
  { lead: "#1042", via: "E-Mail", status: "Gesendet", tone: "sky" },
  { lead: "#1043", via: "WhatsApp", status: "Heute fällig", tone: "due" },
  { lead: "#1044", via: "E-Mail", status: "Fehler", tone: "error" },
  { lead: "#1045", via: "WhatsApp", status: "Beantwortet", tone: "sky" },
];
function Pill({ x, y, w, h, font, status, tone }: { x: number; y: number; w: number; h: number; font: number; status: string; tone: Row["tone"] }) {
  const color = tone === "error" ? AMBER : tone === "due" ? INK(0.88) : SKY;
  return (
    <g>
      <rect x={x - w} y={y} width={w} height={h} rx={h / 2} fill={tone === "due" ? INK(1) : color} fillOpacity={tone === "due" ? 0.06 : 0.14} stroke={color} strokeOpacity={0.6} />
      <text x={x - w / 2} y={y + h / 2 + font * 0.36} fontSize={font} fill={color} textAnchor="middle">
        {status}
      </text>
    </g>
  );
}
/* Two columns of two: each tile a lead, its channel and its status. */
function FollowUps({ w, top, tileH, gap, font, pillW, via }: { w: number; top: number; tileH: number; gap: number; font: number; pillW: number; via: boolean }) {
  const tw = (w - gap) / 2;
  return (
    <>
      {ROWS.map((row, i) => {
        const x = (i % 2) * (tw + gap);
        const y = top + Math.floor(i / 2) * (tileH + gap);
        const pill = { x: x + tw - 5, y: y + 5, w: pillW, h: tileH - 10, font };
        return (
          <g key={row.lead} className="ca-rise" style={delay(i, 100, 90)}>
            <rect x={x} y={y} width={tw} height={tileH} rx={8} fill={PANEL} stroke={row.tone === "error" ? AMBER : INK(0.14)} strokeOpacity={row.tone === "error" ? 0.45 : 1} />
            <text x={x + 10} y={y + tileH / 2 + font * 0.36} fontSize={font} fill={INK(0.9)}>
              {row.lead}
              {via && (
                <tspan fill={INK(0.5)} dx={8}>
                  {row.via}
                </tspan>
              )}
            </text>
            {row.tone === "error" ? (
              <>
                {/* The failed send, flagged, then caught and sent again: "Fehler" gives way to "Erneut gesendet". */}
                <g className="ca-error" style={delay(0, 900)}>
                  <Pill {...pill} status="Fehler" tone="error" />
                </g>
                <g className="ca-fixed" style={delay(0, 2200)}>
                  <Pill {...pill} status="Erneut gesendet" tone="sky" />
                </g>
              </>
            ) : (
              <Pill {...pill} status={row.status} tone={row.tone} />
            )}
          </g>
        );
      })}
    </>
  );
}
function Crm({ play }: { play: boolean }) {
  return (
    <Art
      play={play}
      desk={
        <>
          <Label x={0} y={13} size={13}>
            Follow-ups heute
          </Label>
          <FollowUps w={W} top={24} tileH={34} gap={8} font={12.5} pillW={110} via />
        </>
      }
      phone={<FollowUps w={PW} top={2} tileH={24} gap={6} font={10.5} pillW={84} via={false} />}
    />
  );
}

export function CaseArt({ area, play }: { area: CaseArtArea; play: boolean }) {
  if (area === "Marketing") return <Marketing play={play} />;
  if (area === "Vertrieb") return <Vertrieb play={play} />;
  if (area === "Kundenservice") return <Kundenservice play={play} />;
  if (area === "Backoffice") return <Backoffice play={play} />;
  return <Crm play={play} />;
}
