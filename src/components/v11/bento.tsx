import type { HTMLAttributes, ReactNode } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";

/*
  v11's bento pieces (the developer: "avoid sections with too much text and use some cool layout for that, utilise
  21st.dev, Magic UI"). A Tile is one rounded light-navy cell of a bento grid with Magic UI's MagicCard light around
  the cursor (its edge and a soft spotlight; desktop mouse only, nothing runs otherwise). A featured tile also carries
  Magic UI's BorderBeam, a slow light running round its edge, one per section at most. The tiles' icons are the
  animated ones in icon-well.tsx.
*/

/**
 * `className` places and sizes the tile in its grid; `layout` lays out its content (MagicCard wraps the content);
 * `bind` takes handlers for the tile's surface (an icon that plays on hover).
 */
export function Tile({
  className,
  layout,
  bind,
  children,
  featured = false,
}: {
  className?: string;
  layout?: string;
  bind?: HTMLAttributes<HTMLDivElement>;
  children: ReactNode;
  featured?: boolean;
}) {
  return (
    <MagicCard className={cn("v11-tile rounded-[24px]", featured && "v11-tile-featured", className)} gradientSize={300}>
      {featured && <BorderBeam colorFrom="#69bff8" colorTo="#004ba0" duration={14} size={220} />}
      <div className={cn("h-full", layout)} {...bind}>
        {children}
      </div>
    </MagicCard>
  );
}
