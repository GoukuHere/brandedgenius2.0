"use client";

import { ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/*
  The version switcher (2026-11-07, the developer: "list all versions in nav as v1, v2 and so on"). Every version
  the client can review, on every page: v1 is the full homepage, v2 to v7 are the six layout concepts in the order
  they were made. It floats at the bottom right (the one corner none of the versions uses; v7 lifts its minimap above it); on a desktop it
  shows all versions in a row, on a phone one button that opens the list. Links are full page loads, so each
  version starts from its own beginning (several of them run their own scroll stage).
*/
export const VERSIONS = [
  { href: "/", label: "v1", name: "Startseite" },
  { href: "/v2", label: "v2", name: "Kapitel" },
  { href: "/v3", label: "v3", name: "Der blaue Faden" },
  { href: "/v4", label: "v4", name: "Papier" },
  { href: "/v5", label: "v5", name: "Kobalt" },
  { href: "/v6", label: "v6", name: "Warp" },
  { href: "/v7", label: "v7", name: "System" },
] as const;

export function VersionNav() {
  const path = usePathname();
  const current = Math.max(0, VERSIONS.findIndex((v) => v.href === path));
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLElement>(null);

  // A tap anywhere else closes the phone list.
  useEffect(() => {
    if (!open) return undefined;
    const close = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <nav ref={box} aria-label="Versionen" className="fixed right-3 bottom-3 z-[60] md:right-5 md:bottom-5">
      <ol className="hidden items-center gap-1 rounded-[14px] bg-[rgb(10_14_21/0.8)] p-1 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12),0_14px_34px_-14px_rgb(0_0_0/0.6)] backdrop-blur-md md:flex">
        {VERSIONS.map((v, i) => (
          <li key={v.href}>
            <a
              href={v.href}
              title={v.name}
              aria-label={`Version ${i + 1}: ${v.name}`}
              aria-current={i === current ? "page" : undefined}
              className={cn(
                "grid h-9 min-w-10 place-items-center rounded-[10px] px-2.5 text-[13px] font-medium transition-colors",
                i === current ? "bg-white text-[#0a0e15]" : "text-white/70 hover:bg-white/12 hover:text-white"
              )}
            >
              {v.label}
            </a>
          </li>
        ))}
      </ol>

      <div className="relative md:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-label={`Version ${current + 1}: ${VERSIONS[current].name}. Versionen anzeigen`}
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 cursor-pointer items-center gap-1.5 rounded-[12px] bg-[rgb(10_14_21/0.84)] px-3.5 text-[13px] font-medium text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14),0_12px_28px_-12px_rgb(0_0_0/0.6)] backdrop-blur-md"
        >
          {VERSIONS[current].label}
          <ChevronUp aria-hidden className={cn("size-3.5 transition-transform duration-300", !open && "rotate-180")} />
        </button>
        {open && (
          <ol className="absolute right-0 bottom-12 grid w-[180px] gap-0.5 rounded-[14px] bg-[rgb(10_14_21/0.92)] p-1 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12),0_18px_40px_-14px_rgb(0_0_0/0.7)] backdrop-blur-md">
            {VERSIONS.map((v, i) => (
              <li key={v.href}>
                <a
                  href={v.href}
                  aria-current={i === current ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-[10px] px-3 text-[14px] transition-colors",
                    i === current ? "bg-white text-[#0a0e15]" : "text-white/80 hover:bg-white/12"
                  )}
                >
                  <span className="w-6 font-medium">{v.label}</span>
                  <span className={i === current ? "text-[#0a0e15]/60" : "text-white/50"}>{v.name}</span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </nav>
  );
}
