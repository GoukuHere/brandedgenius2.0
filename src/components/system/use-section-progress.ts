"use client";

import { useScroll, useTransform } from "motion/react";
import type { RefObject } from "react";

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/**
 * Scroll progress through a section, always calculated in JavaScript.
 *
 * Motion can hand opacity and transform animations driven by useScroll({ target }) to the browser's native
 * ViewTimeline, which measures from when the section enters the screen and ignores offsets such as
 * "start start" / "end end". At the top of the page that left the hero headline at 69% opacity. Passing the
 * value through a function-form transform keeps every mapping on the offsets we set.
 */
export function useSectionProgress(target: RefObject<HTMLElement | null>, offset: Offset) {
  const { scrollYProgress } = useScroll({ target, offset });
  return useTransform(() => scrollYProgress.get());
}
