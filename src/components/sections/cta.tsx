import { ArrowUpRight, Check } from "lucide-react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { BorderBeam } from "@/components/ui/border-beam";
import { CTA, LINKS } from "@/content/site";

/*
  Kontakt: the page's closing call to action and its one looping light. A single lit glass panel with a slow
  sky-to-royal BorderBeam (it pauses off screen and is hidden for reduced motion). No cards inside it.

  Desktop (lg): 12 columns. Left (7): the headline with the client's white-to-sky phrase, the text and the three
  checks. Right (5): the two actions as full-width rows, sitting on the panel's lower edge. Below lg everything stacks.

  The first row is the original's "Send Message", the client's hosted contact form (labelled with the German label the
  original gives the same form elsewhere, see site.ts); the second books the strategy call. Both open in a new tab.
*/

const ACTIONS = [
  { href: LINKS.contact, label: CTA.primary },
  { href: LINKS.booking, label: CTA.secondary },
];

export function CtaSection() {
  return (
    <Section id="kontakt">
      <Container>
        <Reveal>
          <div className="glass glass-lit rounded-panel p-6 md:p-14">
            <BorderBeam colorFrom="#69bff8" colorTo="#004ba0" duration={16} size={260} />

            <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-8">
              <div className="lg:col-span-7">
                <Heading title={CTA.title} accent={CTA.accent} className="max-w-[640px]" />
                <p className="t-lead mt-6 max-w-[560px]">{CTA.text}</p>
                <ul role="list" className="mt-8 flex flex-col gap-3">
                  {CTA.checks.map((check) => (
                    <li key={check} className="flex items-center gap-3 text-[16px] leading-[1.5] text-white/80">
                      <Check aria-hidden strokeWidth={1.5} className="size-4 shrink-0 text-sky" />
                      {check}
                    </li>
                  ))}
                </ul>
              </div>

              <ul role="list" className="lg:col-span-5 lg:col-start-8 lg:self-end">
                {ACTIONS.map((action, i) => (
                  <li key={action.href}>
                    {i > 0 && <div aria-hidden className="rule" />}
                    <a
                      href={action.href}
                      target="_blank"
                      rel="noopener"
                      className={`group flex items-center justify-between gap-5 rounded-2xl ${i === 0 ? "pb-6" : "pt-6"}`}
                    >
                      {/* 22px on phones: "KI-Potenzialanalyse" then still fits beside the 52px button at 360px. */}
                      <span className="min-w-0 text-[22px] leading-[1.2] font-medium tracking-[-0.02em] hyphens-auto text-white sm:text-[24px] xl:text-[26px]">
                        {action.label}
                      </span>
                      <span
                        aria-hidden
                        className="grid size-[52px] shrink-0 place-items-center rounded-button border border-white/15 text-white transition-[background-color,border-color,color] duration-200 ease-out group-hover:border-cream group-hover:bg-cream group-hover:text-page group-focus-visible:border-cream group-focus-visible:bg-cream group-focus-visible:text-page"
                      >
                        <ArrowUpRight
                          strokeWidth={1.5}
                          className="size-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
