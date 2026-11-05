/*
  The one background for the whole page. It is fixed behind everything and never animates, and no section sets its
  own background.

  v5 (2026-11-06): flat black, after the developer's reference (the 21st.dev Stipple Orb Landing, lagoon theme,
  dark mode): no glow and no lines, so the neutrals carry the page and the brand blue stays a small accent. v3 and
  v4 used the client's arventas.de reference instead (deep navy, soft royal light and thin curved lines). If the
  client wants some navy back, one faint royal glow at the top of this layer restores it without touching anything
  else, for example: radial-gradient(1300px 820px at 82% 4%, rgb(0 75 160 / 0.22), transparent 70%).
*/
export function PageBackground() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-page" />;
}
