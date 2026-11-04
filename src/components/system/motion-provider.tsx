"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Respects the visitor's reduced-motion setting for every motion animation on the page: movement (transforms)
 * is skipped and gentle fades stay. Because components render the same markup either way, the server HTML and
 * the first browser render always match. Never branch the rendered tree on useReducedMotion() for this.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
