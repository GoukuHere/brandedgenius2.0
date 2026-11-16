import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { RevealObserver } from "@/components/system/reveal-observer";
import { SmoothScroll } from "@/components/system/smooth-scroll";
import { V11Background } from "@/components/v11/background";
import { Footer } from "@/components/v11/footer";
import "@/components/v11/v11.css";

/*
  The site's one frame (2026-11-16: the client approved v11, which became the only version; every page now shares its
  ground). v11's fixed navy background with its sixteen thin lines, the floating header, the footer, the reveal
  observer and v1's smooth scrolling. A page passes only its sections; each page owns its own hero.
*/
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="v11">
      <V11Background />
      <Header />
      <main id="main" className="overflow-x-clip">
        {children}
      </main>
      <Footer />
      <RevealObserver />
      <SmoothScroll />
    </div>
  );
}
