import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { KittyCarouselDrag, type KittyDragState } from "./kitty-carousel-drag";
import { useKittyCarouselAnimation } from "./use-kitty-carousel-animation";
import { useKittyCarouselPosition } from "./use-kitty-carousel-position";

export function useKittyCarousel() {
	const [active, setActive] = useState<number | null>(null);
	const [dragging, setDragging] = useState(false);
	const carouselRef = useRef<HTMLDivElement>(null);
	const dragOrigin = useRef<HTMLElement | null>(null);
	const dragState = useRef<KittyDragState>({
		pointerId: -1,
		startX: 0,
		startScroll: 0,
		moved: false,
	});
	const reducedMotion = useReducedMotion();
	const { animateToIndex, carouselAnimation } = useKittyCarouselAnimation(
		carouselRef,
		reducedMotion,
	);
	const { carouselIndex, setCarouselIndex, syncFromScroll } = useKittyCarouselPosition(carouselRef);
	const highlightCard = useCallback((index: number | null) => {
		setActive(index);
	}, []);
	const handlers = new KittyCarouselDrag({
		dragState,
		dragOrigin,
		carouselAnimation,
		setDragging,
		highlightCard,
		animateToIndex,
	});
	function jumpToCarousel(index: number) {
		setCarouselIndex(index);
		animateToIndex(index);
	}
	return {
		active,
		dragging,
		carouselRef,
		carouselIndex,
		syncFromScroll,
		highlightCard,
		animateToIndex,
		jumpToCarousel,
		handlers,
	};
}
