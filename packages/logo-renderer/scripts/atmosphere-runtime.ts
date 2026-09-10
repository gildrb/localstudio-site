import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { init, target } from "vgpu/node";
import { decodeGltfMesh } from "../src/renderer/mesh.ts";
import { parseGltfDocument } from "../src/renderer/gltf.ts";
import { DEFAULT_CAMERA_FOV, cameraRadiusForBounds } from "../src/renderer/render.ts";
import type { ImprintRenderOptions, RenderControls } from "../src/renderer/render/types.ts";
import { readAtmosphereOptions, logoRect, logoWidth, logoHeight } from "./atmosphere-options.ts";

// Packed scripts run from the repository root, not from their emitted directory.
const repositoryRoot = pathToFileURL(`${process.cwd()}/`);
const options = readAtmosphereOptions(repositoryRoot.href);
const gltfUrl = new URL("public/localai/localai-logo.gltf", repositoryRoot);
const mesh = await decodeGltfMesh(parseGltfDocument(readFileSync(gltfUrl, "utf8")), (uri) => {
	const bytes = readFileSync(new URL(uri, gltfUrl));
	return Promise.resolve(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
});
// Core WebGPU is required for the live rgba16float + MSAA render targets.
const gpu = await init({ backend: "webgpu" });
const errors: string[] = [];
// The SDK emits VGPUError subclasses with the standard Error stringification algorithm.
gpu.onError((error: Readonly<Error>) => {
	errors.push(Error.prototype.toString.call(error));
});

const { width, height, blank, prism, lightGain } = options;
const out = target(gpu, {
	size: [width, height],
	format: "rgba8unorm",
	label: "hero-atmosphere",
});
const foreground = target(gpu, {
	size: [width, height],
	format: "rgba8unorm",
	label: "hero-atmosphere-near",
});
const logo = target(gpu, {
	size: [logoWidth, logoHeight],
	format: "rgba8unorm",
	label: "hero-atmosphere-logo",
});
const controls: RenderControls = {
	yaw: 0,
	pitch: 0,
	radius: cameraRadiusForBounds(DEFAULT_CAMERA_FOV, mesh.bounds, 1.52),
	fov: DEFAULT_CAMERA_FOV,
	envYaw: 0,
	envPitch: 0,
	insideRendering: false,
	outsideRendering: !blank,
	material: "metallic",
	wireframe: false,
	showEnv: false,
};
const imprint = {
	progress: 0,
	time: 0,
	devicePixelRatio: 2,
	atmosphere: {
		target: out,
		foregroundTarget: foreground,
		logoRect,
		prism,
		lightGain,
		dayRoom: 0.9,
		pixelScale: width / 1585,
	},
} satisfies ImprintRenderOptions;

export { options, mesh, gpu, errors, out, foreground, logo, controls, imprint };
