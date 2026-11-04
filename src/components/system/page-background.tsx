/*
  The one background for the whole page, after the client's reference (arventas.de): a deep navy base, a soft
  royal-blue glow and faint thin flowing lines. It is fixed behind everything and never animates, so it costs
  nothing while scrolling. No section sets its own background.
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
      <div className="absolute inset-0 bg-[radial-gradient(1200px_760px_at_80%_8%,rgb(0_75_160/0.26),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_640px_at_6%_92%,rgb(105_191_248/0.07),transparent_70%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" fill="none">
        <g stroke="#69bff8" strokeOpacity="0.07" strokeWidth="1" vectorEffect="non-scaling-stroke">
          {LINES.map((d, i) => (
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgb(5_10_20/0.6))]" />
    </div>
  );
}
