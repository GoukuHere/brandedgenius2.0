/*
  The one background for the whole page, after the client's reference (arventas.de): soft royal-blue light and
  thin flowing lines. It is fixed behind everything and never animates, so it costs nothing while scrolling. No
  section sets its own background.

  2026-11-06: the developer found it "hardly visible", so the light and the lines are stronger than before (the
  lines went from 5.5% to 13% opacity, the glow from 20% to about a third), still one background, still behind
  everything.

  v5 (2026-11-06): the base is the v5 black (#111) instead of navy. A flat black without these layers was tried
  first and the developer asked for the background back, so the lines sit on the black. The developer then asked
  for it "more darker, not that much blue shade": the lines stay at 13%, the royal light is about a third of what
  it was (0.36 to 0.12 at the top right), a faint hint rather than a navy wash.
*/

// Sixteen gentle curves sweeping across the screen, like contour lines; generated once, deterministic.
const LINES = Array.from({ length: 16 }, (_, i) => {
  const y = -120 + i * 78;
  const bend = 140 + (i % 4) * 36;
  return `M -80 ${y} C 420 ${y + bend}, 980 ${y - bend * 0.6}, 1680 ${y + bend * 0.9}`;
});

export function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-page">
      {/* All light on the page lives here, fixed, so every section sees the same ground (no per-section light). */}
      <div className="absolute inset-0 bg-[radial-gradient(1300px_820px_at_82%_4%,rgb(0_75_160/0.12),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(620px_420px_at_84%_2%,rgb(26_111_224/0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_720px_at_6%_58%,rgb(0_75_160/0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(1600px_560px_at_30%_106%,rgb(26_111_224/0.04),transparent_70%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" fill="none">
        <g stroke="#69bff8" strokeOpacity="0.13" strokeWidth="1" vectorEffect="non-scaling-stroke">
          {LINES.map((d, i) => (
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_65%,rgb(8_8_8/0.45))]" />
    </div>
  );
}
