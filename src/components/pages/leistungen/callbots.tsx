"use client";

import { Check, Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Section } from "@/components/system/primitives";
import { CALLBOTS } from "@/content/pages/leistungen";
import { cn } from "@/lib/utils";
import { DemoButton, ServiceText, useReducedMotion, useSeenOnce, useTabVisible } from "./shared";

/*
  KI-Callbots: his text on the left, his "Branded Genius Voice Engine" on the right as a device: a status line, a
  screen with a live waveform and his live transcription, his play and restart buttons, and his Inbound / Outbound
  switch with the two lines his page gives each. While the demo call plays (silently: no audio), the waveform moves,
  his transcript types out as his own demo types it, and the five topics of the chosen direction light up one by one
  like topics the engine detects. It plays once by itself when it first comes into view; pause, resume and restart
  are his own buttons. Reduced motion: no waveform motion; the transcript and topics appear complete.
*/

const E = CALLBOTS.engine;
const TEXT = E.transcript;

/** His demo types one character every 62ms. */
const TYPE_MS = 62;
/** The call: the topics light at these seconds, and the call ends at the last. */
const TOPIC_AT = [1.2, 2.4, 3.6, 4.8, 6.0];
const CALL_S = 7.2;
const TICK_MS = 62;

/**
 * The waveform: 44 bars, taller in the middle, each with its own speed and phase. Integer arithmetic only, so the
 * server and every browser compute exactly the same values.
 */
const BARS = Array.from({ length: 44 }, (_, i) => {
  const r = ((i * 9301 + 49297) % 233280) / 233280;
  const mid = 1 - Math.abs(i - 21.5) / 22;
  return { h: Math.round((0.3 + 0.7 * mid * (0.5 + 0.5 * r)) * 100) / 100, d: 600 + Math.round(r * 560), o: -Math.round(r * 900) };
});

type Phase = "ready" | "playing" | "paused" | "ended";

export function CallbotsSection() {
  return (
    <Section id="callbots">
      <Container>
        <div className="grid [&>*]:min-w-0 items-center gap-12 lg:grid-cols-12 lg:gap-x-10">
          <ServiceText className="lg:col-span-5" title={CALLBOTS.title} accent={CALLBOTS.accent} text={CALLBOTS.text} cta={CALLBOTS.cta} />
          <div className="lg:col-span-7 lg:pl-6 xl:pl-12">
            <VoiceEngine />
          </div>
        </div>
      </Container>
    </Section>
  );
}

function VoiceEngine() {
  const box = useRef<HTMLDivElement>(null);
  const seen = useSeenOnce(box, 0.5);
  const reduced = useReducedMotion();
  const visible = useTabVisible();

  const [phase, setPhase] = useState<Phase>("ready");
  const [mode, setMode] = useState(0);
  /** Milliseconds into the call. */
  const [ms, setMs] = useState(0);

  const playing = phase === "playing";

  // The call's clock: runs only while playing in a visible tab.
  useEffect(() => {
    if (!playing || !visible) return undefined;
    const id = window.setInterval(() => {
      setMs((t) => {
        const next = t + TICK_MS;
        return next >= CALL_S * 1000 ? CALL_S * 1000 : next;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [playing, visible]);

  // The call ends by itself (outside the clock's updater, so the phase change is its own update).
  const over = ms >= CALL_S * 1000;
  useEffect(() => {
    if (!playing || !over) return undefined;
    const id = window.setTimeout(() => setPhase("ended"), 0);
    return () => window.clearTimeout(id);
  }, [playing, over]);

  const play = useCallback(() => {
    setMs(0);
    setPhase("playing");
  }, []);

  // Once, when the engine first comes well into view.
  const autoRan = useRef(false);
  useEffect(() => {
    if (!seen || autoRan.current || reduced) return undefined;
    autoRan.current = true;
    const id = window.setTimeout(play, 500);
    return () => window.clearTimeout(id);
  }, [seen, reduced, play]);

  const onPlay = () => {
    if (phase === "playing") setPhase("paused");
    else if (phase === "paused") setPhase("playing");
    else play();
  };
  const onMode = (next: number) => {
    if (next === mode) return;
    setMode(next);
    // A different direction is a different call: it starts again if one was running.
    if (phase === "playing" || phase === "paused") play();
  };

  // Reduced motion and nothing pressed: the finished call.
  const idleFull = reduced && phase === "ready";
  const t = idleFull || phase === "ended" ? CALL_S * 1000 : ms;
  const typed = phase === "ready" && !idleFull ? 0 : Math.min(TEXT.length, Math.floor(t / TYPE_MS));
  const lit = phase === "ready" && !idleFull ? 0 : TOPIC_AT.filter((s) => t >= s * 1000).length;
  const status = phase === "playing" ? E.playing : phase === "paused" ? E.paused : E.ready;
  const playLabel = phase === "playing" ? E.pause : phase === "paused" ? E.resume : E.play;
  const seconds = Math.floor(t / 1000);
  const time = `00:${String(seconds).padStart(2, "0")}`;
  const current = E.modes[mode];

  return (
    <div ref={box} data-reveal="up" className="ls-voice" data-phase={phase}>
      <div className="ls-voice-head">
        <span className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small static vector mark; next/image adds nothing */}
          <img src="/brand/mark.svg" alt="" width={721} height={454} draggable={false} className="h-5 w-auto shrink-0" />
          <span className="truncate text-[15px] font-medium text-white">{E.name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2.5 text-[14px] text-white/70" aria-live="polite">
          <span aria-hidden className="ls-status-dot" />
          {status}
          {phase === "playing" || phase === "paused" ? <span className="num tabular-nums text-white/50">{time}</span> : null}
        </span>
      </div>

      <div className="ls-voice-screen">
        <div aria-hidden className="ls-wave" data-on={(playing || phase === "paused") && !reduced ? "" : undefined}>
          {BARS.map((bar, i) => (
            <span key={i} style={{ "--h": bar.h, "--d": `${bar.d}ms`, "--o": `${bar.o}ms` } as CSSProperties} />
          ))}
        </div>
        <div className="mt-5 border-t border-white/[0.07] pt-4">
          <p className="text-[13px] leading-snug text-white/50">{E.transcriptLabel}</p>
          <p className="ls-transcript mt-2 text-[17px] leading-[1.5] text-white/90">
            <span>{TEXT.slice(0, typed)}</span>
            {phase === "playing" && typed < TEXT.length ? <span aria-hidden className="ls-caret" /> : null}
            {/* The whole line stays laid out (invisible), so the screen never grows while it types. */}
            <span aria-hidden className="invisible">{TEXT.slice(typed)}</span>
          </p>
        </div>
      </div>

      <div className="ls-voice-controls">
        <div className="flex items-center gap-2">
          <DemoButton tone="primary" icon={phase === "playing" ? Pause : Play} onClick={onPlay} className="min-w-[132px]">
            {playLabel}
          </DemoButton>
          <DemoButton icon={RotateCcw} onClick={play}>
            {E.restart}
          </DemoButton>
        </div>
        <div role="radiogroup" aria-label={E.name} className="ls-switch">
          {E.modes.map((m, i) => (
            <button key={m.id} type="button" role="radio" aria-checked={mode === i} onClick={() => onMode(i)} className="ls-switch-option">
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ls-voice-topics">
        <h3 className="text-[16px] leading-snug font-medium text-white">{current.title}</h3>
        <ul role="list" className="mt-3 flex flex-wrap gap-2">
          {current.topics.map((topic, i) => (
            <li key={topic} className={cn("ls-topic", i < lit && "ls-topic-on")}>
              <Check aria-hidden strokeWidth={2.25} className="ls-topic-check" />
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
