"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type AnimationPlaybackControls, type MotionValue } from "motion/react";
import { Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { ECOSYSTEM } from "@/content/pages/leistungen";
import { cn } from "@/lib/utils";
import { DemoButton, useMedia, useOnScreen, useReducedMotion, useTabVisible } from "./shared";

/*
  Vernetztes KI-Ökosystem: his heading and text centred, then his ten platforms as glass cards on a slowly turning
  ring, a cylinder seen from slightly above. Each card has its own 3D transform under one perspective (the ring is not
  one 3D space, so the drawing order is the z-index and no card ever cuts through another); a card that turns away
  shows its opaque back, never its mirrored face. The card in front stands exactly in the screen plane, so its text
  is as sharp as any other text on the page.

  His "Workflow abspielen" plays his seven-step example: for each step the ring turns to the platform it uses (to the
  middle of two neighbours when a step uses both), those cards light up with his "Sync", and the readout shows
  "Schritt N von 7" and the step's name. At the end everything rests on the last step, then returns to the idle turn,
  as his demo does. His closing line follows.

  Phones: a smaller ring whose sides fade into the page edges (nothing overflows). Off screen, in a hidden tab and with
  reduced motion the ring holds still (reduced motion: the readout and lights still step, the ring jumps).
*/

const PLATFORMS = ECOSYSTEM.platforms;
const STEPS = ECOSYSTEM.steps;
const N = PLATFORMS.length;
const STEP_DEG = 360 / N;
/** Idle: one turn in 80 seconds. */
const IDLE_DEG_PER_MS = 360 / 80000;
const STEP_MS = 2100;
const HOLD_MS = 1700;

const norm = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

/** The ring's angle that brings a step's platform (or the middle of two neighbours) to the front. */
function frontFor(step: number) {
  const [a, b] = STEPS[step].platforms.map((p) => p * STEP_DEG);
  if (b === undefined) return a;
  const gap = norm(b - a);
  return Math.abs(gap) <= 110 ? a + gap / 2 : a;
}

const subscribeNothing = () => () => {};
const useMounted = () => useSyncExternalStore(subscribeNothing, () => true, () => false);

export function EcosystemSection() {
  return (
    <Section id="oekosystem">
      <Container>
        <div className="mx-auto max-w-[860px] text-center">
          <Heading title={ECOSYSTEM.title} accent={ECOSYSTEM.accent} className="ls-eco-title" />
          <p data-reveal="up" data-rd="2" className="t-lead mx-auto mt-6 max-w-[700px]">
            {ECOSYSTEM.text}
          </p>
        </div>
        <Ring />
        <p data-reveal="up" className="ls-eco-closing mx-auto mt-14 max-w-[760px] text-center md:mt-16">
          {closingParts()}
        </p>
      </Container>
    </Section>
  );
}

/** His closing line, with its second half (his own line break) in the brand's white-to-sky. */
function closingParts() {
  const [first, ...rest] = ECOSYSTEM.closing.split(" vernetztes");
  return (
    <>
      {first} <span className="accent">vernetztes{rest.join(" vernetztes")}</span>
    </>
  );
}

function Ring() {
  const mounted = useMounted();
  const stage = useRef<HTMLDivElement>(null);
  const phone = useMedia("(max-width: 767px)");
  const reduced = useReducedMotion();
  const visible = useTabVisible();
  const onScreen = useOnScreen(stage, "120px");

  const rot = useMotionValue(0);
  const radius = useMotionValue(500);
  useEffect(() => {
    radius.set(phone ? 236 : 500);
  }, [phone, radius]);

  const [playing, setPlaying] = useState(false);
  /** The step being shown (-1: none yet). */
  const [step, setStep] = useState(-1);
  const timers = useRef<{ ids: number[]; spin: AnimationPlaybackControls | null }>({ ids: [], spin: null });

  // The idle turn: only on screen, in a visible tab, with motion allowed, and not while the workflow plays.
  const idle = onScreen && visible && !reduced && !playing;
  useEffect(() => {
    if (!idle) return undefined;
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      rot.set(rot.get() + Math.min(64, now - last) * IDLE_DEG_PER_MS);
      last = now;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [idle, rot]);

  const turnTo = useCallback(
    (deg: number) => {
      const list = timers.current;
      list.spin?.stop();
      const from = rot.get();
      const to = from + norm(deg - from);
      if (reduced) {
        rot.set(to);
        return;
      }
      list.spin = animate(rot, to, { duration: 1.15, ease: [0.65, 0, 0.35, 1] });
    },
    [rot, reduced]
  );

  const reset = useCallback(() => {
    const list = timers.current;
    list.ids.forEach((id) => window.clearTimeout(id));
    list.ids = [];
    list.spin?.stop();
    setPlaying(false);
    setStep(-1);
  }, []);

  const play = useCallback(() => {
    reset();
    const list = timers.current;
    setPlaying(true);
    STEPS.forEach((_, i) => {
      list.ids.push(
        window.setTimeout(() => {
          setStep(i);
          turnTo(frontFor(i));
        }, i * STEP_MS)
      );
    });
    list.ids.push(window.setTimeout(reset, (STEPS.length - 1) * STEP_MS + STEP_MS + HOLD_MS));
  }, [reset, turnTo]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.ids.forEach((id) => window.clearTimeout(id));
      list.spin?.stop();
    };
  }, []);

  const lit = new Set<number>(step >= 0 ? STEPS[step].platforms : []);
  const shownStep = Math.max(0, step);

  return (
    <div className="mt-8 md:mt-10">
      {/* His ten platforms for screen readers; the turning ring below is their picture. */}
      <ul role="list" aria-label={ECOSYSTEM.ready} className="sr-only">
        {PLATFORMS.map((platform) => (
          <li key={platform.title}>
            {platform.title}: {platform.tools}
          </li>
        ))}
      </ul>
      {/* The edge fade sits on a wrapper, never on the element that holds the perspective. */}
      <div ref={stage} aria-hidden data-reveal="up" className="ls-ring-mask">
        <div className="ls-ring-stage">
          {mounted
            ? PLATFORMS.map((platform, i) => (
                <RingCard key={platform.title} i={i} rot={rot} radius={radius} lit={lit.has(i)} title={platform.title} tools={platform.tools} />
              ))
            : null}
        </div>
      </div>

      <div data-reveal="up" data-rd="1" className="ls-eco-bar">
        <p className="ls-eco-status" aria-live="polite">
          <span aria-hidden className={cn("ls-status-dot", playing && "ls-status-dot-live")} />
          {playing ? ECOSYSTEM.live : ECOSYSTEM.ready}
        </p>
        <div className="ls-eco-readout">
          <p className="text-[14px] text-white/55">{ECOSYSTEM.stepOf(shownStep + 1, STEPS.length)}</p>
          <p key={shownStep} className="ls-eco-step mt-1 text-[19px] leading-snug font-medium text-balance text-white md:text-[21px]">
            {STEPS[shownStep].name}
          </p>
          <span aria-hidden className="ls-eco-segments">
            {STEPS.map((s, i) => (
              <span key={s.name} data-on={playing && i <= step ? "" : undefined} />
            ))}
          </span>
        </div>
        <DemoButton tone="primary" icon={playing ? RotateCcw : Play} onClick={playing ? reset : play} className="ls-eco-button">
          {playing ? ECOSYSTEM.reset : ECOSYSTEM.play}
        </DemoButton>
      </div>
    </div>
  );
}

function RingCard({
  i,
  rot,
  radius,
  lit,
  title,
  tools,
}: {
  i: number;
  rot: MotionValue<number>;
  radius: MotionValue<number>;
  lit: boolean;
  title: string;
  tools: string;
}) {
  // The card's angle on the ring, 0 in front.
  const theta = useTransform(() => norm(i * STEP_DEG - rot.get()));
  /*
    A card that has turned away flips itself half a turn more and shows its back: one flat face, so no browser has to
    sort two faces in 3D (no preserve-3d, no backface-visibility), and the back is never a mirrored front.
  */
  const facesAway = (deg: number) => Math.abs(deg) > 90;
  const transform = useTransform(() => {
    const r = radius.get();
    const t = theta.get();
    return `translateZ(${-r}px) rotateY(${t.toFixed(3)}deg) translateZ(${r}px)${facesAway(t) ? " rotateY(180deg)" : ""}`;
  });
  const zIndex = useTransform(() => Math.round(100 + 100 * Math.cos((theta.get() * Math.PI) / 180)));
  // Depth: the further back, the deeper the shade over the card (the card itself stays opaque).
  const shade = useTransform(() => Math.round(((1 - Math.cos((theta.get() * Math.PI) / 180)) / 2) * 620) / 1000);

  // Which side shows changes only when the card passes the ring's side, so it is React state (a rare update).
  const [away, setAway] = useState(() => facesAway(theta.get()));
  useMotionValueEvent(theta, "change", (t) => {
    const next = facesAway(t);
    if (next !== away) setAway(next);
  });

  return (
    <motion.div className="ls-ring-card" style={{ transform, zIndex }} data-lit={lit ? "" : undefined} data-away={away ? "" : undefined}>
      {away ? (
        <div aria-hidden className="ls-ring-face ls-ring-back">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small static vector mark; next/image adds nothing */}
          <img src="/brand/mark.svg" alt="" width={721} height={454} draggable={false} />
        </div>
      ) : (
        <div className="ls-ring-face ls-ring-front">
          <div className="flex items-start justify-between gap-3">
            <h3 className="ls-ring-title">{title}</h3>
            <span className="ls-sync">
              <span aria-hidden className="ls-sync-dot" />
              {ECOSYSTEM.sync}
            </span>
          </div>
          <p className="ls-ring-tools">{tools}</p>
        </div>
      )}
      <motion.span aria-hidden className="ls-ring-shade" style={{ opacity: shade }} />
    </motion.div>
  );
}
