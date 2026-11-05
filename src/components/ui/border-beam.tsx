"use client"

import { useRef } from "react"
import { motion, useInView, type MotionStyle, type Transition } from "motion/react"

import { cn } from "@/lib/utils"

/*
  Magic UI's BorderBeam: a short light that travels around a card's edge. Adapted for Branded Genius v3:
  brand blues by default, and the beam only runs while its card is on screen (an infinite animation off screen
  would keep the main thread busy for nothing). Hidden for reduced motion by CSS (motion-reduce:hidden), because
  MotionConfig only freezes transforms, not this offset-path loop.
*/

interface BorderBeamProps {
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  transition?: Transition
  className?: string
  style?: React.CSSProperties
  reverse?: boolean
  initialOffset?: number
  borderWidth?: number
}

export const BorderBeam = ({
  className,
  size = 180,
  delay = 0,
  duration = 9,
  colorFrom = "#dcecff",
  colorTo = "#69bff8",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
}: BorderBeamProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: "120px" })
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]"
      style={{ "--border-beam-width": `${borderWidth}px` } as React.CSSProperties}
    >
      {inView && (
        <motion.div
          className={cn("absolute aspect-square motion-reduce:hidden", "bg-linear-to-l from-(--color-from) via-(--color-to) to-transparent", className)}
          style={
            {
              width: size,
              offsetPath: `rect(0 auto auto 0 round ${size}px)`,
              "--color-from": colorFrom,
              "--color-to": colorTo,
              ...style,
            } as MotionStyle
          }
          initial={{ offsetDistance: `${initialOffset}%` }}
          animate={{
            offsetDistance: reverse ? [`${100 - initialOffset}%`, `${-initialOffset}%`] : [`${initialOffset}%`, `${100 + initialOffset}%`],
          }}
          transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay, ...transition }}
        />
      )}
    </div>
  )
}
