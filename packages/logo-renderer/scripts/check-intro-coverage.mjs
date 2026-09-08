// Checks the canonical 640x551 intro capture against its approved core reference.
// Usage: bun scripts/check-intro-coverage.mjs <capture-dir> <reference-dir>
// Captures contain 0.9-intro.png and a 960x643 RGBA float32 0.9-surface.bin.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import assert from "node:assert/strict";

const [captureDir, referenceDir] = process.argv.slice(2);
assert(captureDir && referenceDir, "Provide capture and reference directories");
const requireFromVgpu = createRequire(import.meta.resolve("vgpu/package.json"));
const { PNG } = requireFromVgpu("pngjs");
const image = PNG.sync.read(readFileSync(join(captureDir, "0.9-intro.png")));
const reference = PNG.sync.read(readFileSync(join(referenceDir, "0.9-intro.png")));
assert.equal(image.width, 640);
assert.equal(image.height, 551);
assert.equal(reference.width, image.width);
assert.equal(reference.height, image.height);
const bytes = readFileSync(join(captureDir, "0.9-surface.bin"));
assert.equal(bytes.byteLength, 960 * 643 * 4 * 4);
const surface = new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));

for (const [x, y] of [[251, 173], [320, 127], [389, 173]]) {
  const sx = Math.floor(((x + 0.5) / 640 - 0.2073) / 0.5855 * 960);
  const sy = Math.floor(((y + 0.5) / 551 - 0.0879) / 0.4473 * 643);
  assert.equal(surface[(sy * 960 + sx) * 4 + 3], 0, "Empty aperture must have zero material coverage");
  const pixel = (y * 640 + x) * 4;
  for (let channel = 0; channel < 3; channel++) {
    assert(image.data[pixel + channel] >= 190, "Rear light must remain visible through the aperture");
    assert.equal(image.data[pixel + channel], reference.data[pixel + channel], "Approved aperture core changed");
  }
}
for (const [x, y] of [[0, 0], [959, 0], [0, 642], [959, 642]]) {
  assert.equal(surface[(y * 960 + x) * 4 + 3], 0, "Outside geometry must be transparent");
}
for (const [x, y] of [[480, 400], [200, 450], [760, 450]]) {
  assert.equal(surface[(y * 960 + x) * 4 + 3], 1, "Solid material must remain opaque");
}
console.log("Intro material coverage and final aperture transmission passed");
