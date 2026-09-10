import type { MouseEvent, PointerEvent, RefObject } from "react";
import {
	isolateCarouselDrag,
	measureCarousel,
	nearestTargetIndex,
	type CarouselMeasurementTarget,
} from "./kitty-carousel-metrics";

type CarouselPointerTarget = CarouselMeasurementTarget &
	Readonly<
		Pick<HTMLDivElement, "querySelectorAll" | "setPointerCapture" | "releasePointerCapture">
	>;

type CarouselPointerInput = Readonly<
	Pick<PointerEvent, "pointerId" | "clientX" | "button" | "isPrimary" | "pointerType">
> & {
	readonly target: Readonly<EventTarget>;
	readonly currentTarget: CarouselPointerTarget;
};

type CarouselClickInput = Readonly<
	Pick<MouseEvent, "clientX" | "clientY" | "preventDefault" | "stopPropagation">
> & {
	readonly target: Readonly<EventTarget>;
	readonly currentTarget: Readonly<Pick<HTMLDivElement, "querySelectorAll">>;
};

export interface KittyDragState {
	pointerId: number;
	startX: number;
	startScroll: number;
	moved: boolean;
}

interface KittyDragInputs {
	readonly dragState: RefObject<KittyDragState>;
	readonly dragOrigin: RefObject<HTMLElement | null>;
	readonly carouselAnimation: RefObject<{ readonly stop: () => void } | null>;
	readonly setDragging: (dragging: boolean) => void;
	readonly highlightCard: (index: number | null) => void;
	readonly animateToIndex: (index: number, center?: boolean) => void;
}

export class KittyCarouselDrag {
	readonly #inputs: KittyDragInputs;

	constructor(inputs: KittyDragInputs) {
		this.#inputs = inputs;
	}

	readonly onClickCapture = (event: CarouselClickInput) => {
		if (this.#inputs.dragState.current.moved) {
			event.preventDefault();
			event.stopPropagation();
			this.#inputs.dragState.current.moved = false;
			return;
		}
		const eventTarget = event.target instanceof Element ? event.target : null;
		const pointTarget = document.elementFromPoint(event.clientX, event.clientY);
		const media =
			eventTarget?.closest<HTMLElement>("[data-kitty-feature-media]") ??
			pointTarget?.closest<HTMLElement>("[data-kitty-feature-media]");
		const card = media?.closest<HTMLElement>("[data-kitty-feature]");
		if (!card) return;
		const cards = Array.from(
			event.currentTarget.querySelectorAll<HTMLElement>("[data-kitty-feature]"),
		);
		const index = cards.indexOf(card);
		if (index < 0) return;
		event.stopPropagation();
		this.#inputs.animateToIndex(index, true);
	};

	readonly onPointerDown = (event: CarouselPointerInput) => {
		if (!event.isPrimary || event.pointerType !== "mouse") return;
		if (event.button !== 0) return;
		this.#inputs.dragState.current.moved = false;
		this.#inputs.carouselAnimation.current?.stop();
		this.#inputs.dragOrigin.current =
			event.target instanceof HTMLElement
				? event.target.closest<HTMLElement>("[data-kitty-drag-interactive]")
				: null;
		this.#inputs.dragState.current = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startScroll: event.currentTarget.scrollLeft,
			moved: false,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	readonly onPointerMove = (event: Readonly<PointerEvent<HTMLDivElement>>) => {
		if (this.#inputs.dragState.current.pointerId !== event.pointerId) return;
		const delta = event.clientX - this.#inputs.dragState.current.startX;
		if (Math.abs(delta) > 6 && !this.#inputs.dragState.current.moved) {
			this.#inputs.dragState.current.moved = true;
			isolateCarouselDrag(event.currentTarget, true, this.#inputs.dragOrigin.current);
			this.#inputs.setDragging(true);
			this.#inputs.highlightCard(null);
		}
		event.currentTarget.scrollLeft = this.#inputs.dragState.current.startScroll - delta;
	};

	readonly onPointerUp = (event: CarouselPointerInput) => {
		if (this.#inputs.dragState.current.pointerId !== event.pointerId) return;
		const { moved, startX } = this.#inputs.dragState.current;
		this.#inputs.dragState.current.pointerId = -1;
		isolateCarouselDrag(event.currentTarget, false);
		this.#inputs.setDragging(false);
		event.currentTarget.releasePointerCapture(event.pointerId);
		const metrics = measureCarousel(event.currentTarget);
		if (!metrics) return;
		let nextIndex = nearestTargetIndex(metrics.targets, event.currentTarget.scrollLeft);
		const direction = Math.sign(startX - event.clientX);
		if (moved && direction > 0) {
			const forwardIndex = metrics.targets.findIndex(
				(target) => target >= event.currentTarget.scrollLeft,
			);
			nextIndex = forwardIndex === -1 ? metrics.targets.length - 1 : forwardIndex;
		} else if (moved && direction < 0) {
			for (let index = metrics.targets.length - 1; index >= 0; index -= 1) {
				if ((metrics.targets[index] ?? 0) <= event.currentTarget.scrollLeft) {
					nextIndex = index;
					break;
				}
			}
		}
		this.#inputs.animateToIndex(nextIndex);
	};

	readonly onPointerCancel = (event: CarouselPointerInput) => {
		if (this.#inputs.dragState.current.pointerId !== event.pointerId) return;
		this.#inputs.dragState.current.pointerId = -1;
		this.#inputs.dragState.current.moved = false;
		isolateCarouselDrag(event.currentTarget, false);
		this.#inputs.setDragging(false);
		const metrics = measureCarousel(event.currentTarget);
		if (!metrics) return;
		this.#inputs.animateToIndex(
			nearestTargetIndex(metrics.targets, event.currentTarget.scrollLeft),
		);
	};

	readonly onLostPointerCapture = (event: CarouselPointerInput) => {
		this.#inputs.dragState.current.pointerId = -1;
		isolateCarouselDrag(event.currentTarget, false);
		this.#inputs.setDragging(false);
	};
}
