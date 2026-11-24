"use client";

import { Check, Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Section } from "@/components/system/primitives";
import VOICE from "@/content/voice-demo.json";
import { useCopy, useLocale } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { DemoButton, ServiceText, useReducedMotion } from "./shared";

/*
  KI-Callbots: his text on the left, his "Branded Genius Voice Engine" on the right as a device: a status line, a
  screen with a live waveform and his live transcription, his play and restart buttons, and his Inbound / Outbound
  switch with the two lines his page gives each.
  Round 5 (the client's Loom of 2026-11-18, V3 2:57: "a realistic German voice sample"): the demo plays a real call
  now, one per direction and language (scripts/voice-demo.mjs, ElevenLabs voices). The audio is the clock: play,
  pause, resume and restart drive it, and the file loads on the first play. The transcript shows the line being
  spoken, word by word as it is said, with who speaks; each topic lights when its line starts (a topic the call never
  reaches stays dark); the waveform moves while someone speaks and settles in the pauses (data-quiet). It no longer
  starts by itself: a call with sound waits for the play button. Reduced motion: no waveform motion, whole lines.
  The whole call is also there as text for screen readers.
*/

type Direction = "inbound" | "outbound";
type Line = { who: string; topic: string | null; start: number; end: number; words: [string, number, number][] };
type Call = { src: string; duration: number; lines: Line[] };
const CALLS = VOICE as unknown as Record<Locale, Record<Direction, Call>>;

/** Where a call is at a moment: the line on (-1 before the first), its words said so far, the second, and whether someone speaks. */
type Pos = { line: number; word: number; sec: number; speaking: boolean };
const START: Pos = { line: -1, word: 0, sec: 0, speaking: false };

function posAt(call: Call, t: number): Pos {
  let line = -1;
  call.lines.forEach((l, i) => {
    if (l.start <= t) line = i;
  });
  if (line < 0) return { ...START, sec: Math.floor(t) };
  const on = call.lines[line];
  return { line, word: on.words.filter((w) => w[1] <= t).length, sec: Math.floor(t), speaking: t < on.end };
}

const sameTime = (a: Pos, b: Pos) => a.line === b.line && a.word === b.word && a.sec === b.sec && a.speaking === b.speaking;
const lineText = (line: Line, from = 0, to = line.words.length) =>
  line.words
    .slice(from, to)
    .map((w) => w[0])
    .join(" ");

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
  const { CALLBOTS } = useCopy().leistungen;
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
  const E = useCopy().leistungen.CALLBOTS.engine;
  const locale = useLocale();
  const reduced = useReducedMotion();
  const audio = useRef<HTMLAudioElement>(null);

  const [phase, setPhase] = useState<Phase>("ready");
  const [mode, setMode] = useState(0);
  const [pos, setPos] = useState<Pos>(START);

  const callFor = useCallback((m: number) => CALLS[locale][E.modes[m].id as Direction], [locale, E.modes]);
  const call = callFor(mode);
  const direction = E.modes[mode].id as Direction;
  const speaker = (line: Line) => E.speakers[line.who === "agent" ? "agent" : direction];

  // While the call plays, the audio's own clock moves the screen (read every frame; only a change re-renders).
  useEffect(() => {
    if (phase !== "playing") return undefined;
    let frame = 0;
    const tick = () => {
      const a = audio.current;
      if (a) {
        const next = posAt(call, a.currentTime);
        setPos((p) => (sameTime(p, next) ? p : next));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, call]);

  // The audio's events set the phase, so the end of the call and the system's media keys agree with the buttons.
  useEffect(() => {
    const a = audio.current;
    if (!a) return undefined;
    const onPlay = () => setPhase("playing");
    const onPause = () => setPhase((p) => (p !== "playing" ? p : a.ended ? "ended" : "paused"));
    const onEnded = () => {
      setPos(posAt(call, call.duration));
      setPhase("ended");
    };
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, [call]);

  /** A call from its start; its file is only fetched now. */
  const start = useCallback(
    (m: number) => {
      const a = audio.current;
      if (!a) return;
      const src = callFor(m).src;
      if (a.getAttribute("src") !== src) a.setAttribute("src", src);
      a.currentTime = 0;
      setPos(START);
      a.play().catch(() => setPhase("ready"));
    },
    [callFor]
  );

  const onPlay = () => {
    const a = audio.current;
    if (phase === "playing") a?.pause();
    else if (phase === "paused") a?.play().catch(() => setPhase("paused"));
    else start(mode);
  };
  const onMode = (next: number) => {
    if (next === mode) return;
    setMode(next);
    // A different direction is a different call: it starts again if one was running, else it waits for play.
    if (phase === "playing" || phase === "paused") start(next);
    else {
      setPos(START);
      setPhase("ready");
    }
  };

  const live = phase === "playing" || phase === "paused";
  // Ready: the call's first line as a quiet preview. Live: the line on (its speaker alone before its first word).
  // Ended: the last line, whole.
  const shown = phase === "ready" ? call.lines[0] : call.lines[Math.max(0, pos.line)];
  const said = phase === "ready" ? shown.words.length : phase === "ended" || reduced ? shown.words.length : pos.line < 0 ? 0 : pos.word;
  const reached = phase === "ended" ? call.lines.length : live ? pos.line + 1 : 0;
  const lit = new Set(call.lines.slice(0, reached).map((l) => l.topic));
  const status = phase === "playing" ? E.playing : phase === "paused" ? E.paused : E.ready;
  const playLabel = phase === "playing" ? E.pause : phase === "paused" ? E.resume : E.play;
  const time = `00:${String(pos.sec).padStart(2, "0")}`;
  const current = E.modes[mode];
  // Every line of both calls in this language, laid out invisibly in one cell: the screen keeps one height.
  const sizers = [...CALLS[locale].inbound.lines, ...CALLS[locale].outbound.lines];

  return (
    <div data-reveal="up" className="ls-voice" data-phase={phase}>
      <audio ref={audio} preload="none" />
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
        <div
          aria-hidden
          className="ls-wave"
          data-on={live && !reduced ? "" : undefined}
          data-quiet={live && !pos.speaking ? "" : undefined}
        >
          {BARS.map((bar, i) => (
            <span key={i} style={{ "--h": bar.h, "--d": `${bar.d}ms`, "--o": `${bar.o}ms` } as CSSProperties} />
          ))}
        </div>
        <div className="mt-5 border-t border-white/[0.07] pt-4">
          <p className="text-[13px] leading-snug text-white/50">{E.transcriptLabel}</p>
          <div aria-hidden className="ls-transcript-stack mt-2 text-[17px] leading-[1.5]">
            {sizers.map((line, i) => (
              <p key={i} className="ls-transcript invisible">
                <span className="ls-speaker">{E.speakers.agent}</span> {lineText(line)}
              </p>
            ))}
            <p className="ls-transcript text-white/90" data-preview={phase === "ready" ? "" : undefined}>
              <span className="ls-speaker">{speaker(shown)}</span> <span>{lineText(shown, 0, said)}</span>
              {phase === "playing" && said < shown.words.length ? <span className="ls-caret" /> : null}
              {/* The rest of the line stays laid out (invisible), so the words never reflow while they appear. */}
              <span className="invisible">
                {said > 0 ? " " : ""}
                {lineText(shown, said)}
              </span>
            </p>
          </div>
          {/* The whole call as text for screen readers (the moving transcript above is hidden from them). */}
          <div className="sr-only">
            <p>{current.title}</p>
            <ol>
              {call.lines.map((line, i) => (
                <li key={i}>
                  {speaker(line)}: {lineText(line)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="ls-voice-controls">
        <div className="flex items-center gap-2">
          <DemoButton tone="primary" icon={phase === "playing" ? Pause : Play} onClick={onPlay} className="min-w-[132px]">
            {playLabel}
          </DemoButton>
          <DemoButton icon={RotateCcw} onClick={() => start(mode)}>
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
          {current.topics.map((topic) => (
            <li key={topic} className={cn("ls-topic", lit.has(topic) && "ls-topic-on")}>
              <Check aria-hidden strokeWidth={2.25} className="ls-topic-check" />
              {topic}
            </li>
          ))}
        </ul>
        <p className="ls-voice-credit">
          <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer">
            {E.credit}
          </a>
        </p>
      </div>
    </div>
  );
}
