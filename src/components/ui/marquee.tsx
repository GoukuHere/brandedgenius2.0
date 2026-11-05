"use client"

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

/*
  Magic UI's Marquee, adapted for Branded Genius v3: the loop pauses while the band is off screen (an endless CSS
  animation would otherwise keep the compositor busy), and only the first copy is read by screen readers.
*/

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children: React.ReactNode
  vertical?: boolean
  /** Number of copies (enough to cover the band plus one). */
  repeat?: number
}

export function Marquee({ className, reverse = false, pauseOnHover = false, children, vertical = false, repeat = 3, ...props }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      {...props}
      className={cn("group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]", vertical ? "flex-col" : "flex-row", className)}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 ? true : undefined}
          className={cn(
            "flex shrink-0 justify-around gap-(--gap) motion-reduce:[animation:none]",
            vertical ? "animate-marquee-vertical flex-col" : "animate-marquee flex-row",
            !on && "[animation-play-state:paused]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
