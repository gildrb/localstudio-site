import { expect, test } from "@playwright/test";
import type { BrowserFixtures } from "./browser-fixtures";

const brightness = (color: string) =>
	(
		color
			.match(/[\d.]+/gu)
			?.slice(0, 3)
			.map(Number) ?? []
	).reduce((sum, value) => sum + value, 0);
test("1", async ({ page }: BrowserFixtures) => {
	for (const scheme of ["dark", "light"] as const) {
		await page.emulateMedia({ colorScheme: scheme });
		await page.goto("/");
		await expect(page.getByRole("region", { name: "Local Studio workbench" })).toHaveAttribute(
			"data-theme",
			`zai-${scheme}`,
		);
		const audit = await page.evaluate(() => {
			const demo = document.querySelector('[aria-label="Local Studio workbench"]');
			return {
				colorScheme: getComputedStyle(document.documentElement).colorScheme,
				demoScheme: demo ? getComputedStyle(demo).colorScheme : null,
				demoTheme: demo instanceof HTMLElement ? (demo.dataset["theme"] ?? null) : undefined,
				themeColor: [
					...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
				].find((meta: Readonly<Pick<HTMLMetaElement, "media">>) => matchMedia(meta.media).matches)
					?.content,
			};
		});
		expect(audit).toEqual({
			colorScheme: scheme,
			demoScheme: scheme,
			demoTheme: `zai-${scheme}`,
			themeColor: scheme === "dark" ? "#000000" : "#ffffff",
		});
	}
});

test("2", async ({ page }: BrowserFixtures) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/");
	const primary = page
		.locator("main")
		.getByRole("link", { name: /Download for/u })
		.first();
	const primaryStyle = await primary.evaluate((element) => {
		const style = getComputedStyle(element);
		return { borderColor: style.borderColor, boxShadow: style.boxShadow };
	});
	expect(primaryStyle.boxShadow.match(/rgba?\(|color\(/gu)?.length).toBeGreaterThanOrEqual(2);
	const borderChannels = primaryStyle.borderColor.match(/[\d.]+/gu)?.map(Number) ?? [];
	expect(borderChannels[2]).toBeGreaterThanOrEqual(borderChannels[0] ?? 0);

	await page.goto("/setup");
	const prompt = page.getByRole("region", { name: "Portable setup prompt" });
	const fade = await prompt.evaluate((element) => {
		const pre = element.querySelector("pre");
		if (pre === null) throw new Error("prompt pre");
		return {
			backgroundImage: getComputedStyle(element, "::after").backgroundImage,
			maskImage: getComputedStyle(pre).maskImage,
		};
	});
	expect(fade.backgroundImage).not.toBe("none");
	expect(fade.maskImage).toBe("none");
});

test("3", async ({ page }: BrowserFixtures) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/");

	const heading = await page
		.getByRole("heading", { level: 1 })
		.evaluate((element) => getComputedStyle(element).color);
	for (const control of [
		page.getByRole("button", { name: "Products" }),
		page.locator("footer a").first(),
	]) {
		await control.scrollIntoViewIfNeeded();
		const rest = await control.evaluate((element) => getComputedStyle(element).color);
		await control.hover();
		await page.waitForTimeout(150);
		const hover = await control.evaluate((element) => getComputedStyle(element).color);
		expect(brightness(rest)).toBeLessThan(brightness(heading));
		expect(brightness(hover)).toBeGreaterThan(brightness(rest));
	}
});

test("4", async ({ page }: BrowserFixtures) => {
	await page.goto("/#mobile");
	const card = page.locator("[data-kitty-feature]").first();
	const media = card.getByRole("region");
	const image = card.locator("img");
	const treatment = await media.evaluate((element) => {
		const imageElement = element.querySelector("img");
		if (imageElement === null) throw new Error("card img");
		return {
			boxShadow: getComputedStyle(element).boxShadow,
			filter: getComputedStyle(imageElement).filter,
		};
	});
	expect(treatment.boxShadow).toBe("none");
	expect(treatment.filter).not.toContain("grayscale");
	await expect(image).toBeVisible();
});
