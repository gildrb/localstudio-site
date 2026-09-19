import { expect, test } from "vite-plus/test";
import { readFileSync } from "node:fs";
import {
	storyIndex,
	storyOptionsTime,
	storyPosition,
	storySceneStates,
	storySceneAnimation,
} from "../../src/sections/product-story-motion";

import { motion } from "../../src/domain/motion";

const sceneCount = 5;

test("entries transition in 300ms; story swap in 500ms", () => {
	expect(motion.featureEntry.duration).toBe(0.3);
	expect(motion.featureSwap.duration).toBe(0.5);
});

function positionAt(scrollY: number, scrollRange = 1000) {
	return storyPosition({
		scrollY,
		navHeight: 72,
		showcaseTop: 72,
		scrollRange,
		sceneCount,
	});
}

test("position clamps and spaces scenes equally", () => {
	for (const [scroll, expected] of [
		[-100, 0],
		[0, 0],
		[500, 2],
		[1000, 4],
		[2000, 4],
	] as const) {
		expect(positionAt(scroll)).toBe(expected);
	}
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

test("position is monotonic both ways", () => {
	const forward = Array.from({ length: 1001 }, (_, index) => positionAt(index));
	for (let index = 1; index < forward.length; index += 1) {
		expect(forward[index]).toBeGreaterThanOrEqual(forward[index - 1] ?? 0);
	}
	const reverse = forward.toReversed();
	for (let index = 1; index < reverse.length; index += 1) {
		expect(reverse[index]).toBeLessThanOrEqual(reverse[index - 1] ?? 4);
	}
});

test("hysteresis rejects jitter and permits jumps", () => {
	for (const [position, current, expected] of [
		[0.519, 0, 0],
		[0.521, 0, 1],
		[0.481, 1, 1],
		[0.479, 1, 0],
		[4, 0, 4],
		[0, 4, 0],
	] as const)
		expect(storyIndex(position, current, sceneCount)).toBe(expected);
});

test("desktop scrub is continuous", () => {
	expect(storyOptionsTime(0, sceneCount)).toBe(0);
	expect(storyOptionsTime(2, sceneCount)).toBe(0.5);
	expect(storyOptionsTime(4, sceneCount)).toBe(1);
});

test("all scenes mount; one is selected", () => {
	for (const activeIndex of [-100, -1, 0, 1, 2, 3, 4, 5, 100]) {
		const states = storySceneStates(activeIndex, sceneCount);
		expect(states).toHaveLength(sceneCount);
		expect(states.filter(({ selected }) => selected)).toHaveLength(1);
		expect(states.map(({ index }) => index)).toEqual([0, 1, 2, 3, 4]);
	}
	expect(storySceneStates(0, 0)).toEqual([]);
});

test("Motion owns transitions; demos stay mounted", () => {
	const component = readFileSync("src/sections/ProductStory.tsx", "utf8");
	const controller = readFileSync("src/sections/use-product-story-motion.ts", "utf8");
	const styles = readFileSync("src/styles/sections-styles.ts", "utf8");
	const story = styles.slice(styles.indexOf("\tstory:"), styles.indexOf("\tscreenReaderOnly:"));
	for (const text of [
		'import { FeatureDemo } from "@local-studio/demo-ui/story"',
		"sceneStates.map(({ index, selected })",
		"selected && styles.storySelectedDemo",
		"aria-hidden={!selected}",
		"inert={!selected}",
		"<m.div",
		"<m.li",
		"<m.span",
		"{...storySceneAnimation(index, activeIndex, reducedMotion)}",
		"y: selected || reducedMotion ? 0 : 6",
		"animate={{ opacity: selected ? 1 : 0.55 }}",
		"duration: reducedMotion ? 0 : motion.featureEntry.duration",
	])
		expect(component).toContain(text);
	for (const text of ["Suspense", "lazy(", "mountedSceneIndexes"])
		expect(component).not.toContain(text);
	for (const text of ["layerAnimations", "registerLayer", "opacity:"])
		expect(controller).not.toContain(text);
	for (const text of ["requestAnimationFrame(update)", "{ passive: true }"])
		expect(controller).toContain(text);
	for (const text of ['visibility: "hidden"', 'visibility: "visible"'])
		expect(story).toContain(text);
	expect(story).not.toContain("transitionProperty:");
	expect(component).not.toContain("styles.storySelectedOptionTitle");
	expect(component).not.toContain("styles.storyLayerOffset");
	const sceneStyles = story.slice(
		story.indexOf("	storyDemoTransition:"),
		story.indexOf("	storyScrollTrack:"),
	);
	expect(sceneStyles).not.toContain("transform:");
	for (const text of [
		"storyIndex(position, currentIndex, sceneCount)",
		"syncMotion(reducedMotion ? currentIndex : position)",
	])
		expect(controller).toContain(text);
	expect(controller).not.toContain("useSpring");
});

test("stationary crossfades blur inactive scenes; reduced motion snaps", () => {
	for (const reduced of [false, true]) {
		for (let active = 0; active < sceneCount; active += 1) {
			for (let index = 0; index < sceneCount; index += 1) {
				const { initial, animate, transition } = storySceneAnimation(index, active, reduced);
				const selected = index === active;
				const duration = reduced ? 0 : 0.5;
				expect(initial).toBe(false);
				expect(animate).toEqual({
					opacity: 1,
					"--story-content-blur": selected || reduced ? "0px" : "8px",
					visibility: selected ? "visible" : "hidden",
				});
				expect(transition.duration).toBe(duration);
				expect(transition.visibility).toEqual({ duration: 0 });
			}
		}
	}
});
