/*
  v11's one background: v1's PageBackground (one fixed ground for the whole page, sixteen thin flowing lines, never
  animating) in v2's light navy instead of v1's black (the client: "this navy blue background, can we use it for a full
  website?"). Fixed behind the page inside .v11, so it covers v1's black ground underneath.
*/

// v1's sixteen gentle curves sweeping across the screen, like contour lines; deterministic.
const LINES = Array.from({ length: 16 }, (_, i) => {
  const y = -120 + i * 78;
  const bend = 140 + (i % 4) * 36;
  return `M -80 ${y} C 420 ${y + bend}, 980 ${y - bend * 0.6}, 1680 ${y + bend * 0.9}`;
});

export function V11Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 isolate overflow-hidden">
      <div className="v11-ground" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" fill="none">
        <g stroke="#69bff8" strokeOpacity="0.13" strokeWidth="1">
          {LINES.map((d, i) => (
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
      <div className="v11-ground-grain" />
    </div>
  );
}
