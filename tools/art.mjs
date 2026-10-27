// Renders every image in assets/ from code. Usage: node tools/art.mjs [map|people|objects]
import { buildMap } from "./art/map.mjs";
import { buildPeople } from "./art/people.mjs";
import { buildObjects } from "./art/objects.mjs";

const only = process.argv[2];
const steps = { people: buildPeople, objects: buildObjects, map: buildMap };
for (const [name, step] of Object.entries(steps)) {
  if (only && only !== name) continue;
  const t = Date.now();
  await step();
  console.log(`${name}: ${((Date.now() - t) / 1000).toFixed(1)} s`);
}
