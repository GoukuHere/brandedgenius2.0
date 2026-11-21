/**
 * The shape of a piece of German copy with its words widened to plain strings, so an English module can be checked
 * against it (same keys, same nesting, same list lengths left to the author) without having to repeat the German.
 * The registry (content/copy.ts) types both languages as the German, so components see one type; the English is
 * checked against this shape where it is written, and its ids (slugs, keys used in code) must equal the German ones.
 */
export type Shape<T> = T extends string
  ? string
  : T extends number | boolean | null | undefined
    ? T
    : T extends readonly (infer U)[]
      ? Shape<U>[]
      : T extends object
        ? { -readonly [K in keyof T]: Shape<T[K]> }
        : T;
