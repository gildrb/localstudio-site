import { expect, test } from "vite-plus/test";
import { atmosphereLayout } from "../../packages/logo-renderer/src/renderer/runtime/atmosphere-surface";

test("atmosphere uses half CSS resolution with a 768px longest-edge cap", () => {
	expect(
		atmosphereLayout(
			{ left: 400, top: 300, width: 1200, height: 400 },
			{ left: 100, top: 100, width: 2400, height: 1200 },
		).size,
	).toEqual([768, 384]);
	expect(
		atmosphereLayout(
			{ left: 0, top: 0, width: 100, height: 100 },
			{ left: 0, top: 0, width: 1200, height: 2400 },
		).size,
	).toEqual([384, 768]);
	expect(
		atmosphereLayout(
			{ left: 0, top: 0, width: 100, height: 100 },
			{ left: 0, top: 0, width: 1200, height: 800 },
		).size,
	).toEqual([600, 400]);
});

test("Prism desktop resolution caps at 1280px without changing logo projection", () => {
	const hero = { left: 20, top: 100, width: 1585, height: 1365 };
	const logo = { left: 140, top: 400, width: 1200, height: 420 };
	const baseline = atmosphereLayout(logo, hero);
	const prism = atmosphereLayout(logo, hero, { scale: 1, maxEdge: 1280 });
	expect(prism.size).toEqual([1280, 1102]);
	expect(prism.logoRect).toEqual(baseline.logoRect);
	expect(prism.logoRect).toEqual([120 / 1585, 300 / 1365, 1200 / 1585, 420 / 1365]);
});

test("Prism mobile resolution uses one render pixel per CSS pixel without upscaling", () => {
	const logo = { left: 0, top: 200, width: 375, height: 120 };
	const mobile = { left: 0, top: 0, width: 375, height: 704 };
	expect(atmosphereLayout(logo, mobile, { scale: 1, maxEdge: 1280 }).size).toEqual([375, 704]);
	for (const [width, height] of [
		[375, 704],
		[1280, 300],
		[300, 1280],
		[320, 1800],
	] as const) {
		const layout = atmosphereLayout(
			logo,
			{ ...mobile, width, height },
			{ scale: 1, maxEdge: 1280 },
		);
		expect(layout.size[0]).toBeLessThanOrEqual(width);
		expect(layout.size[1]).toBeLessThanOrEqual(height);
		expect(Math.max(...layout.size)).toBeLessThanOrEqual(1280);
	}
});

test("mobile atmosphere projects the logo in hero-relative UV without clipping", () => {
	const hero = { left: 20, top: 100, width: 390, height: 844 };
	const logo = { left: -19, top: 311, width: 468, height: 211 };
	const layout = atmosphereLayout(logo, hero);
	expect(layout.size).toEqual([195, 422]);
	expect(layout.logoRect).toEqual([-0.1, 0.25, 1.2, 0.25]);
	expect(
		atmosphereLayout(
			{ ...logo, left: logo.left + 200, top: logo.top - 50 },
			{ ...hero, left: hero.left + 200, top: hero.top - 50 },
		),
	).toEqual(layout);
});

test("zero-sized hero bounds keep the atmosphere finite and nonempty", () => {
	const layout = atmosphereLayout(
		{ left: 0, top: 0, width: 0, height: 0 },
		{ left: 0, top: 0, width: 0, height: 0 },
	);
	expect(layout.size).toEqual([1, 1]);
	for (const value of layout.logoRect) expect(Number.isFinite(value)).toBe(true);
});
