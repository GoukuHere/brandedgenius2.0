"use client";

import { ArrowLeft, ArrowRight, Play, X } from "lucide-react";
import { animate, motion, useMotionValue, useSpring, useTransform, type MotionValue, type Transition } from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTrigger,
} from "@/components/ui/morphing-dialog";
import { VOICES } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Kundenstimmen: the client's four YouTube Shorts as an arc of portraits, the arc the developer liked in v1's hero,
  here carrying real content. The cards stand on a large circle whose centre lies far below the stage: the current
  voice upright in the middle, its neighbours tilted away on either side and dimmed, the fourth waiting out of view
  at the far edge. As the section scrolls in, the fan opens from a stack behind the centre card (scroll-linked and
  reversible); the arrows, dots, swipe and arrow keys turn the arc one card at a time. Only the centre card's quote
  is shown, under the arc, at full contrast. No glass, no auto-advance, no background effect.

  Every card is placed by one continuous value, the wheel position, so turning the arc is a single animation and a
  card that leaves at one edge re-enters at the other while it is invisible.

  Play opens Motion Primitives' MorphingDialog: the portrait grows into a centred 9:16 player and only then is the
  privacy-enhanced youtube-nocookie iframe mounted.
*/

type Voice = (typeof VOICES.items)[number];

const ITEMS = VOICES.items;
const COUNT = ITEMS.length;
const TRACK_ID = "kundenstimmen-karussell";

const EASE = [0.16, 1, 0.3, 1] as const;
const TURN: Transition = { duration: 0.8, ease: EASE };
const MORPH: Transition = { duration: 0.6, ease: EASE };
const MORPH_MS = 600;
const SWIPE_PX = 48;

// Degrees between neighbouring cards on the arc, the side cards' scale, and the circle's radius in card widths
// (a tighter circle on phones, so the neighbours peek in from the screen edges).
const STEP = 16;
const SIDE_SCALE = 0.9;
const RADIUS_DESKTOP = 4;
const RADIUS_PHONE = 3.2;

// The card is 320px wide from lg and 240px below.
const SIZES = "(min-width: 1024px) 320px, 240px";

const mod = (n: number) => ((n % COUNT) + COUNT) % COUNT;
const rad = (deg: number) => (deg * Math.PI) / 180;
const embed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

/*
  MorphingDialogContainer paints its own backdrop (40% black with a blur) and takes no className. This rule turns
  that backdrop, only when it sits in front of this player, into 70% black without the full-screen blur, and lifts
  it above the fixed header (z-50, earlier in the DOM).
*/
const BACKDROP_CSS =
  "body>div:has(+div [data-voice-player]){background-color:rgb(0 0 0/0.7);-webkit-backdrop-filter:none;backdrop-filter:none;z-index:50}";

export function VoicesSection() {
  const regionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const focusCentre = useRef(false);
  // pos is the virtual index of the centre card; it only ever grows or shrinks by whole steps.
  const [pos, setPos] = useState(1);
  const active = mod(pos);

  const go = useCallback((step: number) => setPos((p) => p + step), []);

  // Set after mount, so the server markup never depends on them.
  const reduced = useMotionValue(0);
  const radius = useMotionValue(320 * RADIUS_DESKTOP);
  const wheel = useMotionValue(1);

  useEffect(() => {
    reduced.set(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0);
  }, [reduced]);

  // The circle scales with the card, which CSS sizes per breakpoint.
  useEffect(() => {
    const stage = stageRef.current;
    const card = stage?.querySelector<HTMLElement>("[data-card]");
    if (!stage || !card) return;
    const ro = new ResizeObserver(() => {
      const w = card.offsetWidth;
      radius.set(w * (w >= 300 ? RADIUS_DESKTOP : RADIUS_PHONE));
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [radius]);

  useEffect(() => {
    const controls = animate(wheel, pos, reduced.get() ? { duration: 0 } : TURN);
    return () => controls.stop();
  }, [pos, wheel, reduced]);

  // The fan opens as the stage comes up the screen and is fully open once it is centred.
  const progress = useSectionProgress(stageRef, ["start end", "center center"]);
  const smooth = useSpring(progress, { stiffness: 140, damping: 30, mass: 0.4 });
  const spread = useTransform(() => (reduced.get() ? 1 : 0.15 + 0.85 * smooth.get()));

  // After a keyboard move from inside a card, or a click on a side card, focus follows the voice now in the centre.
  useEffect(() => {
    if (!focusCentre.current) return;
    focusCentre.current = false;
    regionRef.current?.querySelector<HTMLElement>(`[data-i="${mod(pos)}"] [aria-haspopup="dialog"]`)?.focus({ preventScroll: true });
  }, [pos]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target as HTMLElement;
    // Keys pressed in the open player bubble here through the React portal; only keys from the carousel count.
    if (!event.currentTarget.contains(target)) return;
    event.preventDefault();
    focusCentre.current = target.closest("[data-i]") !== null;
    go(event.key === "ArrowRight" ? 1 : -1);
  }

  // Swipe on touch and pen: a horizontal drag past the threshold turns the arc once. Mouse drags are left alone.
  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    swiped.current = false;
    swipeStart.current = event.pointerType === "mouse" ? null : { x: event.clientX, y: event.clientY };
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    swiped.current = true;
    go(dx < 0 ? 1 : -1);
  }
  // A swipe that ends on the portrait must not also open the player.
  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!swiped.current) return;
    swiped.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  // The shortest way round to a voice.
  function goTo(index: number) {
    const diff = mod(index - active);
    if (diff) go(diff > COUNT / 2 ? diff - COUNT : diff);
  }

  return (
    // Clipped sideways: the far cards of the arc reach past the screen edge.
    <Section id="kundenstimmen" className="overflow-x-clip">
      <style href="bg-voices-player-backdrop" precedence="default">
        {BACKDROP_CSS}
      </style>
      <Container>
        <div className="max-w-[760px]">
          <Heading title={VOICES.title} accent={VOICES.accent} />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[560px]">
            {VOICES.text}
          </p>
        </div>

        <div ref={regionRef} role="region" aria-roledescription="Karussell" aria-label="Kundenstimmen" onKeyDown={onKeyDown} className="mt-14 md:mt-20">
          <div
            ref={stageRef}
            id={TRACK_ID}
            className="relative h-[462px] touch-pan-y lg:h-[640px]"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              swipeStart.current = null;
            }}
            onClickCapture={onClickCapture}
          >
            {/* v11: the arrows sit at both sides of the portraits, large and lit, not under the quote. */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-30 flex items-center md:-left-2">
              <StepButton direction={-1} onClick={() => go(-1)} />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-30 flex items-center md:-right-2">
              <StepButton direction={1} onClick={() => go(1)} />
            </div>
            {ITEMS.map((voice, i) => (
              <ArcCard
                key={voice.youtube}
                i={i}
                voice={voice}
                centre={i === active}
                wheel={wheel}
                spread={spread}
                radius={radius}
                onSelect={() => {
                  focusCentre.current = regionRef.current?.contains(document.activeElement) ?? false;
                  goTo(i);
                }}
              />
            ))}
          </div>

          {/* The centre voice's words. All four share one grid cell, so the controls below never jump. */}
          <div className="mx-auto mt-8 grid max-w-[600px] text-center md:mt-12">
            {ITEMS.map((voice, i) => {
              const on = i === active;
              return (
                <motion.figure
                  key={voice.youtube}
                  aria-hidden={!on}
                  inert={!on}
                  className="col-start-1 row-start-1"
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, y: on ? 0 : 10 }}
                  transition={{ duration: 0.45, ease: EASE, delay: on ? 0.2 : 0 }}
                >
                  <blockquote className="text-[20px] leading-[1.45] tracking-[-0.01em] text-balance text-white md:text-[22px]">
                    <p>„{voice.quote}“</p>
                  </blockquote>
                  <figcaption className="mt-5">
                    <span className="block font-medium text-white">{voice.name}</span>
                    <span className="t-small mt-1 block">{voice.role}</span>
                  </figcaption>
                </motion.figure>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center md:mt-10">
            <div className="flex items-center">
              {ITEMS.map((item, i) => (
                <button
                  key={item.youtube}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-controls={TRACK_ID}
                  aria-current={i === active ? "true" : undefined}
                  aria-label={`Kundenstimme von ${item.name}`}
                  className="group grid size-11 cursor-pointer place-items-center rounded-button"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-2 rounded-full transition-[background-color,scale] duration-200 ease-out",
                      i === active ? "scale-125 bg-white" : "bg-white/40 group-hover:bg-white/75"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {`Kundenstimme ${active + 1} von ${COUNT}: ${ITEMS[active].name}`}
          </p>
        </div>
      </Container>
    </Section>
  );
}

/** One portrait on the arc. Its place follows the wheel: upright in the centre, tilted and dimmed to the sides. */
function ArcCard({
  i,
  voice,
  centre,
  wheel,
  spread,
  radius,
  onSelect,
}: {
  i: number;
  voice: Voice;
  centre: boolean;
  wheel: MotionValue<number>;
  spread: MotionValue<number>;
  radius: MotionValue<number>;
  onSelect: () => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null!);
  const playLabel = `Video von ${voice.name} abspielen`;

  // MorphingDialogTrigger hard-codes an English aria-label ("Open dialog …"); give the play button its German name.
  useEffect(() => {
    triggerRef.current?.setAttribute("aria-label", playLabel);
  }, [playLabel]);

  // Signed distance from the centre in cards, wrapped into [-COUNT/2, COUNT/2): a card leaving one edge comes back
  // at the other, where it is fully transparent.
  const rel = useTransform(() => {
    const d = i - wheel.get() + COUNT / 2;
    return ((d % COUNT) + COUNT) % COUNT - COUNT / 2;
  });
  const far = useTransform(() => Math.min(Math.abs(rel.get()), 1));
  const angle = useTransform(() => rel.get() * STEP * spread.get());
  const x = useTransform(() => radius.get() * Math.sin(rad(angle.get())));
  const y = useTransform(() => radius.get() * (1 - Math.cos(rad(angle.get()))));
  const scale = useTransform(() => 1 - (1 - SIDE_SCALE) * far.get());
  const opacity = useTransform(() => Math.min(1, Math.max(0, 2 - Math.abs(rel.get()))));
  const shade = useTransform(() => 0.55 * far.get());
  const zIndex = useTransform(() => 10 - Math.round(Math.abs(rel.get()) * 2));
  const pointerEvents = useTransform(() => (Math.abs(rel.get()) > 1.5 ? "none" : "auto"));

  return (
    <motion.div
      data-card
      data-i={i}
      role="group"
      aria-roledescription="Kundenstimme"
      aria-label={`${i + 1} von ${COUNT}: ${voice.name}`}
      aria-hidden={!centre}
      style={{ x, y, rotate: angle, scale, opacity, zIndex, pointerEvents }}
      className="absolute top-0 left-1/2 -ml-[120px] w-[240px] will-change-transform lg:-ml-[160px] lg:w-[320px]"
    >
      {/* Side cards leave the tab order; the arrows, dots and keys turn the arc. */}
      <div inert={!centre}>
        <MorphingDialog transition={MORPH}>
          <MorphingDialogTrigger
            triggerRef={triggerRef}
            className="frame group block aspect-[9/16] w-full bg-deep shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] select-none focus-visible:outline-offset-[-4px]"
            style={{ borderRadius: 16 }}
          >
            <Image src={voice.img} alt="" fill sizes={SIZES} draggable={false} className="object-cover object-top" />
            {/* Dims the portrait on the sides; a shade, not opacity, so the cards behind never show through. */}
            <motion.span aria-hidden style={{ opacity: shade }} className="absolute inset-0 bg-page" />
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-button bg-white/90 text-page shadow-[0_12px_32px_-8px_rgb(0_0_0/0.6)] transition-[scale,background-color,opacity] duration-300 ease-out group-hover:scale-[1.06] group-hover:bg-white",
                centre ? "opacity-100" : "opacity-0"
              )}
            >
              {/* Nudged 2px right: a triangle's visual centre sits left of its box centre. */}
              <Play strokeWidth={1.5} className="size-6 translate-x-[2px] fill-current" />
            </span>
          </MorphingDialogTrigger>
          <MorphingDialogContainer>
            <MorphingDialogContent
              className="relative aspect-[9/16] h-[min(85vh,calc(100svh_-_9rem),160vw)] overflow-visible"
              style={{ borderRadius: 16 }}
            >
              <Player voice={voice} returnTo={triggerRef} />
            </MorphingDialogContent>
          </MorphingDialogContainer>
        </MorphingDialog>
      </div>

      {/* A side card is one large pointer target that turns it to the centre. */}
      {!centre && (
        <button
          type="button"
          tabIndex={-1}
          onClick={onSelect}
          aria-label={`Kundenstimme von ${voice.name} anzeigen`}
          className="absolute inset-0 z-10 cursor-pointer rounded-panel"
        />
      )}
    </motion.div>
  );
}

const CLOSE_FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.3, duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

/** The open player: the portrait first, the YouTube iframe once the morph has finished. */
function Player({ voice, returnTo }: { voice: Voice; returnTo: RefObject<HTMLButtonElement> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setReady(true), reduce ? 0 : MORPH_MS);
    return () => window.clearTimeout(timer);
  }, []);

  /*
    The shared dialog names itself through ids that do not exist and labels its close button in English. Give the
    dialog and the button German names, give the dialog the id the play button's aria-controls points at, and send
    focus back to the play button once the dialog has closed (the component's own return never finds the trigger).
  */
  useEffect(() => {
    const trigger = returnTo.current;
    const root = rootRef.current;
    const dialog = root?.closest<HTMLElement>('[role="dialog"]');
    if (dialog) {
      dialog.setAttribute("aria-label", `Kundenstimme von ${voice.name}`);
      dialog.removeAttribute("aria-labelledby");
      dialog.removeAttribute("aria-describedby");
      const controls = trigger?.getAttribute("aria-controls");
      if (controls) dialog.id = controls;
    }
    root?.querySelector('button[aria-label="Close dialog"]')?.setAttribute("aria-label", "Video schließen");
    return () => trigger?.focus({ preventScroll: true });
  }, [returnTo, voice.name]);

  // Focus guard after the player: Tab out of the video returns to the close button, Shift+Tab from it enters the video.
  function onGuardFocus(event: FocusEvent<HTMLSpanElement>) {
    const close = rootRef.current?.querySelector<HTMLElement>("button");
    const frame = frameRef.current;
    if (frame && event.relatedTarget === close) frame.focus();
    else close?.focus();
  }

  return (
    <div ref={rootRef} data-voice-player className="absolute inset-0">
      {/* Above the player, outside the video, so it never covers YouTube's own controls. */}
      <MorphingDialogClose
        variants={CLOSE_FADE}
        className="top-auto right-0 bottom-full mb-3 grid size-11 cursor-pointer place-items-center rounded-button border border-white/25 text-white transition-[border-color,background-color] duration-200 ease-out hover:border-white/50 hover:bg-white/10"
      >
        <X aria-hidden strokeWidth={1.5} className="size-5" />
      </MorphingDialogClose>
      <div className="absolute inset-0 overflow-hidden rounded-panel bg-deep">
        <Image src={voice.img} alt="" fill sizes={SIZES} draggable={false} className="object-cover object-top" />
        {ready && (
          <iframe
            ref={frameRef}
            src={embed(voice.youtube)}
            title={`Kundenstimme von ${voice.name}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
          />
        )}
      </div>
      <span tabIndex={0} onFocus={onGuardFocus} />
    </div>
  );
}

/** v11: a 60px step button (52px on phones), royal with a lit edge so it reads at once; the arrow nudges the way it points. */
function StepButton({ direction, onClick }: { direction: 1 | -1; onClick: () => void }) {
  const iconClass = cn(
    "size-6 transition-transform duration-200 ease-out",
    direction === 1 ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"
  );
  return (
    <button
      type="button"
      onClick={onClick}
      aria-controls={TRACK_ID}
      aria-label={direction === 1 ? "Nächste Kundenstimme" : "Vorherige Kundenstimme"}
      className="v11-step group pointer-events-auto grid size-[52px] shrink-0 cursor-pointer place-items-center rounded-button text-white transition-[background-color,box-shadow,scale] duration-200 ease-out active:scale-[0.96] md:size-[60px]"
    >
      {direction === 1 ? (
        <ArrowRight aria-hidden strokeWidth={2} className={iconClass} />
      ) : (
        <ArrowLeft aria-hidden strokeWidth={2} className={iconClass} />
      )}
    </button>
  );
}
