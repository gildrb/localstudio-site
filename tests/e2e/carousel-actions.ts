import type { Locator, Page } from "@playwright/test";

type PointerPage = { readonly mouse: Readonly<Page["mouse"]> };
type Carousel = Readonly<Pick<Locator, "evaluate" | "boundingBox">>;

export async function dragCarousel(page: PointerPage, carousel: Carousel) {
	const dragMetrics = await carousel.evaluate(
		(element: Readonly<Pick<Element, "querySelector" | "scrollLeft">>) => {
			const card = element.querySelector<HTMLElement>("[data-kitty-feature]");
			const grid = element.querySelector<HTMLElement>("[data-kitty-items]");
			if (!card || !grid) throw new Error("carousel metrics");
			const gap = Number.parseFloat(getComputedStyle(grid).columnGap) || 0;
			return {
				before: element.scrollLeft,
				stride: card.getBoundingClientRect().width + gap,
			};
		},
	);
	const box = await carousel.boundingBox();
	if (!box) throw new Error("carousel geometry");
	const startX = box.x + box.width * 0.55;
	const y = box.y + box.height * 0.4;
	await page.mouse.move(startX, y);
	await page.mouse.down();
	await page.mouse.move(startX - 48, y, { steps: 4 });
	await page.mouse.up();
	return dragMetrics;
}

export async function dragTriggerBackward(page: PointerPage & Readonly<Pick<Page, "locator">>) {
	const lastTrigger = page
		.locator("[data-kitty-feature]")
		.last()
		.locator("[data-kitty-feature-trigger]");
	const triggerBox = await lastTrigger.boundingBox();
	if (!triggerBox) throw new Error("carousel trigger geometry");
	const triggerX = triggerBox.x + triggerBox.width / 2;
	const triggerY = triggerBox.y + triggerBox.height / 2;
	await page.mouse.move(triggerX, triggerY);
	await page.mouse.down();
	await page.mouse.move(triggerX + 48, triggerY, { steps: 4 });
	await page.mouse.up();
}

export function readCarouselAlignment(
	element: Readonly<Pick<Element, "querySelectorAll" | "getBoundingClientRect">>,
) {
	const card = element.querySelectorAll<HTMLElement>("[data-kitty-feature]")[3];
	if (!card) return Number.POSITIVE_INFINITY;
	const carouselBounds = element.getBoundingClientRect();
	const cardBounds = card.getBoundingClientRect();
	return Math.abs(
		cardBounds.left + cardBounds.width / 2 - (carouselBounds.left + carouselBounds.width / 2),
	);
}
