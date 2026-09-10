import { useCallback, useEffect, useRef, type RefObject } from "react";
import { animate } from "motion";
import { motion } from "../domain/motion";
import { measureCarousel } from "./kitty-carousel-metrics";

export function useKittyCarouselAnimation(
	carouselRef: RefObject<HTMLDivElement | null>,
	reducedMotion: boolean | null,
) {
	const carouselAnimation = useRef<{ readonly stop: () => void } | null>(null);
	const animateToIndex = useCallback(
		(index: number, center = false) => {
			const carousel = carouselRef.current;
			if (!carousel) return;
			const metrics = measureCarousel(carousel);
			if (!metrics) return;
			const bounded = Math.min(Math.max(index, 0), metrics.targets.length - 1);
			const target = center
				? (metrics.centerTargets[bounded] ?? 0)
				: (metrics.targets[bounded] ?? 0);
			carouselAnimation.current?.stop();
			if (reducedMotion === true || document.hidden) {
				carousel.scrollLeft = target;
				return;
			}
			carouselAnimation.current = animate(carousel.scrollLeft, target, {
				duration: 0.3,
				ease: motion.ease,
				onUpdate: (value) => {
					carousel.scrollLeft = value;
				},
			});
		},
		[carouselRef, reducedMotion],
	);

	useEffect(
		() => () => {
			carouselAnimation.current?.stop();
		},
		[],
	);
	return { animateToIndex, carouselAnimation };
}
