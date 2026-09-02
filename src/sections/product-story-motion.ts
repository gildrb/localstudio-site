export const STORY_HYSTERESIS = 0.02;

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
