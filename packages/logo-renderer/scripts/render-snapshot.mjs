// Renders the hero's first frame offline into committed PNG snapshots.
// Output: public/localai/hero-render-{night,day}.png — the static image the hero
// uses for reduced motion, unavailable WebGPU, or renderer failure.
// Run the root snapshot command: vp pack compiles this entry before Node runs it.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PNG } from "pngjs";

import { init, target } from "vgpu/node";
import { decodeGltfMesh } from "../src/renderer/mesh.ts";
import {
	DEFAULT_CAMERA_FOV,
	DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
	cameraRadiusForBounds,
	createEve5Renderer,
} from "../src/renderer/render.ts";
import { getCanvasLogicalSize, resizeCanvas } from "../src/renderer/runtime/canvas-sizing.ts";

// Packed scripts run from the repository root, not from their emitted directory.
const repositoryRoot = pathToFileURL(`${process.cwd()}/`);
const LOGO_VIEWPORT_ASPECT = 1.52;
const SNAPSHOT_CSS_WIDTH = 940;
// Match the live stage at its maximum CSS width, including the backing-store
// pixel budget and bloom padding. Other viewport widths scale this same poster.
const canvasSize = { width: 0, height: 0 };
const devicePixelRatio = resizeCanvas(
	canvasSize,
	{
		current: { width: SNAPSHOT_CSS_WIDTH, height: SNAPSHOT_CSS_WIDTH / LOGO_VIEWPORT_ASPECT },
	},
	{ current: 2 },
);
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
	const gltfUrl = new URL("public/localai/localai-logo.gltf", repositoryRoot);
	const gltf = JSON.parse(readFileSync(gltfUrl, "utf8"));
	return decodeGltfMesh(gltf, (uri) => bufferOf(readFileSync(new URL(uri, gltfUrl))));
}

// --- render ----------------------------------------------------------------

const mesh = await loadMesh();
// Core WebGPU is required for the live rgba16float + MSAA render targets.
const gpu = await init({ backend: "webgpu" });
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
	const destination = new URL(`public/localai/hero-render-${scheme}.png`, repositoryRoot);
	writeFileSync(destination, PNG.sync.write(png));
	console.log(`wrote ${fileURLToPath(destination).split("/").slice(-2).join("/")}`);
	renderer.dispose();
	out.color.destroy();
	out.depth?.destroy();
}

gpu.dispose();
