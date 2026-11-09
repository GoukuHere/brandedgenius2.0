"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMounted } from "@/components/concepts/shared";
import { isSceneId, SCENE_ASPECT, ServiceAnimation, type SceneId } from "@/components/sections/service-scenes";
import { Container, Heading, Section, TextLink } from "@/components/system/primitives";
import { LINKS, SERVICES } from "@/content/site";

/*
  v10 Leistungen. The client liked v1's four service plates and their drawings ("many ideas", "very cool idea"), but
  found them "too dark, no colors, no contrast" and asked for "the animation, the text a little bit better". So: the
  same plates and drawings in normal scrolling (no sticky stack), on v2's royal panel light, the drawing screened
  onto blue so its lines stay bright, the number in sky, the title larger and the text brighter. Each drawing only
  plays while its plate is on screen.
*/

type Service = (typeof SERVICES.items)[number] & { id: SceneId };
const ITEMS = SERVICES.items.filter((s): s is Service => isSceneId(s.id));

/** Keeps hyphenated compounds (KI-Agenten) whole, so a title never breaks after "KI-". */
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

function Plate({ service, index }: { service: Service; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  // The drawing's coordinates round differently on the server, so it is drawn only in the browser; a box of its size
  // holds its place until then.
  const mounted = useMounted();
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "-10% 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} role="listitem" className="v10-plate rounded-[22px] p-4 sm:p-6 lg:p-8">
      <div aria-hidden className="v10-scene overflow-hidden rounded-[14px]">
        {mounted ? <ServiceAnimation id={service.id} playing={inView} /> : <div className="w-full" style={{ aspectRatio: SCENE_ASPECT }} />}
      </div>
      <div className="mt-6 grid gap-4 sm:mt-7 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 lg:mt-8 lg:gap-14">
        <h3 data-reveal="up" className="text-[27px] leading-[1.14] font-medium tracking-[-0.018em] text-balance text-white sm:text-[31px] lg:text-[34px]">
          <span aria-hidden className="num mr-3 text-sky">
            {String(index + 1).padStart(2, "0")}
          </span>
          {keepCompounds(service.title)}
        </h3>
        <div data-reveal="up" data-rd="2">
          <p className="text-[16.5px] leading-[1.6] text-white/80 lg:text-[17px]">{service.text}</p>
          <TextLink href={LINKS.contact} className="mt-3 min-h-11">
            {service.cta}
          </TextLink>
        </div>
      </div>
    </div>
  );
}

export function ServicesSection() {
  return (
    <Section id="leistungen">
      <Container>
        <div className="max-w-[820px]">
          <Heading title={SERVICES.title} accent={SERVICES.accent} />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[620px]">
            {SERVICES.text}
          </p>
          <div data-reveal="up" data-rd="3" className="mt-5">
            <TextLink href={LINKS.contact} className="min-h-11">
              {SERVICES.cta}
            </TextLink>
          </div>
        </div>
        <div role="list" className="mt-12 grid gap-5 md:mt-16 md:gap-6">
          {ITEMS.map((service, i) => (
            <Plate key={service.id} service={service} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
