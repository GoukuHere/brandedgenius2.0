import Image from "next/image";
import { Container, Heading, PrimaryLink } from "@/components/system/primitives";
import { UU_HERO, UU_WHO } from "@/content/pages/uber-uns";
import { OnScreen } from "./on-screen";

/*
  Über uns, the manifesto. The client's headline, very large and centred, rises line by line as the page loads, the
  title in off-white and his blue phrase in the brand gradient. Behind it the bG mark, huge and faint, catches a slow
  light now and then (a CSS mask of the mark with one soft band crossing it, only while the hero is on screen). Under
  the headline one sentence of his, his button down to the expertise, and his tag line as one quiet line under the
  button. Round 5 (2026-11-18, Roman: "less text"): his two paragraphs became that one sentence.

  Then "Wer wir sind" as a split under a hairline that draws: his heading and his first sentence on the left, the
  team photo on the right (round 5, Roman: "team picture or something instead of text text text text"). The same real
  photo as on the homepage, framed wider here (3:2) until he sends a second team shot.

  Everything in the first screen is plain server markup with CSS entrances on load, so nothing waits for script.
*/
export function UberHero() {
  return (
    <section id="hero" aria-labelledby="uu-title" className="relative">
      <OnScreen className="uu-hero relative isolate">
        <div aria-hidden className="uu-mark">
          <span className="uu-mark-sweep" />
        </div>

        <Container className="relative flex flex-col items-center pt-[136px] pb-16 text-center md:pt-[188px] md:pb-[136px]">
          <h1 id="uu-title" className="uu-manifesto">
            <span className="uu-line">
              <span style={{ animationDelay: "0.15s" }}>{UU_HERO.title}</span>
            </span>{" "}
            <span className="uu-line uu-line-accent">
              <span style={{ animationDelay: "0.32s" }}>
                <span className="accent">{UU_HERO.accent}</span>
              </span>
            </span>
          </h1>

          <p
            className="uu-rise mt-10 max-w-[600px] text-[17px] leading-[1.6] text-pretty text-white/75 md:mt-12 md:text-[19px]"
            style={{ animationDelay: "0.75s" }}
          >
            {UU_HERO.text}
          </p>

          <div className="uu-rise mt-10 flex flex-col items-center md:mt-12" style={{ animationDelay: "1s" }}>
            <PrimaryLink href="#expertise" size="lg">
              {UU_HERO.cta}
            </PrimaryLink>
            <p className="mt-6 flex flex-col items-center gap-1 text-[14px] text-white/55 sm:flex-row sm:gap-4">
              <span className="font-medium text-white/80">{UU_HERO.kind}</span>
              <span aria-hidden className="hidden h-px w-6 bg-white/25 sm:block" />
              <span>{UU_HERO.tagline}</span>
            </p>
          </div>
        </Container>
      </OnScreen>

      {/* Wer wir sind: heading and his one line on the left, the team on the right. */}
      <Container className="pt-6 md:pt-10">
        <div data-reveal="rule" className="rule" />
        <div className="grid items-center gap-10 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-x-8">
          <div className="min-w-0 lg:col-span-6">
            {/* Sized so "Unternehmenswachstum", one long word, still fits a 360px phone and the left column. */}
            <Heading title={UU_WHO.title} accent={UU_WHO.accent} className="uu-who-heading" />
            <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[460px]">
              {UU_WHO.text}
            </p>
          </div>
          <figure data-reveal="photo" className="frame relative aspect-[3/2] w-full shadow-[0_40px_80px_-40px_rgb(1_4_12/0.95)] lg:col-span-6">
            <Image src={UU_WHO.photo} alt={UU_WHO.alt} fill quality={85} sizes="(min-width: 1280px) 620px, (min-width: 1024px) 48vw, 92vw" className="object-cover object-[50%_28%]" />
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgb(4_12_30/0.45)_0%,rgb(4_12_30/0)_34%)]" />
          </figure>
        </div>
      </Container>
    </section>
  );
}
