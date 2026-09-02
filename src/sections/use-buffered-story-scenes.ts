import { useEffect, useState } from "react";
import { mountedStoryScenes, retainedStoryScenes } from "./product-story-motion";

export function useBufferedStoryScenes(
	activeIndex: number,
	sceneCount: number,
	inRange: boolean,
	reducedMotion: boolean,
) {
	const [bufferedIndexes, setBufferedIndexes] = useState([0]);
	const renderedIndexes = retainedStoryScenes(
		bufferedIndexes,
		activeIndex,
		sceneCount,
		inRange,
		reducedMotion,
	);

	useEffect(() => {
		const desired = mountedStoryScenes(
			activeIndex,
			sceneCount,
			inRange,
			reducedMotion,
		);
		if (reducedMotion || !inRange) {
			setBufferedIndexes(desired);
			return;
		}

		const commit = () => setBufferedIndexes(desired);
		if (window.requestIdleCallback) {
			const idle = window.requestIdleCallback(commit, { timeout: 80 });
			return () => window.cancelIdleCallback(idle);
		}
		const timeout = globalThis.setTimeout(commit, 32);
		return () => globalThis.clearTimeout(timeout);
	}, [activeIndex, inRange, reducedMotion, sceneCount]);

	return renderedIndexes;
}
