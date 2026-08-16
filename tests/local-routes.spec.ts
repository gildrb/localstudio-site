import { expect, test } from "@playwright/test";

const routes = [
	["/", "Run your intelligence at home - Local Studio", "Run your intelligence"],
	["/product", "Product - Local Studio", "One place to run local AI"],
	["/mobile", "Mobile - Local Studio", "Your local agents"],
	["/docs", "Docs - Local Studio", "Get Local Studio running"],
	["/prompt", "Setup Prompt - Local Studio", "Give this to any coding model"],
	["/agents", "Agents - Local Studio", "Set up the stack"],
	["/download/macos", "Download - Local Studio", "Download for macOS"],
] as const;

for (const [route, title, heading] of routes) {
	test(`${route} loads locally`, async ({ page }) => {
		const errors: string[] = [];
		page.on("console", (message) => {
			if (message.type() === "error") errors.push(message.text());
		});
		await page.goto(route);
		await expect(page).toHaveTitle(title);
		await expect(
			page.getByRole("heading", { level: 1, name: new RegExp(heading) }),
		).toBeVisible();
		const overflow = await page.evaluate(
			() =>
				document.documentElement.scrollWidth -
				document.documentElement.clientWidth,
		);
		expect(overflow).toBeLessThanOrEqual(0);
		expect(errors).toEqual([]);
	});
}

test("non-home routes use the homepage intro system", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	let mobileHeadingTop = 0;
	for (const [route] of routes.slice(1)) {
		await page.goto(route);
		const intro = page.locator(".page-intro");
		await expect(intro).toBeVisible();
		await expect(intro.locator('.page-intro__mark, img[src="/images/optimized.svg"]')).toHaveCount(0);
		await expect(intro.getByRole("heading", { level: 1 })).toHaveCount(1);
		await expect(intro.locator(":scope > .page-intro__content > p")).toBeVisible();
		const geometry = await intro.evaluate(element => {
			const style = getComputedStyle(element);
			const heading = getComputedStyle(element.querySelector("h1")!);
			return { minHeight: style.minHeight, textAlign: style.textAlign, heading: [heading.fontSize, heading.lineHeight] };
		});
		if (["/mobile", "/docs", "/prompt", "/agents"].includes(route)) {
			expect(geometry).toEqual({ minHeight: route === "/mobile" ? "650px" : "0px", textAlign: "left", heading: ["56px", "60px"] });
			const headingTop = Math.round(await intro.locator("h1").evaluate(element => element.getBoundingClientRect().top));
			if (route === "/mobile") {
				mobileHeadingTop = headingTop;
				await expect(intro.locator(".page-intro__aside svg")).toHaveCount(3);
				await expect(intro.locator(".page-intro__requirements li")).toHaveCount(3);
			} else {
				expect(headingTop).toBe(mobileHeadingTop);
			}
		} else {
			expect(geometry).toEqual({ minHeight: "650px", textAlign: "center", heading: ["56px", "60px"] });
		}
	}
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/product");
	expect(await page.locator(".page-intro").evaluate(element => getComputedStyle(element).minHeight)).toBe("540px");
});

test("homepage repeats the hero actions in the final callout", async ({ page }) => {
	await page.goto("/");
	const heroActions = page.locator(".hero__copy .hero__actions");
	const finalActions = page.locator(".final-callout .hero__actions");
	for (const actions of [heroActions, finalActions]) {
		await expect(actions.getByRole("link", { name: "Download for macOS" })).toHaveAttribute("href", "/download/macos");
		await expect(actions.getByRole("link", { name: "Setup prompt" })).toHaveAttribute("href", "/prompt");
		await expect(actions.getByRole("link")).toHaveCount(2);
	}
	await expect(page.getByRole("link", { name: "View on GitHub" })).toHaveCount(0);
	const verticalCenter = await page.locator(".final-callout").evaluate(element => {
		const section = element.getBoundingClientRect();
		const content = element.firstElementChild!.getBoundingClientRect();
		return Math.round((content.top + content.bottom) / 2 - (section.top + section.bottom) / 2);
	});
	expect(verticalCenter).toBe(0);
	const homepageHeading = await page.locator(".page-cta h2").evaluate(element => {
		const style = getComputedStyle(element);
		return [style.fontSize, style.lineHeight, style.fontWeight];
	});
	await page.goto("/mobile");
	const mobileRouteHeading = await page.locator(".page-cta h2").evaluate(element => {
		const style = getComputedStyle(element);
		return [style.fontSize, style.lineHeight, style.fontWeight];
	});
	expect(homepageHeading).toEqual(["42px", "48px", "500"]);
	expect(mobileRouteHeading).toEqual(homepageHeading);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/mobile");
	expect(await page.locator(".page-cta h2").evaluate(element => [getComputedStyle(element).fontSize, getComputedStyle(element).lineHeight])).toEqual(["32px", "40px"]);
});

test("homepage hero, product story, and mobile story have no separators", async ({ page }) => {
	await page.goto("/");
	const boundaries = await page.evaluate(() => {
		const hero = document.querySelector(".hero")!.getBoundingClientRect();
		const intro = document.querySelector(".story__intro")!.getBoundingClientRect();
		const showcase = document.querySelector(".story__showcase")!.getBoundingClientRect();
		const kittyHeading = document.querySelector(".kitty h2")!.getBoundingClientRect();
		return {
			borders: [".hero", ".story"].map(selector => getComputedStyle(document.querySelector(selector)!).borderBottomWidth),
			firstGap: Math.round(intro.top - hero.bottom),
			secondGap: Math.round(kittyHeading.top - showcase.bottom),
		};
	});
	expect(boundaries).toEqual({ borders: ["0px", "0px"], firstGap: 240, secondGap: 240 });
});

test("homepage hero reveals through CSS with a responsive screenshot", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/", { waitUntil: "domcontentloaded" });
	await expect(page.locator(".signal, .macbook-scroll, .hero__macbook")).toHaveCount(0);
	const gradient = page.locator(".hero__gradient");
	const stage = page.locator(".hero__stage");
	const image = page.locator(".hero__screenshot");
	await stage.waitFor({ state: "attached" });
	await expect
		.poll(
			() =>
				page.evaluate(
					() => (document.querySelector(".hero__gradient") as HTMLElement).style.opacity,
				),
				{ timeout: 5000 },
			)
		.toBe("1");
	const entrance = await page.evaluate(() => {
		const mark = (document.querySelector(".hero__mark") as HTMLElement)
			.closest(".hero__mark-button") as HTMLElement;
		const title = document.querySelector(".hero h1") as HTMLElement;
		const actions = document.querySelector(".hero__actions") as HTMLElement;
		const stage = document.querySelector(".hero__stage") as HTMLElement;
		const gradient = document.querySelector(".hero__gradient") as HTMLElement;
		const lead = document.querySelector(".story__intro p")!;
		const texture = document.querySelector(".hero__texture")!;
		const inline = (el: HTMLElement) => el.style.opacity;
		return {
			identity: [inline(mark), inline(title), inline(actions)],
			atmosphere: [inline(stage), inline(gradient)],
			textNodeTransforms: [getComputedStyle(title).transform, getComputedStyle(lead).transform],
			textureGradient: getComputedStyle(texture).backgroundImage.includes("linear-gradient"),
			grid: getComputedStyle(texture, "::before").animationName,
		};
	});
	expect(entrance.identity).toEqual(["1", "1", "1"]);
	expect(entrance.atmosphere).toEqual(["1", "1"]);
	expect(entrance.textNodeTransforms).toEqual(["none", "none"]);
	expect(entrance.textureGradient).toBe(false);
	expect(entrance.grid).toBe("grid-drift");
	await expect(stage).toHaveCSS("opacity", "1");
	await expect(gradient).toHaveCSS("opacity", "1");
	await image.evaluate(element => (element as HTMLImageElement).decode());
	const layout = await page.evaluate(() => {
		const hero = document.querySelector(".hero")!.getBoundingClientRect();
		const gradientElement = document.querySelector(".hero__gradient")!;
		const gradientBounds = gradientElement.getBoundingClientRect();
		const copy = document.querySelector(".hero__copy")!.getBoundingClientRect();
		const stageBounds = document.querySelector(".hero__stage")!.getBoundingClientRect();
		const screenshot = document.querySelector(".hero__screenshot") as HTMLImageElement;
		const imageBounds = screenshot.getBoundingClientRect();
		return {
			gap: Math.round(stageBounds.top - copy.bottom),
			widths: [Math.round(gradientBounds.width), Math.round(stageBounds.width), Math.round(imageBounds.width)],
			imageInset: Math.round(imageBounds.left - gradientBounds.left),
			bottomOffsets: [Math.round(hero.bottom - gradientBounds.bottom), Math.round(hero.bottom - stageBounds.bottom), Math.round(hero.bottom - imageBounds.bottom)],
			intrinsic: [screenshot.naturalWidth, screenshot.naturalHeight],
			currentSrc: new URL(screenshot.currentSrc).pathname,
			neutral: !getComputedStyle(gradientElement).backgroundImage.includes("8, 9, 10"),
		};
	});
	expect(layout).toMatchObject({ gap: 72, widths: [1440, 1240, 1240], imageInset: 100, bottomOffsets: [0, 0, 24], currentSrc: "/images/workbench-browser-1300.png", neutral: true });
	expect(layout.intrinsic[0]).toBeLessThanOrEqual(1300);
	expect(Math.abs(layout.intrinsic[1] - Math.round((layout.intrinsic[0] * 2800) / 5118))).toBeLessThanOrEqual(1);
	const srcset = await image.evaluate(element => (element as HTMLImageElement).srcset);
	expect(srcset).toContain("workbench-browser-800.png 800w");
	expect(srcset).toContain("workbench-browser-2600.png 2600w");
	const documentTop = await stage.evaluate(element => Math.round(element.getBoundingClientRect().top + scrollY));
	await page.evaluate(() => globalThis.scrollTo(0, 500));
	await page.waitForTimeout(100);
	expect(await stage.evaluate(element => Math.round(element.getBoundingClientRect().top + scrollY))).toBe(documentTop);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/", { waitUntil: "domcontentloaded" });
	await expect(stage).toHaveCSS("opacity", "1");
	const mobile = await page.evaluate(() => {
		const screenshot = document.querySelector(".hero__screenshot") as HTMLImageElement;
		const gradientBounds = document.querySelector(".hero__gradient")!.getBoundingClientRect();
		const imageBounds = screenshot.getBoundingClientRect();
		const heroBottom = document.querySelector(".hero")!.getBoundingClientRect().bottom;
		return {
			gap: Math.round(document.querySelector(".hero__stage")!.getBoundingClientRect().top - document.querySelector(".hero__copy")!.getBoundingClientRect().bottom),
			widths: [Math.round(gradientBounds.width), Math.round(imageBounds.width)],
			bottomOffsets: [Math.round(heroBottom - gradientBounds.bottom), Math.round(heroBottom - imageBounds.bottom)],
			currentSrc: new URL(screenshot.currentSrc).pathname,
		};
	});
	expect(mobile).toEqual({ gap: 56, widths: [1440, 342], bottomOffsets: [0, 16], currentSrc: "/images/workbench-browser-800.png" });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/", { waitUntil: "domcontentloaded" });
	await stage.waitFor({ state: "attached" });
	const reduced = await page.evaluate(() => ({
		stage: [getComputedStyle(document.querySelector(".hero__stage")!).opacity, getComputedStyle(document.querySelector(".hero__stage")!).transform],
		gradient: getComputedStyle(document.querySelector(".hero__gradient")!).opacity,
		grid: getComputedStyle(document.querySelector(".hero__texture")!, "::before").animationName,
	}));
	expect(reduced).toEqual({ stage: ["1", "none"], gradient: "1", grid: "none" });
});

test("mobile sections stack their hierarchy without separators", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/mobile");
	const desktop = await page.locator(".mobile-section").evaluateAll(sections => sections.map((section, index) => {
		const heading = section.querySelector("h2")!.getBoundingClientRect();
		const description = section.querySelector("p")!.getBoundingClientRect();
		const previous = index > 0 ? sections[index - 1].getBoundingClientRect() : null;
		return { border: getComputedStyle(section).borderTopWidth, aligned: Math.round(heading.left) === Math.round(description.left), gap: previous ? Math.round(heading.top - previous.bottom) : null };
	}));
	expect(desktop).toEqual([
		{ border: "0px", aligned: true, gap: null },
		{ border: "0px", aligned: true, gap: 120 },
		{ border: "0px", aligned: true, gap: 120 },
	]);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/mobile");
	const mobileGaps = await page.locator(".mobile-section").evaluateAll(sections => sections.slice(1).map((section, index) => Math.round(section.querySelector("h2")!.getBoundingClientRect().top - sections[index].getBoundingClientRect().bottom)));
	expect(mobileGaps).toEqual([80, 80]);
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/mobile");
	const shieldAlignment = await page.locator('[aria-labelledby="security-title"]').evaluate(section => {
		const shield = section.querySelector("ul + div")!.getBoundingClientRect();
		const bounds = section.getBoundingClientRect();
		return { right: Math.round(bounds.right - shield.right), followsList: Boolean(section.querySelector("ul + div")) };
	});
	expect(shieldAlignment).toEqual({ right: 0, followsList: true });
});

test("mobile page keeps stable gutters, type, and actions at narrow widths", async ({ page }) => {
	for (const width of [390, 320]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto("/mobile");
		const sections = await page.locator(".mobile-section").evaluateAll(elements =>
			elements.map(element => {
				const bounds = element.getBoundingClientRect();
				const heading = getComputedStyle(element.querySelector("h2")!);
				return {
					left: Math.round(bounds.left),
					width: Math.round(bounds.width),
					heading: [heading.fontSize, heading.lineHeight],
				};
			}),
		);
		expect(sections).toEqual(Array(3).fill({
			left: 24,
			width: width - 48,
			heading: ["32px", "40px"],
		}));
		const actions = await page
			.locator(".page-intro .button-group, .page-cta .button-group")
			.evaluateAll(groups => groups.map(group => {
				const links = [...group.children].map(element => element.getBoundingClientRect());
				return {
					group: [Math.round(group.getBoundingClientRect().left), Math.round(group.getBoundingClientRect().width)],
					links: links.map(bounds => [Math.round(bounds.left), Math.round(bounds.width), Math.round(bounds.height)]),
					gap: Math.round(links[1].top - links[0].bottom),
				};
			}));
		expect(actions).toEqual(Array(2).fill({
			group: [24, width - 48],
			links: [[24, width - 48, 48], [24, width - 48, 48]],
			gap: 8,
		}));
	}
});

test("every route uses the useful canonical footer", async ({ page }) => {
	const footerLinks = ["Mobile", "Docs", "Setup", "Agents", "Download"];
	for (const [route] of routes) {
		await page.goto(route);
		await expect(page.locator("footer")).toContainText("© 2026 Local Studio");
		for (const label of footerLinks) {
			await expect(page.locator("footer").getByRole("link", { name: label, exact: true })).toBeVisible();
		}
	}
});

test("shared navbar remains pinned while pages scroll", async ({ page }) => {
	for (const route of ["/", "/docs", "/prompt", "/agents"]) {
		await page.goto(route);
		const header = page.locator("header.nav");
		expect(await header.evaluate(element => getComputedStyle(element).position)).toBe("sticky");
		await page.evaluate(() => window.scrollTo(0, 1000));
		await expect.poll(() => header.evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(0);
	}
});

test("shared action links fully brighten within 130ms", async ({ page }) => {
	await page.goto("/");
	const link = page.getByRole("link", { name: "See how mobile works" });
	await link.scrollIntoViewIfNeeded();
	const rest = await link.evaluate(element => {
		const style = getComputedStyle(element);
		return { color: style.color, duration: style.transitionDuration.split(", ").every(d => d === "0.13s") };
	});
	expect(rest).toEqual({ color: "rgb(143, 143, 143)", duration: true });
	await link.hover();
	await page.waitForTimeout(150);
	const hover = await link.evaluate(element => ({
		color: getComputedStyle(element).color,
	}));
	expect(hover).toEqual({ color: "rgb(255, 255, 255)" });
	for (const route of ["/mobile", "/docs", "/prompt"]) {
		await page.goto(route);
		const action = page.locator(".page-intro .text-link");
		expect(await action.evaluate(element => getComputedStyle(element).transitionDuration.split(", ").every(d => d === "0.13s"))).toBe(true);
	}
});

test("homepage capability selector responds to hover, focus, and keys", async ({ page }) => {
	await page.goto("/");
	const options = page.getByRole("radiogroup", { name: "Local Studio capabilities" });
	const control = options.getByRole("radio", { name: "Control" });
	const serve = options.getByRole("radio", { name: "Serve" });
	const work = options.getByRole("radio", { name: "Work" });
	await expect(control).toHaveAttribute("aria-checked", "true");
	await expect(page.locator(".story__options .story__description", { hasText: "Local and remote controllers" })).toBeVisible();
	await expect(page.locator('.story__visual[data-active-feature="Control"] img')).toHaveAttribute("src", "/images/usage-proxy.png");
	await serve.hover();
	await expect(serve).toHaveAttribute("aria-checked", "true");
	await expect(page).toHaveURL(/\/$/);
	await expect(page.locator(".story__options .story__description", { hasText: "OpenAI-compatible surface" })).toBeVisible();
	await expect(page.locator('.story__visual[data-active-feature="Serve"] img')).toHaveAttribute("src", "/images/configure-models.png");
	await serve.focus();
	await serve.press("ArrowDown");
	await expect(work).toBeFocused();
	await expect(work).toHaveAttribute("aria-checked", "true");
	await expect(page).toHaveURL(/\/$/);
	await expect(page.locator('.story__visual[data-active-feature="Work"] img')).toHaveAttribute("src", "/images/workbench-terminal.png");
	await expect(page.locator(".story__visual img")).toHaveCount(1);
});

test("tabbing reaches every story tab in order", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");
	const seen: string[] = [];
	for (let index = 0; index < 30 && seen.length < 3; index += 1) {
		await page.keyboard.press("Tab");
		const label = await page.evaluate(() => {
			const element = document.activeElement as HTMLElement;
			return element.getAttribute("role") === "radio"
				? (element.textContent ?? "").trim()
				: "";
		});
		if (label) seen.push(label);
	}
	expect(seen).toEqual(["Control", "Serve", "Work"]);
});

test("KittyLitter intro follows the stacked homepage hierarchy", async ({ page }) => {
	await page.goto("/");
	const layout = await page.locator(".kitty__intro").evaluate(element => {
		const heading = element.querySelector("h2")!.getBoundingClientRect();
		const copy = element.querySelector(".kitty__copy")!.getBoundingClientRect();
		return { stacked: copy.top >= heading.bottom, width: Math.round(element.getBoundingClientRect().width) };
	});
	expect(layout).toEqual({ stacked: true, width: 760 });
});

test("product page media is equal and fully framed", async ({ page }) => {
	await page.goto("/product");
	await page.locator('img[loading="lazy"]').last().scrollIntoViewIfNeeded();
	await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')].every(image => image.complete && image.naturalWidth > 0));
	const media = await page.locator('section[aria-label="Product capabilities"] .media-frame').evaluateAll(elements =>
		elements.map(element => Math.round(element.getBoundingClientRect().width)),
	);
	expect(media[0]).toBeGreaterThan(media[1]);
	expect(media.slice(1)).toEqual([media[1], media[1], media[1]]);
});

test("design system typography is stable", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");
	const desktop = await page.evaluate(() => {
		const body = getComputedStyle(document.body);
		const title = getComputedStyle(document.querySelector("h1")!);
		const subheadline = getComputedStyle(document.querySelector(".story h2")!);
		const feature = getComputedStyle(document.querySelector(".story__option-title")!);
		return {
			body: [body.fontFamily, body.fontSize, body.fontWeight, body.lineHeight, body.letterSpacing],
			title: [title.fontFamily, title.fontSize, title.fontWeight, title.lineHeight, title.letterSpacing],
			subheadline: [subheadline.fontSize, subheadline.fontWeight, subheadline.lineHeight, subheadline.letterSpacing],
			feature: [feature.fontSize, feature.fontWeight, feature.lineHeight, feature.letterSpacing],
		};
	});
	expect(desktop.body).toEqual([expect.stringContaining("Geist Sans"), "16px", "400", "24px", "normal"]);
	expect(desktop.title).toEqual([expect.stringContaining("Geist Sans"), "64px", "500", "64px", "-1.28px"]);
	expect(desktop.subheadline).toEqual(["42px", "500", "48px", "normal"]);
	expect(desktop.feature).toEqual(["28px", "500", "36px", "normal"]);
	await page.goto("/docs");
	const docsType = await page.evaluate(() => {
		const heading = getComputedStyle(document.querySelector(".docs-section h2")!);
		const emphasis = getComputedStyle(document.querySelector(".docs-prose strong")!);
		const code = getComputedStyle(document.querySelector(".docs-code")!);
		const sections = [...document.querySelectorAll(".docs-section")];
		return {
			heading: [heading.fontSize, heading.lineHeight, heading.fontWeight],
			emphasis: emphasis.fontWeight,
			code: [code.fontSize, code.lineHeight, code.fontWeight],
			sectionGap: Math.round(sections[1].getBoundingClientRect().top - sections[0].getBoundingClientRect().bottom),
		};
	});
	expect(docsType).toEqual({ heading: ["24px", "32px", "500"], emphasis: "500", code: ["14px", "20px", "400"], sectionGap: 80 });
	const fullWidthLayouts = await page.evaluate(() => {
		const docs = document.querySelector(".docs-layout")!.getBoundingClientRect();
		const article = document.querySelector(".docs-prose")!.getBoundingClientRect();
		return { docs: Math.round(docs.width), article: Math.round(article.width), left: Math.round(docs.left) };
	});
	expect(fullWidthLayouts).toEqual({ docs: 1240, article: 952, left: 100 });
	await page.goto("/prompt");
	const setupWidth = await page.locator('section[aria-label="Setup handoff"]').evaluate(element => Math.round(element.getBoundingClientRect().width));
	expect(setupWidth).toBe(1240);
	await page.goto("/mobile");
	const hierarchy = await page.evaluate(() => {
		const section = getComputedStyle(document.querySelector("h2")!);
		const compact = getComputedStyle(document.querySelector("h3")!);
		return {
			section: [section.fontSize, section.fontWeight, section.lineHeight, section.letterSpacing],
			compact: [compact.fontSize, compact.fontWeight, compact.lineHeight, compact.letterSpacing],
		};
	});
	expect(hierarchy.section).toEqual(["42px", "500", "48px", "normal"]);
	expect(hierarchy.compact).toEqual(["19px", "500", "28px", "normal"]);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	const mobile = await page.evaluate(() => {
		const title = getComputedStyle(document.querySelector("h1")!);
		const subheadline = getComputedStyle(document.querySelector(".story h2")!);
		return {
			title: [title.fontSize, title.lineHeight, title.letterSpacing],
			subheadline: [subheadline.fontSize, subheadline.lineHeight, subheadline.letterSpacing],
		};
	});
	expect(mobile.title).toEqual(["40px", "44px", "-0.8px"]);
	expect(mobile.subheadline).toEqual(["32px", "40px", "normal"]);
});

test("heading labels are absent", async ({ page }) => {
	for (const [route] of routes) {
		await page.goto(route);
		const findings = await page.locator("h1, h2, h3").evaluateAll(headings =>
			headings.flatMap(heading => {
				const previous = heading.previousElementSibling;
				if (!previous || !["P", "SPAN", "SMALL"].includes(previous.tagName)) return [];
				return [previous.textContent?.trim() || previous.tagName];
			}),
		);
		expect(findings, `${route} contains labels before headings`).toEqual([]);
		const transformed = await page.locator("body *").evaluateAll(elements =>
			elements.filter(element => getComputedStyle(element).textTransform === "uppercase").length,
		);
		expect(transformed, `${route} contains uppercase text treatment`).toBe(0);
	}
});

for (const width of [390, 320]) {
	test(`all routes fit ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 844 });
		for (const [route] of routes) {
			await page.goto(route);
			const sizes = await page.evaluate(() => ({
				client: document.documentElement.clientWidth,
				scroll: document.documentElement.scrollWidth,
			}));
			expect(
				sizes.scroll,
				`${route} overflows at ${width}px`,
			).toBeLessThanOrEqual(sizes.client);
		}
	});
}

test("internal navigation never leaves the local origin", async ({ page }) => {
	await page.goto("/");
	const navigation = page.getByRole("navigation", { name: "Landing navigation" });
	await expect(navigation.getByRole("link", { name: "Media", exact: true })).toHaveCount(0);
	await expect(navigation.getByRole("link", { name: "Setup", exact: true })).toHaveCount(0);
	await expect(
		navigation.getByRole("link", { name: "Company", exact: true }),
	).toHaveAttribute("href", "https://www.sybilsolutions.ai/");
	await navigation.getByRole("button", { name: /Resources/ }).hover();
	const panel = page.locator(".nav__menu-panel");
	await panel.getByRole("menuitem", { name: "Overview", exact: true }).click();
	await expect(page).toHaveURL("/resources");
	await page.goBack();
	await expect(page).toHaveURL("/");
});

test("all Local Studio links resolve locally", async ({ page }) => {
	for (const [route] of routes) {
		await page.goto(route);
		const links = await page
			.locator("a[href]")
			.evaluateAll((anchors) =>
				anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
			);
		for (const href of links) {
			const url = new URL(href);
			expect(url.hostname).not.toBe("localstudio.ai");
			if (url.origin === "http://127.0.0.1:4173") {
				const response = await page.request.get(url.href);
				expect(response.ok(), `${url.href} should load locally`).toBeTruthy();
			}
		}
	}
});

test("setup prompt copies from the floating copy icon", async ({ page, context }) => {
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.goto("/prompt");
	const icon = page.getByRole("button", { name: "Copy to clipboard" });
	await expect
		.poll(() => icon.evaluate((el) => getComputedStyle(el).opacity))
		.toBe("0");
	await page.locator(".prompt-block").hover();
	await expect
		.poll(() => icon.evaluate((el) => getComputedStyle(el).opacity))
		.toBe("1");
	const copyPath = await icon.evaluate((el) => el.querySelector("path")!.getAttribute("d"));
	await icon.click();
	await page.waitForTimeout(250);
	const checkPath = await icon.evaluate((el) => el.querySelector("path")!.getAttribute("d"));
	expect(copyPath).not.toBe(checkPath);
	await expect(page.getByRole("status")).toContainText("Copied to clipboard");
	const clipboard = await page.evaluate(() => navigator.clipboard.readText());
	expect(clipboard).toContain("Set up Local Studio completely");
});

test("unknown routes render a local not-found page", async ({ page }) => {
	await page.goto("/not-a-route");
	await expect(page).toHaveTitle("Page not found - Local Studio");
	await expect(
		page.getByRole("heading", { level: 1, name: "This page is not local." }),
	).toBeVisible();
});
