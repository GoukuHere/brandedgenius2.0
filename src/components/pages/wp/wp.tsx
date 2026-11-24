import Image from "next/image";
import { Container } from "@/components/system/primitives";
import { BLOG, LISTS, WIKI, germanDate, related, type WpLegal, type WpPost } from "@/content/wp";
import { ldJson, postGraph } from "@/lib/seo";
import "./wp.css";

/*
  The client's WordPress content in the new design (2026-11-24): a post (the blog's 49 articles and the glossary's 92
  entries share one template), the blog list, the glossary A to Z and the legal pages. Each sits on the site's ground
  (SiteShell) below the fixed header, in one reading column. The text is the client's own, as his site served it;
  the labels around it are the site's own (the footer's "Blogs" and "KI Wikipedia", the nav's "Startseite").
*/

const LIST_OF = {
  uncategorized: { name: "Blogs", path: "/blog/", more: "Weitere Beiträge", all: "Alle Beiträge" },
  wikipedia: { name: "KI Wikipedia", path: "/wikipedia/", more: "Weitere Begriffe", all: "Zum KI-Glossar" },
} as const;

/** The trail above a heading: where the page sits on the site. */
function Crumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Brotkrumen" className="wp-crumbs">
      <ol>
        {items.map((item) => (
          <li key={item.name}>{item.path ? <a href={item.path}>{item.name}</a> : <span aria-current="page">{item.name}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}

export function PostArticle({ post }: { post: WpPost }) {
  const list = LIST_OF[post.cat];
  const next = related(post);
  return (
    <>
      <article className="wp-page">
        <Container>
          <div className="wp-column">
            <Crumbs items={[{ name: "Startseite", path: "/" }, { name: list.name, path: list.path }, { name: post.title }]} />
            <h1 className="wp-title">{post.h1}</h1>
            <p className="wp-meta">
              <span>Roman Tränkle</span>
              <time dateTime={post.date}>{germanDate(post.date)}</time>
            </p>
            {post.image ? (
              <figure className="wp-figure">
                <Image
                  src={post.image.src}
                  alt={post.image.alt || post.title}
                  width={post.image.width ?? 1600}
                  height={post.image.height ?? 900}
                  sizes="(min-width: 840px) 760px, calc(100vw - 40px)"
                  priority
                />
              </figure>
            ) : null}
            <div className="wp-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>

          <section aria-labelledby="wp-more" className="wp-column wp-more">
            <h2 id="wp-more" className="wp-more-title">
              {list.more}
            </h2>
            <ul role="list" className="wp-list">
              {next.map((p) => (
                <li key={p.id}>
                  <a href={p.path} className="wp-row">
                    <span className="wp-row-text">
                      <span className="wp-row-title">{p.title}</span>
                      <span className="wp-row-excerpt">{p.description ?? p.excerpt}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <a href={list.path} className="wp-link">
                {list.all}
              </a>
            </p>
          </section>
        </Container>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(postGraph(post, { name: list.name, path: list.path })) }} />
    </>
  );
}

export function BlogList() {
  const page = LISTS.blog;
  return (
    <section className="wp-page">
      <Container>
        <div className="wp-column wp-column-wide">
          <Crumbs items={[{ name: "Startseite", path: "/" }, { name: "Blogs" }]} />
          <h1 className="wp-title wp-title-xl">{page.h1}</h1>
          <p className="wp-intro">{page.intro}</p>
          <ol role="list" className="wp-list wp-list-blog">
            {BLOG.map((p, i) => (
              <li key={p.id}>
                <a href={p.path} className="wp-row">
                  <span className="wp-row-text">
                    <time dateTime={p.date} className="wp-row-date">
                      {germanDate(p.date)}
                    </time>
                    <span className="wp-row-title">{p.title}</span>
                    <span className="wp-row-excerpt">{p.description ?? p.excerpt}</span>
                  </span>
                  {p.image ? (
                    <span className="wp-row-img">
                      <Image src={p.image.src} alt="" fill sizes="(min-width: 768px) 240px, calc(100vw - 40px)" loading={i < 3 ? "eager" : "lazy"} className="object-cover" />
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/** The first letter a term is filed under (Ä with A, and so on). */
const letterOf = (title: string) => {
  const c = title.trim().charAt(0).toUpperCase();
  return ({ Ä: "A", Ö: "O", Ü: "U" } as Record<string, string>)[c] ?? (/[A-Z]/.test(c) ? c : "#");
};

export function Glossary() {
  const page = LISTS.wikipedia;
  const groups = new Map<string, typeof WIKI>();
  for (const p of WIKI) groups.set(letterOf(p.title), [...(groups.get(letterOf(p.title)) ?? []), p]);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return (
    <section className="wp-page">
      <Container>
        <div className="wp-column wp-column-wide">
          <Crumbs items={[{ name: "Startseite", path: "/" }, { name: "KI Wikipedia" }]} />
          <h1 className="wp-title wp-title-xl">{page.h1}</h1>
          <p className="wp-intro">{page.intro}</p>
          <nav aria-label="Buchstaben" className="wp-letters">
            {letters.map((l) =>
              groups.has(l) ? (
                <a key={l} href={`#buchstabe-${l.toLowerCase()}`}>
                  {l}
                </a>
              ) : (
                <span key={l} aria-hidden>
                  {l}
                </span>
              )
            )}
          </nav>
          {[...groups.entries()].map(([letter, items]) => (
            <section key={letter} id={`buchstabe-${letter.toLowerCase()}`} aria-labelledby={`wp-letter-${letter}`} className="wp-letter-group">
              <h2 id={`wp-letter-${letter}`} className="wp-letter">
                {letter}
              </h2>
              <ul role="list" className="wp-list">
                {items.map((p) => (
                  <li key={p.id}>
                    <a href={p.path} className="wp-row">
                      <span className="wp-row-text">
                        <span className="wp-row-title">{p.title}</span>
                        <span className="wp-row-excerpt">{p.description ?? p.excerpt}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function LegalPage({ page }: { page: WpLegal }) {
  return (
    <article className="wp-page">
      <Container>
        <div className="wp-column">
          <Crumbs items={[{ name: "Startseite", path: "/" }, { name: page.h1 }]} />
          <h1 className="wp-title">{page.h1}</h1>
          {page.lead.map((line) => (
            <p key={line} className="wp-intro">
              {line}
            </p>
          ))}
          <div className="wp-prose wp-prose-legal" dangerouslySetInnerHTML={{ __html: page.html }} />
        </div>
      </Container>
    </article>
  );
}
