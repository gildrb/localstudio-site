import { expect, test } from "vite-plus/test";
import {
	ATMOSPHERE_INTRO_DURATION,
	atmosphereIntroState,
} from "../../packages/logo-renderer/src/renderer/render/intro";

test("actual-hole emission turns on left, middle, right before the room settles", () => {
	expect(atmosphereIntroState(0)).toEqual({
		strengths: [0, 0, 0],
		pulses: [0, 0, 0],
		settle: 0,
		active: true,
	});
	const left = atmosphereIntroState(0.15);
	expect(left.strengths[0]).toBeGreaterThan(0);
	expect(left.strengths.slice(1)).toEqual([0, 0]);
	const middle = atmosphereIntroState(0.45);
	expect(middle.strengths[0]).toBe(1);
	expect(middle.strengths[1]).toBeGreaterThan(0);
	expect(middle.strengths[2]).toBe(0);
	const right = atmosphereIntroState(0.75);
	expect(right.strengths[0]).toBe(1);
	expect(right.strengths[1]).toBe(1);
	expect(right.strengths[2]).toBeGreaterThan(0);
	expect(right.settle).toBe(0);
	expect(ATMOSPHERE_INTRO_DURATION).toBe(2.1);
	expect(atmosphereIntroState(0.9).settle).toBe(0);
	expect(atmosphereIntroState(1.4).settle).toBe(0);
	expect(atmosphereIntroState(1.75).settle).toBeCloseTo(0.5);
	expect(atmosphereIntroState(2.1).settle).toBe(1);
});

test("each light stays on as the next 300ms stage begins", () => {
	expect(atmosphereIntroState(0.3).pulses).toEqual([1, 0, 0]);
	expect(atmosphereIntroState(0.6).pulses).toEqual([1, 1, 0]);
	expect(atmosphereIntroState(0.9).pulses).toEqual([1, 1, 1]);
	expect(atmosphereIntroState(0.75).pulses[0]).toBe(1);
	expect(atmosphereIntroState(0.75).pulses[1]).toBe(1);
	expect(atmosphereIntroState(0.75).pulses[2]).toBeGreaterThan(0);
	for (let ms = 0; ms <= 900; ms += 10) {
		for (const pulse of atmosphereIntroState(ms / 1000).pulses) {
			expect(pulse).toBeGreaterThanOrEqual(0);
			expect(pulse).toBeLessThanOrEqual(1);
		}
	}
});

test("intro is bounded, monotonic, and ends at the unchanged baseline", () => {
	let previous = atmosphereIntroState(-1);
	for (let ms = 0; ms <= 2400; ms += 10) {
		const current = atmosphereIntroState(ms / 1000);
		for (let hole = 0; hole < 3; hole++) {
			expect(current.strengths[hole]).toBeGreaterThanOrEqual(previous.strengths[hole]!);
			expect(current.strengths[hole]).toBeLessThanOrEqual(1);
		}
		expect(current.settle).toBeGreaterThanOrEqual(previous.settle);
		expect(current.settle).toBeLessThanOrEqual(1);
		previous = current;
	}
	for (const time of [undefined, NaN, Infinity, -Infinity, ATMOSPHERE_INTRO_DURATION, 60]) {
		expect(atmosphereIntroState(time)).toEqual({
			strengths: [1, 1, 1],
			pulses: [0, 0, 0],
			settle: 1,
			active: false,
		});
	}
});
