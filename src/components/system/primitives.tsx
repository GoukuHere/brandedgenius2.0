import { ArrowUpRight } from "lucide-react";
import type { AnchorHTMLAttributes, CSSProperties, ElementType, ReactNode } from "react";
import { SpecularButton } from "@/components/ui/specular-button";
import { cn } from "@/lib/utils";

/* Shared building blocks for every section. Use these instead of re-styling the same things per section. */

export function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cn("relative py-16 md:py-24", className)}>
      {children}
    </section>
  );
}

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1280px] px-5 md:px-8", className)}>{children}</div>;
}

/** Keeps hyphenated German compounds (KI-Potenzialanalyse) whole, so a heading never breaks after "KI-". */
function keepCompounds(text: string): ReactNode {
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

/** The step between two words of a heading's entrance, in ms (the CSS multiplies `--i` by the same 40ms). */
const WORD_STEP = 40;

/**
 * The title's words, each in a mask (`.rw`) for the heading's entrance (motion block in globals.css). The spaces stay
 * plain text between the masks, so lines break exactly where they did; a compound stays whole as before. Without
 * script or with reduced motion the masks are plain inline spans.
 */
function maskedWords(text: string, first: number): ReactNode {
  let index = first;
  return text.split(/(\s+)/).map((part, i) => {
    if (!part.trim()) return part;
    const word = (
      <span key={i} className="rw">
        <span style={{ "--i": index } as CSSProperties}>
          {part.includes("-") ? <span className="whitespace-nowrap">{part}</span> : part}
        </span>
      </span>
    );
    index += 1;
    return word;
  });
}

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

/**
 * A headline in the brand face: the title in off-white and its continuation (`accent`, the copy's own second
 * phrase) in the client's white-to-sky gradient, a step lighter, exactly as in the hero. Every heading on the page
 * works this way since 2026-11-06 (the developer chose white and blue over the reference's white and grey).
 *
 * Entrance (v6, 2026-11-07): when the heading scrolls into view (RevealObserver), the title's words rise out of
 * their masks one after another and the blue phrase then fills with its colour from left to right. Pure CSS on
 * server markup; nothing is hidden without script or with reduced motion.
 */
export function Heading({
  title,
  accent,
  as: Tag = "h2",
  size = "h2",
  className,
  accentFirst = false,
}: {
  title: string;
  accent?: string;
  as?: ElementType;
  size?: "display" | "h2" | "h3";
  className?: string;
  /** Put the accent phrase before the title (when the copy reads that way). */
  accentFirst?: boolean;
}) {
  const cls = size === "display" ? "t-display" : size === "h3" ? "t-h3" : "t-h2";
  // The phrase fills once the title's words are on their way (or first, when it leads), so it always lands last.
  const accentDelay = accentFirst ? 0 : wordCount(title) * WORD_STEP + 200;
  const accentEl = accent ? (
    <span className="accent" style={{ "--accent-delay": `${accentDelay}ms` } as CSSProperties}>
      {keepCompounds(accent)}
    </span>
  ) : null;
  return (
    <Tag data-reveal="heading" className={cn(cls, className)}>
      {accentFirst && accentEl ? (
        <>
          {accentEl} {maskedWords(title, 5)}
        </>
      ) : (
        <>
          {maskedWords(title, 0)}
          {accentEl ? <> {accentEl}</> : null}
        </>
      )}
    </Tag>
  );
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; size?: "md" | "lg" };

const external = (href?: string) => (href?.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});

/*
  The two buttons are React Bits' SpecularButton (components/ui/specular-button.tsx): a thin edge light follows the
  pointer when it comes near. Both keep the lifting arrow.
  v5 (2026-11-06), after the developer's reference: the main button is cream (#ecebe6) with near-black text and a
  royal edge light; the second is dark and matte with a hairline and a sky light. As in the reference, the header
  uses the second style, so the cream button leads in the content.
  Corners are slightly curved, never a pill (the developer's reference, 2026-11-06). BUTTON_RADIUS is the same 12px
  as `--radius-button` in globals.css: the edge light is drawn along the same curve, so the shader needs the number.
*/
export const BUTTON_RADIUS = 12;

const ARROW = "size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

/** The cream main button with a royal edge light. Primary action only. */
export function PrimaryLink({ children, className, size = "md", href, ...props }: LinkProps) {
  return (
    <SpecularButton
      href={href ?? "#"}
      {...external(href)}
      {...props}
      size={size}
      radius={BUTTON_RADIUS}
      tint="#ecebe6"
      tintOpacity={1}
      lineColor="#004ba0"
      baseColor="#c4c3bd"
      textColor="#141414"
      idleIntensity={0.4}
      className={cn("group shadow-[0_12px_28px_-14px_rgb(0_0_0/0.9)] hover:bg-[#f7f7f4]", className)}
    >
      {children}
      <ArrowUpRight className={ARROW} />
    </SpecularButton>
  );
}

/** The quiet second action: dark matte with a hairline and a sky edge light. */
export function SecondaryLink({ children, className, size = "md", href, ...props }: LinkProps) {
  return (
    <SpecularButton
      href={href ?? "#"}
      {...external(href)}
      {...props}
      size={size}
      radius={BUTTON_RADIUS}
      tint="#ffffff"
      tintOpacity={0.045}
      lineColor="#69bff8"
      baseColor="#555555"
      textColor="#f1f1ee"
      idleIntensity={0.3}
      className={cn("group hover:bg-white/[0.08]", className)}
    >
      {children}
      <ArrowUpRight className={ARROW} />
    </SpecularButton>
  );
}

/** Inline text link with an arrow, for tertiary actions inside sections. */
export function TextLink({ children, className, href, ...props }: LinkProps) {
  return (
    <a
      href={href}
      {...external(href)}
      {...props}
      className={cn("group inline-flex cursor-pointer items-center gap-1.5 text-[15px] font-medium text-white transition-colors duration-200 hover:text-sky", className)}
    >
      {children}
      <ArrowUpRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

/** A meaningful icon set bare in sky (v3 has no icon holders: icons in tinted shapes read as a template). */
export function IconChip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex shrink-0 text-sky [&>svg]:size-5", className)}>{children}</span>;
}
