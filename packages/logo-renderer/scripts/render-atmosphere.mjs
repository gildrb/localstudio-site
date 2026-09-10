// Native fallback generation and deterministic depth/interaction checks.
// Static posters include the live additive light at its first-frame gain.
// Run the root atmosphere snapshot command with [--validate] [--blank] [--prism].
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import { draw, init, target } from "vgpu/node";
import { fileURLToPath, pathToFileURL } from "node:url";
import { decodeGltfMesh } from "../src/renderer/mesh.ts";
import {
	DEFAULT_CAMERA_FOV,
	cameraRadiusForBounds,
	createEve5Renderer,
} from "../src/renderer/render.ts";
import { createGpuMesh } from "../src/renderer/render/mesh-gpu.ts";
import { writeParams } from "../src/renderer/render/params.ts";
import {
	cameraAxisDepthRange,
	meshOrbitTarget,
	meshThicknessScale,
} from "../src/renderer/render/camera.ts";
import { bloomRadiusForDevicePixelRatio, PASS_OUTSIDE } from "../src/renderer/render/constants.ts";
import depthShader from "../src/renderer/shaders/glass/back-depth.wgsl";

// Packed scripts run from the repository root, not from their emitted directory.
const repositoryRoot = pathToFileURL(`${process.cwd()}/`);

const validate = process.argv.includes("--validate");
const blank = process.argv.includes("--blank");
const prism = process.argv.includes("--prism");
const lightGain = Number(
	process.argv.find((arg) => arg.startsWith("--light-gain="))?.slice(13) ?? (prism ? 0 : 0.72),
);
assert(
	Number.isFinite(lightGain) && lightGain >= 0 && lightGain <= 1,
	"light gain must be in [0, 1]",
);
assert(
	!(prism && lightGain > 0),
	"validate the additive light separately from rejected Prism ribbons",
);
const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
const output =
	outputArg?.slice(9) ??
	(validate
		? "/tmp/localstudio-atmosphere"
		: fileURLToPath(new URL("public/localai/", repositoryRoot)));
mkdirSync(output, { recursive: true });
const width = Number(process.argv.find((arg) => arg.startsWith("--width="))?.slice(8) ?? 640);
assert(
	Number.isInteger(width) && width >= 64 && width <= 2048,
	"width must be an integer in [64, 2048]",
);
const height = Math.round((width * 1365) / 1585);
// Measured desktop hero1585x1365, padded logo canvas928x610.5.
const logoRect = [0.2073, 0.0879, 0.5855, 0.4473];
const logoWidth = 928;
const logoHeight = 611;
const gltfUrl = new URL("public/localai/localai-logo.gltf", repositoryRoot);
const mesh = await decodeGltfMesh(JSON.parse(readFileSync(gltfUrl, "utf8")), (uri) => {
	const bytes = readFileSync(new URL(uri, gltfUrl));
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
});
// Core WebGPU is required for the live rgba16float + MSAA render targets.
const gpu = await init({ backend: "webgpu" });
const errors = [];
gpu.onError((error) => errors.push(String(error)));
const out = target(gpu, { size: [width, height], format: "rgba8unorm", label: "hero-atmosphere" });
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
const controls = {
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
};

function writePng(path, backgroundPixels, scheme, logoPixels, foregroundPixels) {
	const png = new PNG({ width, height });
	const page = scheme === "day" ? 255 : 0;
	for (let y = 0; y < height; y++)
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const uv = [
				(x / width - logoRect[0]) / logoRect[2],
				(y / height - logoRect[1]) / logoRect[3],
			];
			const inLogo = logoPixels && uv.every((v) => v >= 0 && v < 1);
			const j = (Math.floor(uv[1] * logoHeight) * logoWidth + Math.floor(uv[0] * logoWidth)) * 4;
			for (let c = 0; c < 3; c++) {
				let v = backgroundPixels[i + c] + page * (1 - backgroundPixels[i + 3] / 255);
				if (inLogo) v = logoPixels[j + c] + v * (1 - logoPixels[j + 3] / 255);
				if (foregroundPixels) v = foregroundPixels[i + c] + v * (1 - foregroundPixels[i + 3] / 255);
				png.data[i + c] = Math.max(0, Math.min(255, Math.round(v)));
			}
			png.data[i + 3] = 255;
		}
	writeFileSync(path, PNG.sync.write(png, { colorType: 2 }));
	return png.data;
}
function difference(a, b) {
	let sum = 0,
		max = 0,
		changed = 0;
	for (let i = 0; i < a.length; i++) {
		if (i % 4 === 3) continue;
		const d = Math.abs(a[i] - b[i]);
		sum += d;
		max = Math.max(max, d);
		changed += d > 0 ? 1 : 0;
	}
	return { mean: sum / (width * height * 3), max, changed };
}
function checkBorder(pixels) {
	for (let y = 0; y < height; y++)
		for (let x = 0; x < width; x++) {
			if (x !== 0 && x !== width - 1 && y !== 0 && y !== height - 1) continue;
			const i = (y * width + x) * 4;
			assert.equal(
				pixels[i] + pixels[i + 1] + pixels[i + 2] + pixels[i + 3],
				0,
				"exact transparent border",
			);
		}
}
// Find enclosed transparent regions in the actual rendered mesh, not guessed SVG ellipses.
function aperturePixels(pixels) {
	const seen = new Uint8Array(logoWidth * logoHeight);
	const holes = [];
	for (let seed = 0; seed < seen.length; seed++) {
		if (seen[seed] || pixels[seed * 4 + 3] >= 128) continue;
		const pending = [seed],
			region = [];
		let touchesEdge = false;
		seen[seed] = 1;
		while (pending.length > 0) {
			const cell = pending.pop();
			const x = cell % logoWidth,
				y = Math.floor(cell / logoWidth);
			region.push(cell);
			if (x === 0 || x === logoWidth - 1 || y === 0 || y === logoHeight - 1) touchesEdge = true;
			for (const [nx, ny] of [
				[x - 1, y],
				[x + 1, y],
				[x, y - 1],
				[x, y + 1],
			]) {
				if (nx < 0 || nx >= logoWidth || ny < 0 || ny >= logoHeight) continue;
				const next = ny * logoWidth + nx;
				if (seen[next] || pixels[next * 4 + 3] >= 128) continue;
				seen[next] = 1;
				pending.push(next);
			}
		}
		if (touchesEdge || region.length < 64) continue;
		const projected = new Set();
		for (const cell of region) {
			const u = ((cell % logoWidth) + 0.5) / logoWidth;
			const v = (Math.floor(cell / logoWidth) + 0.5) / logoHeight;
			const x = Math.floor((logoRect[0] + u * logoRect[2]) * width);
			const y = Math.floor((logoRect[1] + v * logoRect[3]) * height);
			projected.add((y * width + x) * 4);
		}
		holes.push([...projected]);
	}
	assert.equal(holes.length, 3, "actual mesh has three enclosed apertures");
	return holes;
}
const report = [];
try {
	if (validate) {
		// Independent native extraction of the exact depth shader/projection used
		// by the volume, checked against CPU bounds in normalized mesh space.
		const geometry = createGpuMesh(gpu, mesh);
		const pad = bloomRadiusForDevicePixelRatio(2);
		const depthTarget = target(gpu, {
			size: [logoWidth + pad * 2, logoHeight + pad * 2],
			format: "r32float",
			depth: "depth24plus",
			clearColor: [-1e6, 0, 0, 0],
		});
		const depthPass = draw(gpu, {
			shader: depthShader,
			geometry: geometry.triangles,
			cull: "back",
			depth: { write: true, compare: "less" },
		});
		const depthReports = [];
		for (const yaw of [0, 0.12]) {
			const params = writeParams({
				controls: { ...controls, yaw },
				logicalWidth: logoWidth,
				logicalHeight: logoHeight,
				passKind: PASS_OUTSIDE,
				projectionPaddingRadius: pad,
				meshBounds: mesh.bounds,
				orbitTarget: meshOrbitTarget(mesh),
				thicknessScale: meshThicknessScale(mesh.bounds),
				isLight: false,
				imprint,
			});
			depthPass.set({ params });
			depthPass.draw(depthTarget);
			const depths = await depthTarget.readFloats();
			const range = cameraAxisDepthRange(mesh.bounds, params.cameraForward);
			let min = Infinity,
				max = -Infinity,
				count = 0;
			for (const value of depths) {
				assert(Number.isFinite(value), "finite native depth");
				if (value < -999999) continue;
				min = Math.min(min, value);
				max = Math.max(max, value);
				count++;
			}
			assert(count > 100 && max - min > 0.001, "genuine nonplanar front depth");
			assert(
				min >= range.min - 0.001 && max <= range.max + 0.001,
				"depth agrees with CPU normalized mesh bounds",
			);
			depthReports.push({ yaw, min, max, count, cpuRange: range });
		}
		report.push({ nativeDepth: depthReports });
		geometry.triangles.destroy();
		geometry.lines.destroy();
		depthTarget.color.destroy();
		depthTarget.depth?.destroy();
	}
	for (const scheme of ["night", "day"]) {
		const renderer = createEve5Renderer(gpu, mesh, {
			theme: "dark",
			environmentTheme: scheme === "day" ? "light" : "dark",
			bloom: true,
			backRefraction: false,
		});
		try {
			renderer.renderAtmosphere(controls, imprint); // safe before first scene
			renderer.render(logo, controls, logoWidth, logoHeight, imprint);
			const base = await out.read();
			const near = await foreground.read();
			const logoPixels = await logo.read();
			let illumination;
			if (validate && lightGain > 0) {
				const resources = renderer.illuminationTargets;
				assert(resources, "added-light resources exist only after positive gain");
				const coverage = await resources.coverage.read();
				assert.equal(
					coverage.length,
					base.length,
					"opaque coverage matches final layer resolution",
				);
				const approvedBG = await resources.baseBackground.read();
				const approvedFG = await resources.baseForeground.read();
				let peak = 0,
					litPixels = 0;
				for (const layer of [resources.background, resources.foreground]) {
					const values = await layer.readFloats();
					for (let i = 0; i < values.length; i += 4) {
						for (let c = 0; c < 4; c++)
							assert(Number.isFinite(values[i + c]), "finite added HDR scattering");
						const value = Math.max(values[i], values[i + 1], values[i + 2]);
						peak = Math.max(peak, value);
						if (value > 0.0001) litPixels++;
					}
				}
				assert(peak > 0 && litPixels > 100, "the moving medium receives real new radiance");
				const sourceDepth = await resources.sourceDepth.readFloats();
				const sourceDepthPixels = sourceDepth.reduce(
					(count, value) => count + Number(value < 999999),
					0,
				);
				assert(sourceDepthPixels > 100, "closed SVG-derived mesh occludes the actual source");
				renderer.renderAtmosphere(controls, {
					...imprint,
					atmosphere: { ...imprint.atmosphere, lightGain: 0 },
				});
				const zeroBG = await out.read(),
					zeroFG = await foreground.read();
				assert.deepEqual(
					zeroBG,
					approvedBG,
					"approved background is byte-identical, not relit or re-tonemapped",
				);
				assert.deepEqual(zeroFG, approvedFG, "approved foreground remains byte-identical");
				assert.deepEqual(await logo.read(), logoPixels, "chrome output is unchanged");
				const zeroComposite = writePng(
					`${output}/base-scene-${scheme}.png`,
					zeroBG,
					scheme,
					logoPixels,
					zeroFG,
				);
				const litComposite = writePng(
					`${output}/lit-scene-${scheme}.png`,
					base,
					scheme,
					logoPixels,
					near,
				);
				const holeRegions = aperturePixels(logoPixels);
				const holeIndices = new Set(holeRegions.flat());
				let solidPixels = 0,
					exteriorLitPixels = 0;
				for (let i = 0; i < coverage.length; i += 4) {
					if (coverage[i + 3] === 255) {
						solidPixels++;
						for (let c = 0; c < 4; c++) {
							assert.equal(
								base[i + c],
								zeroBG[i + c],
								"new BG cannot leak through alpha-.92 chrome",
							);
							assert.equal(near[i + c], zeroFG[i + c], "new FG cannot overlay opaque geometry");
						}
						for (let c = 0; c < 3; c++)
							assert.equal(
								litComposite[i + c],
								zeroComposite[i + c],
								"final composited solid chrome RGB is unchanged",
							);
					} else if (
						coverage[i + 3] === 0 &&
						!holeIndices.has(i) &&
						litComposite[i] > zeroComposite[i]
					)
						exteriorLitPixels++;
				}
				assert(solidPixels > 100, "independent geometry coverage includes actual chrome");
				assert(exteriorLitPixels > 100, "new light also illuminates air around the SVG silhouette");
				const holeIncrements = holeRegions.map(
					(region) =>
						region.reduce((sum, i) => sum + Math.max(0, litComposite[i] - zeroComposite[i]), 0) /
						region.length,
				);
				for (const increment of holeIncrements)
					assert(increment > 0.1, "each real opening receives a positive diffuse-light increment");
				renderer.renderAtmosphere(controls, imprint);
				assert.deepEqual(
					await out.read(),
					base,
					"restoring gain restores deterministic background",
				);
				assert.deepEqual(
					await foreground.read(),
					near,
					"restoring gain restores deterministic foreground",
				);
				illumination = {
					peak,
					litPixels,
					sourceDepthPixels,
					solidPixels,
					exteriorLitPixels,
					holeIncrements,
					zeroGainPreservesBase: true,
					finalMetalRgbDifference: 0,
				};
				writeFileSync(
					`${output}/illumination-${scheme}.json`,
					JSON.stringify(illumination, null, 2),
				);
			}
			let prismHdr;
			if (validate && prism) {
				const resources = renderer.prismTargets;
				assert(resources, "opt-in Prism resources were created");
				let peak = 0,
					litPixels = 0;
				for (const layer of [resources.background, resources.foreground]) {
					const values = await layer.readFloats();
					for (let i = 0; i < values.length; i += 4) {
						for (let c = 0; c < 4; c++) assert(Number.isFinite(values[i + c]), "finite Prism HDR");
						const light = Math.max(values[i], values[i + 1], values[i + 2]);
						peak = Math.max(peak, light);
						if (light > 0.001) litPixels++;
					}
				}
				assert(
					peak > 1 && litPixels > 100,
					"real white-beam HDR exceeds display range before tone mapping",
				);
				const lightDepth = await resources.lightDepth.readFloats();
				const sourceDepthPixels = lightDepth.reduce(
					(count, value) => count + Number(value < 999999),
					0,
				);
				assert(sourceDepthPixels > 100, "the real mesh occludes light in the source camera");
				renderer.renderAtmosphere(controls, {
					...imprint,
					atmosphere: { ...imprint.atmosphere, beamOpacity: 0 },
				});
				for (const layer of [resources.background, resources.foreground]) {
					const dark = await layer.readFloats();
					for (let i = 0; i < dark.length; i += 4)
						assert.equal(
							dark[i] + dark[i + 1] + dark[i + 2],
							0,
							"zero beam opacity disables emission",
						);
				}
				assert.deepEqual(
					await logo.read(),
					logoPixels,
					"Prism lighting does not redraw or alter chrome",
				);
				renderer.renderAtmosphere(controls, imprint);
				assert.equal(renderer.prismTargets, resources, "idle lighting reuses Prism resources");
				prismHdr = { peak, litPixels, sourceDepthPixels };
			}
			let nearOverLogoMax = 0,
				nearOverLogoCount = 0;
			if (validate) {
				for (let y = 0; y < height; y++)
					for (let x = 0; x < width; x++) {
						const u = ((x + 0.5) / width - logoRect[0]) / logoRect[2];
						const v = ((y + 0.5) / height - logoRect[1]) / logoRect[3];
						if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
						const j = (Math.floor(v * logoHeight) * logoWidth + Math.floor(u * logoWidth)) * 4;
						// Erode the comparison mask: the final logo includes bloom/MSAA,
						// while the volume samples the raw padded scene at pixel centers.
						if (
							[0, -12, 12, -logoWidth * 12, logoWidth * 12].some(
								(offset) => (logoPixels[j + offset + 3] ?? 0) < 230,
							)
						)
							continue;
						const alpha = near[(y * width + x) * 4 + 3];
						nearOverLogoMax = Math.max(nearOverLogoMax, alpha);
						if (alpha > 0) nearOverLogoCount++;
					}
				assert(
					nearOverLogoCount > 100 && nearOverLogoMax <= 9,
					`low but nonzero near-volume over chrome: ${nearOverLogoCount} pixels, max ${nearOverLogoMax}`,
				);
			}
			writePng(`${output}/hero-atmosphere-${scheme}.png`, base, scheme, undefined, near);
			if (!validate) continue;
			writePng(`${output}/scene-${scheme}.png`, base, scheme, logoPixels, near);
			writePng(
				`${output}/near-${scheme}.png`,
				new Uint8Array(base.length),
				"night",
				undefined,
				near,
			);
			renderer.renderAtmosphere(controls, imprint);
			assert.deepEqual(await out.read(), base, "same input+time is deterministic");
			assert.deepEqual(await foreground.read(), near, "foreground deterministic");
			renderer.renderAtmosphere({ ...controls, envYaw: 0.28, envPitch: -0.18 }, imprint);
			const pointer = await out.read();
			const pointerNear = await foreground.read();
			const apertures = aperturePixels(logoPixels).map((pixels) => {
				let light = 0,
					response = 0;
				for (const i of pixels)
					for (let c = 0; c < 3; c++) {
						light += near[i + c];
						response += Math.abs(near[i + c] - pointerNear[i + c]);
					}
				const meanLight = light / (pixels.length * 3);
				const meanResponse = response / (pixels.length * 3);
				assert(meanLight > 0.25, "each aperture contains visible near-volume light");
				assert(meanResponse > 0.01, "each aperture responds to the shared light position");
				return { pixels: pixels.length, meanLight, meanResponse };
			});
			const pointerDiff = difference(base, pointer);
			assert(
				pointerDiff.changed > 100 && pointerDiff.mean < 5,
				`pointer moves pixels subtly: ${JSON.stringify(pointerDiff)}`,
			);
			renderer.renderAtmosphere(controls, { ...imprint, time: 30 });
			const drift = await out.read();
			const driftDiff = difference(base, drift);
			assert(driftDiff.changed > 100 && driftDiff.mean < 5, "slow volume drift");
			renderer.render(
				logo,
				{ ...controls, outsideRendering: false },
				logoWidth,
				logoHeight,
				imprint,
			);
			const unoccluded = await out.read();
			const unoccludedNear = await foreground.read();
			const alphaDiff = difference(base, unoccluded);
			const alphaNearDiff = difference(near, unoccludedNear);
			assert(alphaDiff.changed + alphaNearDiff.changed > 100, "actual mesh changes volume");
			writePng(`${output}/unoccluded-${scheme}.png`, unoccluded, scheme, undefined, unoccludedNear);
			renderer.render(
				logo,
				{ ...controls, yaw: 0.12, depthOpening: 1 },
				logoWidth,
				logoHeight,
				imprint,
			);
			const changedDepth = await foreground.read();
			const depthDiff = difference(near, changedDepth);
			assert(depthDiff.changed > 100, "real front depth changes near volume");
			for (const pixels of [
				base,
				near,
				pointer,
				pointerNear,
				drift,
				unoccluded,
				unoccludedNear,
				changedDepth,
			])
				checkBorder(pixels);
			const started = performance.now();
			for (let i = 0; i < 30; i++)
				renderer.renderAtmosphere(controls, { ...imprint, time: i / 30 });
			await gpu.settled();
			const idleMs = (performance.now() - started) / 30;
			assert.equal(errors.length, 0, errors.join("\n"));
			report.push({
				scheme,
				prismHdr,
				illumination,
				apertures,
				nearOverLogoMax,
				nearOverLogoCount,
				pointerDiff,
				driftDiff,
				alphaDiff,
				alphaNearDiff,
				depthDiff,
				idleMs,
				borders: "zero",
				deterministic: true,
			});
		} finally {
			renderer.dispose();
		}
	}
	console.log(JSON.stringify({ width, height, logoRect, output, report }, null, 2));
	if (validate) writeFileSync(`${output}/validation.json`, JSON.stringify(report, null, 2));
} finally {
	gpu.dispose();
}
