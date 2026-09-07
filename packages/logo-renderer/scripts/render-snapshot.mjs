// Renders the hero's first frame offline into committed PNG snapshots.
// Output: public/localai/hero-render-{night,day}.png — the static image the hero
// shows instantly on load while the WebGPU canvas warms up (no black screen).
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
const SNAPSHOT_WIDTH = 1880;
const SNAPSHOT_HEIGHT = Math.round(SNAPSHOT_WIDTH / LOGO_VIEWPORT_ASPECT);

const { init, target } = await import("vgpu/node");
const { decodeGltfMesh } = await import(here("../src/renderer/mesh.ts").href);
const {
  DEFAULT_CAMERA_FOV,
  DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
  cameraRadiusForBounds,
  createEve5Renderer,
} = await import(here("../src/renderer/render.ts").href);

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
  // Render at the logical stage size: the composite squeezes the padded scene
  // into this target by the same factor the live canvas shrinks its padded
  // bitmap into the CSS box, so the poster matches the live frame exactly.
  const out = target(gpu, {
    size: [SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT],
    format: "rgba8unorm",
    label: `hero-snapshot-${scheme}`,
  });
  renderer.render(out, controls, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT, {
    progress: 0,
    gridScaleMultiplier: DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
    glyphScale: 1.27,
    time: 0,
    mouse: [0, 0],
    devicePixelRatio: 2,
  });
  const premultiplied = await out.read();
  // Un-premultiply: the canvas composites premultiplied, PNG wants straight alpha.
  const png = new PNG({ width: SNAPSHOT_WIDTH, height: SNAPSHOT_HEIGHT });
  for (let i = 0; i < SNAPSHOT_WIDTH * SNAPSHOT_HEIGHT; i++) {
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
