import { motion } from "../domain/motion";

export const STORY_HYSTERESIS = 0.02;

export function storySceneAnimation(index: number, activeIndex: number, reducedMotion: boolean) {
	const selected = index === activeIndex;
	const passed = index < activeIndex;
	const visible = selected || (!reducedMotion && index === activeIndex + 1);
	const duration = reducedMotion ? 0 : motion.featureSwap.duration;
	return {
		initial: false as const,
		animate: {
			opacity: passed ? 0 : 1,
			z: reducedMotion || selected ? 0 : passed ? 140 : -100,
			y: reducedMotion || selected ? 0 : passed ? -8 : 0,
			visibility: visible ? "visible" as const : "hidden" as const,
		},
		transition: {
			...motion.featureSwap,
			type: "tween" as const,
			duration,
			ease: [0.4, 0, 0.2, 1] as const,
			// Only the departing foreground dissolves; the scene beneath stays opaque.
			opacity: { duration: passed ? duration : 0, ease: "easeIn" as const },
			visibility: { duration: 0, delay: visible ? 0 : duration },
		},
	};
}

function clamp(value: number, minimum: number, maximum: number) {
	return Math.min(Math.max(value, minimum), maximum);
}

export function storyPosition({
	scrollY,
	navHeight,
	showcaseTop,
	scrollRange,
	sceneCount,
}: {
	scrollY: number;
	navHeight: number;
	showcaseTop: number;
	scrollRange: number;
	sceneCount: number;
}) {
	if (sceneCount <= 1) return 0;
	const safeRange = Number.isFinite(scrollRange) ? Math.max(1, scrollRange) : 1;
	const rawTravel = scrollY + navHeight - showcaseTop;
	const traveled = clamp(Number.isFinite(rawTravel) ? rawTravel : 0, 0, safeRange);
	return clamp((traveled / safeRange) * sceneCount - 0.5, 0, sceneCount - 1);
}

export function storyIndex(
	position: number,
	currentIndex: number,
	sceneCount: number,
	hysteresis = STORY_HYSTERESIS,
) {
	if (sceneCount <= 1) return 0;
	const lastIndex = sceneCount - 1;
	const safePosition = clamp(Number.isFinite(position) ? position : 0, 0, lastIndex);
	const safeCurrent = clamp(Math.round(currentIndex), 0, lastIndex);
	const candidate = clamp(Math.round(safePosition), 0, lastIndex);
	const deadband = clamp(hysteresis, 0, 0.49);

	if (candidate > safeCurrent && safePosition >= safeCurrent + 0.5 + deadband) {
		return candidate;
	}
	if (candidate < safeCurrent && safePosition <= safeCurrent - 0.5 - deadband) {
		return candidate;
	}
	return safeCurrent;
}

export function storyOptionsTime(position: number, sceneCount: number) {
	if (sceneCount <= 1) return 0;
	return clamp(position / (sceneCount - 1), 0, 1);
}

export function storySceneStates(activeIndex: number, sceneCount: number) {
	if (sceneCount <= 0) return [];
	const selectedIndex = clamp(Math.round(activeIndex), 0, sceneCount - 1);
	return Array.from({ length: sceneCount }, (_, index) => ({
		index,
		selected: index === selectedIndex,
	}));
}
