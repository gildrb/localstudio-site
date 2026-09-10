import { animate } from "motion";
import type { RefObject } from "react";
import { storyIndex, storyPosition } from "./product-story-motion";

const MOBILE_STORY_QUERY = "(max-width: 900px)";
export type MotionControls = ReturnType<typeof animate>;

interface StoryMotionInputs {
	readonly sceneCount: number;
	readonly reducedMotion: boolean;
	readonly showcase: HTMLDivElement;
	readonly sticky: HTMLElement;
	readonly options: HTMLOListElement;
	readonly activeIndexRef: RefObject<number>;
	readonly positionRef: RefObject<number>;
	readonly optionsAnimation: RefObject<MotionControls | null>;
	readonly syncMotion: (position: number) => void;
	readonly setActiveIndex: (index: number) => void;
	readonly setMobile: (mobile: boolean) => void;
}

class ProductStoryMotionSession {
	readonly #inputs: StoryMotionInputs;
	readonly #mobileQuery = window.matchMedia(MOBILE_STORY_QUERY);
	readonly #sizeObserver = new ResizeObserver(() => {
		this.scheduleMeasure();
	});
	readonly #visibilityObserver = new IntersectionObserver(
		(entries: readonly Readonly<Pick<IntersectionObserverEntry, "isIntersecting">>[]) => {
			const visible = entries.at(-1)?.isIntersecting ?? false;
			this.setScrollActive(visible);
			if (visible) this.scheduleMeasure();
		},
		{ rootMargin: "500px 0px" },
	);
	#updateFrame = 0;
	#measureFrame = 0;
	#showcaseTop = 0;
	#navHeight = 72;
	#scrollRange = 1;
	#currentIndex: number;
	#scrollActive = false;
	#disposed = false;

	constructor(inputs: StoryMotionInputs) {
		this.#inputs = inputs;
		this.#currentIndex = inputs.activeIndexRef.current;
	}

	readonly rebuildResponsiveMotion = () => {
		const { options, optionsAnimation, reducedMotion, positionRef, setMobile, syncMotion } =
			this.#inputs;
		setMobile(this.#mobileQuery.matches);
		optionsAnimation.current?.cancel();
		optionsAnimation.current = null;
		if (!this.#mobileQuery.matches) {
			optionsAnimation.current = animate(
				options,
				{ transform: ["translateY(20%)", "translateY(-60%)"] },
				{ autoplay: false, duration: 1, ease: "linear" },
			);
		}
		syncMotion(reducedMotion ? this.#currentIndex : positionRef.current);
	};

	readonly update = () => {
		this.#updateFrame = 0;
		const { sceneCount, reducedMotion, activeIndexRef, setActiveIndex, syncMotion } = this.#inputs;
		const position = storyPosition({
			scrollY: window.scrollY,
			navHeight: this.#navHeight,
			showcaseTop: this.#showcaseTop,
			scrollRange: this.#scrollRange,
			sceneCount,
		});
		const nextIndex = storyIndex(position, this.#currentIndex, sceneCount);
		if (nextIndex !== this.#currentIndex) {
			this.#currentIndex = nextIndex;
			activeIndexRef.current = nextIndex;
			setActiveIndex(nextIndex);
		}
		syncMotion(reducedMotion ? this.#currentIndex : position);
	};

	readonly measure = () => {
		this.#measureFrame = 0;
		const { showcase, sticky } = this.#inputs;
		const headerHeight = document.querySelector("header")?.getBoundingClientRect().height;
		this.#navHeight =
			headerHeight === undefined || headerHeight === 0 || Number.isNaN(headerHeight)
				? 72
				: headerHeight;
		const stageHeight = Math.max(1, sticky.offsetHeight);
		this.#scrollRange = Math.max(1, showcase.offsetHeight - stageHeight);
		this.#showcaseTop = window.scrollY + showcase.getBoundingClientRect().top;
		if (this.#updateFrame !== 0) window.cancelAnimationFrame(this.#updateFrame);
		this.update();
	};

	readonly scheduleUpdate = () => {
		if (this.#updateFrame === 0) this.#updateFrame = window.requestAnimationFrame(this.update);
	};

	readonly scheduleMeasure = () => {
		if (this.#measureFrame === 0) this.#measureFrame = window.requestAnimationFrame(this.measure);
	};

	readonly scheduleViewportMeasure = () => {
		const focused = document.activeElement;
		if (focused instanceof HTMLElement && this.#inputs.showcase.contains(focused)) return;
		this.scheduleMeasure();
	};

	readonly syncAfterVisibility = () => {
		if (document.visibilityState === "visible") this.scheduleMeasure();
	};

	setScrollActive(active: boolean) {
		if (this.#scrollActive === active) return;
		this.#scrollActive = active;
		if (active) {
			window.addEventListener("scroll", this.scheduleUpdate, { passive: true });
			this.scheduleUpdate();
		} else {
			window.removeEventListener("scroll", this.scheduleUpdate);
		}
	}

	attach() {
		this.#sizeObserver.observe(this.#inputs.showcase);
		this.#sizeObserver.observe(this.#inputs.sticky);
		this.#visibilityObserver.observe(this.#inputs.showcase);
		this.rebuildResponsiveMotion();
		this.scheduleMeasure();
		window.addEventListener("resize", this.scheduleMeasure);
		window.visualViewport?.addEventListener("resize", this.scheduleViewportMeasure);
		window.addEventListener("pageshow", this.scheduleMeasure);
		document.addEventListener("visibilitychange", this.syncAfterVisibility);
		this.#mobileQuery.addEventListener("change", this.rebuildResponsiveMotion);
		void document.fonts.ready.then(() => {
			if (!this.#disposed) this.scheduleMeasure();
		});
	}

	readonly dispose = () => {
		this.#disposed = true;
		this.#sizeObserver.disconnect();
		this.#visibilityObserver.disconnect();
		window.removeEventListener("scroll", this.scheduleUpdate);
		window.removeEventListener("resize", this.scheduleMeasure);
		window.visualViewport?.removeEventListener("resize", this.scheduleViewportMeasure);
		window.removeEventListener("pageshow", this.scheduleMeasure);
		document.removeEventListener("visibilitychange", this.syncAfterVisibility);
		this.#mobileQuery.removeEventListener("change", this.rebuildResponsiveMotion);
		this.#inputs.optionsAnimation.current?.cancel();
		this.#inputs.optionsAnimation.current = null;
		if (this.#updateFrame !== 0) window.cancelAnimationFrame(this.#updateFrame);
		if (this.#measureFrame !== 0) window.cancelAnimationFrame(this.#measureFrame);
	};
}

export function attachProductStoryMotion(inputs: StoryMotionInputs) {
	const session = new ProductStoryMotionSession(inputs);
	session.attach();
	return session.dispose;
}
