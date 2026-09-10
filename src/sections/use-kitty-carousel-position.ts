import { useCallback, useLayoutEffect, useState, type RefObject } from "react";
import {
	measureCarousel,
	nearestTargetIndex,
	type CarouselMeasurementTarget,
} from "./kitty-carousel-metrics";

export function useKittyCarouselPosition(carouselRef: RefObject<HTMLDivElement | null>) {
	const [carouselIndex, setCarouselIndex] = useState(0);
	const syncFromScroll = useCallback((carousel: CarouselMeasurementTarget) => {
		const metrics = measureCarousel(carousel);
		if (!metrics) return;
		setCarouselIndex(nearestTargetIndex(metrics.targets, carousel.scrollLeft));
	}, []);

	useLayoutEffect(() => {
		const carousel = carouselRef.current;
		let cleanup: (() => void) | undefined;
		if (carousel) {
			const syncCarousel = () => {
				syncFromScroll(carousel);
			};
			syncCarousel();
			const observer = new ResizeObserver(syncCarousel);
			observer.observe(carousel);
			const card = carousel.querySelector<HTMLElement>("[data-kitty-feature]");
			if (card) observer.observe(card);
			cleanup = () => {
				observer.disconnect();
			};
		}
		return cleanup;
	}, [carouselRef, syncFromScroll]);

	return { carouselIndex, setCarouselIndex, syncFromScroll };
}
