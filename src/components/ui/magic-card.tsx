"use client"

import React, { useCallback } from "react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"

import { cn } from "@/lib/utils"

/*
  Magic UI's MagicCard, adapted for Branded Genius v3: a glass card whose edge and surface light up around the
  cursor in the brand blues. Dark only (no next-themes). The glass fill comes from the `.glass` class the caller
  passes; this component only adds the cursor light on the 1px edge and a soft spotlight inside.
*/

interface MagicCardProps {
  children?: React.ReactNode
  className?: string
  /** Radius of the cursor light in px. */
  gradientSize?: number
  /** Edge light colours (brand blues by default). */
  gradientFrom?: string
  gradientTo?: string
  /** Inner spotlight colour and strength. */
  gradientColor?: string
  gradientOpacity?: number
}

export function MagicCard({
  children,
  className,
  gradientSize = 260,
  gradientFrom = "#69bff8",
  gradientTo = "#004ba0",
  gradientColor = "rgb(241 241 238 / 0.05)",
  gradientOpacity = 1,
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY]
  )
  const onLeave = useCallback(() => {
    mouseX.set(-gradientSize)
    mouseY.set(-gradientSize)
  }, [mouseX, mouseY, gradientSize])

  const edge = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientFrom}, ${gradientTo} 45%, transparent 100%)`
  const spot = useMotionTemplate`radial-gradient(${gradientSize * 1.4}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`

  return (
    <div className={cn("group/magic relative isolate", className)} onPointerMove={onMove} onPointerLeave={onLeave}>
      {/* The lit edge: a 1px ring drawn by masking a cursor-centred gradient to the border box. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/magic:opacity-100 group-hover/magic:will-change-[background]"
        style={{
          background: edge,
          padding: 1,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/magic:opacity-100"
        style={{ background: spot, opacity: gradientOpacity }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </div>
  )
}
