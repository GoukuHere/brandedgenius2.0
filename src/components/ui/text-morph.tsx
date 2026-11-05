"use client";

import { AnimatePresence, LayoutGroup, motion, type Transition } from "motion/react";
import { useId, useMemo, useSyncExternalStore, type ElementType } from "react";

/*
  Text Morph, after Motion Primitives (ibelick, "text-morph"): when the string changes, the letters the old and the
  new string share glide to their new places (shared layout ids, keyed by letter and occurrence), and the others fade
  out and in.

  Adapted for long German sentences:
  - Letters are grouped per word in unbreakable wrappers, so a line only ever wraps between words. (Every letter
    has to be its own inline-block to move, and a browser may break a line between any two inline-blocks, which split
    words like "To|ol-C|haos" on phones.) The wrappers sit next to each other with a space's width between them.
  - New letters arrive in a left-to-right wave (a small per-letter delay) and rise a third of an em; leaving letters
    drift up as they fade; words that disappear fade as a whole.
  - The visual letters are hidden from screen readers; the caller provides the readable text.
  - Nothing animates on the first render (server and hydration show the text as is).
*/

// Slow enough to watch the shared letters travel (about 0.8s to settle).
const LAYOUT: Transition = { type: "spring", stiffness: 120, damping: 20, mass: 0.75 };

// False on the server and during hydration, true afterwards: only text that changes after mount animates in.
const noop = () => () => {};
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

export function TextMorph({
  children,
  as: Tag = "span",
  className,
  wave = 0.018,
}: {
  children: string;
  as?: ElementType;
  className?: string;
  /** Seconds between neighbouring letters as they arrive. */
  wave?: number;
}) {
  const uid = useId();
  const mounted = useMounted();

  const words = useMemo(() => {
    const counts: Record<string, number> = {};
    let index = 0;
    return children.split(" ").map((word) =>
      word.split("").map((char) => {
        const key = char.toLowerCase();
        counts[key] = (counts[key] ?? 0) + 1;
        return { id: `${uid}-${key}-${counts[key]}`, char, index: index++ };
      })
    );
  }, [children, uid]);

  return (
    <Tag aria-hidden className={className}>
      <LayoutGroup id={uid}>
        <AnimatePresence initial={false} mode="popLayout">
          {words.map((letters, w) => (
            <motion.span
              key={w}
              className="inline-block whitespace-nowrap"
              style={{ marginRight: w < words.length - 1 ? "0.26em" : 0 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              <AnimatePresence initial={mounted} mode="popLayout">
                {letters.map(({ id, char, index }) => (
                  <motion.span
                    key={id}
                    layoutId={id}
                    className="inline-block"
                    initial={{ opacity: 0, y: "0.35em" }}
                    animate={{ opacity: 1, y: 0 }}
                    // Leaving letters drift up as they fade, so the rewrite is visible in both directions.
                    exit={{ opacity: 0, y: "-0.3em", transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
                    transition={{
                      layout: LAYOUT,
                      opacity: { duration: 0.4, delay: index * wave },
                      y: { type: "spring", stiffness: 260, damping: 24, delay: index * wave },
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.span>
          ))}
        </AnimatePresence>
      </LayoutGroup>
    </Tag>
  );
}
