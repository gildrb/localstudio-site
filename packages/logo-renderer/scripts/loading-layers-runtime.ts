// Runs only from the native pack output of render-loading-layers.ts.
// Static imports keep the shader-masked temporary clone fully type checked.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";
import { init, target, type Target } from "vgpu/node";
import { decodeGltfMesh, parseGltfDocument } from "../src/renderer/mesh.ts";
import {
	DEFAULT_CAMERA_FOV,
	DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
	cameraRadiusForBounds,
	createEve5Renderer,
	type RenderControls,
} from "../src/renderer/render.ts";
import { getCanvasLogicalSize, resizeCanvas } from "../src/renderer/runtime/canvas-sizing.ts";

const [output, repositoryRootHref] = process.argv.slice(2);
if (output === undefined || repositoryRootHref === undefined) {
	throw new Error("Loading-layer runtime requires output and repository-root paths");
}
const repositoryRoot = new URL(repositoryRootHref);
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

const gltfUrl = new URL("public/localai/localai-logo.gltf", repositoryRoot);
const gltf = parseGltfDocument(readFileSync(gltfUrl, "utf8"));
const mesh = await decodeGltfMesh(gltf, async (uri) => {
	const bytes = readFileSync(new URL(uri, gltfUrl));
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
});

const planeWidth = 3760,
	planeHeight = 4000;
const logoRect: [number, number, number, number] = [
	1410 / planeWidth,
	470 / planeHeight,
	940 / planeWidth,
	940 / 1.52 / planeHeight,
];
const gpu = await init();
try {
	const radius = cameraRadiusForBounds(DEFAULT_CAMERA_FOV, mesh.bounds, LOGO_VIEWPORT_ASPECT);
	const controls: RenderControls = {
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
		const background = target(gpu, { size: [1203, 1280], format: "rgba8unorm" });
		const foreground = target(gpu, { size: [1203, 1280], format: "rgba8unorm" });
		renderer.render(out, controls, logicalWidth, logicalHeight, {
			progress: 0,
			gridScaleMultiplier: DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
			glyphScale: 1.27,
			time: 0,
			mouse: [0, 0],
			devicePixelRatio,
			atmosphere: { target: background, foregroundTarget: foreground, logoRect },
		});
		for (const [name, layer] of [
			["bg", background],
			["fg", foreground],
		] satisfies [string, Target][]) {
			const premultiplied = await layer.read();
			const pixels = new DataView(
				premultiplied.buffer,
				premultiplied.byteOffset,
				premultiplied.byteLength,
			);
			const png = new PNG({ width: 1203, height: 1280 });
			let nonzeroAlpha = 0,
				maxAlpha = 0;
			for (let i = 0; i < 1203 * 1280; i++) {
				const a = pixels.getUint8(i * 4 + 3);
				nonzeroAlpha += Number(a > 0);
				maxAlpha = Math.max(maxAlpha, a);
				for (let c = 0; c < 3; c++)
					png.data[i * 4 + c] =
						a === 0 ? 0 : Math.min(255, Math.round((pixels.getUint8(i * 4 + c) * 255) / a));
				png.data[i * 4 + 3] = a;
			}
			const destination = join(output, `hero-atmosphere-${scheme}-${name}.png`);
			writeFileSync(destination, PNG.sync.write(png));
			console.log(JSON.stringify({ destination, nonzeroAlpha, maxAlpha }));
			layer.color.destroy();
		}
		console.log(
			JSON.stringify({
				scheme,
				snapshotWidth,
				snapshotHeight,
				logicalWidth,
				logicalHeight,
				devicePixelRatio,
				logoRect,
				controls,
			}),
		);
		renderer.dispose();
		out.color.destroy();
		out.depth?.destroy();
	}
} finally {
	gpu.dispose();
}
