import { expect, test } from "@playwright/test";

const routes = [
	"/",
	"/product",
	"/mobile",
	"/docs",
	"/prompt",
	"/agents",
	"/download/macos",
] as const;

test("landmarks are separate and a skip link targets main content", async ({
	page,
}) => {
	await page.goto("/");
	const shell = page.locator(".site-shell");
	await expect(shell.locator("> header.nav")).toHaveCount(1);
	await expect(shell.locator("> main#content")).toHaveCount(1);
	await expect(shell.locator("> footer.footer")).toHaveCount(1);
	await expect(
		shell.locator("main > .page-intro, main > .hero").first(),
	).toBeVisible();
	const skip = page.getByRole("link", { name: "Skip to content" });
	await expect(skip).toHaveAttribute("href", "#content");
	expect(await skip.evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(0);
	await page.keyboard.press("Tab");
	await expect(skip).toBeFocused();
	const focused = await skip.evaluate((element: HTMLAnchorElement) => ({
		href: element.hash,
		withinViewport: element.getBoundingClientRect().top >= 0,
		ring: [getComputedStyle(element).outlineWidth, getComputedStyle(element).outlineStyle, getComputedStyle(element).outlineColor],
	}));
	expect(focused).toEqual({
		href: "#content",
		withinViewport: true,
		ring: ["2px", "solid", "rgb(0, 112, 243)"],
	});
});

test("focus rings appear only after real keyboard use", async ({ page }) => {
	await page.goto("/");
	const reload = await page.goto("/docs#quick-start");
	expect(reload?.ok()).toBeTruthy();
	const loadState = await page.evaluate(() => {
		const active = document.activeElement;
		if (!(active instanceof Element)) throw new Error("active");
		return {
			focused: active.tagName,
			ring: getComputedStyle(active).outlineStyle,
		};
	});
	expect(loadState).toEqual({ focused: "H2", ring: "none" });
	await page.getByRole("navigation", { name: "Landing navigation" }).getByRole("button", { name: "Resources" }).click();
	await page.getByRole("menuitem", { name: "Mobile", exact: true }).click();
	await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
	expect(
		await page.evaluate(() => {
			const active = document.activeElement;
			if (!(active instanceof Element)) throw new Error("active");
			return getComputedStyle(active).outlineStyle;
		}),
		"click navigation must not draw a ring",
	).toBe("none");
	await page.goto("/");
	expect(
		await page.locator(".nav__links a").first().evaluate((element) => {
		element.focus();
		return getComputedStyle(element).outlineStyle;
	}),
		"fresh load must not draw a ring before keyboard use",
	).toBe("none");
	await page.keyboard.press("Tab");
	const checks = [
		".nav__links a",
		".hero__actions .button",
		".hero__actions .text-link",
		".story__option-control",
		".footer__links a",
	];
	for (const selector of checks) {
		await page.locator(selector).first().focus();
		const style = await page
			.locator(selector)
			.first()
			.evaluate((element) => ({
				width: getComputedStyle(element).outlineWidth,
				style: getComputedStyle(element).outlineStyle,
			}));
		expect(style, `${selector} keyboard focus`).toEqual({
			width: "2px",
			style: "solid",
		});
	}
});

test("route changes focus the new heading and reset scroll only on push", async ({
	page,
}) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { level: 1 })).not.toBeFocused();
	await page
		.getByRole("navigation", { name: "Landing navigation" })
		.getByRole("button", { name: "Resources" })
		.click();
	await page.getByRole("menuitem", { name: "Documentation", exact: true }).click();
	await expect(
		page.getByRole("heading", { level: 1, name: "Get Local Studio running" }),
	).toBeFocused();
	expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("back and forward restore the scroll position", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 800 });
	await page.goto("/");
	await page.evaluate(() => globalThis.scrollTo(0, 900));
	await expect
		.poll(() => page.evaluate(() => Math.round(window.scrollY)))
		.toBeGreaterThan(500);
	await page
		.getByRole("navigation", { name: "Landing navigation" })
		.getByRole("button", { name: "Resources" })
		.click();
	await page.getByRole("menuitem", { name: "Documentation", exact: true }).click();
	await expect
		.poll(() => page.evaluate(() => Math.round(window.scrollY)))
		.toBe(0);
	await page.goBack();
	await expect
		.poll(() => page.evaluate(() => Math.round(window.scrollY)), {
			timeout: 5000,
		})
		.toBeGreaterThan(500);
	await page.goForward();
	await expect(
		page.getByRole("heading", { level: 1, name: "Get Local Studio running" }),
	).toBeVisible();
});

test("hash jumps account for the sticky navigation and move focus", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 800 });
	await page.goto("/");
	await page.evaluate(() => document.fonts.ready);
	await page.evaluate(() => {
		const element = document.querySelector("#media h2");
		if (!(element instanceof HTMLElement)) throw new Error("#media h2");
		globalThis.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
	});
	const withoutMargin = await page
		.locator("#media h2")
		.evaluate((element) => element.getBoundingClientRect().top);
	expect(withoutMargin).toBeLessThan(72);
	await page.goto("/#media");
	await page.waitForTimeout(150);
	const headingTop = await page
		.locator("#media h2")
		.evaluate((element) => element.getBoundingClientRect().top);
	expect(headingTop).toBeGreaterThan(withoutMargin);
	expect(headingTop).toBeGreaterThanOrEqual(71);
	await expect(page.locator("#media h2")).toBeFocused();
});

test("product names are protected from translation", async ({ page }) => {
	for (const route of routes) {
		await page.goto(route);
		const count = await page.locator('[translate="no"]').count();
		expect(count, `${route} should protect product names`).toBeGreaterThan(0);
	}
	const agents = await page.goto("/agents");
	expect(agents?.ok()).toBeTruthy();
	await expect(page.locator(".page-intro p")).toContainText(
		"copy-paste instruction",
	);
});

test("touch interactions avoid double-tap zoom and tap highlight flash", async ({
	page,
}) => {
	await page.goto("/");
	const interactions = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const link = html(".nav__links a, .nav__toggle");
		const button = html(".button");
		const tap = getComputedStyle(document.documentElement).getPropertyValue(
			"-webkit-tap-highlight-color",
		);
		return {
			links: getComputedStyle(link).touchAction,
			buttons: getComputedStyle(button).touchAction,
			tapHighlight: tap === "rgba(0, 0, 0, 0)" || tap === "transparent",
		};
	});
	expect(interactions).toEqual({
		links: "manipulation",
		buttons: "manipulation",
		tapHighlight: true,
	});
});

test("mobile hit targets reach 44px", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	const sizes = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const toggle = html(".nav__toggle");
		const footerLink = html(".footer__links a");
		return {
			toggle: [toggle.getBoundingClientRect().width, toggle.getBoundingClientRect().height],
			footer: footerLink.getBoundingClientRect().height,
		};
	});
	expect(sizes.toggle[0]).toBeGreaterThanOrEqual(44);
	expect(sizes.toggle[1]).toBeGreaterThanOrEqual(44);
	expect(sizes.footer).toBeGreaterThanOrEqual(32);
	await page.getByRole("button", { name: "Open menu" }).click();
	const sheet = await page.locator(".nav__sheet-summary, .nav__sheet-link").evaluateAll((elements) =>
		elements.map((element) => {
			const box = element.getBoundingClientRect();
			return { height: Math.round(box.height), width: Math.round(box.width) };
		}),
	);
	expect(sheet.length).toBeGreaterThan(0);
	for (const target of sheet) {
		expect(target.height).toBeGreaterThanOrEqual(44);
		expect(target.width).toBeGreaterThanOrEqual(44);
	}
	const chrome = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const brand = html(".brand");
		const toggle = html(".nav__toggle");
		const brandBox = brand.getBoundingClientRect();
		const toggleBox = toggle.getBoundingClientRect();
		const brandHit = document.elementFromPoint(brandBox.left + 8, brandBox.top + brandBox.height / 2);
		const toggleHit = document.elementFromPoint(toggleBox.left + toggleBox.width / 2, toggleBox.top + toggleBox.height / 2);
		return {
			brandTop: Math.round(brandBox.top),
			toggleTop: Math.round(toggleBox.top),
			brandVisible: brandBox.height > 0 && Boolean(brandHit?.closest(".brand")),
			toggleVisible: toggleBox.height > 0 && Boolean(toggleHit?.closest(".nav__toggle")),
		};
	});
	expect(chrome.brandTop).toBeGreaterThanOrEqual(0);
	expect(chrome.toggleTop).toBeGreaterThanOrEqual(0);
	expect(chrome.brandVisible).toBe(true);
	expect(chrome.toggleVisible).toBe(true);
	await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
	const hit = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const header = html("header.nav");
		const sheet = html(".nav__sheet");
		const first = html(".nav__sheet-summary");
		const headerBottom = header.getBoundingClientRect().bottom;
		const firstBox = first.getBoundingClientRect();
		const mid = document.elementFromPoint(firstBox.left + 24, firstBox.top + firstBox.height / 2);
		return {
			gap: Math.round(firstBox.top - headerBottom),
			sheetTop: Math.round(sheet.getBoundingClientRect().top),
			headerBottom: Math.round(headerBottom),
			hit: mid?.textContent?.trim() ?? "",
		};
	});
	expect(hit.sheetTop).toBe(hit.headerBottom);
	expect(hit.gap).toBeGreaterThanOrEqual(0);
	expect(hit.hit).toContain("Products");
	await page.getByRole("button", { name: "Close menu" }).click();
	await page.evaluate(() => window.scrollTo(0, 900));
	const scrolled = await page.evaluate(() => Math.round(window.scrollY));
	expect(scrolled).toBeGreaterThan(500);
	const headingTop = await page.locator("h1").evaluate((element) => Math.round(element.getBoundingClientRect().top));
	await page.getByRole("button", { name: "Open menu" }).click();
	const afterScroll = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const brand = html(".brand");
		const toggle = html(".nav__toggle");
		const heading = html("h1");
		return {
			scrollY: Math.round(window.scrollY),
			brandTop: Math.round(brand.getBoundingClientRect().top),
			toggleTop: Math.round(toggle.getBoundingClientRect().top),
			toggleHeight: Math.round(toggle.getBoundingClientRect().height),
			headingTop: Math.round(heading.getBoundingClientRect().top),
		};
	});
	expect(afterScroll.scrollY).toBe(scrolled);
	expect(afterScroll.headingTop).toBe(headingTop);
	expect(afterScroll.brandTop).toBeGreaterThanOrEqual(0);
	expect(afterScroll.toggleTop).toBeGreaterThanOrEqual(0);
	expect(afterScroll.toggleHeight).toBeGreaterThanOrEqual(44);
	await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
	await page.getByRole("button", { name: "Close menu" }).click();
	expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(scrolled);
});

test("desktop menus use one continuous navbar surface and align to the page grid", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");
	const trigger = page.getByRole("button", { name: "Resources" });
	const restingNav = await page.locator("header.nav").evaluate((element) => {
		const style = getComputedStyle(element, "::before");
		return [style.backgroundColor, style.backdropFilter];
	});
	await trigger.hover();
	const menu = page.locator(".nav__mega");
	await expect(menu).toBeVisible();
	await expect(menu.locator(".nav__mega-section")).toHaveCount(3);
	const geometry = await page.evaluate(() => {
		const header = document.querySelector<HTMLElement>("header.nav");
		const panel = document.querySelector<HTMLElement>(".nav__mega");
		const inner = document.querySelector<HTMLElement>(".nav__mega-inner");
		const entryGrid = document.querySelector<HTMLElement>(".nav__mega-grid");
		const firstSection = document.querySelector<HTMLElement>(".nav__mega-section");
		const brand = document.querySelector<HTMLElement>(".brand");
		if (!header || !panel || !inner || !entryGrid || !firstSection || !brand) {
			throw new Error("Desktop menu did not open");
		}
		const pageOverlay = getComputedStyle(document.body, "::after");
		const headerBox = header.getBoundingClientRect();
		const panelBox = panel.getBoundingClientRect();
		const innerBox = inner.getBoundingClientRect();
		const entryGridBox = entryGrid.getBoundingClientRect();
		return {
			panelTop: Math.round(panelBox.top),
			headerBottom: Math.round(headerBox.bottom),
			panelWidth: Math.round(panelBox.width),
			containerWidth: Math.round(innerBox.width),
			entryGridWidth: Math.round(entryGridBox.width),
			panelHeight: Math.round(panelBox.height),
			surfaceBottom: Math.round(
				headerBox.top + Number.parseFloat(getComputedStyle(header, "::before").height),
			),
			gridLeft: [brand, inner, entryGrid, firstSection].map((element) =>
				Math.round(element.getBoundingClientRect().left),
			),
			panelPseudo: getComputedStyle(panel, "::before").content,
			panelDirectChrome: [
				getComputedStyle(panel).backgroundColor,
				getComputedStyle(panel).backdropFilter,
			],
			pageOverlay: pageOverlay.content,
			navChrome: [
				getComputedStyle(header, "::before").backgroundColor,
				getComputedStyle(header, "::before").backdropFilter,
			],
			navDirectChrome: [
				getComputedStyle(header).backgroundColor,
				getComputedStyle(header).backdropFilter,
			],
			navZIndex: Number.parseInt(getComputedStyle(header).zIndex, 10),
			sectionBorders: [...panel.querySelectorAll<HTMLElement>(".nav__mega-section")].map(
				(section) => [
					getComputedStyle(section).borderLeftWidth,
					getComputedStyle(section).borderRightWidth,
				],
			),
			labelFonts: [...panel.querySelectorAll<HTMLElement>(".nav__mega-section > p")].map(
				(label) => {
					const style = getComputedStyle(label);
					return [style.fontSize, style.lineHeight, style.fontWeight];
				},
			),
		};
	});
	expect(Math.abs(geometry.panelTop - geometry.headerBottom)).toBeLessThanOrEqual(1);
	expect(geometry.headerBottom).toBeGreaterThanOrEqual(72);
	expect(geometry.panelWidth).toBe(1440);
	expect(geometry.containerWidth).toBe(geometry.panelWidth - 48);
	expect(geometry.entryGridWidth).toBe(Math.round(geometry.containerWidth * 0.6));
	expect(geometry.gridLeft).toEqual(Array(4).fill(geometry.gridLeft[0]));
	expect(geometry.pageOverlay).toBe("none");
	expect(restingNav).toEqual([
		"rgba(0, 0, 0, 0.64)",
		"blur(24px) brightness(0.7)",
	]);
	expect(geometry.navChrome).toEqual(restingNav);
	expect(geometry.surfaceBottom).toBe(geometry.panelTop + geometry.panelHeight);
	expect(geometry.panelPseudo).toBe("none");
	expect(geometry.navDirectChrome).toEqual(["rgba(0, 0, 0, 0)", "none"]);
	expect(geometry.panelDirectChrome).toEqual(geometry.navDirectChrome);
	await expect(page.locator(".nav__page-overlay, .nav__backdrop")).toHaveCount(0);
	expect(geometry.sectionBorders).toEqual(Array(3).fill(["0px", "0px"]));
	expect(geometry.labelFonts).toEqual(Array(3).fill(["16px", "24px", "400"]));
	const targets = await menu.locator("a").evaluateAll((links) =>
		links.map((link) => ({
			height: Math.round(link.getBoundingClientRect().height),
			color: getComputedStyle(link).color,
			font: [
				getComputedStyle(link).fontSize,
				getComputedStyle(link).lineHeight,
				getComputedStyle(link).fontWeight,
			],
		})),
	);
	expect(targets.length).toBe(5);
	expect(Math.min(...targets.map((target) => target.height))).toBeGreaterThanOrEqual(48);
	expect(new Set(targets.map((target) => target.color))).toEqual(new Set(["rgb(255, 255, 255)"]));
	expect(new Set(targets.map((target) => target.font.join("/")))).toEqual(
		new Set(["28px/36px/400"]),
	);
	await page.getByRole("link", { name: "Documentation", exact: true }).hover();
	await expect(menu).toBeVisible();
	await page.mouse.move(720, 700);
	await expect(menu).toBeHidden();
	await trigger.click();
	await expect(menu).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(menu).toBeHidden();
});

test("navbar and footer hitboxes touch and share one height", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");
	const nav = await page.locator(".nav__links > *").evaluateAll((links) =>
		links.map((link) => {
			const box = link.getBoundingClientRect();
			return {
				left: Math.round(box.left),
				right: Math.round(box.right),
				top: Math.round(box.top),
				bottom: Math.round(box.bottom),
			};
		}),
	);
	expect(nav.length).toBeGreaterThanOrEqual(4);
	for (let index = 1; index < nav.length; index += 1) {
		expect(nav[index].left, "nav hitboxes must touch").toBe(nav[index - 1].right);
	}
	expect(new Set(nav.map((link) => link.bottom - link.top)).size).toBe(1);
	const between = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const company = html('.nav__links a[href="https://www.sybilsolutions.ai/"]');
		const github = html(".nav__github");
		const companyBox = company.getBoundingClientRect();
		const githubBox = github.getBoundingClientRect();
		const x = (companyBox.right + githubBox.left) / 2;
		const hit = document.elementFromPoint(x, (companyBox.top + companyBox.bottom) / 2);
		return hit?.closest("a")?.getAttribute("href") ?? "";
	});
	expect(["https://www.sybilsolutions.ai/", "https://github.com/sybil-solutions/local-studio"]).toContain(between);
	const link = page.locator(".nav__links a").first();
	const pill = await link.evaluate((element) => {
		const box = element.getBoundingClientRect();
		const style = getComputedStyle(element, "::before");
		const height = Number.parseInt(style.height, 10);
		const visualTop = Number.parseInt(style.top, 10) - height / 2;
		return {
			hitbox: Math.round(box.height),
			highlight: style.height,
			margins: [visualTop, box.height - (visualTop + height)],
			anchorBackground: getComputedStyle(element).backgroundColor,
		};
	});
	await link.hover();
	await page.waitForTimeout(150);
	const hoveredPill = await link.evaluate(
		(element) => getComputedStyle(element, "::before").backgroundColor,
	);
	expect(hoveredPill.startsWith("rgba(255, 255, 255, 0.0")).toBe(true);
	expect(pill).toEqual({
		hitbox: 72,
		highlight: "38px",
		margins: [17, 17],
		anchorBackground: "rgba(0, 0, 0, 0)",
	});
	const footer = await page.locator(".footer__links a").evaluateAll((links) => {
		const boxes = links.map((link) => {
			const box = link.getBoundingClientRect();
			return {
				left: Math.round(box.left),
				right: Math.round(box.right),
				top: Math.round(box.top),
				bottom: Math.round(box.bottom),
			};
		});
		const touching = boxes.every(
			(box, index) =>
				index === 0 || box.top !== boxes[index - 1].top || box.left === boxes[index - 1].right,
		);
		const heights = new Set(boxes.map((box) => box.bottom - box.top));
		return { touching, heightCount: heights.size };
	});
	expect(footer).toEqual({ touching: true, heightCount: 1 });
});

test("typography avoids widows and the first paint is preloaded", async ({ page }) => {
	await page.goto("/docs");
	const wrapping = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		return {
			body: getComputedStyle(html(".page-intro p")).textWrap,
			title: getComputedStyle(html("h1")).textWrap,
		};
	});
	expect(wrapping).toEqual({ body: "pretty", title: "balance" });
	await page.goto("/");
 const fonts = page.locator('link[rel="preload"][as="font"]');
 expect(await fonts.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")))).toEqual([
  "/fonts/geist-sans.woff2",
  "/fonts/geist-mono.woff2",
 ]);
	await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(0);
	await page.goto("/product");
	const hero = page.locator('link[rel="preload"][as="image"]');
	await expect(hero).toHaveCount(1);
	expect(await hero.getAttribute("href")).toContain(
		"workbench-browser-1300.png",
	);
});

test("below-the-fold imagery is responsive", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/product");
	const images = await page
		.locator("section[aria-label='Product capabilities'] img")
		.evaluateAll((elements: HTMLImageElement[]) =>
			elements.map((image) => ({
				srcset: image.srcset.length > 0,
				sizes: image.sizes.length > 0,
				width: image.getAttribute("width"),
			})),
		);
	expect(images.length).toBe(6);
	for (const image of images) {
		expect(image.srcset).toBe(true);
		expect(image.sizes).toBe(true);
	}
});

test("the story autoplays and announces demo changes", async ({
	page,
}) => {
 await page.goto("/");
 await page.locator(".story__visual").scrollIntoViewIfNeeded();
	const control = page.getByRole("radio", { name: "Control" });
	const serve = page.getByRole("radio", { name: "Serve" });
	await expect(control).toHaveAttribute("aria-checked", "true");
	await expect(serve).toHaveAttribute("aria-checked", "true", { timeout: 10000 });
	const live = await page
		.locator(".story__visual .sr-only")
		.evaluate((element) => element.getAttribute("role"));
	expect(live).toBe("status");
});

test("agents page keeps a hierarchical heading order", async ({ page }) => {
	await page.goto("/agents");
	const order = await page
		.locator("h1, h2, h3")
		.evaluateAll((headings) =>
			headings.map((heading) => Number(heading.tagName.slice(1))),
		);
	expect(order[0]).toBe(1);
	for (let index = 1; index < order.length; index += 1) {
		expect(order[index] - order[index - 1]).toBeLessThanOrEqual(1);
	}
});

test("bounded route surfaces use the shared radius roles", async ({ page }) => {
	await page.goto("/prompt");
	const tokens = await page.evaluate(() => {
		const style = getComputedStyle(document.documentElement);
		return [
			"--radius-control",
			"--radius-compact",
			"--radius-frame",
			"--radius-card",
			"--radius-media-frame",
			"--radius-panel",
			"--radius-panel-large",
		].map((token) => style.getPropertyValue(token).trim());
	});
	expect(tokens).toEqual(["6px", "8px", "10px", "12px", "14px", "16px", "24px"]);

	const checks = [
		{ route: "/prompt", selector: ".prompt-block.surface-panel", count: 1, radius: "16px", clipped: false },
		{ route: "/prompt", selector: ".prompt-block__toggle", count: 1, radius: "6px", clipped: false },
		{ route: "/resources", selector: ".surface-panel", count: 3, radius: "16px", clipped: true },
		{ route: "/agents", selector: ".surface-panel:not(.prompt-block)", count: 1, radius: "16px", clipped: true },
		{ route: "/agents", selector: ".prompt-block.surface-panel", count: 1, radius: "16px", clipped: false },
		{ route: "/agents", selector: ".surface-card", count: 1, radius: "12px", clipped: true },
		{ route: "/agents", selector: ".surface-compact", count: 1, radius: "8px", clipped: false },
		{ route: "/mobile", selector: ".surface-panel-large", count: 1, radius: "24px", clipped: true },
		{ route: "/mobile", selector: ".surface-panel", count: 2, radius: "16px", clipped: true },
		{ route: "/mobile", selector: ".surface-card", count: 3, radius: "12px", clipped: true },
	] as const;

	for (const check of checks) {
		await page.goto(check.route);
		const surfaces = page.locator(check.selector);
		await expect(surfaces).toHaveCount(check.count);
		const styles = await surfaces.evaluateAll((elements) =>
			elements.map((element) => ({
				radius: getComputedStyle(element).borderRadius,
				overflow: getComputedStyle(element).overflow,
			})),
		);
		expect(styles.map(({ radius }) => radius)).toEqual(
			Array.from({ length: check.count }, () => check.radius),
		);
		if (check.clipped) {
			expect(styles.every(({ overflow }) => overflow === "hidden")).toBe(true);
		}
	}

	await page.goto("/prompt");
	const toggle = page.locator(".prompt-block__toggle");
	await toggle.scrollIntoViewIfNeeded();
	const toggleBox = await toggle.boundingBox();
	expect(toggleBox?.height).toBe(40);
	await toggle.click({
		position: { x: (toggleBox?.width ?? 0) / 2, y: (toggleBox?.height ?? 0) - 2 },
	});
	await expect(toggle).toHaveAttribute("aria-expanded", "true");
});
test("story media uses the hero border treatment", async ({ page }) => {
	await page.goto("/");
	const style = await page.locator(".story__visual .demo").first().evaluate((element) => ({
		border: getComputedStyle(element).borderTopWidth,
		radius: getComputedStyle(element).borderRadius,
		shadow: getComputedStyle(element).boxShadow,
	}));
	expect(style.radius).toContain("10px");
	const frame = await page.locator(".story__visual").evaluate((element) => ({
		padding: getComputedStyle(element).paddingTop,
		border: getComputedStyle(element).borderTopWidth,
		background: getComputedStyle(element).backgroundColor,
	}));
	expect(frame).toEqual({ padding: "0px", border: "0px", background: "rgba(0, 0, 0, 0)" });
});

test("primary actions highlight clearly without moving", async ({ page }) => {
	await page.goto("/");
	const button = page.locator(".hero__copy .button");
	const rest = await button.evaluate(
		(element) => ({
			background: getComputedStyle(element).backgroundColor,
			color: getComputedStyle(element).color,
			transform: getComputedStyle(element).transform,
		}),
	);
	await button.hover();
	await page.waitForTimeout(150);
	const hover = await button.evaluate(
		(element) => ({
			background: getComputedStyle(element).backgroundColor,
			color: getComputedStyle(element).color,
			transform: getComputedStyle(element).transform,
		}),
	);
	expect(hover.background).not.toBe(rest.background);
	expect(rest).toMatchObject({ background: "rgb(255, 255, 255)", color: "rgb(0, 0, 0)" });
	expect(hover).toMatchObject({ background: "rgb(234, 234, 234)", color: "rgb(0, 0, 0)" });
	expect(hover.transform).toBe("none");
	expect(rest.transform).toBe("none");
	const setup = page.locator(".hero__copy .hero__actions .text-link");
	const arrow = await setup.evaluate((element) => ({
		color: getComputedStyle(element).color,
		fontWeight: getComputedStyle(element).fontWeight,
	}));
	await setup.hover();
	await expect.poll(() => setup.evaluate((element) => {
		const background = getComputedStyle(element).backgroundColor;
		return Number(background.match(/[\d.]+(?=\)$)/)?.[0] ?? 0);
	})).toBeGreaterThanOrEqual(0.05);
	const hoveredArrow = await setup.evaluate((element) => {
		const background = getComputedStyle(element).backgroundColor;
		return {
			color: getComputedStyle(element).color,
			alpha: Number(background.match(/[\d.]+(?=\)$)/)?.[0] ?? 0),
		};
	});
	expect(arrow).toEqual({ color: "rgb(255, 255, 255)", fontWeight: "400" });
	expect(hoveredArrow.color).toBe("rgb(255, 255, 255)");
	expect(hoveredArrow.alpha).toBeGreaterThanOrEqual(0.05);
	expect(hoveredArrow.alpha).toBeLessThanOrEqual(0.1);
});

test("hero actions are two discrete bordered buttons with a gap", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");
	const groups = page.locator(".hero__actions .button-group");
	await expect(groups).toHaveCount(2);
	const geometry = await groups.evaluateAll((elements) =>
		elements.map((element) => {
			const button = element.children[0].getBoundingClientRect();
			const link = element.children[1].getBoundingClientRect();
			return {
				noEnclosingBox: getComputedStyle(element).borderTopWidth === "0px",
				gap: Math.round(link.left - button.right),
				separateBorders:
					getComputedStyle(element.children[0]).borderTopWidth === "1px" &&
					getComputedStyle(element.children[1]).borderTopWidth === "1px",
				equalHeights: Math.round(button.height) === Math.round(link.height),
			};
		}),
	);
	for (const group of geometry) {
		expect(group).toEqual({
				noEnclosingBox: true,
				gap: 8,
				separateBorders: true,
				equalHeights: true,
			});
	}
});
test("not-found page suggests every route", async ({ page }) => {
	await page.goto("/not-a-route");
	const suggestions = page.getByRole("navigation", {
		name: "Suggested routes",
	});
	await expect(suggestions.getByRole("link")).toHaveCount(7);
	await expect(
		suggestions.getByRole("link", { name: "Product", exact: true }),
	).toHaveAttribute("href", "/product");
});

test("copy uses numerals, non-breaking units, and real apostrophes", async ({
	page,
}) => {
	await page.goto("/mobile");
	await expect(
		page.getByRole("heading", { name: "3 steps, no server setup." }),
	).toBeVisible();
	const apostrophe = await page
		.locator("body")
		.evaluate((element) => element.textContent);
	expect(apostrophe).toContain("’");
	await page.goto("/download/macos");
	const unit = await page
		.locator("body")
		.evaluate((element) => element.textContent);
	expect(unit).toContain("255\u00A0MB");
});

test("brand assets are reachable from the footer", async ({ page }) => {
	await page.goto("/");
	const assets = page.getByRole("link", { name: "Brand assets" });
	await expect(assets).toHaveAttribute("href", "/images/localstudio-logo.svg");
	await expect(assets).toHaveAttribute("download");
	const response = await page.request.get("/images/localstudio-logo.svg");
	expect(response.ok()).toBeTruthy();
});
