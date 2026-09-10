import { controls, imprint, out, foreground, logo, options } from "./atmosphere-runtime.ts";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import type { Target } from "vgpu";
import type { AtmosphereDiagnostics, AtmosphereCommands, ScenePixels } from "./atmosphere-scene.ts";
import { writePng, type SnapshotBytes } from "./atmosphere-images.ts";
import { checkLightCoverage } from "./atmosphere-coverage.ts";

async function checkHdrLayers(
	layers: readonly Readonly<Pick<Target, "readFloats">>[],
	threshold: number,
	message: string,
) {
	let peak = 0;
	let litPixels = 0;
	for (const layer of layers) {
		const values = await layer.readFloats();
		let pixelPeak = -Infinity;
		for (const [index, value] of values.entries()) {
			assert.ok(Number.isFinite(value), message);
			if (index % 4 !== 3) {
				pixelPeak = Math.max(pixelPeak, value);
				continue;
			}
			peak = Math.max(peak, pixelPeak);
			if (pixelPeak > threshold) litPixels++;
			pixelPeak = -Infinity;
		}
	}
	return { peak, litPixels };
}

async function checkAddedRadiance(renderer: AtmosphereDiagnostics, base: SnapshotBytes) {
	const resources = renderer.illuminationTargets;
	assert.ok(resources !== undefined, "added-light resources exist only after positive gain");
	const coverage = await resources.coverage.read();
	assert.equal(coverage.length, base.length, "opaque coverage matches final layer resolution");
	const approvedBG = await resources.baseBackground.read();
	const approvedFG = await resources.baseForeground.read();
	const { peak, litPixels } = await checkHdrLayers(
		[resources.background, resources.foreground],
		0.0001,
		"finite added HDR scattering",
	);
	assert.ok(peak > 0 && litPixels > 100, "the moving medium receives real new radiance");
	const sourceDepth = await resources.sourceDepth.readFloats();
	const sourceDepthPixels = sourceDepth.reduce((count, value) => count + Number(value < 999999), 0);
	assert.ok(sourceDepthPixels > 100, "closed SVG-derived mesh occludes the actual source");
	return { coverage, approvedBG, approvedFG, peak, litPixels, sourceDepthPixels };
}

type ApprovedLayers = {
	readonly approvedBG: SnapshotBytes;
	readonly approvedFG: SnapshotBytes;
};

async function createLightComposites(
	renderer: AtmosphereCommands,
	scheme: string,
	pixels: Readonly<ScenePixels>,
	approved: Readonly<ApprovedLayers>,
) {
	const { output } = options;
	const { base, near, logoPixels } = pixels;
	const { approvedBG, approvedFG } = approved;
	renderer.renderAtmosphere(controls, {
		...imprint,
		atmosphere: { ...imprint.atmosphere, lightGain: 0 },
	});
	const zeroBG = await out.read();
	const zeroFG = await foreground.read();
	assert.deepEqual(
		zeroBG,
		approvedBG,
		"approved background is byte-identical, not relit or re-tonemapped",
	);
	assert.deepEqual(zeroFG, approvedFG, "approved foreground remains byte-identical");
	assert.deepEqual(await logo.read(), logoPixels, "chrome output is unchanged");
	const zeroComposite = writePng(
		options,
		`${output}/base-scene-${scheme}.png`,
		zeroBG,
		scheme,
		logoPixels,
		zeroFG,
	);
	const litComposite = writePng(
		options,
		`${output}/lit-scene-${scheme}.png`,
		base,
		scheme,
		logoPixels,
		near,
	);
	return { zeroBG, zeroFG, litComposite, zeroComposite };
}

export async function checkIllumination(
	renderer: AtmosphereDiagnostics,
	scheme: string,
	pixels: Readonly<ScenePixels>,
) {
	const { output } = options;
	const { base, near, logoPixels } = pixels;
	const { coverage, approvedBG, approvedFG, peak, litPixels, sourceDepthPixels } =
		await checkAddedRadiance(renderer, base);
	const { zeroBG, zeroFG, litComposite, zeroComposite } = await createLightComposites(
		renderer,
		scheme,
		pixels,
		{ approvedBG, approvedFG },
	);
	const { solidPixels, exteriorLitPixels, holeIncrements } = checkLightCoverage(
		options,
		{ coverage, base, near, zeroBG, zeroFG, litComposite, zeroComposite },
		logoPixels,
	);
	renderer.renderAtmosphere(controls, imprint);
	assert.deepEqual(await out.read(), base, "restoring gain restores deterministic background");
	assert.deepEqual(
		await foreground.read(),
		near,
		"restoring gain restores deterministic foreground",
	);
	const illumination = {
		peak,
		litPixels,
		sourceDepthPixels,
		solidPixels,
		exteriorLitPixels,
		holeIncrements,
		zeroGainPreservesBase: true,
		finalMetalRgbDifference: 0,
	};
	writeFileSync(`${output}/illumination-${scheme}.json`, JSON.stringify(illumination, null, 2));
	return illumination;
}

async function checkDarkLayers(layers: readonly Readonly<Pick<Target, "readFloats">>[]) {
	for (const layer of layers) {
		const dark = await layer.readFloats();
		let sum = 0;
		for (const [index, value] of dark.entries()) {
			if (index % 4 === 0) {
				sum = value;
				continue;
			}
			if (index % 4 !== 3) {
				sum += value;
				continue;
			}
			assert.equal(sum, 0, "zero beam opacity disables emission");
			sum = 0;
		}
	}
}

export async function checkPrism(renderer: AtmosphereDiagnostics, logoPixels: SnapshotBytes) {
	const resources = renderer.prismTargets;
	assert.ok(resources !== undefined, "opt-in Prism resources were created");
	const { peak, litPixels } = await checkHdrLayers(
		[resources.background, resources.foreground],
		0.001,
		"finite Prism HDR",
	);
	assert.ok(
		peak > 1 && litPixels > 100,
		"real white-beam HDR exceeds display range before tone mapping",
	);
	const lightDepth = await resources.lightDepth.readFloats();
	const sourceDepthPixels = lightDepth.reduce((count, value) => count + Number(value < 999999), 0);
	assert.ok(sourceDepthPixels > 100, "the real mesh occludes light in the source camera");
	renderer.renderAtmosphere(controls, {
		...imprint,
		atmosphere: { ...imprint.atmosphere, beamOpacity: 0 },
	});
	await checkDarkLayers([resources.background, resources.foreground]);
	assert.deepEqual(await logo.read(), logoPixels, "Prism lighting does not redraw or alter chrome");
	renderer.renderAtmosphere(controls, imprint);
	assert.equal(renderer.prismTargets, resources, "idle lighting reuses Prism resources");
	return { peak, litPixels, sourceDepthPixels };
}
