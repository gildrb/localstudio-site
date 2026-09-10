import type { SnapshotBytes } from "./atmosphere-images.ts";
import assert from "node:assert/strict";
import {
	logoRect,
	logoWidth,
	logoHeight,
	type readAtmosphereOptions,
} from "./atmosphere-options.ts";

type AtmosphereOptions = ReturnType<typeof readAtmosphereOptions>;

function transparentRegion(
	seed: number,
	pixels: Readonly<Pick<Buffer, "readUInt8">>,
	seen: Readonly<Pick<Buffer, "readUInt8" | "writeUInt8">>,
) {
	const pending = [seed];
	const region: number[] = [];
	let touchesEdge = false;
	seen.writeUInt8(1, seed);
	while (pending.length > 0) {
		const cell = pending.pop();
		if (cell === undefined) break;
		const x = cell % logoWidth;
		const y = Math.floor(cell / logoWidth);
		region.push(cell);
		if (x === 0 || x === logoWidth - 1 || y === 0 || y === logoHeight - 1) touchesEdge = true;
		const neighbors: readonly (readonly [number, number])[] = [
			[x - 1, y],
			[x + 1, y],
			[x, y - 1],
			[x, y + 1],
		];
		for (const [nx, ny] of neighbors) {
			if (nx < 0 || nx >= logoWidth || ny < 0 || ny >= logoHeight) continue;
			const next = ny * logoWidth + nx;
			if (seen.readUInt8(next) !== 0 || pixels.readUInt8(next * 4 + 3) >= 128) continue;
			seen.writeUInt8(1, next);
			pending.push(next);
		}
	}
	return { region, touchesEdge };
}

// Find enclosed transparent regions in the actual rendered mesh, not guessed SVG ellipses.
export function aperturePixels(options: Readonly<AtmosphereOptions>, input: SnapshotBytes) {
	const pixelsView = input.subarray();
	const pixels = Buffer.from(pixelsView.buffer, pixelsView.byteOffset, pixelsView.byteLength);
	const { width, height } = options;
	const seen = Buffer.alloc(logoWidth * logoHeight);
	const holes: number[][] = [];
	for (let seed = 0; seed < seen.length; seed++) {
		if (seen.readUInt8(seed) !== 0 || pixels.readUInt8(seed * 4 + 3) >= 128) continue;
		const { region, touchesEdge } = transparentRegion(seed, pixels, seen);
		if (touchesEdge || region.length < 64) continue;
		const projected = new Set<number>();
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

export function checkNearChrome(
	options: Readonly<AtmosphereOptions>,
	nearInput: SnapshotBytes,
	logoPixels: SnapshotBytes,
) {
	const nearView = nearInput.subarray();
	const near = Buffer.from(nearView.buffer, nearView.byteOffset, nearView.byteLength);
	const { width, height } = options;
	const logoMask = logoPixels.subarray();
	let nearOverLogoMax = 0;
	let nearOverLogoCount = 0;

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
					(offset) => (logoMask[j + offset + 3] ?? 0) < 230,
				)
			)
				continue;
			const alpha = near.readUInt8((y * width + x) * 4 + 3);
			nearOverLogoMax = Math.max(nearOverLogoMax, alpha);
			if (alpha > 0) nearOverLogoCount++;
		}
	assert.ok(
		nearOverLogoCount > 100 && nearOverLogoMax <= 9,
		`low but nonzero near-volume over chrome: ${String(nearOverLogoCount)} pixels, max ${String(nearOverLogoMax)}`,
	);
	return { nearOverLogoMax, nearOverLogoCount };
}

export function checkApertureResponse(
	options: Readonly<AtmosphereOptions>,
	logoPixels: SnapshotBytes,
	nearInput: SnapshotBytes,
	pointerInput: SnapshotBytes,
) {
	const nearView = nearInput.subarray();
	const near = Buffer.from(nearView.buffer, nearView.byteOffset, nearView.byteLength);
	const pointerNearView = pointerInput.subarray();
	const pointerNear = Buffer.from(
		pointerNearView.buffer,
		pointerNearView.byteOffset,
		pointerNearView.byteLength,
	);
	return aperturePixels(options, logoPixels).map((pixels: readonly number[]) => {
		let light = 0;
		let response = 0;
		for (const i of pixels)
			for (let c = 0; c < 3; c++) {
				light += near.readUInt8(i + c);
				response += Math.abs(near.readUInt8(i + c) - pointerNear.readUInt8(i + c));
			}
		const meanLight = light / (pixels.length * 3);
		const meanResponse = response / (pixels.length * 3);
		assert.ok(meanLight > 0.25, "each aperture contains visible near-volume light");
		assert.ok(meanResponse > 0.01, "each aperture responds to the shared light position");
		return { pixels: pixels.length, meanLight, meanResponse };
	});
}
