"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionStyle, type Variant } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { Container, Section } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { InView } from "@/components/ui/in-view";
import { TextEffect } from "@/components/ui/text-effect";
import { WHY } from "@/content/site";

/*
  Warum Branded Genius, the page's "Über uns". The scroll expansion after 21st.dev's scroll-expansion hero, rebuilt
  on a sticky runway (no wheel or touch hijacking): a 240svh runway pins a one-screen stage. At rest the headline sits
  centred near the top (the title solid, the accent outlined and revealed word by word with Motion Primitives
  TextEffect) and the team photo waits below it in a centred, rounded 4:3 frame with its caption.

  Scrolling opens the photo to the full screen. The photo is one full-screen layer whose visible area is a
  clip-path inset() that runs from the frame's rectangle (measured in a ResizeObserver) to 0, the corner radius from
  28px to 0. Inside it the picture grows from "the whole photo in the frame, 15% closer" to "covering the screen";
  every edge of the picture and of the clip moves on the same eased value, so the picture always covers the window.
  A dark veil on the photo lifts from 0.35 to 0. The two headline lines slide apart (left and right, up to 30vw) and
  are gone by 15% of the runway, the caption by 8%, both long before the photo's edge reaches them; the photo layer
  is also stacked above them, so text can never sit on the photo. The photo is full screen from 75% of the runway to
  the end, then the page scrolls on to the paragraph and the six reasons.

  Everything is scroll-linked (useSectionProgress plus a light spring) and reversible, and moves only by transform,
  opacity and clip-path. The picture's scale is never promoted with will-change: it is painted at its current size
  on every frame, so it stays sharp at full screen.

  Where the stage does not pin (phones in landscape, desktop windows under 720px tall, reduced motion), the same
  markup is a plain stack: the headline, the photo full width in a .frame, the caption, then the rest. The switch
  is pure CSS (the media query below); the motion values reach the pinned layout only through CSS variables that
  the stacked layout never reads, so the server HTML is right in both cases.
*/

const EASE = [0.16, 1, 0.3, 1] as const;

/*
  The headline's second line follows the page's white-and-blue headings (the `.accent` gradient: #f1f1ee, #dcecff at
  38%, #69bff8). Its words slide in one by one, and a gradient clipped to moving words can drop them in Chrome, so
  each word takes a solid colour from the gradient at its centre instead (the same sweep, word by word).
*/
const ACCENT_STOPS: [number, [number, number, number]][] = [
  [0, [241, 241, 238]],
  [0.38, [220, 236, 255]],
  [1, [105, 191, 248]],
];

function accentColourAt(t: number) {
  const at = Math.min(1, Math.max(0, t));
  for (let i = 1; i < ACCENT_STOPS.length; i++) {
    const [p1, c1] = ACCENT_STOPS[i];
    const [p0, c0] = ACCENT_STOPS[i - 1];
    if (at <= p1) {
      const k = (at - p0) / (p1 - p0);
      return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(" ")})`;
    }
  }
  return "rgb(105 191 248)";
}

function accentWordStyle(segment: string, index: number, segments: string[]) {
  if (!segment.trim()) return undefined;
  const total = segments.join("").length;
  const before = segments.slice(0, index).join("").length;
  return { color: accentColourAt((before + segment.length / 2) / total) };
}

// Where the stage pins: desktops at least 720px tall, and portrait phones and tablets at least 560px tall.
const PIN =
  "(prefers-reduced-motion: no-preference) and (width >= 64rem) and (height >= 45rem), " +
  "(prefers-reduced-motion: no-preference) and (width < 64rem) and (aspect-ratio <= 4/5) and (height >= 35rem)";

// The runway's timeline, as fractions of the pinned scroll.
const OPEN_END = 0.75; // the photo is full screen from here to the end
const TEXT_FADE_START = 0.02;
const TEXT_END = 0.15; // the headline lines have slid apart and are gone
const CAPTION_END = 0.08;

const SLIDE = 0.3; // how far each headline line travels, in stage widths
const RADIUS = 28;
const VEIL = 0.35;
const DEPTH = 1.15; // how much closer than "fits the frame" the photo starts
const RATIO = 2400 / 1792; // team.webp
const FOCUS_Y = 0.2; // full screen, a wide screen crops the photo's height: keep the heads in, cut more of the legs

// The full-screen layer starts closed, so nothing shows before the frame has been measured.
const CLOSED = `inset(50% 50% 50% 50% round ${RADIUS}px)`;

/*
  The two layouts. Unlayered, so these rules win over the Tailwind utilities on the same elements. The stacked layout
  is the default (in the markup's Tailwind classes); everything below only applies while the stage pins.

  The stage is 100lvh (the same as 100svh and 100vh on a desktop): on a phone the browser hides its toolbar while
  the reader scrolls down, and a 100svh stage would then leave a strip of page under the full-screen photo. The
  frame's size is capped against 100svh, so the headline, the frame and the caption always fit the smaller screen.
  The negative scroll margin cancels the page's 96px scroll padding, so the navigation's "Über uns" lands exactly
  where the stage starts to pin, with the headline, the framed photo and the caption all in view.
*/
const CSS = `
.why-veil{display:none}
@media ${PIN}{
  .why-section{padding-top:0;scroll-margin-top:-96px}
  .why-runway{height:240svh}
  .why-stage{position:sticky;top:0;height:100lvh;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding-top:80px;padding-bottom:24px}
  .why-frame{position:static;overflow:visible;width:min(72vw,calc((100svh - 300px) * 4 / 3));aspect-ratio:4/3;margin:24px auto 0;border-radius:${RADIUS}px}
  .why-frame::after{content:none}
  .why-layer{z-index:1;clip-path:var(--why-clip)}
  .why-img{inset:auto;left:0;top:0;width:var(--why-w);height:var(--why-h);transform-origin:0 0;transform:var(--why-tf)}
  .why-veil{display:block}
  .why-caption{margin-top:16px}
  @media (width >= 48rem){.why-frame{width:min(56vw,calc((100svh - 340px) * 4 / 3));margin-top:32px}}
  @media (width >= 64rem){.why-stage{padding-top:88px}.why-frame{width:min(30vw,calc((100svh - 360px) * 4 / 3));margin-top:40px}}
}
`;

/** The expansion, worked out once per layout: the clip's start insets and the picture's start and end placement. */
type Plan = {
  width: number;
  inset: [number, number, number, number];
  box: { w: number; h: number };
  from: { x: number; y: number; s: number };
  to: { x: number; y: number };
};

function planFor(stage: DOMRect, frame: DOMRect): Plan {
  const sw = stage.width;
  const sh = stage.height;
  const left = frame.left - stage.left;
  const top = frame.top - stage.top;
  // The picture's own box: the photo at the size that covers the stage.
  const w = Math.max(sw, sh * RATIO);
  const h = w / RATIO;
  // At the start the whole photo fits the frame, then DEPTH brings it closer; centred on the frame.
  const s = Math.max(frame.width / w, frame.height / h) * DEPTH;
  return {
    width: sw,
    inset: [top, sw - left - frame.width, sh - top - frame.height, left],
    box: { w, h },
    from: { x: left + frame.width / 2 - (w * s) / 2, y: top + frame.height / 2 - (h * s) / 2, s },
    to: { x: (sw - w) / 2, y: (sh - h) * FOCUS_Y },
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const easeIn = (t: number) => t * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const px = (value: number) => `${value.toFixed(2)}px`;

/** Keeps hyphenated German compounds whole, as the Heading primitive does, so "KI-Beratung" never breaks after "KI-". */
function keepWhole(text: string): ReactNode {
  return text.split(/(\s+)/).map((part, i) =>
    part.includes("-") && part.trim() ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    )
  );
}

// The accent's words rise 12px and fade in; the preset's 20px rise is too much at this size.
const WORD = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

const RISE: { hidden: Variant; visible: Variant } = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};
const STAGGER: { hidden: Variant; visible: Variant } = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const VIEW = { once: true, margin: "0px 0px -10% 0px" } as const;

export function WhySection() {
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  const progress = useSectionProgress(runway, ["start start", "end end"]);
  const smooth = useSpring(progress, { stiffness: 160, damping: 32, restDelta: 0.0005, skipInitialAnimation: true });

  // Set after mount, never read during render: whether the stage pins, and the measured expansion.
  const live = useMotionValue(0);
  const plan = useMotionValue<Plan | null>(null);

  useEffect(() => {
    const stageEl = stage.current;
    const columnEl = column.current;
    const frameEl = frame.current;
    if (!stageEl || !columnEl || !frameEl) return;
    const query = window.matchMedia(PIN);
    const measure = () => {
      if (!query.matches) {
        live.set(0);
        return;
      }
      plan.set(planFor(stageEl.getBoundingClientRect(), frameEl.getBoundingClientRect()));
      live.set(1);
    };
    measure();
    // The stage for the screen size, the column for the headline's height once the font has loaded.
    const observer = new ResizeObserver(measure);
    observer.observe(stageEl);
    observer.observe(columnEl);
    query.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", measure);
    };
  }, [live, plan]);

  // Every motion value is read unconditionally, so each transform keeps all of its sources subscribed.
  const p = useTransform(() => live.get() * smooth.get());
  const open = useTransform(() => easeInOut(clamp01(p.get() / OPEN_END)));

  const textOpacity = useTransform(() => 1 - clamp01((p.get() - TEXT_FADE_START) / (TEXT_END - TEXT_FADE_START)));
  const leftX = useTransform(() => {
    const t = clamp01(p.get() / TEXT_END);
    const width = plan.get()?.width ?? 0;
    return -SLIDE * width * easeIn(t);
  });
  const rightX = useTransform(() => -leftX.get());
  const captionOpacity = useTransform(() => 1 - clamp01(p.get() / CAPTION_END));

  const clip = useTransform(() => {
    const k = open.get();
    const g = plan.get();
    if (!g) return CLOSED;
    const f = 1 - k;
    const [t, r, b, l] = g.inset;
    return `inset(${px(t * f)} ${px(r * f)} ${px(b * f)} ${px(l * f)} round ${px(RADIUS * f)})`;
  });
  const picture = useTransform(() => {
    const k = open.get();
    const g = plan.get();
    if (!g) return "none";
    const x = lerp(g.from.x, g.to.x, k);
    const y = lerp(g.from.y, g.to.y, k);
    const s = lerp(g.from.s, 1, k);
    // 2D on purpose: a 3D transform would promote the picture and freeze its raster at the small start scale.
    return `translate(${px(x)}, ${px(y)}) scale(${s.toFixed(4)})`;
  });
  const boxWidth = useTransform(() => {
    const g = plan.get();
    return g ? px(g.box.w) : "100%";
  });
  const boxHeight = useTransform(() => {
    const g = plan.get();
    return g ? px(g.box.h) : "100%";
  });
  const veil = useTransform(() => VEIL * (1 - open.get()));

  return (
    <Section id="ueber-uns" className="why-section">
      <style href="bg-why-expansion" precedence="default">
        {CSS}
      </style>

      <div ref={runway} className="why-runway relative">
        <div ref={stage} className="why-stage">
          <Container>
            <div ref={column} className="text-center">
              <h2 className="text-[clamp(1.875rem,9.2vw,2.25rem)] leading-[1.06] font-medium tracking-[-0.03em] text-balance text-white md:text-[48px] lg:text-[56px]">
                <motion.span style={{ x: leftX, opacity: textOpacity }} className="block">
                  {keepWhole(WHY.title)}
                </motion.span>
                <motion.span style={{ x: rightX, opacity: textOpacity }} className="block">
                  <TextEffect
                    as="span"
                    per="word"
                    preset="slide"
                    delay={0.25}
                    variants={{ item: WORD }}
                    segmentTransition={{ duration: 0.8, ease: EASE }}
                    segmentStyle={accentWordStyle}
                    className="block pb-[0.06em] font-normal"
                  >
                    {WHY.accent}
                  </TextEffect>
                </motion.span>
              </h2>

              <figure>
                {/*
                  Stacked: the photo's frame. Pinned: only the frame's rectangle (measured), while the photo itself is
                  the full-screen layer inside it, positioned against the stage.
                */}
                <div ref={frame} className="why-frame frame mt-10 aspect-[4/3] w-full bg-deep md:mt-14 md:aspect-video">
                  <motion.div style={{ "--why-clip": clip } as MotionStyle} className="why-layer absolute inset-0">
                    <motion.div
                      style={{ "--why-w": boxWidth, "--why-h": boxHeight, "--why-tf": picture } as MotionStyle}
                      className="why-img absolute inset-0"
                    >
                      <Image
                        src="/media/photos/team.webp"
                        alt="Roman Tränkle und das Team von Branded Genius"
                        fill
                        quality={85}
                        sizes="(max-aspect-ratio: 4/3) 134vh, 100vw"
                        className="object-cover object-[50%_20%]"
                      />
                    </motion.div>
                    <motion.div aria-hidden style={{ opacity: veil }} className="why-veil pointer-events-none absolute inset-0 bg-page" />
                  </motion.div>
                </div>
                <motion.figcaption style={{ opacity: captionOpacity }} className="why-caption mt-5">
                  <span className="block text-[17px] leading-snug font-medium text-white">{WHY.center.title}</span>
                  <span className="mt-1 block text-[14px] leading-normal text-silver">{WHY.center.text}</span>
                </motion.figcaption>
              </figure>
            </div>
          </Container>
        </div>
      </div>

      <Container className="pt-20 md:pt-28">
        <InView variants={RISE} transition={{ duration: 0.8, ease: EASE }} viewOptions={VIEW}>
          <p className="t-lead max-w-[640px]">{WHY.text}</p>
        </InView>

        <InView variants={STAGGER} viewOptions={VIEW}>
          <ul role="list" className="mt-14 grid gap-x-10 gap-y-12 md:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-14">
            {WHY.reasons.map((reason) => (
              <motion.li key={reason.title} variants={RISE} transition={{ duration: 0.7, ease: EASE }}>
                {/* A hairline that starts at a filled sky dot and fades out along the column. */}
                <div
                  aria-hidden
                  className="relative h-px bg-[linear-gradient(90deg,rgb(105_191_248/0.5),rgb(255_255_255/0.08)_45%)]"
                >
                  <span className="absolute top-1/2 left-0 size-1.5 -translate-y-1/2 rounded-full bg-sky" />
                </div>
                <h3 className="mt-6 text-[20px] leading-snug font-medium tracking-[-0.01em] text-balance text-white">{reason.title}</h3>
                <p className="mt-2.5 max-w-[400px] text-[16px] leading-relaxed text-silver">{reason.text}</p>
              </motion.li>
            ))}
          </ul>
        </InView>
      </Container>
    </Section>
  );
}
