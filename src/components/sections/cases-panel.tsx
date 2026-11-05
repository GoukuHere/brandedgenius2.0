"use client";

import { Check } from "lucide-react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { memo, type FocusEvent } from "react";
import { MagicCard } from "@/components/ui/magic-card";
import { CASES, type CaseStudy } from "@/content/site";

/*
  One Fallstudie as a wide glass panel inside Magic UI's MagicCard (a cursor-lit edge in the brand blues). Two halves
  split by a 1px hairline: the case on the left (its number as a large outlined figure, area and kind, the tagline as
  the headline, the text and the three results as a specs row between vertical hairlines), the voice on the right
  (the quote on a sky rule, then what was built and the tools). Phones and tablets stack the halves.

  From lg the type, the number and the padding follow the window height (svh clamps, smallest at 720px tall, full size
  from 880px), so the pinned panel holds its whole case at every pinned size. Checked against General Sans' own
  metrics: at 1280x720 the tallest half needs about 465px of the 480px inside the panel, at 1659x900 about 465 of 520.

  The panel never decides where it is: the section hands it the track's offset and the slot width, and it derives how
  far it is from the front. Both are 0 until the stage pins, so every panel renders (and server-renders) at full
  strength.
*/

const COUNT = CASES.items.length;

export const casePanelId = (index: number) => `use-cases-panel-${index}`;

type CasePanelProps = {
  item: CaseStudy;
  index: number;
  /** The track's offset in px (0 down to minus its travel); 0 while the stage is not pinned. */
  x: MotionValue<number>;
  /** From one panel's left edge to the next in px; 0 while the stage is not pinned. */
  slot: MotionValue<number>;
  /** 1 when the visitor asked for reduced motion (set after mount). */
  reduced: MotionValue<number>;
  onFocusPanel: (index: number, event: FocusEvent<HTMLElement>) => void;
};

export const CasePanel = memo(function CasePanel({ item, index, x, slot, reduced, onFocusPanel }: CasePanelProps) {
  // 1 with the panel's left edge on the stage's left content edge, easing to 0 one slot away on either side.
  const front = useTransform(() => {
    const step = slot.get();
    const offset = x.get();
    if (reduced.get() || step <= 0) return 1;
    const t = Math.max(0, 1 - Math.abs(index * step + offset) / step);
    return t * t * (3 - 2 * t);
  });
  const opacity = useTransform(() => 0.55 + 0.45 * front.get());
  const scale = useTransform(() => 0.96 + 0.04 * front.get());

  return (
    <li className="flex w-[var(--case-w)] shrink-0 snap-start xl:[@media(min-height:720px)]:h-[min(600px,calc(100svh_-_176px))]">
      {/* Focusable so the keyboard can step through the cases; the section scrolls the focused one to the front. */}
      <motion.article
        id={casePanelId(index)}
        data-case={index}
        tabIndex={0}
        aria-label={`${index + 1} von ${COUNT}: ${item.name}`}
        onFocus={(event) => onFocusPanel(index, event)}
        style={{ opacity, scale }}
        className="w-full rounded-[28px] motion-reduce:transform-none! motion-reduce:opacity-100! lg:rounded-[36px]"
      >
        <MagicCard className="glass h-full rounded-[inherit]" gradientSize={320} gradientOpacity={0}>
          {/* Stacked, the rows pack to the top (a shorter case leaves its spare height at the foot); side by side, the one row fills the panel. */}
          <div className="grid h-full grid-cols-[minmax(0,1fr)] content-start gap-y-8 p-6 lg:grid-cols-[minmax(0,9fr)_1px_minmax(0,7fr)] lg:content-stretch lg:gap-x-8 lg:p-[clamp(32px,5svh_-_4px,40px)] 2xl:gap-x-10">
            <CaseStory item={item} index={index} />
            <div aria-hidden className="h-px bg-white/[0.08] lg:h-auto lg:w-px" />
            <CaseVoice item={item} />
          </div>
        </MagicCard>
      </motion.article>
    </li>
  );
});

/*
  The left half. The top row is the panel's chrome: area and kind at the top left, cap-aligned with the outlined
  number at the top right, both well clear of the headline. The results sit at the foot of the half (lg).
  The case name is the same words as area and kind ("Marketing" + "Automation" = "Marketing Automation"), so it is
  not printed twice; it names the panel for screen readers instead.
*/
function CaseStory({ item, index }: { item: CaseStudy; index: number }) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-start justify-between gap-4">
        <p className="min-w-0 text-[15px] leading-snug">
          <span className="font-medium text-white">{item.area}</span> <span className="text-silver">{item.kind}</span>
        </p>
        <span aria-hidden className="ghost-num shrink-0 text-[80px] leading-[0.75] md:text-[112px] lg:text-[clamp(120px,18.75svh_-_15px,150px)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="mt-6 text-[26px] leading-[1.12] font-medium tracking-[-0.025em] text-balance text-white sm:text-[30px] lg:mt-7 lg:text-[clamp(34px,7px_+_3.75svh,40px)]">
        {item.tagline}
      </h3>
      <p className="t-body mt-4 max-w-[460px]">{item.text}</p>

      {/*
        Phones: one result per row (figure left, label right) between horizontal hairlines. From md: three columns
        between vertical hairlines, the figure over its label. The figures never wrap.
      */}
      <ul role="list" className="mt-8 md:grid md:grid-cols-3 lg:mt-auto lg:pt-7">
        {item.metrics.map((metric) => (
          <li
            key={metric.label}
            className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-x-4 border-white/[0.08] py-3.5 first:pt-0 last:pb-0 not-first:border-t md:block md:px-4 md:py-0 md:first:pl-0 md:last:pr-0 md:not-first:border-t-0 md:not-first:border-l"
          >
            <p className="num text-[32px] leading-none whitespace-nowrap text-white md:text-[40px] lg:text-[clamp(40px,22px_+_2.5svh,44px)]">
              {metric.value}
            </p>
            <p className="text-[14px] leading-[1.45] text-balance text-silver md:mt-2.5 md:text-[13px]">{metric.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The right half: the client's voice first, then what was built and the tools at the foot (lg). */
function CaseVoice({ item }: { item: CaseStudy }) {
  const lastTool = item.tools.length - 1;
  return (
    <div className="flex min-w-0 flex-col">
      <figure className="border-l border-sky/60 pl-5">
        <blockquote>
          <p className="text-[18px] leading-[1.5] text-pretty text-white/90 lg:text-[clamp(19px,10px_+_1.25svh,21px)]">„{item.quote}“</p>
        </blockquote>
        <figcaption className="mt-3 text-[14px] leading-[1.5] text-silver">
          <span aria-hidden>– </span>
          {item.role}
        </figcaption>
      </figure>

      <div className="mt-8 lg:mt-auto lg:pt-7">
        <h4 className="text-[14px] leading-[1.5] text-silver">{CASES.doneLabel}</h4>
        <ul role="list" className="mt-3 grid gap-2">
          {item.done.map((entry) => (
            <li key={entry} className="flex gap-3 text-[16px] leading-6 text-ink/85 lg:text-[15px]">
              <Check aria-hidden strokeWidth={1.5} className="mt-1 size-4 shrink-0 text-sky" />
              <span className="min-w-0">{entry}</span>
            </li>
          ))}
        </ul>

        <h4 className="mt-6 text-[14px] leading-[1.5] text-silver">{CASES.toolsLabel}</h4>
        {/* Plain text joined by middle dots: each name keeps its dot, and the space after it is the only place a line breaks. */}
        <ul role="list" className="mt-2 text-[16px] leading-7 text-ink/85 lg:text-[15px] lg:leading-[26px]">
          {item.tools.map((tool, i) => (
            <li key={tool} className="inline">
              <span className="whitespace-nowrap">
                {tool}
                {i < lastTool ? (
                  <span aria-hidden className="text-silver">
                    {" ·"}
                  </span>
                ) : null}
              </span>
              {i < lastTool ? " " : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
