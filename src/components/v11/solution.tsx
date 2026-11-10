"use client";

import Image from "next/image";
import { Fragment } from "react";
import { Container, Heading, PrimaryLink, SecondaryLink, Section } from "@/components/system/primitives";
import { Tilt } from "@/components/ui/tilt";
import { LINKS, SOLUTION } from "@/content/site";
import { Tile } from "./bento";
import { IconWell, useIconTurns, type WellHandle } from "./icon-well";
import type { IconName } from "./icons";

/*
  v11 Lösung: v1's layout and spacing (the client: "keep that position and spaces"). A split: on the left the photo
  of Roman at his desk, turning gently towards the pointer (Motion Primitives Tilt), with the two short cards as
  small plates under it; on the right the heading, the text and both actions. Below, across the full width, the
  three pillars, redesigned as v2-style panels (see Pillar).

  Reading order: heading, text and actions first, then the photo and the plates, then the pillars. On phones the
  photo and the plates are shown above the heading (CSS order; they hold nothing focusable).
*/

const pad = (i: number) => String(i + 1).padStart(2, "0");

// A no-break space before each dot keeps the dot on its item's line when the list wraps.
const NBSP = String.fromCharCode(0xa0);

/** Items joined with dots for the eye; screen readers hear a comma between them instead of the dot. */
function Joined({ items }: { items: readonly string[] }) {
  return items.map((item, i) => (
    <Fragment key={item}>
      {i > 0 && (
        <>
          <span className="sr-only">,</span>
          <span aria-hidden>{`${NBSP}·`}</span>{" "}
        </>
      )}
      {item}
    </Fragment>
  ));
}

/*
  The three pillars, which the client found "not so good" in v1 (outlined numbers drawn by the scroll, hairlines
  between): v11 makes them three bento tiles, each with an animated icon (a route for Plan, linked points for
  Systeme, people for Menschen; the developer turned the rendered 3D icons down), its word and its items as small
  chips. They rise in once with the page's entrance; nothing is tied to the scroll.
*/
const PILLAR_ICONS: IconName[] = ["route", "waypoints", "users"];

function Pillar({
  index,
  title,
  items,
  well,
  bind,
}: {
  index: number;
  title: string;
  items: readonly string[];
  well: (handle: WellHandle | null) => void;
  bind: ReturnType<ReturnType<typeof useIconTurns>["trigger"]>;
}) {
  return (
    <li>
      <Tile className="h-full" layout="flex flex-col justify-between gap-8 p-6 sm:p-8" bind={bind}>
        <div className="flex items-start justify-between gap-4">
          <IconWell ref={well} name={PILLAR_ICONS[index]} />
          <span aria-hidden className="num text-[15px] text-sky">
            {pad(index)}
          </span>
        </div>
        <div>
          <h3 className="text-[30px] leading-none font-medium tracking-[-0.025em] text-white lg:text-[34px]">{title}</h3>
          <ul role="list" className="mt-5 flex flex-wrap gap-2">
            {items.map((item) => (
              <li key={item} className="rounded-[10px] bg-white/[0.06] px-3 py-1.5 text-[14px] leading-snug text-white/80 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Tile>
    </li>
  );
}

export function SolutionSection() {
  const { area: iconArea, well: iconWell, trigger: iconTrigger } = useIconTurns<HTMLOListElement>(SOLUTION.pillars.length);
  return (
    <Section id="loesung">
      <Container>
        <div className="grid gap-y-12 lg:grid-cols-2 lg:items-center lg:gap-x-16 xl:gap-x-20">
          <div className="lg:col-start-2 lg:row-start-1">
            <Heading
              title={SOLUTION.title}
              accent={SOLUTION.accent}
              className="max-w-[600px] text-[36px] sm:text-[44px] lg:text-[48px] xl:text-[50px]"
            />
            <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[520px]">
              {SOLUTION.text}
            </p>
            <div data-reveal="up" data-rd="3" className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {/* The original opens the hosted contact form here and the booking widget from the second button. */}
              <PrimaryLink href={LINKS.contact}>{SOLUTION.primary}</PrimaryLink>
              <SecondaryLink href={LINKS.booking}>{SOLUTION.secondary}</SecondaryLink>
            </div>
          </div>

          {/* The photo opens from its bottom edge, then the two cards rise in under it. */}
          <div className="order-first lg:order-none lg:col-start-1 lg:row-start-1">
            <Tilt
              rotationFactor={5}
              springOptions={{ stiffness: 150, damping: 22, mass: 0.6 }}
              className="motion-reduce:!transform-none [@media(hover:none)]:!transform-none"
            >
              <div data-reveal="photo" className="frame aspect-[4/3] bg-deep">
                <Image src={SOLUTION.img} alt={SOLUTION.imgAlt} fill quality={85} sizes="(min-width:1024px) 600px, 100vw" className="object-cover" />
              </div>
            </Tilt>

            {/* The two cards from the original, under the photo. Side by side once there are 400px for them. */}
            <div className="@container mt-4">
              <ol data-reveal-group data-rd="3" role="list" className="grid gap-3 @min-[400px]:grid-cols-2">
                {SOLUTION.cards.map((card, i) => (
                  <li key={card.title} className="glass rounded-panel p-5">
                    <p className="text-[16px] leading-snug font-medium text-white">
                      <span aria-hidden className="mr-2 text-[13px] font-normal text-sky">
                        {pad(i)}
                      </span>
                      {card.title}
                    </p>
                    <p className="t-small mt-2">
                      <Joined items={card.items} />
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <ol ref={iconArea} role="list" data-reveal-group className="mt-16 grid gap-4 md:mt-24 md:grid-cols-3 md:gap-5 lg:mt-28">
          {SOLUTION.pillars.map((pillar, i) => (
            <Pillar key={pillar.title} index={i} title={pillar.title} items={pillar.items} well={iconWell(i)} bind={iconTrigger(i)} />
          ))}
        </ol>
      </Container>
    </Section>
  );
}
