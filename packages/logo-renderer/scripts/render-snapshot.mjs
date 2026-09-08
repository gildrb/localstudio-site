// Renders the hero's first frame offline into committed PNG snapshots.
// Output: public/localai/hero-render-{night,day}.png — the static image the hero
// uses for reduced motion, unavailable WebGPU, or renderer failure.
// Run from the repo root: bun run --cwd packages/logo-renderer snapshot
import "./bun-hooks.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const requireFromVgpu = createRequire(import.meta.resolve("vgpu/package.json"));
const { PNG } = requireFromVgpu("pngjs");
const here = (path) => new URL(`./${path}`, import.meta.url);
const repo = (path) => new URL(`../../../${path}`, import.meta.url);

const LOGO_VIEWPORT_ASPECT = 1.52;
const SNAPSHOT_CSS_WIDTH = 940;

const { init, target } = await import("vgpu/node");
const { decodeGltfMesh } = await import(here("../src/renderer/mesh.ts").href);
const {
  DEFAULT_CAMERA_FOV,
  DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
  cameraRadiusForBounds,
  createEve5Renderer,
} = await import(here("../src/renderer/render.ts").href);

const { getCanvasLogicalSize, resizeCanvas } = await import(
  here("../src/renderer/runtime/canvas-sizing.ts").href
);
// Match the live stage at its maximum CSS width, including the backing-store
// pixel budget and bloom padding. Other viewport widths scale this same poster.
const canvasSize = { width: 0, height: 0 };
const devicePixelRatio = resizeCanvas(canvasSize, {
  current: { width: SNAPSHOT_CSS_WIDTH, height: SNAPSHOT_CSS_WIDTH / LOGO_VIEWPORT_ASPECT },
}, { current: 2 });
const { width: snapshotWidth, height: snapshotHeight } = canvasSize;
const { logicalWidth, logicalHeight } = getCanvasLogicalSize(canvasSize, devicePixelRatio);

// --- helpers -------------------------------------------------------------

function bufferOf(nodeBuffer) {
  return nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength,
  );
}

function loadMesh() {
  const gltfUrl = repo("public/localai/localai-logo.gltf");
  const gltf = JSON.parse(readFileSync(gltfUrl, "utf8"));
  return decodeGltfMesh(gltf, (uri) =>
    bufferOf(readFileSync(new URL(uri, gltfUrl))),
  );
}

// --- render ----------------------------------------------------------------

const mesh = await loadMesh();
const gpu = await init();
const radius = cameraRadiusForBounds(DEFAULT_CAMERA_FOV, mesh.bounds, LOGO_VIEWPORT_ASPECT);
const controls = {
  yaw: 0,
  pitch: 0,
  radius,
  fov: DEFAULT_CAMERA_FOV,
  envYaw: 0,
  envPitch: 0,
  insideRendering: false,
  outsideRendering: true,
  material: "metallic",
  wireframe: false,
  showEnv: false,
};

for (const scheme of ["night", "day"]) {
  const renderer = createEve5Renderer(gpu, mesh, {
    theme: "dark",
    environmentTheme: scheme === "night" ? "dark" : "light",
    bloom: true,
    backRefraction: false,
  });
  // The output is the padded backing store, not the unpadded logical scene.
  const out = target(gpu, {
    size: [snapshotWidth, snapshotHeight],
    format: "rgba8unorm",
    label: `hero-snapshot-${scheme}`,
  });
  renderer.render(out, controls, logicalWidth, logicalHeight, {
    progress: 0,
    gridScaleMultiplier: DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
    glyphScale: 1.27,
    time: 0,
    mouse: [0, 0],
    devicePixelRatio,
  });
  const premultiplied = await out.read();
  // Un-premultiply: the canvas composites premultiplied, PNG wants straight alpha.
  const png = new PNG({ width: snapshotWidth, height: snapshotHeight });
  for (let i = 0; i < snapshotWidth * snapshotHeight; i++) {
    const a = premultiplied[i * 4 + 3];
    for (let c = 0; c < 3; c++) {
      const v = premultiplied[i * 4 + c];
      png.data[i * 4 + c] = a === 0 ? 0 : Math.min(255, Math.round((v * 255) / a));
    }
    png.data[i * 4 + 3] = a;
  }
  const destination = repo(`public/localai/hero-render-${scheme}.png`);
  writeFileSync(destination, PNG.sync.write(png));
  console.log(`wrote ${fileURLToPath(destination).split("/").slice(-2).join("/")}`);
  renderer.dispose();
  out.color.destroy();
  out.depth?.destroy();
}

gpu.dispose();
