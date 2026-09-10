import { PNG } from "pngjs";

// Readback is premultiplied RGBA; PNG stores straight alpha.
export function straightAlphaPng(
	premultiplied: Readonly<Pick<DataView, "getUint8">>,
	width: number,
	height: number,
) {
	const png = new PNG({ width, height });
	let nonzeroAlpha = 0;
	let maxAlpha = 0;
	for (let i = 0; i < width * height; i++) {
		const a = premultiplied.getUint8(i * 4 + 3);
		nonzeroAlpha += Number(a > 0);
		maxAlpha = Math.max(maxAlpha, a);
		for (let c = 0; c < 3; c++) {
			const v = premultiplied.getUint8(i * 4 + c);
			png.data[i * 4 + c] = a === 0 ? 0 : Math.min(255, Math.round((v * 255) / a));
		}
		png.data[i * 4 + 3] = a;
	}
	return { png, nonzeroAlpha, maxAlpha };
}
