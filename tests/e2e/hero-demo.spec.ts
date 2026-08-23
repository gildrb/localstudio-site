import { expect, test } from "@playwright/test";

test("hero demo autoplays the local inference sequence once", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const demo = page.locator(".hero .demo:not(.hero__demo-placeholder)");
	await expect(demo).toBeVisible();
	await expect(demo.locator("canvas, video")).toHaveCount(0);
	await expect(
		demo.getByRole("button", { name: "Model: Qwen3.8-27B" }),
	).toBeVisible();
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(demo.locator(".chat-markdown").first()).toContainText(
		"Ready for you",
	);
	await expect(demo.locator(".chat-markdown").first()).toContainText(
		"Lake District",
	);
	await expect(demo.getByText("Maya's birthday weekend").first()).toBeVisible();
	await expect(demo.getByText("New task").first()).toBeVisible();
	await expect(
		demo.getByRole("button", { name: "Status", exact: true }),
	).toBeVisible();
	await expect(
		demo.getByRole("button", { name: "Review", exact: true }),
	).toBeVisible();
	await expect(demo.getByText("lake-district-weekend.md").first()).toBeVisible();
});

test("hero demo computer panel tabs are clickable", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const demo = page.locator(".hero .demo:not(.hero__demo-placeholder)");
	await demo.getByRole("button", { name: "Show tools" }).click();
	await demo
		.getByRole("button", { name: "Files Browse project files" })
		.click();
	await expect(demo.getByText("saved-places.md").first()).toBeVisible();
	await demo.getByRole("button", { name: "Show tools" }).click();
	await demo.getByRole("button", { name: "Browser Open a website" }).click();
	await expect(
		demo.getByText("Saturday stays dry until 16:00. Rydal Water to Grasmere keeps the route under two hours."),
	).toBeVisible();
	await demo.getByRole("button", { name: "Status", exact: true }).click();
	await expect(demo.getByText("Session").first()).toBeVisible();
});

test("hero demo follow-ups stay visually quiet", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/?demoClock=fast");
	const demo = page.locator(".hero .demo:not(.hero__demo-placeholder)");
	const composer = demo.getByRole("textbox", { name: "Message" });
	await composer.pressSequentially("Add a café stop");
	expect(await composer.evaluate((element) => getComputedStyle(element).boxShadow)).toBe(
		"none",
	);
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

test("hero demo keeps sidebar routes inside New task", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/?demoClock=fast");
	const demo = page.locator(".hero .demo:not(.hero__demo-placeholder)");
	await demo.getByRole("link", { name: "Usage" }).click();
	await expect(demo.getByText("Maya's birthday weekend").first()).toBeVisible();
	await expect(page).toHaveURL("/");
});

test("hero demo result copies with the clipboard API", async ({
	page,
	context,
}) => {
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/?demoClock=fast");
	const demo = page.locator(".hero .demo:not(.hero__demo-placeholder)");
	await expect(demo).toHaveAttribute("data-phase", "done");
	await demo.getByRole("button", { name: "Copy response" }).click();
	await expect(demo.getByRole("button", { name: "Copied" })).toBeVisible();
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied).toContain("Ready for you");
	expect(copied).toContain("Lake District");
});

test("reduced motion shows the finished result immediately", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/?demoClock=fast");
	const demo = page.locator(".hero .demo:not(.hero__demo-placeholder)");
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(demo.locator(".chat-markdown").first()).toHaveText(
		/I'll bring the private details together[\s\S]*Ready for you/,
	);
});

test("hero demo chat follows new messages", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const demo = page.locator(".hero .demo:not(.hero__demo-placeholder)");
	const scroller = demo.locator("[data-timeline-scroller]");
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(scroller).toBeVisible();
	const pinned = await scroller.evaluate((element) => {
		if (!(element instanceof HTMLElement)) return false;
		return element.scrollHeight - element.scrollTop - element.clientHeight <= 8;
	});
	expect(pinned).toBe(true);
});

test("homepage stays inside the viewport at 320", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 640 });
	await page.goto("/?demoClock=fast");
	const overflow = await page.evaluate(
		() =>
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
	);
	expect(overflow).toBeLessThanOrEqual(0);
});

test("hero demo is only rounded when the full app is visible", async ({
	page,
}) => {
 const demo = page.locator(".hero .demo:not(.hero__demo-placeholder)");
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	await expect(demo).toBeVisible();
	await expect(demo).not.toHaveAttribute("data-clip-right");
	expect(await demo.evaluate((el) => getComputedStyle(el).borderTopRightRadius)).toBe("10px");
	await page.setViewportSize({ width: 1200, height: 900 });
	await expect(demo).toHaveAttribute("data-clip-right", "true");
	expect(await demo.evaluate((el) => getComputedStyle(el).borderTopRightRadius)).toBe("0px");
	expect(await demo.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe("10px");
	expect(await demo.evaluate((el) => Math.round(el.getBoundingClientRect().right))).toBe(1200);
});

test("mobile hero shows a cropped desktop app, not a compact shell", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
 await page.goto("/?demoClock=fast");
 await expect(page.locator(".hero .demo__app")).toBeVisible();
	const title = await page.locator(".hero h1").evaluate((element) => {
		const style = getComputedStyle(element);
		return [style.fontSize, style.lineHeight];
	});
	expect(title).toEqual(["40px", "44px"]);
	const layout = await page.evaluate(() => {
		const demo = document.querySelector(".hero .demo");
		const viewport = document.querySelector(".hero .demo__viewport");
		const app = document.querySelector(".hero .demo__app");
		const sidebar = document.querySelector(".hero .demo__app > aside");
		const computer = document.querySelector(".agent-computer-panel");
		const copy = document.querySelector(".hero__copy");
		if (
			!(demo instanceof HTMLElement) ||
			!(viewport instanceof HTMLElement) ||
			!(app instanceof HTMLElement) ||
			!(sidebar instanceof HTMLElement) ||
			!(computer instanceof HTMLElement) ||
			!(copy instanceof HTMLElement)
		) {
			throw new Error("demo chrome");
		}
		const demoBox = demo.getBoundingClientRect();
		const thread = document.querySelector(".agent-thread-shell");
		const threadBox = thread instanceof HTMLElement ? thread.getBoundingClientRect() : null;
		const scale = demo.clientWidth / 950;
		const menu = demo.querySelector('[aria-label="Open navigation menu"]');
		return {
			sidebar: sidebar.offsetWidth,
			computer: computer.offsetWidth,
			layoutWidth: Math.round(Number.parseFloat(getComputedStyle(app).width)),
			layoutHeight: Math.round(Number.parseFloat(getComputedStyle(app).height)),
			composer: getComputedStyle(demo).getPropertyValue("--composer-w").trim(),
			visualWidth: Math.round(app.getBoundingClientRect().width),
			demoWidth: demo.clientWidth,
			demoLeft: Math.round(demoBox.left),
			demoRight: Math.round(demoBox.right),
			copyLeft: Math.round(copy.getBoundingClientRect().left),
			frameHeight: Math.round(viewport.getBoundingClientRect().height),
			scaledHeight: Math.round(787 * scale),
			rightRadius: getComputedStyle(demo).borderTopRightRadius,
			menu: menu instanceof HTMLElement ? getComputedStyle(menu).display : "none",
			chatVisible: Boolean(
				threadBox && threadBox.left < demoBox.right && threadBox.right > demoBox.left,
			),
			pointer: getComputedStyle(demo).pointerEvents,
			mobile: demo.getAttribute("data-mobile"),
		};
	});
	expect(layout.sidebar).toBe(224);
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
