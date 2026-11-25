"use client";

import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { useCopy } from "@/i18n/client";
import { useMedia, useOnScreen, useReducedMotion, useTabVisible } from "./shared";

/*
  Vernetztes KI-Ökosystem: his heading and text centred, then his ten platforms as glass cards on a slowly turning
  ring, a cylinder seen from slightly above. Each card has its own 3D transform under one perspective (the ring is not
  one 3D space, so the drawing order is the z-index and no card ever cuts through another); a card that turns away
  shows its opaque back, never its mirrored face. The card in front stands exactly in the screen plane, so its text
  is as sharp as any other text on the page. His closing line follows.

  Phones: a smaller ring whose sides fade into the page edges (nothing overflows). Off screen, in a hidden tab and with
  reduced motion the ring holds still.
  Round 5 (DE/EN): copy by language; the closing line's white-to-sky half starts at a word index from the copy.
  Round 7 (Roman's Loom of 2026-11-24): "let it swiping like that, that is good", but "remove this in the middle, this
  left and this right play button": his workflow demo under the ring is gone (the status line, the step readout and
  "Workflow abspielen"), and the ring moves up under the text ("make a little bit more up, close to this one as one
  section with the header and sub-header"). The stage's empty top, above the farthest cards, now sits under the text.
*/

/** Idle: one turn in 80 seconds. */
const IDLE_DEG_PER_MS = 360 / 80000;

const norm = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

const subscribeNothing = () => () => {};
const useMounted = () => useSyncExternalStore(subscribeNothing, () => true, () => false);

export function EcosystemSection() {
  const { ECOSYSTEM } = useCopy().leistungen;
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
        <p data-reveal="up" className="ls-eco-closing mx-auto max-w-[760px] text-center">
          {closingParts(ECOSYSTEM.closing, ECOSYSTEM.closingAccentAt)}
        </p>
      </Container>
    </Section>
  );
}

/** His closing line, with its second half (his own line break, from word `at` on) in the brand's white-to-sky. */
function closingParts(line: string, at: number) {
  const words = line.split(" ");
  return (
    <>
      {words.slice(0, at).join(" ")} <span className="accent">{words.slice(at).join(" ")}</span>
    </>
  );
}

function Ring() {
  const { ECOSYSTEM } = useCopy().leistungen;
  const PLATFORMS = ECOSYSTEM.platforms;
  const stepDeg = 360 / PLATFORMS.length;
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

  // The idle turn: only on screen, in a visible tab and with motion allowed.
  const idle = onScreen && visible && !reduced;
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

  return (
    <div className="ls-eco-ring">
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
                <RingCard key={platform.title} i={i} stepDeg={stepDeg} rot={rot} radius={radius} title={platform.title} tools={platform.tools} sync={ECOSYSTEM.sync} />
              ))
            : null}
        </div>
      </div>
    </div>
  );
}

function RingCard({
  i,
  stepDeg,
  rot,
  radius,
  title,
  tools,
  sync,
}: {
  i: number;
  /** The angle between two cards (a full turn over the platforms). */
  stepDeg: number;
  rot: MotionValue<number>;
  radius: MotionValue<number>;
  title: string;
  tools: string;
  /** His "Sync" label. */
  sync: string;
}) {
  // The card's angle on the ring, 0 in front.
  const theta = useTransform(() => norm(i * stepDeg - rot.get()));
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
    <motion.div className="ls-ring-card" style={{ transform, zIndex }} data-away={away ? "" : undefined}>
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
              {sync}
            </span>
          </div>
          <p className="ls-ring-tools">{tools}</p>
        </div>
      )}
      <motion.span aria-hidden className="ls-ring-shade" style={{ opacity: shade }} />
    </motion.div>
  );
}
