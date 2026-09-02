export const STORY_HYSTERESIS = 0.02;
export const STORY_MAX_MOUNTED_SCENES = 3;
export const STORY_LAYER_TIMES = [0, 0.19, 0.25, 0.75, 0.81, 1] as const;
export const STORY_LAYER_OPACITY = [0, 0, 1, 1, 0, 0] as const;

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

export function mountedStoryScenes(
	activeIndex: number,
	sceneCount: number,
	inRange: boolean,
	reducedMotion: boolean,
) {
	if (!inRange || sceneCount <= 0) return [];
	const current = clamp(Math.round(activeIndex), 0, sceneCount - 1);
	if (reducedMotion) return [current];
	const first = Math.max(0, current - 1);
	const last = Math.min(sceneCount - 1, current + 1);
	return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

export function storyLayerTime(position: number, sceneIndex: number) {
	return clamp((position - sceneIndex + 1) / 2, 0, 1);
}

export function storyOptionsTime(position: number, sceneCount: number) {
	if (sceneCount <= 1) return 0;
	return clamp(position / (sceneCount - 1), 0, 1);
}
export function storyVisualPosition(position: number, mountedIndexes: readonly number[]) {
	if (mountedIndexes.length === 0) return position;
	if (mountedIndexes.some((index) => Math.abs(position - index) <= 1)) return position;
	return mountedIndexes.reduce(
		(nearest, index) =>
			Math.abs(position - index) < Math.abs(position - nearest) ? index : nearest,
		mountedIndexes[0] ?? position,
	);
}

export function storyLayerOpacity(position: number, sceneIndex: number) {
	const distance = Math.abs(position - sceneIndex);
	if (distance <= 0.5) return 1;
	if (distance >= 0.62) return 0;
	const progress = (0.62 - distance) / 0.12;
	return progress * progress * (3 - 2 * progress);
}

export function retainedStoryScenes(
	bufferedIndexes: readonly number[],
	activeIndex: number,
	sceneCount: number,
	inRange: boolean,
	reducedMotion: boolean,
) {
	if (!inRange || sceneCount <= 0) return [];
	const current = clamp(Math.round(activeIndex), 0, sceneCount - 1);
	if (reducedMotion) return [current];
	const retained = new Set(
		bufferedIndexes.filter(
			(index) => index >= 0 && index < sceneCount && Math.abs(index - current) <= 1,
		),
	);
	retained.add(current);
	return [current - 1, current, current + 1].filter((index) => retained.has(index));
}
