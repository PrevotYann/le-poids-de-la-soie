// Single source of truth for the Minase mill geometry. The painted map (tools/art)
// and the Foundry scene (walls, doors, lights, notes, tokens) both read it.
// Units are grid squares: 1 square = 100 px = 1,5 m (the system's fixed scale).

export const GRID = 100;
export const MAP = { w: 36, h: 24 };

// x0, y0, x1, y1 in squares. A is an open-air walled yard; the others are buildings.
export const ZONES = {
  A: { name: "Cour", x0: 3, y0: 1, x1: 13, y1: 12, floor: "earth" },
  B: { name: "Atelier", x0: 13, y0: 1, x1: 25, y1: 12, floor: "planks" },
  C: { name: "Chaufferie", x0: 25, y0: 1, x1: 33, y1: 12, floor: "stone" },
  D: { name: "Bureau", x0: 3, y0: 12, x1: 13, y1: 23, floor: "tatami" },
  E: { name: "Magasin", x0: 13, y0: 12, x1: 25, y1: 23, floor: "planks" },
  F: { name: "Quai", x0: 25, y0: 12, x1: 33, y1: 23, floor: "dock" },
};

// Door openings: wall segment [x0,y0,x1,y1] in squares, type, initial state.
export const DOORS = [
  { key: "portail", label: "Portail (fermé par Tamaki)", c: [3, 5, 3, 8], state: "locked" },
  { key: "AB", c: [13, 6, 13, 8] },
  { key: "BC", c: [25, 6, 25, 8] },
  { key: "AD", c: [7, 12, 9, 12] },
  { key: "BE", c: [18, 12, 20, 12] },
  { key: "CF", c: [28, 12, 30, 12] },
  { key: "DE", c: [13, 17, 13, 19] },
  { key: "EF", c: [25, 17, 25, 19] },
  { key: "volets", label: "Volets sur la rivière", c: [33, 16, 33, 20], state: "locked" },
];

// Straight wall runs; door openings are cut out of them automatically.
export const WALL_RUNS = [
  [3, 1, 33, 1], [3, 1, 3, 12], [3, 12, 3, 23], [3, 23, 33, 23], [33, 1, 33, 23],
  [13, 1, 13, 23], [25, 1, 25, 23], [3, 12, 33, 12],
];

// Points of interest in squares (centre of the object).
export const POI = {
  gate: [2.5, 6.5],
  cart: [6.5, 4.5],
  well: [10.5, 3],
  infirmary: [6, 9.5],
  weightB: [19, 4.5],
  catwalk: { x0: 13.5, y0: 1.3, x1: 24.5, y1: 2.6 },
  weightC: [27.5, 8.5],
  boiler: [29.5, 4.5],
  valve: [31.6, 8.5],
  desk: [6.5, 16],
  safe: [11.6, 21.6],
  weightE: [19, 19.5],
  paybox: [23.4, 21.6],
  pier: { x0: 33, y0: 15, x1: 35.6, y1: 21 },
};

/** Split each wall run around the door openings that lie on it. */
export function wallSegments() {
  const segments = [];
  for (const [x0, y0, x1, y1] of WALL_RUNS) {
    const horizontal = y0 === y1;
    const [a, b] = horizontal ? [x0, x1] : [y0, y1];
    const cuts = DOORS.filter(d => horizontal
      ? d.c[1] === y0 && d.c[3] === y0 && d.c[0] >= a && d.c[2] <= b
      : d.c[0] === x0 && d.c[2] === x0 && d.c[1] >= a && d.c[3] <= b)
      .map(d => horizontal ? [d.c[0], d.c[2]] : [d.c[1], d.c[3]]).sort((p, q) => p[0] - q[0]);
    let start = a;
    for (const [c0, c1] of cuts) {
      if (c0 > start) segments.push(horizontal ? [start, y0, c0, y0] : [x0, start, x0, c0]);
      start = c1;
    }
    if (start < b) segments.push(horizontal ? [start, y0, b, y0] : [x0, start, x0, b]);
  }
  return segments;
}
