"use client";

import { Cpu, GraduationCap, Handshake, Megaphone, Rocket, UserRound, type LucideIcon } from "lucide-react";
import { useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { Container, Heading, IconChip, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { WHY } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Why Branded Genius. The team photo is the anchor: on desktop the six reasons sit beside it, three per side, sharing
  three rows so each pair lines up, spread from the photo's top edge to its bottom edge. The photo reveals first, then
  the reasons slide outward from it row by row. On a phone the photo comes first and each reason rises in on its own.
  The motion is CSS transitions on opacity and transform only, started once per element by an IntersectionObserver.
*/

// One icon per reason, in WHY.reasons order.
const ICONS: LucideIcon[] = [UserRound, Megaphone, Cpu, Handshake, Rocket, GraduationCap];

// Desktop placement on the shared column tracks: reasons 1-3 left of the photo, 4-6 right of it.
const PLACE = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-3 lg:row-start-2",
  "lg:col-start-3 lg:row-start-3",
];

// Desktop: each row starts after the photo. Tablet (two columns): the right column trails the left a little.
const DELAY = [
  "lg:delay-350",
  "md:delay-100 lg:delay-450",
  "lg:delay-550",
  "md:delay-100 lg:delay-350",
  "lg:delay-450",
  "md:delay-100 lg:delay-550",
];

// Hidden state, only when motion is allowed: below desktop a short rise; on desktop each side starts beside the photo.
const HIDDEN = {
  left: "motion-safe:opacity-0 motion-safe:max-lg:translate-y-5 motion-safe:lg:translate-x-6",
  right: "motion-safe:opacity-0 motion-safe:max-lg:translate-y-5 motion-safe:lg:-translate-x-6",
};

// Same trigger as the shared Reveal: once, when the element is 10% above the bottom of the screen.
const VIEW = { once: true, margin: "0px 0px -10% 0px" } as const;

export function WhySection({ id = "warum" }: { id?: string }) {
  return (
    <Section id={id}>
      <Container>
        <Reveal>
          <Heading title={WHY.title} accent={WHY.accent} className="max-w-[820px]" />
          <p className="t-lead mt-6 max-w-[620px]">{WHY.text}</p>
        </Reveal>

        <div className="mt-14 md:mt-20 lg:grid lg:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:gap-x-10 lg:gap-y-6 xl:grid-cols-[minmax(0,1fr)_400px_minmax(0,1fr)] xl:gap-x-16">
          <Portrait />

          {/* On desktop the list spans all three columns as a subgrid; the middle track stays empty for the photo. */}
          <ul className="mt-12 grid gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:pointer-events-none lg:col-[1/-1] lg:row-start-1 lg:mt-0 lg:grid-cols-subgrid lg:grid-rows-[auto_auto_auto] lg:content-between lg:gap-x-10 lg:gap-y-8 xl:gap-x-16">
            {WHY.reasons.map((reason, i) => (
              <Reason key={reason.title} index={i} icon={ICONS[i]} title={reason.title} text={reason.text} />
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

function Portrait() {
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref, VIEW);

  return (
    <figure
      ref={ref}
      className="mx-auto w-full max-w-[420px] lg:col-start-2 lg:row-[1/3] lg:mx-0 lg:grid lg:max-w-none lg:grid-rows-subgrid"
    >
      <div
        className={cn(
          "relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] transition-[opacity,translate] duration-900 ease-out-expo",
          !shown && "motion-safe:translate-y-6 motion-safe:opacity-0"
        )}
      >
        {/* Sets the 4/5 portrait shape. On desktop the frame can also stretch to the height of the reasons beside it. */}
        <div aria-hidden className="aspect-[4/5]" />
        {/* The 1600x1194 photo covers a 4/5 frame, so it renders about 1.68 times the frame's width; sizes says so. */}
        <Image
          src="/media/photos/team-group.webp"
          alt="Roman Tränkle und das Team von Branded Genius"
          fill
          sizes="(min-width: 1024px) 680px, (min-width: 460px) 704px, calc((100vw - 40px) * 1.68)"
          className={cn("object-cover transition-[scale] duration-900 ease-out-expo", !shown && "motion-safe:scale-[1.06]")}
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-page/50 to-transparent" />
      </div>

      <figcaption
        className={cn(
          "mt-5 transition-[opacity,translate] delay-150 duration-900 ease-out-expo md:text-center lg:mt-0",
          !shown && "motion-safe:translate-y-3 motion-safe:opacity-0"
        )}
      >
        <p className="text-[18px] leading-snug font-medium text-white">{WHY.center.title}</p>
        <p className="t-small mt-1">{WHY.center.text}</p>
      </figcaption>
    </figure>
  );
}

function Reason({ index, icon: Icon, title, text }: { index: number; icon: LucideIcon; title: string; text: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const shown = useInView(ref, VIEW);

  return (
    <li
      ref={ref}
      className={cn(
        "flex gap-4 transition-[opacity,translate] duration-800 ease-out-expo lg:pointer-events-auto",
        PLACE[index],
        DELAY[index],
        !shown && (index < 3 ? HIDDEN.left : HIDDEN.right)
      )}
    >
      <IconChip>
        <Icon strokeWidth={1.5} />
      </IconChip>
      {/* pt-2.5 centres the first title line on the 44px chip. */}
      <div className="min-w-0 pt-2.5">
        <h3 className="text-[17px] leading-snug font-medium text-white">{title}</h3>
        <p className="t-small mt-1.5 text-ink/60">{text}</p>
      </div>
    </li>
  );
}
