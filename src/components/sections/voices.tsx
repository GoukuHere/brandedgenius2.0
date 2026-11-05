"use client";

import { ArrowLeft, ArrowRight, Play, X } from "lucide-react";
import { AnimatePresence, motion, type Transition } from "motion/react";
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
import { Reveal } from "@/components/system/reveal";
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
  Kundenstimmen: the client's four YouTube Shorts as a centre-highlighted carousel (the logic of 21st.dev
  "Testimonial Section 3": the current voice in the middle, its two neighbours beside it, prev/next), set as type
  and portraits on the page background. No glass, no auto-advance.

  The cards run on a virtual strip: card v sits at (v - pos) slots from the centre, so stepping moves every card one
  slot and a new one slides in from the side it comes from, whichever way the visitor goes. Desktop (lg) shows three
  cards; below lg the strip is clipped to the centre card. The side cards are scaled to 0.92 and only their portraits
  are dimmed, so every quote keeps full contrast.

  Play opens Motion Primitives' MorphingDialog: the portrait grows into a centred 9:16 player and only then is the
  privacy-enhanced youtube-nocookie iframe mounted.
*/

type Voice = (typeof VOICES.items)[number];

const ITEMS = VOICES.items;
const COUNT = ITEMS.length;
const TRACK_ID = "kundenstimmen-karussell";

const EASE = [0.16, 1, 0.3, 1] as const;
const SLIDE: Transition = { duration: 0.7, ease: EASE };
const MORPH: Transition = { duration: 0.6, ease: EASE };
const MORPH_MS = 600;
const SIDE_SCALE = 0.92;
const SWIPE_PX = 48;

// The card is 360px wide from xl, 300px at lg (three cards fit the 960px column) and up to 360px below lg.
const SIZES = "(min-width: 1280px) 360px, (min-width: 1024px) 300px, (min-width: 400px) 360px, calc(100vw - 40px)";

const mod = (n: number) => ((n % COUNT) + COUNT) % COUNT;
// One slot is the card width plus a gap of 8% of it.
const slotX = (offset: number) => `${offset * 108}%`;
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
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const focusCentre = useRef(false);
  // pos is the virtual index of the centre card; from is where the strip stood before the last move.
  const [view, setView] = useState({ pos: 1, from: 1 });
  const active = mod(view.pos);

  const go = useCallback((step: number) => setView((v) => ({ pos: v.pos + step, from: v.pos })), []);
  const select = useCallback((pos: number) => setView((v) => (v.pos === pos ? v : { pos, from: v.pos })), []);

  // After a keyboard move from inside a card, or a click on a side card, focus follows the voice now in the centre.
  useEffect(() => {
    if (!focusCentre.current) return;
    focusCentre.current = false;
    regionRef.current?.querySelector<HTMLElement>(`[data-v="${view.pos}"] [aria-haspopup="dialog"]`)?.focus({ preventScroll: true });
  }, [view.pos]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target as HTMLElement;
    // Keys pressed in the open player bubble here through the React portal; only keys from the carousel count.
    if (!event.currentTarget.contains(target)) return;
    event.preventDefault();
    focusCentre.current = target.closest("[data-v]") !== null;
    go(event.key === "ArrowRight" ? 1 : -1);
  }

  // Swipe on touch and pen: a horizontal drag past the threshold steps once. Mouse drags are left alone (text selection).
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

  function goToIndex(index: number) {
    const diff = mod(index - active);
    if (diff) go(diff > COUNT / 2 ? diff - COUNT : diff);
  }

  return (
    // Clipped sideways: a card entering or leaving two slots out can reach past the screen edge for a moment.
    <Section id="kundenstimmen" className="overflow-x-clip">
      <style href="bg-voices-player-backdrop" precedence="default">
        {BACKDROP_CSS}
      </style>
      <Container>
        <Reveal className="max-w-[760px]">
          <Heading title={VOICES.title} accent={VOICES.accent} />
          <p className="t-lead mt-6 max-w-[560px]">{VOICES.text}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14 md:mt-20">
          <div ref={regionRef} role="region" aria-roledescription="Karussell" aria-label="Kundenstimmen" onKeyDown={onKeyDown}>
            {/* All cards share one grid cell; the cell is as tall as the tallest card, so the controls never jump. */}
            <div
              id={TRACK_ID}
              className="mx-auto grid w-full max-w-[360px] touch-pan-y max-lg:overflow-x-clip lg:w-[300px] xl:w-[360px]"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                swipeStart.current = null;
              }}
              onClickCapture={onClickCapture}
            >
              <AnimatePresence initial={false} custom={view.pos}>
                {[-1, 0, 1].map((offset) => {
                  const v = view.pos + offset;
                  return (
                    <VoiceCard
                      key={v}
                      v={v}
                      offset={offset}
                      from={view.from}
                      index={mod(v)}
                      voice={ITEMS[mod(v)]}
                      onSelect={() => {
                        // Only when the clicked card held focus (it unmounts); otherwise focus stays where it was.
                        focusCentre.current = regionRef.current?.contains(document.activeElement) ?? false;
                        select(v);
                      }}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3 md:mt-14">
              <StepButton direction={-1} onClick={() => go(-1)} />
              <div className="flex items-center">
                {ITEMS.map((item, i) => (
                  <button
                    key={item.youtube}
                    type="button"
                    onClick={() => goToIndex(i)}
                    aria-controls={TRACK_ID}
                    aria-current={i === active ? "true" : undefined}
                    aria-label={`Kundenstimme von ${item.name}`}
                    className="group grid size-11 cursor-pointer place-items-center rounded-full"
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
              <StepButton direction={1} onClick={() => go(1)} />
            </div>

            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {`Kundenstimme ${active + 1} von ${COUNT}: ${ITEMS[active].name}`}
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/** One voice: the 9:16 portrait (the play button), then the quote and who said it. */
function VoiceCard({
  voice,
  index,
  v,
  offset,
  from,
  onSelect,
}: {
  voice: Voice;
  index: number;
  v: number;
  offset: number;
  from: number;
  onSelect: () => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null!);
  const centre = offset === 0;
  const playLabel = `Video von ${voice.name} abspielen`;

  // MorphingDialogTrigger hard-codes an English aria-label ("Open dialog …"); give the play button its German name.
  useEffect(() => {
    triggerRef.current?.setAttribute("aria-label", playLabel);
  }, [playLabel]);

  return (
    <motion.div
      data-v={v}
      role="group"
      aria-roledescription="Kundenstimme"
      aria-label={`${index + 1} von ${COUNT}`}
      className="relative col-start-1 row-start-1 w-full"
      style={{ originY: 0 }}
      initial={{ x: slotX(v - from), scale: SIDE_SCALE, opacity: 0 }}
      animate={{ x: slotX(offset), scale: centre ? 1 : SIDE_SCALE, opacity: 1 }}
      exit="gone"
      // A leaving card reads the strip's new position from AnimatePresence (custom) and slides out the way it is going.
      variants={{ gone: (pos: number) => ({ x: slotX(v - pos), scale: SIDE_SCALE, opacity: 0 }) }}
      transition={SLIDE}
    >
      <figure>
        {/* Side cards: only the portrait dims; it leaves the tab order (the arrows, dots and keys move the carousel). */}
        <motion.div inert={!centre} initial={false} animate={{ opacity: centre ? 1 : 0.5 }} transition={SLIDE}>
          <MorphingDialog transition={MORPH}>
            <MorphingDialogTrigger
              triggerRef={triggerRef}
              className="frame group block aspect-[9/16] w-full bg-deep select-none focus-visible:outline-offset-[-4px]"
              style={{ borderRadius: 24 }}
            >
              <Image src={voice.img} alt="" fill sizes={SIZES} draggable={false} className="object-cover object-top" />
              <span
                aria-hidden
                className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-page shadow-[0_12px_32px_-8px_rgb(0_0_0/0.6)] transition-[scale,background-color] duration-200 ease-out group-hover:scale-[1.06] group-hover:bg-white"
              >
                {/* Nudged 2px right: a triangle's visual centre sits left of its box centre. */}
                <Play strokeWidth={1.5} className="size-6 translate-x-[2px] fill-current" />
              </span>
            </MorphingDialogTrigger>
            <MorphingDialogContainer>
              <MorphingDialogContent
                className="relative aspect-[9/16] h-[min(85vh,calc(100svh_-_9rem),160vw)] overflow-visible"
                style={{ borderRadius: 24 }}
              >
                <Player voice={voice} returnTo={triggerRef} />
              </MorphingDialogContent>
            </MorphingDialogContainer>
          </MorphingDialog>
        </motion.div>

        <blockquote className="mt-6 text-[19px] leading-[1.45] tracking-[-0.01em] text-pretty text-white">
          <p>„{voice.quote}“</p>
        </blockquote>
        <figcaption className="mt-5">
          <span className="block font-medium text-white">{voice.name}</span>
          <span className="t-small mt-1 block">{voice.role}</span>
        </figcaption>
      </figure>

      {/* A side card is one large pointer target that brings it to the centre (keyboard: arrows, dots and keys). */}
      {!centre && (
        <button
          type="button"
          tabIndex={-1}
          onClick={onSelect}
          aria-label={`Kundenstimme von ${voice.name} anzeigen`}
          className="absolute inset-0 z-10 cursor-pointer rounded-[24px]"
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
        className="top-auto right-0 bottom-full mb-3 grid size-11 cursor-pointer place-items-center rounded-full border border-white/25 text-white transition-[border-color,background-color] duration-200 ease-out hover:border-white/50 hover:bg-white/10"
      >
        <X aria-hidden strokeWidth={1.5} className="size-5" />
      </MorphingDialogClose>
      <div className="absolute inset-0 overflow-hidden rounded-[24px] bg-deep">
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

/** A 52px round step button with a hairline border; the arrow nudges the way it points. */
function StepButton({ direction, onClick }: { direction: 1 | -1; onClick: () => void }) {
  const iconClass = cn(
    "size-5 transition-transform duration-200 ease-out",
    direction === 1 ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"
  );
  return (
    <button
      type="button"
      onClick={onClick}
      aria-controls={TRACK_ID}
      aria-label={direction === 1 ? "Nächste Kundenstimme" : "Vorherige Kundenstimme"}
      className="group grid size-[52px] shrink-0 cursor-pointer place-items-center rounded-full border border-white/15 text-white transition-[border-color,background-color,scale] duration-200 ease-out hover:border-white/40 hover:bg-white/[0.04] active:scale-[0.96]"
    >
      {direction === 1 ? (
        <ArrowRight aria-hidden strokeWidth={1.5} className={iconClass} />
      ) : (
        <ArrowLeft aria-hidden strokeWidth={1.5} className={iconClass} />
      )}
    </button>
  );
}
