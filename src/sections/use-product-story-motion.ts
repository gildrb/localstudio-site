import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { type RefCallback, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "../domain/motion";
import {
	STORY_LAYER_OPACITY,
	STORY_LAYER_TIMES,
	storyIndex,
	storyLayerTime,
	storyOptionsTime,
	storyPosition,
	storyVisualPosition,
} from "./product-story-motion";

const MOBILE_STORY_QUERY = "(max-width: 900px)";
const STORY_TRANSFORMS = [
	"translate3d(0, 18px, 0) scale(0.985)",
	"translate3d(0, 18px, 0) scale(0.985)",
	"translate3d(0, 0, 0) scale(1)",
	"translate3d(0, 0, 0) scale(1)",
	"translate3d(0, -18px, 0) scale(0.985)",
	"translate3d(0, -18px, 0) scale(0.985)",
];
const STORY_OPTION_TRANSFORMS = [
	"translate3d(0, 10px, 0)",
	"translate3d(0, 10px, 0)",
	"translate3d(0, 0, 0)",
	"translate3d(0, 0, 0)",
	"translate3d(0, -10px, 0)",
	"translate3d(0, -10px, 0)",
];

type MotionControls = ReturnType<typeof animate>;

function createLayerAnimation(element: HTMLElement, option = false) {
	return animate(
		element,
		{
			opacity: [...STORY_LAYER_OPACITY],
			transform: option ? STORY_OPTION_TRANSFORMS : STORY_TRANSFORMS,
		},
		{
			autoplay: false,
			duration: 1,
			ease: motion.ease,
			times: [...STORY_LAYER_TIMES],
		},
	);
}

export function useProductStoryMotion(sceneCount: number) {
	const reducedMotion = useReducedMotion() ?? false;
	const [activeIndex, setActiveIndex] = useState(0);
	const [inRange, setInRange] = useState(false);
	const activeIndexRef = useRef(0);
	const showcaseRef = useRef<HTMLDivElement>(null);
	const optionsRef = useRef<HTMLOListElement>(null);
	const positionRef = useRef(0);
	const mobileRef = useRef(false);
	const layerAnimations = useRef(new Map<number, MotionControls>());
	const optionAnimations = useRef(new Map<number, MotionControls>());
	const descriptionAnimations = useRef(new Map<number, MotionControls>());
	const optionNodes = useRef(new Map<number, HTMLLIElement>());
	const layerRefCallbacks = useRef(new Map<number, RefCallback<HTMLDivElement>>());
	const optionRefCallbacks = useRef(new Map<number, RefCallback<HTMLLIElement>>());
	const optionsAnimation = useRef<MotionControls | null>(null);

	const syncMotion = useCallback((position: number) => {
		positionRef.current = position;
		const mountedIndexes = [...layerAnimations.current.keys()];
		const visualPosition = storyVisualPosition(position, mountedIndexes);
		for (const [index, controls] of layerAnimations.current) {
			controls.time = storyLayerTime(visualPosition, index);
		}
		for (const [index, controls] of optionAnimations.current) {
			controls.time = storyLayerTime(position, index);
		}
		for (const [index, controls] of descriptionAnimations.current) {
			controls.time = storyLayerTime(position, index);
		}
		if (optionsAnimation.current) {
			optionsAnimation.current.time = storyOptionsTime(position, sceneCount);
		}
	}, []);

	const registerLayer = useCallback((index: number, element: HTMLDivElement | null) => {
		layerAnimations.current.get(index)?.cancel();
		layerAnimations.current.delete(index);
		if (!element) return;
		const controls = createLayerAnimation(element);
		layerAnimations.current.set(index, controls);
		controls.time = storyLayerTime(positionRef.current, index);
	}, []);

	const registerOption = useCallback((index: number, element: HTMLLIElement | null) => {
		optionAnimations.current.get(index)?.cancel();
		optionAnimations.current.delete(index);
		descriptionAnimations.current.get(index)?.cancel();
		descriptionAnimations.current.delete(index);
		if (!element) {
			optionNodes.current.delete(index);
			return;
		}
		optionNodes.current.set(index, element);
		const description = element.querySelector<HTMLElement>("[data-story-description]");
		if (description) {
			const controls = createLayerAnimation(description, true);
			descriptionAnimations.current.set(index, controls);
			controls.time = storyLayerTime(positionRef.current, index);
		}
		if (!mobileRef.current) return;
		const controls = createLayerAnimation(element, true);
		optionAnimations.current.set(index, controls);
		controls.time = storyLayerTime(positionRef.current, index);
	}, []);

	const getLayerRef = useCallback(
		(index: number) => {
			let callback = layerRefCallbacks.current.get(index);
			if (!callback) {
				callback = (element) => registerLayer(index, element);
				layerRefCallbacks.current.set(index, callback);
			}
			return callback;
		},
		[registerLayer],
	);

	const getOptionRef = useCallback(
		(index: number) => {
			let callback = optionRefCallbacks.current.get(index);
			if (!callback) {
				callback = (element) => registerOption(index, element);
				optionRefCallbacks.current.set(index, callback);
			}
			return callback;
		},
		[registerOption],
	);

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
			mobileRef.current = mobileQuery.matches;
			optionsAnimation.current?.cancel();
			optionsAnimation.current = null;
			for (const controls of optionAnimations.current.values()) controls.cancel();
			optionAnimations.current.clear();

			if (mobileRef.current) {
				for (const [index, element] of optionNodes.current) {
					const controls = createLayerAnimation(element, true);
					optionAnimations.current.set(index, controls);
				}
			} else {
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
				sceneCount: sceneCount,
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
				setInRange(visible);
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
	}, [reducedMotion, syncMotion]);

	useEffect(
		() => () => {
			for (const controls of layerAnimations.current.values()) controls.cancel();
			for (const controls of optionAnimations.current.values()) controls.cancel();
			for (const controls of descriptionAnimations.current.values()) controls.cancel();
		},
		[],
	);

	return {
		activeIndex,
		getLayerRef,
		getOptionRef,
		inRange,
		optionsRef,
		reducedMotion,
		showcaseRef,
	};
}
