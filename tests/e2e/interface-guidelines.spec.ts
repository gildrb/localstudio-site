import { expect, test } from "@playwright/test";
import { routePaths } from "../../src/domain/route";

test("routes use the shared interface tokens", async ({ page }) => {
	for (const path of routePaths.filter((item) => item !== "/machine")) {
		await page.goto(path);
		const audit = await page.evaluate(() => {
			const root = getComputedStyle(document.documentElement);
			return {
				fontSmoothing: root.getPropertyValue("-webkit-font-smoothing"),
				textSizeAdjust: root.getPropertyValue("-webkit-text-size-adjust"),
			};
		});
		expect(audit, path).toEqual({
			fontSmoothing: "antialiased",
			textSizeAdjust: "100%",
		});
	}
});
