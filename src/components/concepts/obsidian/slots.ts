/* Where the six shards drift to (screen fractions). The stage puts each shard there; the page labels each one at
   the same place. Kept apart from the stage so the page can read them without loading three.js. */
export const SHARD_SLOTS_DESK = [
  { fx: 0.47, fy: 0.27 },
  { fx: 0.68, fy: 0.23 },
  { fx: 0.88, fy: 0.29 },
  { fx: 0.48, fy: 0.62 },
  { fx: 0.69, fy: 0.59 },
  { fx: 0.88, fy: 0.65 },
];
export const SHARD_SLOTS_PHONE = [
  { fx: 0.2, fy: 0.15 },
  { fx: 0.5, fy: 0.13 },
  { fx: 0.8, fy: 0.16 },
  { fx: 0.2, fy: 0.33 },
  { fx: 0.5, fy: 0.31 },
  { fx: 0.8, fy: 0.34 },
];
