import { ArrowUpRight } from "lucide-react";
import type { AnchorHTMLAttributes, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Shared building blocks for every section. Use these instead of re-styling the same things per section. */

export function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cn("relative py-24 md:py-32", className)}>
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
 * A two-tone headline: the title in white and its continuation (`accent`) in a softer ink. Only the hero and the
 * closing contact section pass `serif`, which sets the continuation in the client's serif gradient instead.
 */
export function Heading({
  title,
  accent,
  as: Tag = "h2",
  size = "h2",
  className,
  accentFirst = false,
  serif = false,
}: {
  title: string;
  accent?: string;
  as?: ElementType;
  size?: "display" | "h2" | "h3";
  className?: string;
  /** Put the accent phrase before the title (when the copy reads that way). */
  accentFirst?: boolean;
  /** Set the continuation in the serif gradient (hero and closing CTA only). */
  serif?: boolean;
}) {
  const cls = size === "display" ? "t-display" : size === "h3" ? "t-h3" : "t-h2";
  const accentEl = accent ? <span className={serif ? "accent" : "tone"}>{keepCompounds(accent)}</span> : null;
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

/** The brand's blue gradient pill, as on brandedgenius.de, with a lifting arrow. Primary action only. */
export function PrimaryLink({ children, className, size = "md", href, ...props }: LinkProps) {
  return (
    <a
      href={href}
      {...external(href)}
      {...props}
      className={cn(
        "group inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full font-medium whitespace-nowrap text-white transition-[filter,transform,box-shadow] duration-300 ease-out hover:brightness-110 active:scale-[0.98]",
        "bg-[linear-gradient(180deg,#2a86ea_0%,#0f5fc4_55%,#004ba0_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_14px_34px_-14px_rgb(26_111_224/0.85)]",
        size === "lg" ? "h-14 px-8 text-[16px]" : "h-12 px-6 text-[15px]",
        className
      )}
    >
      {children}
      <ArrowUpRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

/** Quiet outline pill for the second action. */
export function SecondaryLink({ children, className, size = "md", href, ...props }: LinkProps) {
  return (
    <a
      href={href}
      {...external(href)}
      {...props}
      className={cn(
        "group inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[0.03] font-medium whitespace-nowrap text-white transition-[border-color,background-color,transform] duration-300 ease-out hover:border-white/35 hover:bg-white/[0.07] active:scale-[0.98]",
        size === "lg" ? "h-14 px-8 text-[16px]" : "h-12 px-6 text-[15px]",
        className
      )}
    >
      {children}
      <ArrowUpRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
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

/** Square icon holder in the brand's sky blue. Pass a lucide icon as the child. */
export function IconChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl border border-sky/20 bg-sky/[0.08] text-sky [&>svg]:size-5", className)}>
      {children}
    </span>
  );
}
