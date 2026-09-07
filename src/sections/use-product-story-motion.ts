import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	storyIndex,
	storyOptionsTime,
	storyPosition,
} from "./product-story-motion";

const MOBILE_STORY_QUERY = "(max-width: 900px)";
type MotionControls = ReturnType<typeof animate>;

export function useProductStoryMotion(sceneCount: number) {
	const reducedMotion = useReducedMotion() ?? false;
	const [activeIndex, setActiveIndex] = useState(0);
	const [mobile, setMobile] = useState<boolean | null>(null);
	const activeIndexRef = useRef(0);
	const showcaseRef = useRef<HTMLDivElement>(null);
	const optionsRef = useRef<HTMLOListElement>(null);
	const positionRef = useRef(0);
	const optionsAnimation = useRef<MotionControls | null>(null);

	const syncMotion = useCallback((position: number) => {
		positionRef.current = position;
		if (optionsAnimation.current) {
			optionsAnimation.current.time = storyOptionsTime(position, sceneCount);
		}
	}, [sceneCount]);

	useEffect(() => {
		const showcase = showcaseRef.current;
		const sticky = showcase?.querySelector<HTMLElement>("[data-story-sticky]");
		const options = optionsRef.current;
		if (!showcase || !sticky || !options) return;
		let updateFrame = 0;
		let measureFrame = 0;
		let showcaseTop = 0;
		let navHeight = 72;
		let scrollRange = 1;
		let currentIndex = activeIndexRef.current;
		let scrollActive = false;
		let disposed = false;
		const mobileQuery = window.matchMedia(MOBILE_STORY_QUERY);

		const rebuildResponsiveMotion = () => {
			setMobile(mobileQuery.matches);
			optionsAnimation.current?.cancel();
			optionsAnimation.current = null;
			if (!mobileQuery.matches) {
				optionsAnimation.current = animate(
					options,
					{ transform: ["translateY(20%)", "translateY(-60%)"] },
					{ autoplay: false, duration: 1, ease: "linear" },
				);
			}
			syncMotion(reducedMotion ? currentIndex : positionRef.current);
		};

		const update = () => {
			updateFrame = 0;
			const position = storyPosition({
				scrollY: window.scrollY,
				navHeight,
				showcaseTop,
				scrollRange,
				sceneCount,
			});
			const nextIndex = storyIndex(position, currentIndex, sceneCount);
			if (nextIndex !== currentIndex) {
				currentIndex = nextIndex;
				activeIndexRef.current = nextIndex;
				setActiveIndex(nextIndex);
			}
			syncMotion(reducedMotion ? currentIndex : position);
		};

		const measure = () => {
			measureFrame = 0;
			const header = document.querySelector("header");
			navHeight = header?.getBoundingClientRect().height || 72;
			const stageHeight = Math.max(1, sticky.offsetHeight);
			scrollRange = Math.max(1, showcase.offsetHeight - stageHeight);
			showcaseTop = window.scrollY + showcase.getBoundingClientRect().top;
			if (updateFrame !== 0) window.cancelAnimationFrame(updateFrame);
			update();
		};

		const scheduleUpdate = () => {
			if (updateFrame === 0) updateFrame = window.requestAnimationFrame(update);
		};
		const scheduleMeasure = () => {
			if (measureFrame === 0) measureFrame = window.requestAnimationFrame(measure);
		};
		const scheduleViewportMeasure = () => {
			const focused = document.activeElement;
			if (focused instanceof HTMLElement && showcase.contains(focused)) return;
			scheduleMeasure();
		};
		const restoreAfterPageShow = () => scheduleMeasure();
		const syncAfterVisibility = () => {
			if (document.visibilityState === "visible") scheduleMeasure();
		};
		const setScrollActive = (active: boolean) => {
			if (scrollActive === active) return;
			scrollActive = active;
			if (active) {
				window.addEventListener("scroll", scheduleUpdate, { passive: true });
				scheduleUpdate();
			} else {
				window.removeEventListener("scroll", scheduleUpdate);
			}
		};

		const sizeObserver = new ResizeObserver(scheduleMeasure);
		const visibilityObserver = new IntersectionObserver(
			(entries) => {
				const visible = entries.at(-1)?.isIntersecting ?? false;
				setScrollActive(visible);
				if (visible) scheduleMeasure();
			},
			{ rootMargin: "500px 0px" },
		);
		sizeObserver.observe(showcase);
		sizeObserver.observe(sticky);
		visibilityObserver.observe(showcase);
		rebuildResponsiveMotion();
		scheduleMeasure();
		window.addEventListener("resize", scheduleMeasure);
		window.visualViewport?.addEventListener("resize", scheduleViewportMeasure);
		window.addEventListener("pageshow", restoreAfterPageShow);
		document.addEventListener("visibilitychange", syncAfterVisibility);
		mobileQuery.addEventListener("change", rebuildResponsiveMotion);
		void document.fonts.ready.then(() => {
			if (!disposed) scheduleMeasure();
		});

		return () => {
			disposed = true;
			sizeObserver.disconnect();
			visibilityObserver.disconnect();
			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleMeasure);
			window.visualViewport?.removeEventListener("resize", scheduleViewportMeasure);
			window.removeEventListener("pageshow", restoreAfterPageShow);
			document.removeEventListener("visibilitychange", syncAfterVisibility);
			mobileQuery.removeEventListener("change", rebuildResponsiveMotion);
			optionsAnimation.current?.cancel();
			optionsAnimation.current = null;
			if (updateFrame !== 0) window.cancelAnimationFrame(updateFrame);
			if (measureFrame !== 0) window.cancelAnimationFrame(measureFrame);
		};
	}, [reducedMotion, sceneCount, syncMotion]);


	return {
		activeIndex,
		mobile,
		optionsRef,
		reducedMotion,
		showcaseRef,
	};
}
