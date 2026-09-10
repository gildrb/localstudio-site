// Generate separate straight-alpha loading air layers; never writes runtime assets.
// vp exec node packages/logo-renderer/scripts/render-loading-layers.mjs --output=/tmp/localstudio-layered-loading
// CSS plane: 3760x4000, logo stage: x1410 y470 w940 h940/1.52.
// Apply viewport edge feather to both layers and day ellipse to day BG in CSS.
// Fixed hero-UV shadow penumbra remains a small viewport-dependent approximation.
// Temporary clone is retained for source provenance and debugging.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PNG } from "pngjs";
import { build } from "vite-plus/pack";
import { wgslVitePlugin } from "@vgpu/wgsl/loader-vite";

// Clone before packing WGSL. Runtime shader files stay unchanged.
const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "localstudio-loading-renderer-"));
cpSync(join(packageRoot, "src"), join(temporary, "src"), { recursive: true });
cpSync(join(packageRoot, "package.json"), join(temporary, "package.json"));
symlinkSync(join(packageRoot, "node_modules"), join(temporary, "node_modules"));
const airPath = join(temporary, "src/renderer/shaders/shared/hero-air.wgsl");
const air = readFileSync(airPath, "utf8");
const edge = `  let edge = smoothstep(vec2f(0.012, 0.018), vec2f(0.105, 0.115), uv)
    * (1.0 - smoothstep(vec2f(0.895, 0.78), vec2f(0.988, 0.975), uv));
  let feather = edge.x * edge.y;`;
const day = "let backgroundFeather = feather * mix(1.0, dayFeather, params.day);";
if (!air.includes(edge) || !air.includes(day))
	throw new Error("Atmosphere display changed; review loading-layer masks before regenerating.");
writeFileSync(
	airPath,
	air.replace(edge, "  let feather = 1.0;").replace(day, "let backgroundFeather = feather;"),
);
// Use the native pack API and official WGSL plugin on the edited clone.
// Keep all entries in one build so they share the same renderer modules.
const packed = join(temporary, "dist");
await build({
	config: false,
	cwd: temporary,
	entry: {
		mesh: join(temporary, "src/renderer/mesh.ts"),
		render: join(temporary, "src/renderer/render.ts"),
		"canvas-sizing": join(temporary, "src/renderer/runtime/canvas-sizing.ts"),
	},
	outDir: packed,
	platform: "node",
	format: ["esm"],
	fixedExtension: true,
	dts: false,
	plugins: [wgslVitePlugin()],
});
const repositoryRoot = new URL("../../../", import.meta.url);
const output =
	process.argv.find((arg) => arg.startsWith("--output="))?.slice(9) ??
	join(tmpdir(), "localstudio-layered-loading");
mkdirSync(output, { recursive: true });
console.log(JSON.stringify({ output, temporary }));

const LOGO_VIEWPORT_ASPECT = 1.52;
const SNAPSHOT_CSS_WIDTH = 940;

const { init, target } = await import("vgpu/node");
const { decodeGltfMesh } = await import(pathToFileURL(join(packed, "mesh.mjs")).href);
const {
	DEFAULT_CAMERA_FOV,
	DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
	cameraRadiusForBounds,
	createEve5Renderer,
} = await import(pathToFileURL(join(packed, "render.mjs")).href);

const { getCanvasLogicalSize, resizeCanvas } = await import(
	pathToFileURL(join(packed, "canvas-sizing.mjs")).href
);
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
const gltf = JSON.parse(readFileSync(gltfUrl, "utf8"));
const mesh = await decodeGltfMesh(gltf, (uri) => {
	const bytes = readFileSync(new URL(uri, gltfUrl));
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
});

const planeWidth = 3760,
	planeHeight = 4000;
const logoRect = [1410 / planeWidth, 470 / planeHeight, 940 / planeWidth, 940 / 1.52 / planeHeight];
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
	]) {
		const premultiplied = await layer.read();
		const png = new PNG({ width: 1203, height: 1280 });
		let nonzeroAlpha = 0,
			maxAlpha = 0;
		for (let i = 0; i < 1203 * 1280; i++) {
			const a = premultiplied[i * 4 + 3];
			nonzeroAlpha += a > 0;
			maxAlpha = Math.max(maxAlpha, a);
			for (let c = 0; c < 3; c++)
				png.data[i * 4 + c] =
					a === 0 ? 0 : Math.min(255, Math.round((premultiplied[i * 4 + c] * 255) / a));
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

gpu.dispose();
