"use client";

import { Check, LoaderCircle, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Section } from "@/components/system/primitives";
import { AGENTS } from "@/content/pages/leistungen";
import { cn } from "@/lib/utils";
import { DemoButton, ServiceText, useReducedMotion, useSeenOnce } from "./shared";

/*
  KI-Agenten & Workflows: his text on the left, his agent console on the right, working. The console is a window with
  his status line and his "Workflow starten" button; pressing it runs his five steps in turn, each lighting up while
  it is processed and then turning "Erledigt" with a check, while a progress line runs down beside them; his three
  facts sit in the footer. The states and labels are the ones his own console shows. It runs once by itself when it
  first comes into view; the button replays it. Reduced motion: the finished console, and the button still runs it.
*/

const C = AGENTS.console;
const STEPS = C.steps;

/** His own timing: a step is worked on for 900ms, ticks for 350ms, then the next starts 180ms later. */
const ACTIVE_MS = 900;
const TICK_MS = 350;
const GAP_MS = 180;

type Phase = "idle" | "running" | "finished";

export function AgentsSection() {
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
  }, []);

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
  const label = shown.phase === "running" ? C.running : shown.phase === "finished" ? C.again : C.start;

  return (
    <div ref={box} data-reveal="up" className="ls-console" data-phase={shown.phase}>
      <div className="ls-console-head">
        <p className="flex min-w-0 items-center gap-3" aria-live="polite">
          <span aria-hidden className="ls-status-dot" />
          <span className="truncate text-[15px] text-white/85">{status}</span>
        </p>
        <DemoButton
          tone="primary"
          icon={shown.phase === "running" ? LoaderCircle : shown.phase === "finished" ? RotateCcw : Play}
          onClick={run}
          disabled={shown.phase === "running"}
          className="ls-console-button shrink-0"
        >
          {label}
        </DemoButton>
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
                <h3 className="text-[16px] leading-snug font-medium text-white">{step.title}</h3>
                <p className="mt-0.5 text-[14px] leading-snug text-white/58">{step.text}</p>
                {typeof step.score === "number" ? (
                  <span aria-hidden className="ls-score">
                    <span className="ls-score-fill" style={{ "--score": step.score / 100 } as CSSProperties} />
                  </span>
                ) : null}
              </div>
              <span className={cn("ls-step-state", state === "done" && "text-sky")}>
                {state === "done" ? (
                  <>
                    <Check aria-hidden strokeWidth={2} className="size-4" />
                    {C.done}
                  </>
                ) : state === "active" ? (
                  <span aria-hidden className="ls-working">
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

      <ul role="list" className="ls-console-foot">
        {C.facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
    </div>
  );
}
