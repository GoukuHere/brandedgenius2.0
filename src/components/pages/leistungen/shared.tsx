"use client";

import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore, type ButtonHTMLAttributes, type ReactNode, type RefObject } from "react";
import { Heading, TextLink } from "@/components/system/primitives";
import { useCopy } from "@/i18n/client";
import { cn } from "@/lib/utils";

/*
  What the /leistungen sections share: a few browser hooks (all hydration-safe: the server value is the calm one),
  the text column of a service section (heading, text, use cases as pills, link), and the small button the demos use.
  Round 5 (DE/EN): copy by language.
*/

/** A media query through useSyncExternalStore: false on the server and while hydrating, then the real value. */
export function useMedia(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
/** False while the browser tab is hidden. */
export const useTabVisible = () => useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true);

/** Whether the element is on screen now (with an optional margin). */
export function useOnScreen(ref: RefObject<Element | null>, rootMargin = "0px") {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return on;
}

/** Becomes true once, the first time the element is well inside the screen (`share` of it visible). */
export function useSeenOnce(ref: RefObject<Element | null>, share = 0.45) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: share }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, share, seen]);
  return seen;
}

/**
 * A use case list as small quiet pills (his "Mögliche Einsatzbereiche" and the like), under a plain label. Phones: one
 * row you swipe sideways (faded at its edges) instead of eight to ten stacked lines, so the list never reads as a text
 * block (the client: "too much text").
 */
export function UsePills({ label, items, className, center = false }: { label: string; items: readonly string[]; className?: string; center?: boolean }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className={cn("text-[14px] leading-snug text-silver", center && "text-center")}>{label}</p>
      <ul
        role="list"
        data-reveal-group
        data-rd="1"
        data-lenis-prevent-horizontal
        className={cn("ls-use-row mt-3 flex gap-2 sm:flex-wrap", center && "sm:justify-center")}
      >
        {items.map((item) => (
          <li key={item} className="ls-use">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The text side of a service section: his heading (white and sky), his text, the use cases, his link. */
export function ServiceText({
  title,
  accent,
  text,
  usesLabel,
  uses,
  cta,
  className,
}: {
  title: string;
  accent: string;
  text: string;
  usesLabel?: string;
  uses?: readonly string[];
  cta: string;
  className?: string;
}) {
  const { LINKS } = useCopy().site;
  return (
    <div className={cn("min-w-0", className)}>
      <Heading title={title} accent={accent} className="ls-service-title" />
      <p data-reveal="up" data-rd="2" className="t-body mt-5 max-w-[540px] text-white/75 md:mt-6">
        {text}
      </p>
      {usesLabel && uses ? <UsePills label={usesLabel} items={uses} className="mt-7 md:mt-8" /> : null}
      <div data-reveal="up" data-rd="3" className="mt-6 md:mt-7">
        <TextLink href={LINKS.contact} className="min-h-11">
          {cta}
        </TextLink>
      </div>
    </div>
  );
}

type DemoButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: LucideIcon;
  tone?: "primary" | "quiet";
  children: ReactNode;
};

/** The demos' own button: 40px, 12px corners; royal with a sky rim (primary) or clear with a hairline (quiet). */
export function DemoButton({ icon: Icon, tone = "quiet", className, children, type = "button", ...props }: DemoButtonProps) {
  return (
    <button type={type} {...props} className={cn("ls-btn", tone === "primary" && "ls-btn-primary", className)}>
      {Icon ? <Icon aria-hidden strokeWidth={1.75} className="size-4 shrink-0" /> : null}
      <span>{children}</span>
    </button>
  );
}

/** Keeps hyphenated compounds whole, so a line never breaks after "KI-". */
export function keepCompounds(text: string): ReactNode {
  return text.split(/(\s+)/).map((part, i) =>
    part.includes("-") && part.trim() ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    )
  );
}
