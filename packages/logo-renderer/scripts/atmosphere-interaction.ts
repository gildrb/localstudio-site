import {
	options,
	controls,
	imprint,
	logo,
	out,
	foreground,
	gpu,
	errors,
} from "./atmosphere-runtime.ts";
import assert from "node:assert/strict";
import { writePng, difference, checkBorder } from "./atmosphere-images.ts";
import { checkApertureResponse } from "./atmosphere-apertures.ts";
import { logoWidth, logoHeight } from "./atmosphere-options.ts";
import type { AtmosphereCommands, ScenePixels } from "./atmosphere-scene.ts";

async function checkMeshOcclusion(
	renderer: AtmosphereCommands,
	pixels: Readonly<ScenePixels>,
	scheme: string,
) {
	const { output } = options;
	const { base, near } = pixels;
	renderer.render(logo, { ...controls, outsideRendering: false }, logoWidth, logoHeight, imprint);
	const unoccluded = await out.read();
	const unoccludedNear = await foreground.read();
	const alphaDiff = difference(options, base, unoccluded);
	const alphaNearDiff = difference(options, near, unoccludedNear);
	assert.ok(alphaDiff.changed + alphaNearDiff.changed > 100, "actual mesh changes volume");
	writePng(
		options,
		`${output}/unoccluded-${scheme}.png`,
		unoccluded,
		scheme,
		undefined,
		unoccludedNear,
	);
	renderer.render(
		logo,
		{ ...controls, yaw: 0.12, depthOpening: 1 },
		logoWidth,
		logoHeight,
		imprint,
	);
	const changedDepth = await foreground.read();
	const depthDiff = difference(options, near, changedDepth);
	assert.ok(depthDiff.changed > 100, "real front depth changes near volume");
	return { unoccluded, unoccludedNear, changedDepth, alphaDiff, alphaNearDiff, depthDiff };
}

async function checkPointerResponse(renderer: AtmosphereCommands, pixels: Readonly<ScenePixels>) {
	const { base, near, logoPixels } = pixels;
	renderer.renderAtmosphere(controls, imprint);
	assert.deepEqual(await out.read(), base, "same input+time is deterministic");
	assert.deepEqual(await foreground.read(), near, "foreground deterministic");
	renderer.renderAtmosphere({ ...controls, envYaw: 0.28, envPitch: -0.18 }, imprint);
	const pointer = await out.read();
	const pointerNear = await foreground.read();
	const apertures = checkApertureResponse(options, logoPixels, near, pointerNear);
	const pointerDiff = difference(options, base, pointer);
	assert.ok(
		pointerDiff.changed > 100 && pointerDiff.mean < 5,
		`pointer moves pixels subtly: ${JSON.stringify(pointerDiff)}`,
	);
	return { pointer, pointerNear, apertures, pointerDiff };
}

async function measureIdle(renderer: AtmosphereCommands) {
	const started = performance.now();
	for (let i = 0; i < 30; i++) renderer.renderAtmosphere(controls, { ...imprint, time: i / 30 });
	await gpu.settled();
	const idleMs = (performance.now() - started) / 30;
	assert.equal(errors.length, 0, errors.join("\n"));
	return idleMs;
}

export async function checkSceneInteraction(
	renderer: AtmosphereCommands,
	pixels: Readonly<ScenePixels>,
	scheme: string,
) {
	const { output } = options;
	const { base, near, logoPixels } = pixels;
	writePng(options, `${output}/scene-${scheme}.png`, base, scheme, logoPixels, near);
	writePng(
		options,
		`${output}/near-${scheme}.png`,
		new Uint8Array(base.length),
		"night",
		undefined,
		near,
	);
	const { pointer, pointerNear, apertures, pointerDiff } = await checkPointerResponse(
		renderer,
		pixels,
	);
	renderer.renderAtmosphere(controls, { ...imprint, time: 30 });
	const drift = await out.read();
	const driftDiff = difference(options, base, drift);
	assert.ok(driftDiff.changed > 100 && driftDiff.mean < 5, "slow volume drift");
	const { unoccluded, unoccludedNear, changedDepth, alphaDiff, alphaNearDiff, depthDiff } =
		await checkMeshOcclusion(renderer, pixels, scheme);
	for (const layerPixels of [
		base,
		near,
		pointer,
		pointerNear,
		drift,
		unoccluded,
		unoccludedNear,
		changedDepth,
	])
		checkBorder(options, layerPixels);
	const idleMs = await measureIdle(renderer);
	return { apertures, pointerDiff, driftDiff, alphaDiff, alphaNearDiff, depthDiff, idleMs };
}
