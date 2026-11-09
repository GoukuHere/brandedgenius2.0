import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  v10's 3D icons (the client: "maybe here some 3D icons missing, something that will be better"). A glossy tile in
  the brand blues with depth: a lit top edge, a sheen across its upper half, a darker base and a soft cast shadow,
  the white glyph embossed on it. Pure CSS and an SVG glyph, so it costs nothing to draw and stays sharp at any size.
*/
export function Icon3D({ icon: Icon, className, size = "md" }: { icon: LucideIcon; className?: string; size?: "sm" | "md" }) {
  return (
    <span aria-hidden className={cn("v10-icon3d", size === "sm" && "v10-icon3d-sm", className)}>
      <Icon strokeWidth={1.9} />
    </span>
  );
}
