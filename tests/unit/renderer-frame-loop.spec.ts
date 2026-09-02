import { expect, test } from "bun:test";
import { reflectionRevealDampingAlpha } from "../../packages/logo-renderer/src/renderer/runtime/frame-loop";

function revealAfter(seconds: number, refreshRate: number) {
	let reveal = 0;
	const frames = Math.round(seconds * refreshRate);
	for (let frame = 0; frame < frames; frame++) {
		const alpha = reflectionRevealDampingAlpha(reveal, 1, 1 / refreshRate);
		reveal += (1 - reveal) * alpha;
	}
	return reveal;
}

test("reflection reveal attacks quickly and consistently across refresh rates", () => {
	expect(revealAfter(0.1, 60)).toBeGreaterThan(0.5);
	expect(revealAfter(0.25, 60)).toBeGreaterThan(0.9);
	expect(revealAfter(0.25, 120)).toBeCloseTo(revealAfter(0.25, 60), 12);
});

test("reflection reveal keeps the existing 60 Hz release curve", () => {
	expect(reflectionRevealDampingAlpha(1, 0, 1 / 60)).toBeCloseTo(5 / 60, 12);
	expect(reflectionRevealDampingAlpha(0, 1, 1 / 60)).toBeCloseTo(10 / 60, 12);
});
