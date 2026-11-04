"use client";

import { Pause, Play } from "lucide-react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { FILM, MEDIA } from "@/content/site";

/*
  "Das ist Branded Genius." An editorial header (headline left, intro right, their last lines on one baseline) over
  the client's image film in one wide frame. Signature motion: the frame grows from 90% to full size while it travels
  from the bottom of the screen to its centre. Transform only, spring-smoothed, static under reduced motion.

  The film is a short silent loop. It plays only while at least 40% of the frame is on screen and the tab is visible,
  and pauses otherwise. Nothing downloads before the first play (preload="none"); the poster stands in until then.
  The round toggle in the corner keeps a visitor's pause until they press play again. Under reduced motion the film
  waits on its poster for that press.

  Media note: imagefilm.mp4 is 16:9 with near-black side bars (1,1,1) around 4:3 footage whose edges are the page
  navy, so the bars read as part of the dark frame. The 4:3 poster is cropped from the top, which keeps the heads.
*/

// FILM.title split before the brand: "Das ist" in white, "Branded Genius." in the softer tone, kept on one line.
const BRAND_AT = FILM.title.indexOf("Branded Genius");
const TITLE = BRAND_AT > 0 ? FILM.title.slice(0, BRAND_AT).trimEnd() : FILM.title;
const ACCENT = BRAND_AT > 0 ? FILM.title.slice(BRAND_AT) : undefined;

/** Share of the frame that has to be on screen before the film plays. */
const MIN_VISIBLE = 0.4;

export function FilmSection() {
  return (
    <Section id="ueber-uns">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-baseline-last lg:gap-x-8">
          <Reveal className="lg:col-span-7">
            <Heading title={TITLE} accent={ACCENT} className="max-w-[820px] [&_.tone]:whitespace-nowrap" />
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="t-lead max-w-[620px]">{FILM.text}</p>
          </Reveal>
        </div>

        <FilmFrame />
      </Container>
    </Section>
  );
}

/** What the visitor last asked for. "auto" follows visibility; "pause" holds until they press play again. */
type Intent = "auto" | "play" | "pause";

// play() can be refused (low-power mode, autoplay blocked) or cut short by a pause. The toggle then shows "play".
const tryPlay = (video: HTMLVideoElement) => {
  video.play().catch(() => {});
};

function FilmFrame() {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const onScreen = useRef(false);
  const intent = useRef<Intent>("auto");
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();

  // Measured on the unscaled wrapper; the frame inside it carries the scale.
  const progress = useSectionProgress(frame, ["start end", "center center"]);
  const smooth = useSpring(progress, { stiffness: 100, damping: 30, restDelta: 0.001, skipInitialAnimation: true });
  const scale = useTransform(smooth, [0, 1], [0.9, 1]);

  // One rule for every trigger (visibility, tab switch, a change of the motion setting).
  const sync = useCallback(() => {
    const el = video.current;
    if (!el) return;
    const wanted = intent.current === "play" || (intent.current === "auto" && !reduce);
    if (wanted && onScreen.current && document.visibilityState === "visible") {
      if (el.paused) tryPlay(el);
    } else if (!el.paused) {
      el.pause();
    }
  }, [reduce]);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    // Autoplay policies check the muted property; React does not always mirror the attribute into it.
    if (video.current) video.current.muted = true;
    // Thresholds at 0 and 40%: a film started by hand below 40% still pauses once the frame has left the screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen.current = entry.isIntersecting && entry.intersectionRatio >= MIN_VISIBLE;
        sync();
      },
      { threshold: [0, MIN_VISIBLE] }
    );
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [sync]);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      intent.current = "play";
      tryPlay(el);
    } else {
      intent.current = "pause";
      el.pause();
    }
  };

  return (
    <div ref={frame} className="mt-14">
      {/* isolate and the video's own radius (the frame's inner radius) keep Safari clipping the video's corners. */}
      <motion.div
        style={{ scale }}
        className="relative isolate aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] shadow-[0_40px_120px_-50px_rgb(0_75_160/0.6)] motion-reduce:transform-none! sm:rounded-[32px]"
      >
        {/* Silent and described by the headline above it; the toggle is the control a screen reader needs. */}
        <video
          ref={video}
          src={MEDIA.film}
          poster={MEDIA.filmPoster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="absolute inset-0 size-full rounded-[23px] object-cover object-top sm:rounded-[31px]"
        />
        {/* Only as tall as the toggle needs: 80px on a phone's 188px frame, 128px on desktop. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-page/60 to-transparent md:h-32" />
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Imagefilm pausieren" : "Imagefilm abspielen"}
          className="absolute bottom-4 left-4 grid size-11 cursor-pointer place-items-center rounded-full border border-white/15 bg-page/60 text-white transition-[border-color,background-color,scale] duration-200 ease-out hover:border-sky/30 hover:bg-page/80 active:scale-[0.96] md:bottom-6 md:left-6"
        >
          {playing ? (
            <Pause aria-hidden strokeWidth={1.5} className="size-4 fill-current" />
          ) : (
            // Nudged 1px right: a triangle's visual centre sits left of its box centre.
            <Play aria-hidden strokeWidth={1.5} className="size-4 translate-x-px fill-current" />
          )}
        </button>
      </motion.div>
    </div>
  );
}
