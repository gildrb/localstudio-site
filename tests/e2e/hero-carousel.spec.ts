import { expect, test } from "@playwright/test";
import type { BrowserFixtures } from "./browser-fixtures";
import { dragCarousel, dragTriggerBackward, readCarouselAlignment } from "./carousel-actions";

type ScrollPosition = Readonly<Pick<Element, "scrollLeft">>;
type PositionedElement = Readonly<Pick<Element, "getBoundingClientRect">>;

test("KittyLitter keeps context visible while images and links stay fixed", async ({
	page,
}: BrowserFixtures) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const cards = page.locator("[data-kitty-feature]");
	await expect(cards).toHaveCount(10);
	await expect(cards.locator("[data-kitty-feature-trigger]")).toHaveText([
		"Sessions everywhere",
		"Generative UI",
		"Remote connections",
		"Debug anywhere",
		"Plans",
		"Voice input",
		"Explore projects",
		"Usage insights",
		"More tools",
		"Codex in your pocket",
	]);
	await expect(page.locator("[data-kitty-feature-description]")).toHaveCount(10);
	const images = cards.getByRole("region");
	const before = await images.evaluateAll((elements: readonly PositionedElement[]) =>
		elements.map((element) => element.getBoundingClientRect().top + window.scrollY),
	);
	await expect(cards.getByRole("link")).toHaveCount(0);
	await images.first().hover();
	await expect(cards.first()).toHaveAttribute("data-active", "true");
	await expect(cards.first().getByText("Pick up exactly where you left off.")).toBeVisible();
	await expect(cards.getByRole("link")).toHaveCount(0);
	const after = await images.evaluateAll((elements: readonly PositionedElement[]) =>
		elements.map((element) => element.getBoundingClientRect().top + window.scrollY),
	);
	expect(after).toEqual(before);
});

test("KittyLitter carousel stays still without pagination chrome", async ({
	page,
}: BrowserFixtures) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const carousel = page.getByRole("region", { name: "KittyLitter features" });
	await carousel.scrollIntoViewIfNeeded();
	await expect(carousel.getByRole("status")).toHaveCount(0);
	expect(await carousel.evaluate((element: ScrollPosition) => element.scrollLeft)).toBe(0);
	await page.waitForTimeout(750);
	expect(await carousel.evaluate((element: ScrollPosition) => element.scrollLeft)).toBe(0);
	await carousel.evaluate((element) => {
		element.scrollLeft = element.scrollWidth;
	});
	await expect
		.poll(() =>
			carousel.evaluate((element: Readonly<Pick<Element, "querySelector">>) => {
				const last = element.querySelector<HTMLElement>("[data-kitty-feature]:last-child");
				const intro = document.querySelector<HTMLElement>("[data-kitty-intro]");
				if (!last || !intro) return Number.NaN;
				return Math.round(intro.getBoundingClientRect().right - last.getBoundingClientRect().right);
			}),
		)
		.toBe(0);
	await expect(page.locator("[data-kitty-feature-description]")).toHaveCount(10);
});

test("KittyLitter carousel supports image jumps and pointer dragging", async ({
	page,
}: BrowserFixtures) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const carousel = page.getByRole("region", { name: "KittyLitter features" });
	await carousel.scrollIntoViewIfNeeded();
	await page.locator("[data-kitty-feature]").nth(3).getByRole("region").click();
	await expect
		.poll(() => carousel.evaluate((element: ScrollPosition) => element.scrollLeft))
		.toBeGreaterThan(0);
	await expect.poll(() => carousel.evaluate(readCarouselAlignment)).toBeLessThanOrEqual(2);
	await page.waitForTimeout(500);
	await carousel.evaluate((element) => {
		element.scrollLeft = 0;
	});
	await expect
		.poll(() => carousel.evaluate((element: ScrollPosition) => element.scrollLeft))
		.toBe(0);
	await page.waitForTimeout(500);
	const dragMetrics = await dragCarousel(page, carousel);
	await expect
		.poll(() => carousel.evaluate((element: ScrollPosition) => element.scrollLeft))
		.toBeGreaterThan(dragMetrics.before + dragMetrics.stride * 0.8);
	await page.waitForTimeout(600);
	const settled = await carousel.evaluate((element: ScrollPosition) => element.scrollLeft);
	await page.waitForTimeout(300);
	expect(
		Math.abs((await carousel.evaluate((element: ScrollPosition) => element.scrollLeft)) - settled),
	).toBeLessThan(2);

	await carousel.evaluate((element) => {
		element.scrollLeft = element.scrollWidth;
	});
	await expect(carousel).toHaveAttribute("data-carousel-index", "9");
	const endScroll = await carousel.evaluate((element: ScrollPosition) => element.scrollLeft);
	await dragTriggerBackward(page);
	await expect
		.poll(() => carousel.evaluate((element: ScrollPosition) => element.scrollLeft))
		.toBeLessThan(endScroll - 100);
	await page.waitForTimeout(600);
	const reversed = await carousel.evaluate((element: ScrollPosition) => element.scrollLeft);
	await page.waitForTimeout(300);
	expect(
		Math.abs((await carousel.evaluate((element: ScrollPosition) => element.scrollLeft)) - reversed),
	).toBeLessThan(2);
});
