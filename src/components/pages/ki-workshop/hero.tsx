import { Check } from "lucide-react";
import Image from "next/image";
import { Container, Heading, PrimaryLink } from "@/components/system/primitives";
import { getCopy } from "@/i18n/server";

/*
  Hero, split. Left: his headline (the blue phrase "Produktiver arbeiten." on its own line, as on his page), his lead,
  his four points as a quiet ticked set and his one action. Right: Roman in the middle of a training, in a tall
  rounded frame, with a small floating glass tag that carries his name, his role and "Praxisnahes Training".

  Phones: the photo comes first, in a flatter frame (5:4) just under the header, the tag inside its lower corner; the
  headline and the rest follow. Desktop: the frame is 600 to 640px tall and the tag hangs over its left edge.
  The entrances are the site's own (the reveal observer): the photo opens from its foot, the headline's words rise,
  the ticks draw one after another, the tag rises last.
  Round 5 (DE/EN): copy by language.
*/
export async function KwHero() {
  const copy = await getCopy();
  const { KW_HERO, KW_MEDIA } = copy.kiWorkshop;
  const { LINKS } = copy.site;
  return (
    <section id="hero" className="relative pt-[92px] pb-16 md:pt-[120px] md:pb-24 lg:pt-[132px]">
      <Container>
        <div className="grid gap-y-9 lg:grid-cols-12 lg:items-center lg:gap-x-8">
          <div className="relative lg:order-2 lg:col-span-5 lg:col-start-8">
            <div aria-hidden className="kw-glow absolute -inset-x-16 -inset-y-20 -z-10 hidden lg:block" />
            <div data-reveal="photo" className="frame kw-hero-frame aspect-[5/4] sm:aspect-[16/11] lg:aspect-auto lg:h-[600px] xl:h-[640px]">
              <Image
                src={KW_MEDIA.hero}
                alt={KW_HERO.alt}
                fill
                priority
                quality={85}
                sizes="(min-width: 1280px) 500px, (min-width: 1024px) 40vw, calc(100vw - 40px)"
                className="object-cover object-[50%_32%] lg:object-[46%_50%]"
              />
            </div>
            <div data-reveal="up" data-rd="4" className="kw-hero-tag bottom-3 left-3 sm:bottom-5 sm:left-5 lg:bottom-10 lg:-left-12">
              <p className="text-[14px] leading-tight font-medium text-white sm:text-[16px]">{KW_HERO.tag.name}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-white/70 sm:text-[13.5px]">{KW_HERO.tag.role}</p>
              <p className="mt-2.5 flex items-center gap-2 border-t border-white/10 pt-2.5 text-[12.5px] leading-none text-white/85 sm:mt-3 sm:pt-3 sm:text-[13px]">
                <span aria-hidden className="size-1.5 rounded-full bg-sky shadow-[0_0_10px_rgb(105_191_248/0.9)]" />
                {KW_HERO.tag.note}
              </p>
            </div>
          </div>

          <div className="lg:order-1 lg:col-span-7 lg:pr-6">
            <Heading
              as="h1"
              size="display"
              title={KW_HERO.title}
              accent={KW_HERO.accent}
              className="kw-break max-w-[660px] max-sm:text-[30px] max-sm:leading-[1.08]"
            />
            <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[540px]">
              {KW_HERO.text}
            </p>
            <ul role="list" className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-[auto_auto] sm:justify-start">
              {KW_HERO.points.map((point, i) => (
                <li key={point} data-reveal="tick" data-rd={i + 2} className="flex items-start gap-3 text-[15px] leading-[1.45] text-white/80">
                  <Check aria-hidden strokeWidth={1.5} className="mt-[3px] size-4 shrink-0 text-sky" />
                  {point}
                </li>
              ))}
            </ul>
            <div data-reveal="up" data-rd="5" className="mt-10">
              <PrimaryLink size="lg" href={LINKS.contact}>
                {KW_HERO.cta}
              </PrimaryLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
