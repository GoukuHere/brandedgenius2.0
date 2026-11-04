"use client";

import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { motion, useMotionValue, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { VOICES } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Kundenstimmen: the client's four YouTube Shorts in a horizontal slider with arrows (the client asked for arrows).

  The track runs to both screen edges. Its padding and scroll-padding equal the Container's content edge, so at rest the
  first card lines up with the headline, every snap lands a card on that edge, and at the end the last card lines up
  with the content's right edge. A card shows its portrait until it is played; only then does the YouTube player load,
  from the privacy-enhanced youtube-nocookie.com domain, and only one video plays at a time.
*/

type Voice = (typeof VOICES.items)[number];

const TRACK_ID = "kundenstimmen-liste";

// --gutter is the Container's content edge: 20px on phones, 32px from md, and the inset of the centred 1280px column.
const TRACK = [
  "[--gutter:1.25rem] md:[--gutter:max(2rem,50%_-_608px)]",
  "snap-x snap-mandatory scroll-px-[var(--gutter)] overflow-x-auto overflow-y-hidden overscroll-x-contain motion-safe:scroll-smooth",
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
].join(" ");

const embed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

export function VoicesSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const seen = useMotionValue(0);
  const reduce = useReducedMotion();
  const [edges, setEdges] = useState({ start: true, end: false });
  const [playing, setPlaying] = useState<number | null>(null);

  // Keep the progress bar and the arrows' end states in step with the track, on scroll and on resize.
  useEffect(() => {
    const track = trackRef.current;
    const list = listRef.current;
    if (!track || !list) return;
    const sync = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      // The bar fills with the share of the track seen so far, so it is never empty at rest and full at the end.
      seen.set(scrollWidth > 0 ? Math.min(1, (scrollLeft + clientWidth) / scrollWidth) : 1);
      const start = scrollLeft <= 2;
      const end = scrollLeft >= scrollWidth - clientWidth - 2;
      setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };
    track.addEventListener("scroll", sync, { passive: true });
    // Also runs once right away, with the first measurement.
    const observer = new ResizeObserver(sync);
    observer.observe(track);
    observer.observe(list);
    return () => {
      track.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [seen]);

  const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

  // The list's left padding is the content edge; one step is a card plus the gap.
  function measure() {
    const track = trackRef.current;
    const list = listRef.current;
    const first = list?.firstElementChild;
    if (!track || !list || !(first instanceof HTMLElement)) return null;
    const card = first.getBoundingClientRect();
    return {
      track,
      list,
      edge: card.left - list.getBoundingClientRect().left,
      step: card.width + (parseFloat(getComputedStyle(list).columnGap) || 0),
    };
  }

  function go(direction: 1 | -1) {
    const m = measure();
    if (!m) return;
    m.track.scrollBy({ left: direction * m.step, behavior });
  }

  // One video at a time. A card cut off at either side slides fully into view first; only the track moves, never the page.
  function play(index: number) {
    setPlaying(index);
    const m = measure();
    const card = m?.list.children[index];
    if (!m || !(card instanceof HTMLElement)) return;
    const view = m.track.getBoundingClientRect();
    const box = card.getBoundingClientRect();
    if (box.left < view.left + m.edge - 1 || box.right > view.right - m.edge + 1) {
      m.track.scrollBy({ left: box.left - view.left - m.edge, behavior });
    }
  }

  const arrows = (
    <>
      <ArrowButton direction={-1} disabled={edges.start} onClick={() => go(-1)} />
      <ArrowButton direction={1} disabled={edges.end} onClick={() => go(1)} />
    </>
  );

  return (
    <Section id="kundenstimmen">
      <Container>
        <div className="flex items-end justify-between gap-10">
          <Reveal>
            <Heading title={VOICES.title} accent={VOICES.accent} className="max-w-[820px] [&_.accent]:inline-block" />
            <p className="t-lead mt-6 max-w-[620px]">{VOICES.text}</p>
          </Reveal>
          {/* From md the arrows close the header row; on phones they sit under the track, beside the progress bar. */}
          <Reveal delay={0.1} className="hidden shrink-0 gap-3 md:flex">
            {arrows}
          </Reveal>
        </div>
      </Container>

      {/* 48/72px plus the list's 8px inner padding (room for focus rings) puts the cards 56/80px under the header. */}
      <Reveal className="mt-12 md:mt-[72px]">
        <div ref={trackRef} id={TRACK_ID} className={TRACK}>
          <ul ref={listRef} role="list" className="flex w-max gap-5 px-[var(--gutter)] py-2">
            {VOICES.items.map((voice, index) => (
              <VoiceCard key={voice.youtube} voice={voice} playing={playing === index} onPlay={() => play(index)} />
            ))}
          </ul>
        </div>

        <Container className="mt-8 md:mt-10">
          <div className="flex items-center gap-6">
            <div aria-hidden className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className="absolute inset-0 origin-left rounded-full bg-sky" style={{ scaleX: seen }} />
            </div>
            <div className="flex shrink-0 gap-3 md:hidden">{arrows}</div>
          </div>
        </Container>
      </Reveal>
    </Section>
  );
}

/** One testimonial: the video (portrait until played), the quote, then who said it. */
function VoiceCard({ voice, playing, onPlay }: { voice: Voice; playing: boolean; onPlay: () => void }) {
  return (
    <li className="flex w-[82vw] shrink-0 snap-start md:w-[360px]">
      <figure className="flex w-full flex-col">
        <div className="group/media relative aspect-[9/16]">
          <div
            className={cn(
              "absolute inset-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] transition-colors duration-300 ease-out",
              !playing && "group-hover/media:border-sky/30"
            )}
          >
            {playing ? (
              <VideoFrame id={voice.youtube} name={voice.name} />
            ) : (
              <>
                <Image src={voice.img} alt="" fill sizes="(min-width: 768px) 360px, 82vw" className="object-cover" />
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-page/50 to-transparent" />
              </>
            )}
          </div>
          {/* The whole portrait is the play button (a large touch target); its outline sits outside the clipped frame. */}
          {playing ? null : (
            <button
              type="button"
              onClick={onPlay}
              aria-label={`Video von ${voice.name} abspielen`}
              className="absolute inset-0 grid cursor-pointer place-items-center rounded-[24px]"
            >
              <span className="grid size-16 place-items-center rounded-full bg-white/90 text-page shadow-[0_12px_32px_-8px_rgb(5_10_20/0.6)] transition-[scale,background-color] duration-300 ease-out group-hover/media:scale-[1.06] group-hover/media:bg-white">
                {/* Nudged 2px right: a triangle's visual centre sits left of its box centre. */}
                <Play aria-hidden strokeWidth={1.5} className="size-6 translate-x-[2px] fill-current" />
              </span>
            </button>
          )}
        </div>

        <blockquote className="mt-6 flex-1 text-[18px] leading-[1.5] tracking-[-0.01em] text-pretty text-white/90">
          <p>„{voice.quote}“</p>
        </blockquote>
        <figcaption className="mt-5">
          <span className="block font-medium text-white">{voice.name}</span>
          <span className="t-small mt-1 block">{voice.role}</span>
        </figcaption>
      </figure>
    </li>
  );
}

/** The YouTube player, mounted only after a click. Focus moves into it so the keyboard can pause or seek right away. */
function VideoFrame({ id, name }: { id: string; name: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <iframe
      ref={ref}
      src={embed(id)}
      title={`Kundenstimme von ${name}`}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className="absolute inset-0 size-full border-0 outline-offset-[-2px]"
    />
  );
}

/** A 48px round arrow. At either end it stays focusable but inert (aria-disabled), so keyboard focus is never dropped. */
function ArrowButton({ direction, disabled, onClick }: { direction: 1 | -1; disabled: boolean; onClick: () => void }) {
  const iconClass = cn(
    "size-5 transition-transform duration-300 ease-out",
    !disabled && (direction === 1 ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5")
  );
  return (
    <button
      type="button"
      aria-label={direction === 1 ? "Nächste Kundenstimme" : "Vorherige Kundenstimme"}
      aria-controls={TRACK_ID}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "group grid size-12 place-items-center rounded-full border border-white/15 text-white transition-[border-color,opacity,scale] duration-300 ease-out",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:border-sky/40 active:scale-[0.96]"
      )}
    >
      {direction === 1 ? (
        <ArrowRight aria-hidden strokeWidth={1.5} className={iconClass} />
      ) : (
        <ArrowLeft aria-hidden strokeWidth={1.5} className={iconClass} />
      )}
    </button>
  );
}
