import factorySvg from "#sponsor-svg/factory.svg?raw";
import hotAisleSvg from "#sponsor-svg/hot-aisle.svg?raw";
import lambdaSvg from "#sponsor-svg/lambda.svg?raw";
import nvidiaSvg from "#sponsor-svg/nvidia.svg?raw";
import primeIntellectSvg from "#sponsor-svg/prime-intellect.svg?raw";
import tngSvg from "#sponsor-svg/tng.svg?raw";

export const sponsors = [
	{ name: "NVIDIA", svg: nvidiaSvg, width: 112, height: 21 },
	{ name: "Factory", svg: factorySvg, width: 140, height: 21 },
	{ name: "Lambda", svg: lambdaSvg, width: 98, height: 21 },
	{
		name: "Prime Intellect",
		svg: primeIntellectSvg,
		width: 162,
		height: 27,
	},
	{
		name: "TNG Technology Consulting",
		svg: tngSvg,
		width: 143,
		height: 21,
	},
	{ name: "Hot Aisle", svg: hotAisleSvg, width: 98, height: 30 },
] as const;

export function prepareInlineSvg(source: string, prefix: string): string {
	const start = source.indexOf("<svg");
	const openingEnd = source.indexOf(">", start);
	if (start < 0 || openingEnd < 0) return "";

	const opening = source
		.slice(start, openingEnd + 1)
		.replaceAll(/\s(?:width|height)="[^"]*"/gu, "")
		.replace("<svg", '<svg width="100%" height="100%" aria-hidden="true" focusable="false"');
	let svg = `${opening}${source.slice(openingEnd + 1)}`;
	const ids = [...svg.matchAll(/\sid="([^"]+)"/gu)].map((match) => match[1]);
	for (const id of ids) {
		svg = svg.replaceAll(`id="${id}"`, `id="${prefix}-${id}"`);
		svg = svg.replaceAll(`#${id}`, `#${prefix}-${id}`);
	}
	return svg;
}
