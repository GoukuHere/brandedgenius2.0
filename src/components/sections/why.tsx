"use client";

import { motion, useTransform, type MotionValue, type Variants } from "motion/react";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { Container, Section } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { TextEffect } from "@/components/ui/text-effect";
import { WHY } from "@/content/site";

/*
  Warum Branded Genius, the page's "Über uns". An asymmetric spread with no glass: on desktop the team photo stays
  on the left (sticky, its native 4:3 so nobody is cropped) while the argument scrolls past it on the right. The
  title is set plain and the punchline lands a beat later, word by word (the page's only TextEffect). The six reasons
  are one list with hairlines between them; each one comes up to full strength as it reaches the middle of the
  screen, scroll-linked and reversible. Inside the frame the photo drifts slowly with the scroll (transform only).
  Phones and tablets: the photo first (not sticky), then the rest.
*/

const EASE = [0.16, 1, 0.3, 1] as const;

// The punchline's words rise 12px and fade in. The preset's 20px rise is too much at heading size.
const PUNCHLINE_WORD: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/*
  The dimmed state of a reason before it reaches the middle of the screen. The white title can drop to 60% and still
  reads at about 7:1; the silver text stops at 85%, which keeps it above 4.5:1 even under the page's royal glow.
*/
const TITLE_DIM = 0.6;
const TEXT_DIM = 0.85;

/** Keeps hyphenated German compounds whole (as the Heading primitive does), so "KI-Beratung" never breaks after "KI-". */
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

export function WhySection({ id = "ueber-uns" }: { id?: string }) {
  const spread = useRef<HTMLDivElement>(null);
  // The drift runs while any part of the spread is on screen: about 20px over the whole pass, slow on purpose.
  const progress = useSectionProgress(spread, ["start end", "end start"]);
  const photoY = useTransform(progress, [0, 1], ["-3%", "3%"]);

  return (
    <Section id={id}>
      <Container>
        <div ref={spread} className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-16 xl:gap-x-20">
          <TeamPhoto y={photoY} />

          <div className="lg:col-span-7">
            <h2 className="t-h2 max-w-[640px]">
              {keepWhole(WHY.title)}{" "}
              <TextEffect
                as="span"
                per="word"
                preset="slide"
                delay={0.35}
                variants={{ item: PUNCHLINE_WORD }}
                segmentTransition={{ duration: 0.8, ease: EASE }}
                className="block"
              >
                {WHY.accent}
              </TextEffect>
            </h2>
            <p className="t-lead mt-6 max-w-[580px]">{WHY.text}</p>

            <ul role="list" className="mt-12 md:mt-14">
              {WHY.reasons.map((reason, index) => (
                <Reason key={reason.title} title={reason.title} text={reason.text} first={index === 0} />
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/*
  The photo at its native ratio (1600x1194) in the shared hairline frame. The image is scaled 1.08 so its 3% drift
  never shows an edge (the scale leaves 4% spare on each side). Reduced motion drops the transform entirely (CSS, so
  the markup is the same on server and client) and the photo sits still at its exact fit.
*/
function TeamPhoto({ y }: { y: MotionValue<string> }) {
  return (
    <figure className="w-full md:max-w-[640px] lg:sticky lg:top-28 lg:col-span-5 lg:max-w-none lg:self-start">
      <div className="frame isolate aspect-[1600/1194] w-full">
        <motion.div
          style={{ y, scale: 1.08 }}
          className="absolute inset-0 will-change-transform motion-reduce:!transform-none"
        >
          {/* Widths include the 1.08 scale: about 470px wide at 1280+, 36% of the screen between 1024 and 1280. */}
          <Image
            src="/media/photos/team-group.webp"
            alt="Roman Tränkle und das Team von Branded Genius"
            fill
            sizes="(min-width: 1280px) 510px, (min-width: 1024px) 40vw, (min-width: 768px) 700px, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>
      <figcaption className="mt-5">
        <p className="text-[18px] leading-snug font-medium text-white">{WHY.center.title}</p>
        <p className="mt-1 text-[16px] leading-normal text-silver">{WHY.center.text}</p>
      </figcaption>
    </figure>
  );
}

/*
  One reason. It reaches full strength as its centre crosses the middle of the screen (starting when its top is 75%
  down) and dims again if the reader scrolls back up. Opacity only, bound straight to the scroll.
*/
function Reason({ title, text, first }: { title: string; text: string; first: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const progress = useSectionProgress(ref, ["start 0.75", "center 0.5"]);
  const titleOpacity = useTransform(progress, [0, 1], [TITLE_DIM, 1]);
  const textOpacity = useTransform(progress, [0, 1], [TEXT_DIM, 1]);

  return (
    <li ref={ref} className="relative py-7 first:pt-0 last:pb-0">
      {!first && <div aria-hidden className="rule absolute inset-x-0 top-0" />}
      <motion.h3 style={{ opacity: titleOpacity }} className="text-[20px] leading-snug font-medium tracking-[-0.01em] text-white">
        {title}
      </motion.h3>
      <motion.p style={{ opacity: textOpacity }} className="mt-2 max-w-[540px] text-[16px] leading-relaxed text-silver">
        {text}
      </motion.p>
    </li>
  );
}
