import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import {
	logoRect,
	logoWidth,
	logoHeight,
	type readAtmosphereOptions,
} from "./atmosphere-options.ts";

type AtmosphereOptions = ReturnType<typeof readAtmosphereOptions>;
export type SnapshotBytes = Readonly<Pick<Uint8Array, "length" | "subarray">>;

type CompositeLayers = {
	readonly backgroundPixels: Readonly<Pick<Buffer, "readUInt8">>;
	readonly logoPixels: Readonly<Pick<Buffer, "readUInt8">> | undefined;
	readonly foregroundPixels: Readonly<Pick<Buffer, "readUInt8">> | undefined;
};

function compositePixel(
	destination: Readonly<Pick<Buffer, "writeUInt8">>,
	layers: Readonly<CompositeLayers>,
	i: number,
	j: number,
	inLogo: boolean,
	page: number,
) {
	const { backgroundPixels, logoPixels, foregroundPixels } = layers;
	for (let c = 0; c < 3; c++) {
		let v =
			backgroundPixels.readUInt8(i + c) + page * (1 - backgroundPixels.readUInt8(i + 3) / 255);
		if (inLogo && logoPixels !== undefined)
			v = logoPixels.readUInt8(j + c) + v * (1 - logoPixels.readUInt8(j + 3) / 255);
		if (foregroundPixels !== undefined)
			v = foregroundPixels.readUInt8(i + c) + v * (1 - foregroundPixels.readUInt8(i + 3) / 255);
		destination.writeUInt8(Math.max(0, Math.min(255, Math.round(v))), i + c);
	}
	destination.writeUInt8(255, i + 3);
}

export function writePng(
	options: Readonly<AtmosphereOptions>,
	path: string,
	background: SnapshotBytes,
	scheme: string,
	logo?: SnapshotBytes,
	foreground?: SnapshotBytes,
) {
	const backgroundView = background.subarray();
	const backgroundPixels = Buffer.from(
		backgroundView.buffer,
		backgroundView.byteOffset,
		backgroundView.byteLength,
	);
	const logoView = logo?.subarray();
	const logoPixels =
		logoView === undefined
			? undefined
			: Buffer.from(logoView.buffer, logoView.byteOffset, logoView.byteLength);
	const foregroundView = foreground?.subarray();
	const foregroundPixels =
		foregroundView === undefined
			? undefined
			: Buffer.from(foregroundView.buffer, foregroundView.byteOffset, foregroundView.byteLength);
	const { width, height } = options;
	const png = new PNG({ width, height });
	const page = scheme === "day" ? 255 : 0;
	const layers = { backgroundPixels, logoPixels, foregroundPixels };
	for (let y = 0; y < height; y++)
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const uv: readonly [number, number] = [
				(x / width - logoRect[0]) / logoRect[2],
				(y / height - logoRect[1]) / logoRect[3],
			];
			const inLogo = logoPixels !== undefined && uv.every((v) => v >= 0 && v < 1);
			const j = (Math.floor(uv[1] * logoHeight) * logoWidth + Math.floor(uv[0] * logoWidth)) * 4;
			compositePixel(png.data, layers, i, j, inLogo, page);
		}
	writeFileSync(path, PNG.sync.write(png, { colorType: 2 }));
	return png.data;
}
export function difference(
	options: Readonly<AtmosphereOptions>,
	inputA: SnapshotBytes,
	inputB: SnapshotBytes,
) {
	const aView = inputA.subarray();
	const a = Buffer.from(aView.buffer, aView.byteOffset, aView.byteLength);
	const bView = inputB.subarray();
	const b = Buffer.from(bView.buffer, bView.byteOffset, bView.byteLength);
	const { width, height } = options;
	let sum = 0;
	let max = 0;
	let changed = 0;
	for (let i = 0; i < a.length; i++) {
		if (i % 4 === 3) continue;
		const d = Math.abs(a.readUInt8(i) - b.readUInt8(i));
		sum += d;
		max = Math.max(max, d);
		changed += d > 0 ? 1 : 0;
	}
	return { mean: sum / (width * height * 3), max, changed };
}
export function checkBorder(options: Readonly<AtmosphereOptions>, input: SnapshotBytes) {
	const pixelsView = input.subarray();
	const pixels = Buffer.from(pixelsView.buffer, pixelsView.byteOffset, pixelsView.byteLength);
	const { width, height } = options;
	for (let y = 0; y < height; y++)
		for (let x = 0; x < width; x++) {
			if (x !== 0 && x !== width - 1 && y !== 0 && y !== height - 1) continue;
			const i = (y * width + x) * 4;
			assert.equal(
				pixels.readUInt8(i) +
					pixels.readUInt8(i + 1) +
					pixels.readUInt8(i + 2) +
					pixels.readUInt8(i + 3),
				0,
				"exact transparent border",
			);
		}
}
