import { expect, test } from "@playwright/test";
import type { BrowserFixtures } from "./browser-fixtures";
import { readMobileHeroLayout } from "./hero-layout";

test("hero demo autoplays the local inference sequence once", async ({ page }: BrowserFixtures) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo).toBeVisible();
	await expect(demo.locator("canvas, video")).toHaveCount(0);
	await expect(demo.getByRole("button", { name: "Model: Qwen3.8-27B" })).toBeVisible();
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(demo.locator("[data-chat-markdown]").last()).toContainText("Ready for you");
	await expect(demo.locator("[data-chat-markdown]").last()).toContainText("Lake District");
	await expect(demo.getByText("Maya's birthday weekend").first()).toBeVisible();
	await expect(demo.getByText("New task").first()).toBeVisible();
	await expect(demo.getByRole("button", { name: "Status", exact: true })).toBeVisible();
	await expect(demo.getByRole("button", { name: "Review", exact: true })).toBeVisible();
	await expect(demo.getByText("lake-district-weekend.md").first()).toBeVisible();
});

test("hero demo computer panel tabs are clickable", async ({ page }: BrowserFixtures) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await demo.getByRole("button", { name: "Show tools" }).click();
	await demo.getByRole("button", { name: "Files Browse project files" }).click();
	await expect(demo.getByText("saved-places.md").first()).toBeVisible();
	await demo.getByRole("button", { name: "Show tools" }).click();
	await demo.getByRole("button", { name: "Browser Open a website" }).click();
	await expect(
		demo.getByText(
			"Saturday stays dry until 16:00. Rydal Water to Grasmere keeps the route under two hours.",
		),
	).toBeVisible();
	await demo.getByRole("button", { name: "Status", exact: true }).click();
	await expect(demo.getByText("Session").first()).toBeVisible();
});

test("hero demo follow-ups stay visually quiet", async ({ page }: BrowserFixtures) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	const composer = demo.getByRole("textbox", { name: "Message" });
	await composer.pressSequentially("Add a café stop");
	expect(await composer.evaluate((element) => getComputedStyle(element).boxShadow)).toBe("none");
	await demo.getByRole("button", { name: "Send" }).click();
	await expect(
		demo.getByText(
			"This is an interactive preview. Run Local Studio with your own files, tools, and local models.",
		),
	).toBeVisible();
	const sourceLink = demo.getByRole("link", {
		name: "Open Local Studio on GitHub",
	});
	await expect(sourceLink).toBeVisible();
	await expect(sourceLink).toHaveAttribute(
		"href",
		"https://github.com/sybil-solutions/local-studio",
	);
});

test("hero demo result copies with the clipboard API", async ({
	page,
	context,
}: BrowserFixtures<"page" | "context">) => {
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo).toHaveAttribute("data-phase", "done");
	await demo.getByRole("button", { name: "Copy response" }).click();
	await expect(demo.getByRole("button", { name: "Copied" })).toBeVisible();
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied).toContain("Ready for you");
	expect(copied).toContain("Lake District");
});

test("reduced motion shows the finished result immediately", async ({ page }: BrowserFixtures) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(demo.locator("[data-chat-markdown]").last()).toHaveText(
		/I'll bring the private details together[\s\S]*Ready for you/u,
	);
});

test("hero demo keeps completed tool calls in view", async ({ page }: BrowserFixtures) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(demo.locator('[data-tool-call="itinerary"]')).toBeInViewport();
	await expect(demo.locator('[data-tool-call="packing"]')).toBeInViewport();
});

test("hero demo has no dead sidebar destinations", async ({ page }: BrowserFixtures) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo.getByText("Terminals", { exact: true })).toHaveCount(0);
	const profile = demo.getByText("Sero", { exact: true });
	await expect(profile).toBeVisible();
	expect(
		await profile.evaluate(
			(element: Readonly<Pick<Element, "closest">>) => element.closest("a, button") === null,
		),
	).toBe(true);
	const url = page.url();
	await demo.getByText("Models", { exact: true }).click();
	await expect(page).toHaveURL(url);
	await expect(page.getByRole("heading", { name: "This page is not local" })).toHaveCount(0);
});

test("homepage stays inside the viewport at 320", async ({ page }: BrowserFixtures) => {
	await page.setViewportSize({ width: 320, height: 640 });
	await page.goto("/?demoClock=fast");
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(0);
});

test("hero demo is only rounded when the full app is visible", async ({
	page,
}: BrowserFixtures) => {
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	await expect(demo).toBeVisible();
	await expect(demo).not.toHaveAttribute("data-clip-right");
	expect(await demo.evaluate((el) => getComputedStyle(el).borderTopRightRadius)).toBe("10px");
	await page.setViewportSize({ width: 1200, height: 900 });
	await expect(demo).toHaveAttribute("data-clip-right", "true");
	expect(await demo.evaluate((el) => getComputedStyle(el).borderTopRightRadius)).toBe("0px");
	expect(await demo.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe("10px");
	expect(
		await demo.evaluate((el: Readonly<Pick<Element, "getBoundingClientRect">>) =>
			Math.round(el.getBoundingClientRect().right),
		),
	).toBe(1200);
});

test("mobile hero shows a cropped desktop app, not a compact shell", async ({
	page,
}: BrowserFixtures) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo.locator("[data-demo-app]")).toBeVisible();
	const title = await page.locator("#landing-title").evaluate((element) => {
		const style = getComputedStyle(element);
		return [style.fontSize, style.lineHeight];
	});
	expect(title).toEqual(["40px", "44px"]);
	const layout = await page.evaluate(readMobileHeroLayout);
	expect(layout.sidebar).toBe(244);
	expect(layout.computer).toBe(320);
	expect(layout.layoutWidth).toBe(1392);
	expect(layout.layoutHeight).toBe(787);
	expect(layout.composer).toBe("42rem");
	expect(layout.visualWidth).toBeGreaterThan(layout.demoWidth);
	expect(layout.demoLeft).toBe(layout.copyLeft);
	expect(layout.demoRight).toBe(390);
	expect(layout.frameHeight).toBe(layout.scaledHeight);
	expect(layout.rightRadius).toBe("0px");
	expect(layout.menu).toBe("none");
	expect(layout.chatVisible).toBe(true);
	expect(layout.pointer).toBe("none");
	expect(layout.mobile).toBe("true");
});

test("full hero entrance animates copy and render surface", async ({
	page,
	request,
}: BrowserFixtures<"page" | "request">) => {
	const html = await (await request.get("/")).text();
	const stage = html.match(/<div[^>]*id="product"[^>]*>/u)?.[0] ?? "";
	const title = html.match(/<h1 id="landing-title"[^>]*>/u)?.[0] ?? "";
	expect(stage).toContain('id="product"');
	expect(stage).toContain("opacity:0");
	expect(title).toContain("opacity:0");
	await page.goto("/");
	await expect(page.locator("#landing-title")).toHaveCSS("opacity", "1");
	await expect(page.locator("#product")).toHaveCSS("opacity", "1");
});
