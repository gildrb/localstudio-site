import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";

const source = readFileSync("src/styles/public-tokens.stylex.ts", "utf8");

function tokenHex(name: string, scheme: string): string {
	const match = source.match(
		new RegExp(
			`${name}: stylex\\.types\\.color\\(\\{ default: "(#[0-9a-f]{6})", \\[lightScheme\\]: "(#[0-9a-f]{6})"`,
			"u",
		),
	);
	const color = match?.[scheme === "light" ? 2 : 1];
	if (color === undefined || color === "") throw new Error("token");
	return color;
}

function luminance(hex: string): number {
	const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
	const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
	const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
	const value = red ** 2.4 * 0.2126729 + green ** 2.4 * 0.7151522 + blue ** 2.4 * 0.072175;
	// 1.414 is the APCA black-clamp exponent, not an approximation of sqrt(2).
	return value < 0.022 ? value + (0.022 - value) ** 1.414 : value;
}

function apcaContrast(text: string, background: string): number {
	const textY = luminance(text);
	const backgroundY = luminance(background);
	if (Math.abs(backgroundY - textY) < 0.0005) return 0;
	if (backgroundY > textY) {
		const contrast = (backgroundY ** 0.56 - textY ** 0.57) * 1.14;
		return contrast < 0.1 ? 0 : (contrast - 0.027) * 100;
	}
	const contrast = (backgroundY ** 0.65 - textY ** 0.62) * 1.14;
	return contrast > -0.1 ? 0 : (contrast + 0.027) * 100;
}

const roles = { foreground: 100, fine: 90, dim: 75, quiet: 65, chrome: 50 };
const stops = [
	"selectionSkyBright",
	"selectionSkyDay",
	"selectionSkyBlue",
	"selectionSkyDusk",
	"selectionSkyNight",
];
const primaryButton = { ink: "primaryButtonInk", surface: "primaryButtonSurface" };

test("APCA roles", () => {
	for (const scheme of ["dark", "light"]) {
		const background = tokenHex("background", scheme);
		for (const [name, minimum] of Object.entries(roles)) {
			expect(Math.abs(apcaContrast(tokenHex(name, scheme), background))).toBeGreaterThanOrEqual(
				minimum,
			);
		}
		const ink = tokenHex("selectionInk", scheme);
		const palette = stops.map((name) => tokenHex(name, scheme));
		let previous = palette.values().next().value;
		for (const color of palette.slice(1)) {
			if (previous !== undefined) {
				expect(luminance(previous)).toBeGreaterThan(luminance(color));
			}
			previous = color;
		}
		for (const color of palette) {
			expect(Math.abs(apcaContrast(ink, color))).toBeGreaterThanOrEqual(75);
		}
		expect(
			Math.abs(
				apcaContrast(tokenHex(primaryButton.ink, scheme), tokenHex(primaryButton.surface, scheme)),
			),
		).toBeGreaterThanOrEqual(75);
	}

	const layout = readFileSync("src/styles/hero-styles.ts", "utf8");
	const heroRender = layout.slice(layout.indexOf("heroRender:"), layout.indexOf("heroInner:"));
	const overlayOpacity = Number(
		heroRender.match(/opacity: \{ default: 1, "@media \(max-width: 1200px\)": ([\d.]+)/u)?.[1],
	);
	expect(Number.isFinite(overlayOpacity)).toBe(true);
	// Small-screen reflections leave copy readable.
	for (const { scheme, channel } of [
		{ scheme: "light", channel: 1 - overlayOpacity },
		{ scheme: "dark", channel: overlayOpacity },
	]) {
		const hex = `#${Math.round(255 * channel)
			.toString(16)
			.padStart(2, "0")
			.repeat(3)}`;
		expect(Math.abs(apcaContrast(tokenHex("foreground", scheme), hex))).toBeGreaterThanOrEqual(75);
	}
});
