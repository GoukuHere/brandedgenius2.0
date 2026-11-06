"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { FOOTER, HEADER, LINKS, MEDIA, NAV } from "@/content/site";
import { cn } from "@/lib/utils";

/* Pieces both layout concepts share (see concepts.css). */

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "solid" | "ghost" | "comet";
  size?: "sm" | "md" | "lg";
};

const external = (href?: string) => (href?.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});

/** The concepts' buttons: royal with a sky rim and a passing light, a quiet outline, or royal with a comet edge. */
export function ConceptLink({ children, className, variant = "solid", size = "lg", href, ...props }: LinkProps) {
  return (
    <a href={href} {...external(href)} {...props} className={cn("c-btn group", `c-btn-${variant}`, `c-btn-${size}`, className)}>
      <span className="c-btn-label">
        {children}
        <ArrowUpRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </a>
  );
}

export function Grain({ className }: { className?: string }) {
  return <div aria-hidden className={cn("c-grain", className)} />;
}

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
/** prefers-reduced-motion, safe to hydrate: false on the server and while hydrating, then the real value. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
}

/**
 * The client's hero film (Roman, then two robots appear). It plays only while on screen; with reduced motion the
 * last frame stands as a still. `className` places and sizes it.
 */
export function HeroFilm({ className, sizes }: { className?: string; sizes: string }) {
  const film = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = film.current;
    if (!video) return undefined;
    if (window.matchMedia(REDUCED).matches) {
      video.pause();
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);
  return (
    <div className={cn("pointer-events-none", className)}>
      <video
        ref={film}
        className="absolute inset-0 h-full w-full object-cover"
        src={MEDIA.heroVideo}
        poster={MEDIA.heroPoster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label="Roman Tränkle, Gründer von Branded Genius, mit zwei KI-Robotern"
      />
      <Image src="/media/hero-final.webp" alt="" fill sizes={sizes} className="hidden object-cover motion-reduce:block" />
    </div>
  );
}

/** A slim header over the concept: the wordmark and the contact action. */
export function ConceptHeader({ className }: { className?: string }) {
  const contact = NAV.find((item) => item.href === "#kontakt")?.label ?? "Kontakt";
  return (
    <header className={cn("pointer-events-none fixed inset-x-0 top-0 z-50", className)}>
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:h-[88px] md:px-12">
        <a href="#top" aria-label="Branded Genius, zum Anfang" className="pointer-events-auto block h-[26px] md:h-[30px]">
          <BrandLogo />
        </a>
        <ConceptLink href={LINKS.contact} size="sm" className="pointer-events-auto">
          <span className="hidden sm:inline">{HEADER.cta}</span>
          <span className="sm:hidden">{contact}</span>
        </ConceptLink>
      </div>
    </header>
  );
}

/** The legal line under each concept. */
export function LegalLine({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-start justify-between gap-4 text-[13px] text-white/45 sm:flex-row sm:items-center", className)}>
      <span>{FOOTER.copyright}</span>
      <nav aria-label="Rechtliches" className="flex gap-5">
        {FOOTER.legal.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener" className="transition-colors hover:text-white">
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
