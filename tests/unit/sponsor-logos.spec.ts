import { expect, test } from "bun:test";
import { prepareInlineSvg, sponsors } from "../../src/sections/sponsor-logos";

test("prepares exactly six safe inline sponsor SVGs", () => {
	expect(sponsors).toHaveLength(6);
	expect(sponsors.map(({ name }) => name)).toContain("Hot Aisle");

	const svgs = sponsors.map(({ svg }, index) => prepareInlineSvg(svg, `sponsor-${index}`));
	expect(svgs.every((svg) => svg.startsWith("<svg"))).toBe(true);
	expect(svgs.every((svg) => svg.includes('width="100%" height="100%"'))).toBe(true);

	const html = svgs.join("");
	const ids = [...html.matchAll(/\sid="(sponsor-[^"]+)"/gu)].map((match) => match[1]);
	expect(new Set(ids).size).toBe(ids.length);
	for (const reference of html.matchAll(/url\(#(sponsor-[^)]+)\)/gu)) {
		expect(ids).toContain(reference[1]);
	}
});
