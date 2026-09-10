import { expect, test } from "vite-plus/test";
import { advanceDepthOpening } from "../../packages/logo-renderer/src/renderer/runtime/frame-loop";

function openingAfter(current: number, target: number, seconds: number, refreshRate: number) {
	for (let frame = 0; frame < Math.round(seconds * refreshRate); frame++) {
		current = advanceDepthOpening(current, target, 1 / refreshRate);
	}
	return current;
}

test("pointer depth opening and closing settle in 300ms across refresh rates", () => {
	for (const rate of [30, 60, 120]) {
		expect(openingAfter(0, 1, 0.15, rate)).toBeCloseTo(Math.round(0.15 * rate) / rate / 0.3);
		expect(openingAfter(0, 1, 0.3, rate)).toBe(1);
		expect(openingAfter(1, 0, 0.3, rate)).toBe(0);
		expect(openingAfter(1, 0, 0.4, rate)).toBe(0);
	}
});

test("depth motion reverses continuously without overshoot or negative time", () => {
	expect(advanceDepthOpening(0.5, 0, 0.03)).toBeCloseTo(0.4);
	expect(advanceDepthOpening(0.5, 1, 0.03)).toBeCloseTo(0.6);
	expect(advanceDepthOpening(0.5, 0, -1)).toBe(0.5);
	expect(advanceDepthOpening(0.5, 1, 1)).toBe(1);
	expect(advanceDepthOpening(0.5, 0, 1)).toBe(0);
});
