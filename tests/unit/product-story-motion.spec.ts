import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
	STORY_MAX_MOUNTED_SCENES,
	mountedStoryScenes,
	retainedStoryScenes,
	storyIndex,
	storyLayerOpacity,
	storyLayerTime,
	storyOptionsTime,
	storyPosition,
	storyVisualPosition,
} from "../../src/sections/product-story-motion";

const sceneCount = 5;

function positionAt(scrollY: number, scrollRange = 1000) {
	return storyPosition({
		scrollY,
		navHeight: 72,
		showcaseTop: 72,
		scrollRange,
		sceneCount,
	});
}

test("story position is finite, clamped, and spans every scene", () => {
	expect(positionAt(-100)).toBe(0);
	expect(positionAt(0)).toBe(0);
	expect(positionAt(500)).toBe(2);
	expect(positionAt(1000)).toBe(4);
	expect(positionAt(2000)).toBe(4);
	expect(positionAt(10, 0)).toBe(4);
	expect(storyPosition({ scrollY: Number.NaN, navHeight: 0, showcaseTop: 0, scrollRange: 1, sceneCount })).toBe(0);
	expect(storyPosition({ scrollY: 100, navHeight: 0, showcaseTop: 0, scrollRange: 100, sceneCount: 1 })).toBe(0);
});

test("all five scenes receive equal scroll distance", () => {
	for (let index = 0; index < sceneCount; index += 1) {
		const scrollY = ((index + 0.5) / sceneCount) * 1000;
		expect(positionAt(scrollY)).toBeCloseTo(index);
	}
});

test("story position stays monotonic in both scroll directions", () => {
	const forward = Array.from({ length: 1001 }, (_, index) => positionAt(index));
	for (let index = 1; index < forward.length; index += 1) {
		expect(forward[index]).toBeGreaterThanOrEqual(forward[index - 1] ?? 0);
	}
	const reverse = forward.toReversed();
	for (let index = 1; index < reverse.length; index += 1) {
		expect(reverse[index]).toBeLessThanOrEqual(reverse[index - 1] ?? 4);
	}
});

test("hysteresis rejects threshold jitter and remains symmetric", () => {
	expect(storyIndex(0.519, 0, sceneCount)).toBe(0);
	expect(storyIndex(0.521, 0, sceneCount)).toBe(1);
	expect(storyIndex(0.481, 1, sceneCount)).toBe(1);
	expect(storyIndex(0.479, 1, sceneCount)).toBe(0);
	for (let boundary = 0; boundary < sceneCount - 1; boundary += 1) {
		expect(storyIndex(boundary + 0.519, boundary, sceneCount)).toBe(boundary);
		expect(storyIndex(boundary + 0.521, boundary, sceneCount)).toBe(boundary + 1);
		expect(storyIndex(boundary + 0.481, boundary + 1, sceneCount)).toBe(boundary + 1);
		expect(storyIndex(boundary + 0.479, boundary + 1, sceneCount)).toBe(boundary);
	}
});

test("hysteresis handles fast jumps in one update", () => {
	expect(storyIndex(4, 0, sceneCount)).toBe(4);
	expect(storyIndex(0, 4, sceneCount)).toBe(0);
	expect(storyIndex(Number.NaN, 3, sceneCount)).toBe(0);
	expect(storyIndex(2.7, 2.7, sceneCount)).toBe(3);
});

test("render budget never exceeds active plus two adjacent scenes", () => {
	expect(STORY_MAX_MOUNTED_SCENES).toBe(3);
	for (let count = 1; count <= 100; count += 1) {
		for (let active = 0; active < count; active += 1) {
			const mounted = mountedStoryScenes(active, count, true, false);
			expect(mounted.length).toBeLessThanOrEqual(STORY_MAX_MOUNTED_SCENES);
			expect(mounted).toEqual([...new Set(mounted)].toSorted((left, right) => left - right));
			expect(mounted).toContain(active);
			expect(mounted.every((index) => index >= 0 && index < count)).toBe(true);
		}
	}
	expect(mountedStoryScenes(2, 5, false, false)).toEqual([]);
	expect(mountedStoryScenes(2, 5, true, true)).toEqual([2]);
});



test("idle buffering never delays the active scene", () => {
	expect(retainedStoryScenes([0, 1], 4, 5, true, false)).toEqual([4]);
	expect(retainedStoryScenes([3, 4], 0, 5, true, false)).toEqual([0]);
	expect(retainedStoryScenes([0, 1, 2], 1, 5, true, false)).toEqual([0, 1, 2]);
	expect(retainedStoryScenes([0, 1, 2], 2, 5, true, false)).toEqual([1, 2]);
	expect(retainedStoryScenes([0, 1, 2], 2, 5, true, true)).toEqual([2]);
	expect(retainedStoryScenes([0, 1, 2], 2, 5, false, false)).toEqual([]);
});

test("every scrubbed frame has a fully covering scene", () => {
	let active = 0;
	for (let sample = 0; sample <= 4000; sample += 1) {
		const position = sample / 1000;
		active = storyIndex(position, active, sceneCount);
		const mounted = mountedStoryScenes(active, sceneCount, true, false);
		const visualPosition = storyVisualPosition(position, mounted);
		const coverage = Math.max(...mounted.map((index) => storyLayerOpacity(visualPosition, index)));
		expect(coverage).toBe(1);
	}
	for (let sample = 4000; sample >= 0; sample -= 1) {
		const position = sample / 1000;
		active = storyIndex(position, active, sceneCount);
		const mounted = mountedStoryScenes(active, sceneCount, true, false);
		const visualPosition = storyVisualPosition(position, mounted);
		const coverage = Math.max(...mounted.map((index) => storyLayerOpacity(visualPosition, index)));
		expect(coverage).toBe(1);
	}
});

test("fast jumps hold the nearest mounted scene instead of flashing black", () => {
	expect(storyVisualPosition(4, [0, 1])).toBe(1);
	expect(storyVisualPosition(0, [3, 4])).toBe(3);
	expect(storyLayerOpacity(storyVisualPosition(4, [0, 1]), 1)).toBe(1);
	expect(storyLayerOpacity(storyVisualPosition(0, [3, 4]), 3)).toBe(1);
});

test("Motion scrub time is continuous and exactly reversible", () => {
	for (let index = 0; index < sceneCount; index += 1) {
		expect(storyLayerTime(index - 1, index)).toBe(0);
		expect(storyLayerTime(index, index)).toBe(0.5);
		expect(storyLayerTime(index + 1, index)).toBe(1);
	}
	for (let sample = 0; sample <= 400; sample += 1) {
		const position = sample / 100;
		for (let index = 0; index < sceneCount; index += 1) {
			expect(storyLayerTime(position, index)).toBe(storyLayerTime(position, index));
		}
	}
	expect(storyOptionsTime(0, sceneCount)).toBe(0);
	expect(storyOptionsTime(2, sceneCount)).toBe(0.5);
	expect(storyOptionsTime(4, sceneCount)).toBe(1);
});

test("Product Story integration keeps the hot path bounded and compositor-only", () => {
	const component = readFileSync("src/sections/ProductStory.tsx", "utf8");
	const controller = readFileSync("src/sections/use-product-story-motion.ts", "utf8");
	expect(controller).toContain('import { animate } from "motion"');
	expect(component).toContain("mountedSceneIndexes.map");
	expect(component).toContain("data-story-scene-index");
	expect(controller).toContain("requestAnimationFrame(update)");
	expect(controller).toContain('{ passive: true }');
	expect(controller).toContain("controls.time = storyLayerTime");
	expect(readFileSync("src/sections/use-buffered-story-scenes.ts", "utf8")).toContain(
		"requestIdleCallback",
	);
	expect(controller).not.toContain("filter:");
	expect(component).not.toContain("productFeatures.map((feature, index) => {\n\t\t\t\t\t\tconst selected");
});
