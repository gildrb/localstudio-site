export type CarouselMeasurementTarget = Readonly<
	Pick<
		HTMLDivElement,
		"querySelector" | "getBoundingClientRect" | "scrollWidth" | "clientWidth" | "scrollLeft"
	>
>;

export function measureCarousel(carousel: CarouselMeasurementTarget) {
	const card = carousel.querySelector<HTMLElement>("[data-kitty-feature]");
	const grid = carousel.querySelector<HTMLElement>("[data-kitty-items]");
	if (!card || !grid) return null;
	const gap = Number.parseFloat(getComputedStyle(grid).columnGap) || 0;
	const stride = card.getBoundingClientRect().width + gap;
	const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-kitty-feature]"));
	const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
	const targets = cards.map((_: Readonly<Pick<HTMLElement, "getBoundingClientRect">>, index) =>
		index === cards.length - 1 ? maxScroll : Math.min(index * stride, maxScroll),
	);
	const carouselBounds = carousel.getBoundingClientRect();
	const centerTargets = cards.map((item: Readonly<Pick<HTMLElement, "getBoundingClientRect">>) => {
		const itemBounds = item.getBoundingClientRect();
		return Math.min(
			Math.max(
				carousel.scrollLeft +
					itemBounds.left +
					itemBounds.width / 2 -
					(carouselBounds.left + carouselBounds.width / 2),
				0,
			),
			maxScroll,
		);
	});
	return {
		centerTargets,
		stride,
		targets,
	};
}

export function nearestTargetIndex(targets: readonly number[], position: number) {
	let nearestIndex = 0;
	for (let index = 1; index < targets.length; index += 1) {
		if (
			Math.abs((targets[index] ?? 0) - position) <=
			Math.abs((targets[nearestIndex] ?? 0) - position)
		) {
			nearestIndex = index;
		}
	}
	return nearestIndex;
}

export function isolateCarouselDrag(
	carousel: Readonly<Pick<HTMLDivElement, "querySelectorAll">>,
	dragging: boolean,
	origin: Readonly<EventTarget> | null = null,
) {
	if (dragging) window.getSelection()?.removeAllRanges();
	for (const element of carousel.querySelectorAll<HTMLElement>("[data-kitty-drag-interactive]")) {
		element.inert = dragging && element !== origin;
	}
	if (
		dragging &&
		document.activeElement instanceof HTMLElement &&
		document.activeElement !== origin
	) {
		document.activeElement.blur();
	}
}
