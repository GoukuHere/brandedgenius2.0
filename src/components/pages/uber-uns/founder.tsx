import Image from "next/image";
import { Container, Heading } from "@/components/system/primitives";
import { UU_FOUNDER } from "@/content/pages/uber-uns";

/*
  Über uns, the founder: an editorial spread. Roman's portrait large on the left (it opens from its foot as it comes
  into view and drifts a little slower than the page); on the right his quote set big in the heading style, the title
  sentence in off-white and the second in the brand gradient. His heading follows as the quote's byline (it is the
  section's h2, first in the markup), after a short sky rule. His four bio paragraphs sit in a narrow, quiet column,
  set in from the quote, so the right side steps down like a magazine page.
*/
export function UberFounder() {
  return (
    <section id="gruender" className="relative py-16 md:py-24">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-x-8">
          <figure
            data-reveal="photo"
            data-parallax
            // Desktop: the portrait runs the full height of the text beside it, like a full-page photo in a magazine.
            className="frame relative aspect-[4/5] w-full shadow-[0_40px_80px_-40px_rgb(1_4_12/0.95)] lg:col-span-5 lg:aspect-auto lg:min-h-[620px] lg:self-stretch"
          >
            <Image
              src={UU_FOUNDER.photo}
              alt={UU_FOUNDER.alt}
              fill
              quality={85}
              sizes="(min-width: 1280px) 500px, (min-width: 1024px) 40vw, 92vw"
              // The tall desktop crop keeps the whole BRANDED GENIUS wall sign beside him.
              className="object-cover object-[50%_16%] lg:object-[4%_20%]"
            />
            {/* A navy grade at the foot, so the photo sits in the page's light. */}
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgb(4_12_30/0.55)_0%,rgb(4_12_30/0)_38%)]" />
          </figure>

          <div className="flex flex-col lg:col-span-7 lg:col-start-6 lg:pt-6 lg:pl-10 xl:pl-14">
            {/* The heading comes first for screen readers; on screen it is the quote's byline. */}
            <div className="order-2 mt-8 flex items-center gap-4 md:mt-10">
              <span aria-hidden data-reveal="rule" className="h-px w-10 shrink-0 bg-sky" />
              <Heading as="h2" size="h3" title={UU_FOUNDER.name} accent={UU_FOUNDER.role} className="text-[20px] md:text-[24px]" />
            </div>

            <blockquote className="order-1">
              <Heading as="p" title={UU_FOUNDER.quoteTitle} accent={UU_FOUNDER.quoteAccent} className="uu-quote" />
            </blockquote>

            <div data-reveal-group data-rd="1" className="order-3 mt-12 max-w-[440px] space-y-5 md:mt-14 lg:ml-[18%]">
              {UU_FOUNDER.bio.map((p) => (
                <p key={p} className="text-[15px] leading-[1.7] text-pretty text-white/62 md:text-[16px]">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
