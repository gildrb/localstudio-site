import { expect, test } from "@playwright/test";
import { routePaths } from "../../src/domain/route";

const viewports = [
	{ name: "desktop", width: 1440, height: 1000 },
	{ name: "mobile", width: 390, height: 844 },
] as const;

for (const viewport of viewports) {
	for (const path of routePaths) {
		test(`${viewport.name} ${path}`, async ({ page }) => {
			await page.setViewportSize(viewport);
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.goto(path);
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			if (path === "/") {
				await expect(page.locator(".hero .demo:not(.hero__demo-placeholder)")).toBeVisible();
			}
			await expect(page).toHaveScreenshot(`${viewport.name}${path === "/" ? "-home" : path.replaceAll("/", "-")}.png`, {
				fullPage: true,
				animations: "disabled",
			});
		});
	}
}
