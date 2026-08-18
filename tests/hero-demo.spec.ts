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
	await expect(demo).toHaveAttribute("data-phase", "done", { timeout: 20000 });
	await expect(demo.locator(".chat-markdown").first()).toContainText(
		"What I changed",
	);
	await expect(demo.locator(".chat-markdown").first()).toContainText(
		"Qwen3.8-27B",
	);
	await expect(demo.getByText("Proxy health check").first()).toBeVisible();
	await expect(demo.getByText("New task").first()).toBeVisible();
	await expect(
		demo.getByRole("button", { name: "Status", exact: true }),
	).toBeVisible();
	await expect(
		demo.getByRole("button", { name: "Review", exact: true }),
	).toBeVisible();
	await expect(demo.getByText("src/proxy/health.ts").first()).toBeVisible();
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
	expect(copied).toContain("What I changed");
	expect(copied).toContain("Qwen3.8-27B");
});

test("reduced motion shows the finished result immediately", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/");
	const demo = page.locator(".demo");
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(demo.locator(".chat-markdown").first()).toHaveText(
		/I'll read the standup notes[\s\S]*What I changed/,
	);
});

test("hero demo chat follows new messages", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/");
	const demo = page.locator(".demo");
	const scroller = demo.locator("[data-timeline-scroller]");
	await expect(demo).toHaveAttribute("data-phase", "done", { timeout: 20000 });
	await expect(scroller).toBeVisible();
	const pinned = await scroller.evaluate((element) => {
		if (!(element instanceof HTMLElement)) return false;
		return element.scrollHeight - element.scrollTop - element.clientHeight <= 8;
	});
	expect(pinned).toBe(true);
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

test("mobile hero shows a cropped desktop app, not a compact shell", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	const title = await page.locator(".hero h1").evaluate((element) => {
		const style = getComputedStyle(element);
		return [style.fontSize, style.lineHeight];
	});
	expect(title).toEqual(["40px", "44px"]);
	const layout = await page.evaluate(() => {
		const demo = document.querySelector(".demo");
		const viewport = document.querySelector(".demo__viewport");
		const app = document.querySelector(".demo__app");
		const sidebar = document.querySelector(".demo__app > aside");
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
