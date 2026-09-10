import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { storyOptionsTime } from "./product-story-motion";
import { attachProductStoryMotion, type MotionControls } from "./product-story-session";

export function useProductStoryMotion(sceneCount: number) {
	const reducedMotion = useReducedMotion() ?? false;
	const [activeIndex, setActiveIndex] = useState(0);
	const [mobile, setMobile] = useState<boolean | null>(null);
	const activeIndexRef = useRef(0);
	const showcaseRef = useRef<HTMLDivElement>(null);
	const optionsRef = useRef<HTMLOListElement>(null);
	const positionRef = useRef(0);
	const optionsAnimation = useRef<MotionControls | null>(null);

	const syncMotion = useCallback(
		(position: number) => {
			positionRef.current = position;
			if (optionsAnimation.current) {
				optionsAnimation.current.time = storyOptionsTime(position, sceneCount);
			}
		},
		[sceneCount],
	);

	useEffect(() => {
		const showcase = showcaseRef.current;
		const sticky = showcase?.querySelector<HTMLElement>("[data-story-sticky]");
		const options = optionsRef.current;
		return showcase && sticky && options
			? attachProductStoryMotion({
					sceneCount,
					reducedMotion,
					showcase,
					sticky,
					options,
					activeIndexRef,
					positionRef,
					optionsAnimation,
					syncMotion,
					setActiveIndex,
					setMobile,
				})
			: undefined;
	}, [reducedMotion, sceneCount, syncMotion]);

	return {
		activeIndex,
		mobile,
		optionsRef,
		reducedMotion,
		showcaseRef,
	};
}
