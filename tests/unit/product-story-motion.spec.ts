import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
	storyIndex,
	storyOptionsTime,
	storyPosition,
	storySceneStates,
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

test("story position is finite, clamped, and gives every scene equal distance", () => {
	expect(positionAt(-100)).toBe(0);
	expect(positionAt(0)).toBe(0);
	expect(positionAt(500)).toBe(2);
	expect(positionAt(1000)).toBe(4);
	expect(positionAt(2000)).toBe(4);
	expect(positionAt(10, 0)).toBe(4);
	expect(
		storyPosition({
			scrollY: Number.NaN,
			navHeight: 0,
			showcaseTop: 0,
			scrollRange: 1,
			sceneCount,
		}),
	).toBe(0);
	for (let index = 0; index < sceneCount; index += 1) {
		const scrollY = ((index + 0.5) / sceneCount) * 1000;
		expect(positionAt(scrollY)).toBeCloseTo(index);
	}
});

test("story position and selection stay monotonic in both directions", () => {
	const forward = Array.from({ length: 1001 }, (_, index) => positionAt(index));
	for (let index = 1; index < forward.length; index += 1) {
		expect(forward[index]).toBeGreaterThanOrEqual(forward[index - 1] ?? 0);
	}
	const reverse = forward.toReversed();
	for (let index = 1; index < reverse.length; index += 1) {
		expect(reverse[index]).toBeLessThanOrEqual(reverse[index - 1] ?? 4);
	}
});

test("hysteresis rejects threshold jitter and handles fast jumps", () => {
	expect(storyIndex(0.519, 0, sceneCount)).toBe(0);
	expect(storyIndex(0.521, 0, sceneCount)).toBe(1);
	expect(storyIndex(0.481, 1, sceneCount)).toBe(1);
	expect(storyIndex(0.479, 1, sceneCount)).toBe(0);
	expect(storyIndex(4, 0, sceneCount)).toBe(4);
	expect(storyIndex(0, 4, sceneCount)).toBe(0);
});

test("desktop options Motion scrub time is continuous and reversible", () => {
	expect(storyOptionsTime(0, sceneCount)).toBe(0);
	expect(storyOptionsTime(2, sceneCount)).toBe(0.5);
	expect(storyOptionsTime(4, sceneCount)).toBe(1);
});


test("render state always includes five scenes and exactly one selected image", () => {
	for (const activeIndex of [-100, -1, 0, 1, 2, 3, 4, 5, 100]) {
		const states = storySceneStates(activeIndex, sceneCount);
		expect(states).toHaveLength(sceneCount);
		expect(states.filter(({ selected }) => selected)).toHaveLength(1);
		expect(states.map(({ index }) => index)).toEqual([0, 1, 2, 3, 4]);
	}
	expect(storySceneStates(0, 0)).toEqual([]);
});

test("scene visibility cannot be overridden by a scrub timeline or delayed mount", () => {
	const component = readFileSync("src/sections/ProductStory.tsx", "utf8");
	const controller = readFileSync("src/sections/use-product-story-motion.ts", "utf8");
	const sectionStyles = readFileSync("src/styles/sections-styles.ts", "utf8");
	const sceneStyles = sectionStyles.slice(
		sectionStyles.indexOf("\tstoryDemoTransition:"),
		sectionStyles.indexOf("\tstoryDemoPlaceholder:"),
	);
	expect(component).toContain('import { FeatureDemo } from "@local-studio/demo-ui/story"');
	expect(component).toContain("sceneStates.map(({ index, selected })");
	expect(component).toContain("selected && styles.storySelectedDemo");
	expect(component).toContain("aria-hidden={!selected}");
	expect(component).toContain("inert={!selected}");
	expect(component).not.toContain("Suspense");
	expect(component).not.toContain("lazy(");
	expect(component).not.toContain("mountedSceneIndexes");
	expect(controller).not.toContain("layerAnimations");
	expect(controller).not.toContain("registerLayer");
	expect(controller).not.toContain("opacity:");
	expect(sceneStyles).toContain('visibility: "hidden"');
	expect(sceneStyles).toContain('visibility: "visible"');
	expect(sceneStyles).toContain('transitionProperty: "opacity, transform, visibility"');
	expect(sceneStyles).toContain('[reducedMotion]: "0s"');
	expect(component).toContain('styles.storyLayerOffset(index < activeIndex ? "-12px" : "12px")');
	expect(controller).toContain("requestAnimationFrame(update)");
	expect(controller).toContain('{ passive: true }');
});
