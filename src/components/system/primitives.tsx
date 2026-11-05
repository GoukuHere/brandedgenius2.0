import { ArrowUpRight } from "lucide-react";
import type { AnchorHTMLAttributes, ElementType, ReactNode } from "react";
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

/**
 * A headline in the brand face. v3 default: the whole sentence in solid white (`variant="solid"`). `variant="tone"`
 * dims the continuation (only where the copy has a natural second clause); `variant="gradient"` (or the older
 * `serif` prop) sets the continuation in the client's white-to-sky gradient, reserved for the hero and the CTA.
 */
export function Heading({
  title,
  accent,
  as: Tag = "h2",
  size = "h2",
  className,
  accentFirst = false,
  serif = false,
  variant,
}: {
  title: string;
  accent?: string;
  as?: ElementType;
  size?: "display" | "h2" | "h3";
  className?: string;
  /** Put the accent phrase before the title (when the copy reads that way). */
  accentFirst?: boolean;
  /** Older name for variant="gradient". */
  serif?: boolean;
  /** "outline" (v4) sets the continuation as an outline; display sizes only. */
  variant?: "solid" | "tone" | "gradient" | "outline";
}) {
  const cls = size === "display" ? "t-display" : size === "h3" ? "t-h3" : "t-h2";
  const mode = variant ?? (serif ? "gradient" : "solid");
  const accentEl = accent ? (
    <span className={mode === "gradient" ? "accent" : mode === "tone" ? "tone" : mode === "outline" ? "outline-text" : undefined}>{keepCompounds(accent)}</span>
  ) : null;
  return (
    <Tag className={cn(cls, className)}>
      {accentFirst && accentEl ? (
        <>
          {accentEl} {keepCompounds(title)}
        </>
      ) : (
        <>
          {keepCompounds(title)}
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
  pointer when it comes near. Primary keeps the brand's royal-blue gradient with an ice-white light; secondary is
  clear glass with a sky light. Both keep the lifting arrow.
  Corners are slightly curved, never a pill (the developer's reference, 2026-11-06). BUTTON_RADIUS is the same 12px
  as `--radius-button` in globals.css: the edge light is drawn along the same curve, so the shader needs the number.
*/
export const BUTTON_RADIUS = 12;

const ARROW = "size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

/** The brand's blue gradient button, as on brandedgenius.de, with a specular edge light. Primary action only. */
export function PrimaryLink({ children, className, size = "md", href, ...props }: LinkProps) {
  return (
    <SpecularButton
      href={href ?? "#"}
      {...external(href)}
      {...props}
      size={size}
      radius={BUTTON_RADIUS}
      tint="#1a6fe0"
      tintOpacity={0}
      lineColor="#dcecff"
      baseColor="#5f9ee8"
      textColor="#ffffff"
      idleIntensity={0.45}
      className={cn(
        "group bg-[linear-gradient(180deg,#2a86ea_0%,#0f5fc4_55%,#004ba0_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_14px_34px_-14px_rgb(26_111_224/0.85)] hover:brightness-110",
        className
      )}
    >
      {children}
      <ArrowUpRight className={ARROW} />
    </SpecularButton>
  );
}

/** The quiet second action: clear glass with a sky edge light. */
export function SecondaryLink({ children, className, size = "md", href, ...props }: LinkProps) {
  return (
    <SpecularButton
      href={href ?? "#"}
      {...external(href)}
      {...props}
      size={size}
      radius={BUTTON_RADIUS}
      tint="#dcecff"
      tintOpacity={0.04}
      lineColor="#69bff8"
      baseColor="#3a4c66"
      textColor="#ffffff"
      idleIntensity={0.32}
      className={cn("group hover:bg-white/[0.07]", className)}
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
      className={cn("group inline-flex cursor-pointer items-center gap-1.5 text-[15px] font-medium text-sky transition-colors duration-200 hover:text-white", className)}
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
