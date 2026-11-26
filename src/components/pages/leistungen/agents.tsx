"use client";

import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Section } from "@/components/system/primitives";
import { useCopy } from "@/i18n/client";
import { ServiceText, useReducedMotion, useSeenOnce } from "./shared";

/*
  KI-Agenten & Workflows: his text on the left, his agent console on the right, working. The console is a window with
  his status line over his five steps. It runs once by itself when it first comes into view: each step lights up
  while it is processed, then its dot fills with a check, while a progress line runs down beside them. The states
  and step titles are the ones his own console shows. Reduced motion: the finished console.
  Round 5 (DE/EN): copy by language.
  Round 9 (2026-11-26, Roman's Loom of 2026-11-24, 0:03 to 0:13, "it's too much with text, text, text"): his cursor
  was on this console as well as on the text, so the console lost its words too: the line under each step, the
  "Erledigt" labels (the filled dot says it), the replay button (he called the same play button on the tools ring
  useless) and the three facts in the footer.
*/

/** His own timing: a step is worked on for 900ms, ticks for 350ms, then the next starts 180ms later. */
const ACTIVE_MS = 900;
const TICK_MS = 350;
const GAP_MS = 180;

type Phase = "idle" | "running" | "finished";

export function AgentsSection() {
  const { AGENTS } = useCopy().leistungen;
  return (
    <Section id="ki-agenten">
      <Container>
        <div className="grid [&>*]:min-w-0 items-center gap-12 lg:grid-cols-12 lg:gap-x-10">
          <ServiceText
            className="lg:col-span-5"
            title={AGENTS.title}
            accent={AGENTS.accent}
            text={AGENTS.text}
            usesLabel={AGENTS.usesLabel}
            uses={AGENTS.uses}
            cta={AGENTS.cta}
          />
          <div className="lg:col-span-7 lg:pl-6 xl:pl-12">
            <AgentConsole />
          </div>
        </div>
      </Container>
    </Section>
  );
}

function AgentConsole() {
  const C = useCopy().leistungen.AGENTS.console;
  const STEPS = C.steps;
  const box = useRef<HTMLDivElement>(null);
  const timers = useRef<{ ids: number[] }>({ ids: [] });
  const seen = useSeenOnce(box, 0.5);
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  /** The step being worked on (-1: none). */
  const [current, setCurrent] = useState(-1);
  /** How many steps are done. */
  const [done, setDone] = useState(0);

  const run = useCallback(() => {
    const list = timers.current;
    list.ids.forEach((id) => window.clearTimeout(id));
    list.ids = [];
    const later = (fn: () => void, ms: number) => list.ids.push(window.setTimeout(fn, ms));
    setPhase("running");
    setDone(0);
    setCurrent(0);
    let t = 0;
    STEPS.forEach((_, i) => {
      later(() => setCurrent(i), t);
      later(() => setDone(i + 1), t + ACTIVE_MS);
      t += ACTIVE_MS + TICK_MS + GAP_MS;
    });
    later(() => {
      setCurrent(-1);
      setPhase("finished");
    }, t - GAP_MS);
  }, [STEPS]);

  // Once, when the console first comes well into view (a beat later, so the reader sees it start).
  const autoRan = useRef(false);
  useEffect(() => {
    if (!seen || autoRan.current || reduced) return undefined;
    autoRan.current = true;
    const id = window.setTimeout(run, 450);
    return () => window.clearTimeout(id);
  }, [seen, reduced, run]);

  useEffect(() => {
    const list = timers.current;
    return () => list.ids.forEach((id) => window.clearTimeout(id));
  }, []);

  // Reduced motion and nothing pressed yet: the finished console.
  const shown = reduced && phase === "idle" ? { phase: "finished" as Phase, current: -1, done: STEPS.length } : { phase, current, done };
  const status = shown.phase === "running" ? C.active : shown.phase === "finished" ? C.finished : C.ready;

  return (
    <div ref={box} data-reveal="up" className="ls-console" data-phase={shown.phase}>
      <div className="ls-console-head">
        <p className="flex min-w-0 items-center gap-3" aria-live="polite">
          <span aria-hidden className="ls-status-dot" />
          <span className="truncate text-[15px] text-white/85">{status}</span>
        </p>
      </div>

      <ol className="ls-steps">
        {STEPS.map((step, i) => {
          const state = i < shown.done ? "done" : i === shown.current ? "active" : "pending";
          // The line down to the next step: half drawn while this step works, full once it is done (his progress line).
          const link = i < shown.done ? 1 : i === shown.current ? 0.45 : 0;
          return (
            <li key={step.title} className="ls-step" data-state={state}>
              {i < STEPS.length - 1 ? (
                <span aria-hidden className="ls-step-link">
                  <span style={{ "--link": link } as CSSProperties} />
                </span>
              ) : null}
              <span aria-hidden className="ls-step-dot">
                {state === "done" ? <Check strokeWidth={2.25} className="size-3.5" /> : null}
              </span>
              <div className="min-w-0">
                <h3 className="text-[16px] leading-7 font-medium text-white">{step.title}</h3>
                {typeof step.score === "number" ? (
                  <span aria-hidden className="ls-score">
                    <span className="ls-score-fill" style={{ "--score": step.score / 100 } as CSSProperties} />
                  </span>
                ) : null}
              </div>
              <span aria-hidden className="ls-step-state">
                {state === "active" ? (
                  <span className="ls-working">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
