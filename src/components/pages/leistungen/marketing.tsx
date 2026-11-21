"use client";

import { Check, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Container, Heading, Section, TextLink } from "@/components/system/primitives";
import { useCopy } from "@/i18n/client";
import { DemoButton, UsePills, useReducedMotion, useSeenOnce } from "./shared";

/*
  Marketing- & Vertriebsautomatisierung: a split head (his heading on the left, his text and link on the right), then
  his eight-step end-to-end pipeline as one track across the page. A lead travels from station to station; each
  station it reaches lights up, then ticks, and the line behind it fills with sky. The caption names the current
  stage, as his own pipeline does; his "Replay" runs it again, and a station can be picked by hand (his demo allows
  that too). It runs once by itself when it first comes into view. Under the track, his possible automations as
  compact pills.

  The track: one row of eight on large screens, a snake of four by two on tablets and of two by four on phones (the
  line turns at the row's end and comes back, so the order always reads as one path). The line and the lead are
  measured from the stations themselves, so the path fits every layout. Reduced motion: the finished pipeline.
  Round 5 (DE/EN): copy by language.
*/

/** Per station: the lead arrives, works for a moment, the station ticks, the lead moves on. */
const STEP_MS = 1400;
const TICK_AFTER_MS = 850;

type Geo = { w: number; h: number; pts: { x: number; y: number }[]; d: string; cum: number[]; total: number };

export function MarketingSection() {
  const copy = useCopy();
  const { MARKETING } = copy.leistungen;
  const { LINKS } = copy.site;
  return (
    <Section id="marketing">
      <Container>
        <div className="grid [&>*]:min-w-0 gap-6 lg:grid-cols-12 lg:items-start lg:gap-x-10">
          <Heading title={MARKETING.title} accent={MARKETING.accent} className="lg:col-span-6" />
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-2">
            <p data-reveal="up" data-rd="2" className="t-body text-white/75">
              {MARKETING.text}
            </p>
            <div data-reveal="up" data-rd="3" className="mt-5">
              <TextLink href={LINKS.contact} className="min-h-11">
                {MARKETING.cta}
              </TextLink>
            </div>
          </div>
        </div>

        <Pipeline />

        <UsePills label={MARKETING.usesLabel} items={MARKETING.uses} center className="mx-auto mt-12 max-w-[920px] md:mt-14" />
      </Container>
    </Section>
  );
}

function Pipeline() {
  const { MARKETING } = useCopy().leistungen;
  const STEPS = MARKETING.steps;
  const LAST = STEPS.length - 1;
  const box = useRef<HTMLDivElement>(null);
  const stations = useRef<HTMLOListElement>(null);
  const timers = useRef<{ ids: number[] }>({ ids: [] });
  const seen = useSeenOnce(box, 0.4);
  const reduced = useReducedMotion();

  /** Where the lead is (-1: not started). */
  const [current, setCurrent] = useState(-1);
  /** How many stations have ticked. */
  const [ticked, setTicked] = useState(0);
  const [geo, setGeo] = useState<Geo | null>(null);

  // The path through the stations' dots, measured from the layout (one row, or a snake).
  useEffect(() => {
    const list = stations.current;
    if (!list) return undefined;
    const measure = () => {
      const base = list.getBoundingClientRect();
      const dots = Array.from(list.querySelectorAll<HTMLElement>("[data-dot]"));
      const pts = dots.map((dot) => {
        const r = dot.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2 - base.left), y: Math.round(r.top + r.height / 2 - base.top) };
      });
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
      const d = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
      setGeo({ w: Math.round(base.width), h: Math.round(base.height), pts, d, cum, total: cum[cum.length - 1] });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  const stop = () => {
    timers.current.ids.forEach((id) => window.clearTimeout(id));
    timers.current.ids = [];
  };

  const run = useCallback(() => {
    const list = timers.current;
    list.ids.forEach((id) => window.clearTimeout(id));
    list.ids = [];
    setTicked(0);
    setCurrent(0);
    STEPS.forEach((_, i) => {
      if (i > 0) list.ids.push(window.setTimeout(() => setCurrent(i), i * STEP_MS));
      list.ids.push(window.setTimeout(() => setTicked(i + 1), i * STEP_MS + TICK_AFTER_MS));
    });
  }, [STEPS]);

  const autoRan = useRef(false);
  useEffect(() => {
    if (!seen || autoRan.current || reduced) return undefined;
    autoRan.current = true;
    const id = window.setTimeout(run, 400);
    return () => window.clearTimeout(id);
  }, [seen, reduced, run]);

  useEffect(() => {
    const list = timers.current;
    return () => list.ids.forEach((id) => window.clearTimeout(id));
  }, []);

  /** A station picked by hand: the lead goes there, everything before it is done. */
  const pick = (i: number) => {
    stop();
    setCurrent(i);
    setTicked(i + 1);
  };

  // Reduced motion and nothing pressed: the finished pipeline.
  const idleFull = reduced && current < 0;
  const at = idleFull ? LAST : current;
  const done = idleFull ? STEPS.length : ticked;
  const stage = STEPS[Math.max(0, at)].title;
  const lead = geo && at >= 0 ? geo.pts[at] : null;
  const filled = geo && at >= 0 ? geo.cum[at] : 0;

  return (
    <div ref={box} data-reveal="up" className="ls-track mt-14 md:mt-20">
      <div className="ls-track-head">
        <p className="min-w-0 text-[15px] text-white/60" aria-live="polite">
          {MARKETING.pipelineLabel}
          <span className="mx-2 text-white/30">·</span>
          <span key={stage} className="ls-track-stage text-white">
            {stage}
          </span>
        </p>
        <DemoButton icon={RotateCcw} onClick={run} className="shrink-0">
          {MARKETING.replay}
        </DemoButton>
      </div>

      <div className="relative">
        {geo ? (
          <svg aria-hidden className="pointer-events-none absolute top-0 left-0 overflow-visible" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} fill="none">
            <path d={geo.d} stroke="rgb(241 241 238 / 0.14)" strokeWidth={1.5} strokeLinejoin="round" />
            <path
              d={geo.d}
              stroke="#69bff8"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={`${geo.total} ${geo.total}`}
              className="ls-track-fill"
              style={{ strokeDashoffset: geo.total - filled }}
            />
          </svg>
        ) : null}
        {lead ? <span aria-hidden className="ls-lead" style={{ "--x": `${lead.x}px`, "--y": `${lead.y}px` } as CSSProperties} /> : null}

        <ol ref={stations} className="ls-stations">
          {STEPS.map((step, i) => {
            const state = i < done ? "done" : i === at ? "active" : "pending";
            return (
              <li key={step.title} data-i={i} data-state={state} className="ls-station">
                <button type="button" onClick={() => pick(i)} className="ls-station-hit" aria-label={`${String(i + 1).padStart(2, "0")} ${step.title}`}>
                  <span data-dot className="ls-station-dot">
                    {state === "done" ? <Check aria-hidden strokeWidth={2.25} className="size-4" /> : <span className="num">{String(i + 1).padStart(2, "0")}</span>}
                  </span>
                  <span className="mt-3 block text-[15px] leading-tight font-medium text-white">{step.title}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-white/55">{step.text}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
