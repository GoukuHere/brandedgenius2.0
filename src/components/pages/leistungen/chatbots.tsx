"use client";

import { ArrowUpRight, CalendarCheck, CalendarDays, CheckCheck, Headset, MessageCircle, RotateCcw, Wrench, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Section } from "@/components/system/primitives";
import type { Copy } from "@/content/copy";
import { useCopy } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { ServiceText, keepCompounds, useSeenOnce } from "./shared";

/*
  WhatsApp- & Telegram-Chatbots: his demo phone on the left, his text on the right. A real messenger screen in the
  site's navy, switchable between his two channels (the switch above the phone; each channel has its own header,
  wallpaper, bubbles and reply buttons, as the two apps do). The bot greets with his own opening line and offers his
  three quick replies. Tapping one plays a short answer made only of his words:
  - "Beratung anfragen": his bot's answer, then a card "Mit einem KI-Experten sprechen" that books the call.
  - "Termin buchen": his bot's question, then a small slot picker (weekdays and times only) that confirms with a check.
  - "Serviceanfrage": his bot's answer, then the system line "Automatische Übergabe an echte Mitarbeiter".
  The header carries his "Natürliche 24/7-Kundenkommunikation" as the bot's status line. No time stamps: a messenger
  sets them at 11px, under the site's 13px floor. Switching the channel or pressing reset starts the chat again (as
  his demo does).
  Round 5 (DE/EN): copy by language.
*/

type Reply = Copy["leistungen"]["CHATBOTS"]["phone"]["replies"][number];
type ReplyId = Reply["id"];

const REPLY_ICONS: Record<ReplyId, LucideIcon> = {
  consulting: MessageCircle,
  appointment: CalendarDays,
  service: Wrench,
};

type Item =
  | { id: number; kind: "typing" }
  | { id: number; kind: "bot"; text: string }
  | { id: number; kind: "user"; text: string }
  | { id: number; kind: "expert" }
  | { id: number; kind: "slots"; picked: string | null }
  | { id: number; kind: "booked"; slot: string }
  | { id: number; kind: "system"; text: string };

type Channel = 0 | 1;

export function ChatbotsSection() {
  const { CHATBOTS } = useCopy().leistungen;
  return (
    <Section id="chatbots">
      <Container>
        <div className="grid [&>*]:min-w-0 items-center gap-12 lg:grid-cols-12 lg:gap-x-10">
          <ServiceText
            className="lg:col-span-6 lg:col-start-7 lg:row-start-1"
            title={CHATBOTS.title}
            accent={CHATBOTS.accent}
            text={CHATBOTS.text}
            usesLabel={CHATBOTS.usesLabel}
            uses={CHATBOTS.uses}
            cta={CHATBOTS.cta}
          />
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1">
            <ChatDemo />
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ChatDemo() {
  const { CHATBOTS } = useCopy().leistungen;
  const P = CHATBOTS.phone;
  const box = useRef<HTMLDivElement>(null);
  const seen = useSeenOnce(box, 0.35);
  const timers = useRef<{ ids: number[]; next: number }>({ ids: [], next: 1 });

  const [channel, setChannel] = useState<Channel>(0);
  const [items, setItems] = useState<Item[]>([]);
  const [replies, setReplies] = useState(false);
  const [busy, setBusy] = useState(false);
  const [day, setDay] = useState<string>(P.days[0]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.ids.push(window.setTimeout(fn, ms));
  }, []);
  const uid = useCallback(() => {
    timers.current.next += 1;
    return timers.current.next;
  }, []);

  /** Adds a row, or swaps the typing dots for it. */
  const push = useCallback((item: Item) => setItems((list) => [...list.filter((it) => it.kind !== "typing"), item]), []);

  const start = useCallback(() => {
    timers.current.ids.forEach((id) => window.clearTimeout(id));
    timers.current.ids = [];
    setBusy(true);
    setReplies(false);
    setDay(P.days[0]);
    setItems([{ id: uid(), kind: "typing" }]);
    later(() => {
      push({ id: uid(), kind: "bot", text: P.greeting });
      setReplies(true);
      setBusy(false);
    }, 900);
  }, [later, push, uid, P]);

  // The chat opens the first time the phone comes into view.
  useEffect(() => {
    if (!seen) return undefined;
    const id = window.setTimeout(start, 250);
    return () => window.clearTimeout(id);
  }, [seen, start]);

  useEffect(() => {
    const list = timers.current;
    return () => list.ids.forEach((id) => window.clearTimeout(id));
  }, []);

  const choose = (reply: Reply) => {
    if (busy) return;
    setBusy(true);
    setReplies(false);
    push({ id: uid(), kind: "user", text: reply.user });
    later(() => push({ id: uid(), kind: "typing" }), 380);
    later(() => push({ id: uid(), kind: "bot", text: reply.reply }), 1400);
    if (reply.id === "consulting") {
      later(() => push({ id: uid(), kind: "expert" }), 2000);
      later(() => {
        setReplies(true);
        setBusy(false);
      }, 2500);
    } else if (reply.id === "appointment") {
      later(() => {
        push({ id: uid(), kind: "slots", picked: null });
        setBusy(false);
      }, 2000);
    } else {
      later(() => push({ id: uid(), kind: "system", text: P.handover }), 2100);
      later(() => {
        setReplies(true);
        setBusy(false);
      }, 2600);
    }
  };

  const pick = (slotsId: number, time: string) => {
    if (busy) return;
    const slot = `${day} · ${time}`;
    setBusy(true);
    setItems((list) => list.map((it) => (it.id === slotsId && it.kind === "slots" ? { ...it, picked: slot } : it)));
    push({ id: uid(), kind: "user", text: slot });
    later(() => push({ id: uid(), kind: "typing" }), 380);
    later(() => push({ id: uid(), kind: "booked", slot }), 1300);
    later(() => {
      setReplies(true);
      setBusy(false);
    }, 1800);
  };

  const switchTo = (next: Channel) => {
    if (next === channel) return;
    setChannel(next);
    start();
  };

  const tg = channel === 1;

  return (
    <div ref={box} className="flex flex-col items-center">
      {/* His two channels, and a fresh start. */}
      <div data-reveal="up" className="mb-5 flex items-center gap-2">
        <div role="radiogroup" aria-label={CHATBOTS.usesLabel} className="ls-switch">
          {P.channels.map((name, i) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={channel === i}
              onClick={() => switchTo(i as Channel)}
              className="ls-switch-option"
            >
              {name}
            </button>
          ))}
        </div>
        <button type="button" aria-label={P.reset} title={P.reset} onClick={start} className="ls-icon-btn">
          <RotateCcw aria-hidden strokeWidth={1.75} className="size-4" />
        </button>
      </div>

      <div data-reveal="up" data-rd="1" className="ls-phone" data-channel={tg ? "telegram" : "whatsapp"}>
        <div className="ls-phone-screen">
          <span aria-hidden className="ls-phone-island" />
          <div className={cn("ls-chat-head", tg && "flex-row-reverse")}>
            <span className="ls-chat-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element -- a small static vector mark; next/image adds nothing */}
              <img src="/brand/mark.svg" alt="" width={721} height={454} draggable={false} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] leading-tight font-medium text-white">{P.name}</span>
              <span className="mt-0.5 block text-[13px] leading-tight whitespace-nowrap text-sky/90">{P.status}</span>
            </span>
          </div>

          <div className="ls-chat-body" aria-live="polite">
            <div className="ls-chat-list">
              {items.map((item) => (
                <Row key={item.id} item={item} tg={tg} day={day} setDay={setDay} onPick={pick} busy={busy} />
              ))}
              {replies ? (
                <div className={cn("ls-replies", tg && "ls-replies-tg")}>
                  {P.replies.map((reply) => {
                    const Icon = REPLY_ICONS[reply.id];
                    return (
                      <button key={reply.id} type="button" onClick={() => choose(reply)} className="ls-reply">
                        <Icon aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
                        {reply.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  item,
  tg,
  day,
  setDay,
  onPick,
  busy,
}: {
  item: Item;
  tg: boolean;
  day: string;
  setDay: (day: string) => void;
  onPick: (slotsId: number, time: string) => void;
  busy: boolean;
}) {
  const copy = useCopy();
  const P = copy.leistungen.CHATBOTS.phone;
  const { LINKS } = copy.site;
  switch (item.kind) {
    case "typing":
      return (
        <div className="ls-msg ls-msg-bot">
          <div className="ls-bubble ls-bubble-bot ls-typing" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </div>
      );
    case "bot":
      return (
        <div className="ls-msg ls-msg-bot">
          <div className="ls-bubble ls-bubble-bot">{keepCompounds(item.text)}</div>
        </div>
      );
    case "user":
      return (
        <div className="ls-msg ls-msg-user">
          <div className="ls-bubble ls-bubble-user">
            {item.text}
            <CheckCheck aria-hidden strokeWidth={2} className="ls-read size-3.5" />
          </div>
        </div>
      );
    case "expert":
      return (
        <div className="ls-msg ls-msg-bot">
          <a href={LINKS.booking} target="_blank" rel="noopener" className="ls-card ls-expert">
            <span className="ls-expert-mark">
              {/* eslint-disable-next-line @next/next/no-img-element -- a small static vector mark; next/image adds nothing */}
              <img src="/brand/mark.svg" alt="" width={721} height={454} draggable={false} />
            </span>
            <span className="min-w-0 flex-1 text-[14px] leading-snug font-medium text-white">{P.expert}</span>
            <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-sky" />
          </a>
        </div>
      );
    case "slots":
      return (
        <div className="ls-msg ls-msg-bot">
          <div className="ls-card ls-slots" data-picked={item.picked ? "" : undefined}>
            <div className="flex gap-1.5" role="radiogroup" aria-label={P.replies[1].label}>
              {P.days.map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={day === d}
                  disabled={Boolean(item.picked) || busy}
                  onClick={() => setDay(d)}
                  className="ls-slot ls-slot-day"
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {P.times.map((time) => (
                <button
                  key={time}
                  type="button"
                  disabled={Boolean(item.picked) || busy}
                  data-on={item.picked === `${day} · ${time}` ? "" : undefined}
                  onClick={() => onPick(item.id, time)}
                  className="ls-slot"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    case "booked":
      return (
        <div className="ls-msg ls-msg-bot">
          <div className={cn("ls-card ls-booked", tg && "ls-booked-tg")}>
            <span className="ls-booked-check">
              <CalendarCheck aria-hidden strokeWidth={1.75} className="size-4" />
            </span>
            <span className="text-[15px] font-medium text-white">{item.slot}</span>
          </div>
        </div>
      );
    case "system":
      return (
        <div className="ls-msg justify-center">
          <p className="ls-system">
            <Headset aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0 text-sky" />
            {item.text}
          </p>
        </div>
      );
  }
}
