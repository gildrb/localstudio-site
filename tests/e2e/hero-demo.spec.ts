import { expect, test } from "@playwright/test";

test("hero demo autoplays the local inference sequence once", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo).toBeVisible();
	await expect(demo.locator("canvas, video")).toHaveCount(0);
	await expect(
		demo.getByRole("button", { name: "Model: Qwen3.8-27B" }),
	).toBeVisible();
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(demo.locator("[data-chat-markdown]").last()).toContainText(
		"Ready for you",
	);
	await expect(demo.locator("[data-chat-markdown]").last()).toContainText(
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
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
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
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
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


test("hero demo result copies with the clipboard API", async ({
	page,
	context,
}) => {
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

test("reduced motion shows the finished result immediately", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(demo.locator("[data-chat-markdown]").last()).toHaveText(
		/I'll bring the private details together[\s\S]*Ready for you/,
	);
});

test("hero demo keeps completed tool calls in view", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo).toHaveAttribute("data-phase", "done");
	await expect(demo.locator('[data-tool-call="itinerary"]')).toBeInViewport();
	await expect(demo.locator('[data-tool-call="packing"]')).toBeInViewport();
});

test("hero demo has no dead sidebar destinations", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo.getByText("Terminals", { exact: true })).toHaveCount(0);
	const profile = demo.getByText("Sero", { exact: true });
	await expect(profile).toBeVisible();
	expect(
		await profile.evaluate((element) => element.closest("a, button") === null),
	).toBe(true);
	const url = page.url();
	await demo.getByText("Models", { exact: true }).click();
	await expect(page).toHaveURL(url);
	await expect(page.getByRole("heading", { name: "This page is not local" })).toHaveCount(0);
});

test("KittyLitter keeps context visible while images and links stay fixed", async ({ page }) => {
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
	const before = await images.evaluateAll((elements) =>
		elements.map((element) => element.getBoundingClientRect().top + window.scrollY),
	);
	await expect(cards.getByRole("link")).toHaveCount(0);
	await images.first().hover();
	await expect(cards.first()).toHaveAttribute("data-active", "true");
	await expect(
		cards.first().getByText("Pick up exactly where you left off."),
	).toBeVisible();
	await expect(cards.getByRole("link")).toHaveCount(0);
	const after = await images.evaluateAll((elements) =>
		elements.map((element) => element.getBoundingClientRect().top + window.scrollY),
	);
	expect(after).toEqual(before);
});

test("KittyLitter carousel stays still without pagination chrome", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const carousel = page.getByRole("region", { name: "KittyLitter features" });
	await carousel.scrollIntoViewIfNeeded();
	await expect(carousel.getByRole("status")).toHaveCount(0);
	expect(await carousel.evaluate((element) => element.scrollLeft)).toBe(0);
	await page.waitForTimeout(750);
	expect(await carousel.evaluate((element) => element.scrollLeft)).toBe(0);
	await carousel.evaluate((element) => {
		element.scrollLeft = element.scrollWidth;
	});
	await expect
		.poll(async () =>
			carousel.evaluate((element) => {
				const last = element.querySelector<HTMLElement>(
					"[data-kitty-feature]:last-child",
				);
				const intro = document.querySelector<HTMLElement>("[data-kitty-intro]");
				if (!last || !intro) return Number.NaN;
				return Math.round(
					intro.getBoundingClientRect().right -
						last.getBoundingClientRect().right,
				);
			}),
		)
		.toBe(0);
	await expect(page.locator("[data-kitty-feature-description]")).toHaveCount(10);
});


test("KittyLitter carousel supports image jumps and pointer dragging", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/?demoClock=fast");
	const carousel = page.getByRole("region", { name: "KittyLitter features" });
	await carousel.scrollIntoViewIfNeeded();
	await page
		.locator("[data-kitty-feature]")
		.nth(3)
		.getByRole("region")
		.click();
	await expect
		.poll(() => carousel.evaluate((element) => element.scrollLeft))
		.toBeGreaterThan(0);
	await expect
		.poll(() =>
			carousel.evaluate((element) => {
				const card = element.querySelectorAll<HTMLElement>("[data-kitty-feature]")[3];
				if (!card) return Number.POSITIVE_INFINITY;
				const carouselBounds = element.getBoundingClientRect();
				const cardBounds = card.getBoundingClientRect();
				return Math.abs(
					cardBounds.left + cardBounds.width / 2 -
						(carouselBounds.left + carouselBounds.width / 2),
				);
			}),
		)
		.toBeLessThanOrEqual(2);
	await page.waitForTimeout(500);
	await carousel.evaluate((element) => {
		element.scrollLeft = 0;
	});
	await expect.poll(() => carousel.evaluate((element) => element.scrollLeft)).toBe(0);
	await page.waitForTimeout(500);
	const dragMetrics = await carousel.evaluate((element) => {
		const card = element.querySelector<HTMLElement>("[data-kitty-feature]");
		const grid = element.querySelector<HTMLElement>("[data-kitty-items]");
		if (!card || !grid) throw new Error("carousel metrics");
		const gap = Number.parseFloat(getComputedStyle(grid).columnGap) || 0;
		return {
			before: element.scrollLeft,
			stride: card.getBoundingClientRect().width + gap,
		};
	});
	const box = await carousel.boundingBox();
	if (!box) throw new Error("carousel geometry");
	const startX = box.x + box.width * 0.55;
	const y = box.y + box.height * 0.4;
	await page.mouse.move(startX, y);
	await page.mouse.down();
	await page.mouse.move(startX - 48, y, { steps: 4 });
	await page.mouse.up();
	await expect
		.poll(() => carousel.evaluate((element) => element.scrollLeft))
		.toBeGreaterThan(dragMetrics.before + dragMetrics.stride * 0.8);
	await page.waitForTimeout(600);
	const settled = await carousel.evaluate((element) => element.scrollLeft);
	await page.waitForTimeout(300);
	expect(
		Math.abs(
			(await carousel.evaluate((element) => element.scrollLeft)) - settled,
		),
	).toBeLessThan(2);

	await carousel.evaluate((element) => {
		element.scrollLeft = element.scrollWidth;
	});
	await expect(carousel).toHaveAttribute("data-carousel-index", "9");
	const endScroll = await carousel.evaluate((element) => element.scrollLeft);
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
	await expect
		.poll(() => carousel.evaluate((element) => element.scrollLeft))
		.toBeLessThan(endScroll - 100);
	await page.waitForTimeout(600);
	const reversed = await carousel.evaluate((element) => element.scrollLeft);
	await page.waitForTimeout(300);
	expect(
		Math.abs(
			(await carousel.evaluate((element) => element.scrollLeft)) - reversed,
		),
	).toBeLessThan(2);
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
	expect(await demo.evaluate((el) => Math.round(el.getBoundingClientRect().right))).toBe(1200);
});

test("mobile hero shows a cropped desktop app, not a compact shell", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/?demoClock=fast");
	const demo = page.getByRole("region", { name: "Local Studio workbench" });
	await expect(demo.locator("[data-demo-app]")).toBeVisible();
	const title = await page.locator("#landing-title").evaluate((element) => {
		const style = getComputedStyle(element);
		return [style.fontSize, style.lineHeight];
	});
	expect(title).toEqual(["40px", "44px"]);
	const layout = await page.evaluate(() => {
		const demo = document.querySelector('[aria-label="Local Studio workbench"]');
		const viewport = document.querySelector("[data-demo-viewport]");
		const app = document.querySelector("[data-demo-app]");
		const sidebar = document.querySelector("[data-demo-app] > aside");
		const computer = document.querySelector("[data-computer-panel]");
		const copy = document.querySelector("[data-hero-copy]");
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
		const thread = document.querySelector("[data-timeline-list]");
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

test("full hero entrance animates copy and render surface", async ({ page, request }) => {
	const html = await (await request.get("/")).text();
	const stage = html.match(/<div[^>]*id="product"[^>]*>/)?.[0] ?? "";
	const title = html.match(/<h1 id="landing-title"[^>]*>/)?.[0] ?? "";
	expect(stage).toContain('id="product"');
	expect(stage).toContain("opacity:0");
	expect(title).toContain("opacity:0");
	await page.goto("/");
	await expect(page.locator("#landing-title")).toHaveCSS("opacity", "1");
	await expect(page.locator("#product")).toHaveCSS("opacity", "1");
});
