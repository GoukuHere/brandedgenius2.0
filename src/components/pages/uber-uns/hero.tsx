import { Container, Heading, PrimaryLink } from "@/components/system/primitives";
import { UU_HERO, UU_WHO } from "@/content/pages/uber-uns";
import { OnScreen } from "./on-screen";

/*
  Über uns, the manifesto. The client's headline, very large and centred, rises line by line as the page loads, the
  title in off-white and his blue phrase in the brand gradient. Behind it the bG mark, huge and faint, catches a slow
  light now and then (a CSS mask of the mark with one soft band crossing it, only while the hero is on screen). Under
  the headline his two paragraphs as a short two-column deck, his button down to the expertise, and his tag line as one
  quiet line under the button.

  Then "Wer wir sind" as a split: his heading on the left, his paragraph on the right, under a hairline that draws.

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

          <div className="uu-deck mt-10 grid w-full max-w-[800px] gap-4 md:mt-14 md:grid-cols-2 md:gap-0">
            {UU_HERO.text.map((p, i) => (
              <p
                key={p}
                className="uu-rise text-[16px] leading-[1.65] text-pretty text-white/70 md:px-9 md:text-left md:text-[17px]"
                style={{ animationDelay: `${0.75 + i * 0.12}s` }}
              >
                {p}
              </p>
            ))}
          </div>

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

      {/* Wer wir sind: heading left, text right. */}
      <Container className="pt-6 md:pt-10">
        <div data-reveal="rule" className="rule" />
        <div className="grid gap-7 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-x-8">
          {/* Sized so "Unternehmenswachstum", one long word, still fits a 360px phone. */}
          <Heading title={UU_WHO.title} accent={UU_WHO.accent} className="uu-who-heading lg:col-span-6" />
          <p data-reveal="up" data-rd="2" className="t-lead max-w-[560px] lg:col-span-5 lg:col-start-8 lg:pt-2">
            {UU_WHO.text}
          </p>
        </div>
      </Container>
    </section>
  );
}
