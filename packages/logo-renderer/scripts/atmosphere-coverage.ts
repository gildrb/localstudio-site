import assert from "node:assert/strict";
import type { SnapshotBytes } from "./atmosphere-images.ts";
import type { ScenePixels } from "./atmosphere-scene.ts";
import type { readAtmosphereOptions } from "./atmosphere-options.ts";
import { aperturePixels } from "./atmosphere-apertures.ts";

type AtmosphereOptions = ReturnType<typeof readAtmosphereOptions>;

export type CoveragePixels = Pick<ScenePixels, "base" | "near"> & {
	readonly coverage: SnapshotBytes;
	readonly zeroBG: SnapshotBytes;
	readonly zeroFG: SnapshotBytes;
	readonly litComposite: Readonly<Pick<Buffer, "length" | "subarray" | "readUInt8">>;
	readonly zeroComposite: Readonly<Pick<Buffer, "length" | "subarray" | "readUInt8">>;
};

type CoverageSamples = Readonly<{
	[Key in keyof CoveragePixels]: Readonly<Pick<Buffer, "length" | "readUInt8">>;
}>;

function compareSolidChrome(samples: CoverageSamples, i: number) {
	const { base, zeroBG, near, zeroFG, litComposite, zeroComposite } = samples;
	for (let c = 0; c < 4; c++) {
		assert.equal(
			base.readUInt8(i + c),
			zeroBG.readUInt8(i + c),
			"new BG cannot leak through alpha-.92 chrome",
		);
		assert.equal(
			near.readUInt8(i + c),
			zeroFG.readUInt8(i + c),
			"new FG cannot overlay opaque geometry",
		);
	}
	for (let c = 0; c < 3; c++)
		assert.equal(
			litComposite.readUInt8(i + c),
			zeroComposite.readUInt8(i + c),
			"final composited solid chrome RGB is unchanged",
		);
}

function checkOpaqueCoverage(
	pixels: Readonly<CoveragePixels>,
	holeRegions: readonly (readonly number[])[],
) {
	const holeIndices = new Set(holeRegions.flat());
	const coverageView = pixels.coverage.subarray();
	const coverage = Buffer.from(
		coverageView.buffer,
		coverageView.byteOffset,
		coverageView.byteLength,
	);
	const baseView = pixels.base.subarray();
	const base = Buffer.from(baseView.buffer, baseView.byteOffset, baseView.byteLength);
	const nearView = pixels.near.subarray();
	const near = Buffer.from(nearView.buffer, nearView.byteOffset, nearView.byteLength);
	const zeroBGView = pixels.zeroBG.subarray();
	const zeroBG = Buffer.from(zeroBGView.buffer, zeroBGView.byteOffset, zeroBGView.byteLength);
	const zeroFGView = pixels.zeroFG.subarray();
	const zeroFG = Buffer.from(zeroFGView.buffer, zeroFGView.byteOffset, zeroFGView.byteLength);
	const litCompositeView = pixels.litComposite.subarray();
	const litComposite = Buffer.from(
		litCompositeView.buffer,
		litCompositeView.byteOffset,
		litCompositeView.byteLength,
	);
	const zeroCompositeView = pixels.zeroComposite.subarray();
	const zeroComposite = Buffer.from(
		zeroCompositeView.buffer,
		zeroCompositeView.byteOffset,
		zeroCompositeView.byteLength,
	);
	const samples = { coverage, base, near, zeroBG, zeroFG, litComposite, zeroComposite };
	let solidPixels = 0;
	let exteriorLitPixels = 0;
	for (let i = 0; i < coverage.length; i += 4) {
		if (coverage.readUInt8(i + 3) === 255) {
			solidPixels++;
			compareSolidChrome(samples, i);
		} else if (
			coverage.readUInt8(i + 3) === 0 &&
			!holeIndices.has(i) &&
			litComposite.readUInt8(i) > zeroComposite.readUInt8(i)
		)
			exteriorLitPixels++;
	}
	return { solidPixels, exteriorLitPixels };
}

export function checkLightCoverage(
	options: Readonly<AtmosphereOptions>,
	pixels: Readonly<CoveragePixels>,
	logoPixels: SnapshotBytes,
) {
	const { coverage, base, near, zeroBG, zeroFG, litComposite, zeroComposite } = pixels;
	const holeRegions = aperturePixels(options, logoPixels);
	const { solidPixels, exteriorLitPixels } = checkOpaqueCoverage(
		{ coverage, base, near, zeroBG, zeroFG, litComposite, zeroComposite },
		holeRegions,
	);
	assert.ok(solidPixels > 100, "independent geometry coverage includes actual chrome");
	assert.ok(exteriorLitPixels > 100, "new light also illuminates air around the SVG silhouette");
	const holeIncrements = holeRegions.map(
		(region: readonly number[]) =>
			region.reduce(
				(sum, i) => sum + Math.max(0, litComposite.readUInt8(i) - zeroComposite.readUInt8(i)),
				0,
			) / region.length,
	);
	for (const increment of holeIncrements)
		assert.ok(increment > 0.1, "each real opening receives a positive diffuse-light increment");
	return { solidPixels, exteriorLitPixels, holeIncrements };
}
