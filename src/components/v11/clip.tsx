"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/*
  v11 round 4: a short silent clip for a tile (Warum, Impact). It plays only while it is on screen and pauses off
  screen; with reduced motion only its poster (the first frame) stands and the file is never fetched.
*/
export function Clip({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(still);
    if (still) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={reduced ? undefined : src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
