"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
  Marks its box with data-live while any of it is on screen, so the CSS loops inside it (the hero mark's light, the
  seal's turning rings) run only while they can be seen. The attribute is set on the element directly: nothing
  re-renders when it changes.
*/
export function OnScreen({ className, children, id }: { className?: string; children: ReactNode; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.setAttribute("data-live", "");
      else el.removeAttribute("data-live");
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} id={id} className={className}>
      {children}
    </div>
  );
}
