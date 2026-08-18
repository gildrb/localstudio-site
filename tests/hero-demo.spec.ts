import { expect, test } from "@playwright/test";

test("hero demo autoplays the local inference sequence once", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/");
	const demo = page.locator(".demo");
	await expect(demo).toBeVisible();
	await expect(demo.locator("canvas, video")).toHaveCount(0);
	await expect(demo).toHaveAttribute("data-phase", "prompt");
	await expect(demo).toHaveAttribute("data-phase", "done", { timeout: 15000 });
	await expect(demo.locator(".chat-markdown").first()).toContainText(
		"Open tasks",
	);
	await expect(demo.locator(".chat-markdown").first()).toContainText(
		"Qwen3.8-27B",
	);
	await expect(demo.getByText("Standup notes").first()).toBeVisible();
	await expect(demo.getByText("New task").first()).toBeVisible();
	await expect(demo.getByText("Session").first()).toBeVisible();
	await expect(
		demo.getByRole("button", { name: "Status", exact: true }),
	).toBeVisible();
});

test("hero demo computer panel tabs are clickable", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/");
	const demo = page.locator(".demo");
	await demo.getByRole("button", { name: "Show tools" }).click();
	await demo
		.getByRole("button", { name: "Files Browse project files" })
		.click();
	await expect(demo.getByText("standup.md").first()).toBeVisible();
	await demo.getByRole("button", { name: "Show tools" }).click();
	await demo.getByRole("button", { name: "Browser Open a website" }).click();
	await expect(
		demo.getByText("Pick a running localhost app, or type a URL/search above."),
	).toBeVisible();
	await demo.getByRole("button", { name: "Status", exact: true }).click();
	await expect(demo.getByText("Session").first()).toBeVisible();
});

test("hero demo result copies with the clipboard API", async ({
	page,
	context,
}) => {
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/");
	const demo = page.locator(".demo");
	await expect(demo).toHaveAttribute("data-phase", "done");
	await demo.getByRole("button", { name: "Copy response" }).click();
	await expect(demo.getByRole("button", { name: "Copied" })).toBeVisible();
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied).toContain("Open tasks");
	expect(copied).toContain("Do not upload the notes folder");
});

test("reduced motion shows the finished result immediately", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/");
	const demo = page.locator(".demo");
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(demo.locator(".chat-markdown").first()).toHaveText(
		/I'll read the standup notes on this machine[\s\S]*Open tasks/,
	);
});

test("homepage stays inside the viewport at 320", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 640 });
	await page.goto("/");
	const overflow = await page.evaluate(
		() =>
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(0);
});
