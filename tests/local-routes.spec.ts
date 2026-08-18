import { expect, test } from "@playwright/test";

const routes = [
	["/", "Local intelligence. - Local Studio", "Intelligence should not be rented"],
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
		const geometry = await intro.evaluate((element) => {
			const headingNode = element.querySelector("h1");
			if (!(headingNode instanceof HTMLElement)) throw new Error("h1");
			const style = getComputedStyle(element);
			const heading = getComputedStyle(headingNode);
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
	const verticalCenter = await page.locator(".final-callout").evaluate((element) => {
		const section = element.getBoundingClientRect();
		const child = element.firstElementChild;
		if (!(child instanceof HTMLElement)) throw new Error("content");
		const content = child.getBoundingClientRect();
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
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const hero = html(".hero").getBoundingClientRect();
		const intro = html(".story__intro").getBoundingClientRect();
		const showcase = html(".story__showcase").getBoundingClientRect();
		const kittyHeading = html(".kitty h2").getBoundingClientRect();
		return {
			borders: [".hero", ".story"].map((selector) => getComputedStyle(html(selector)).borderBottomWidth),
			firstGap: Math.round(intro.top - hero.bottom),
			secondGap: Math.round(kittyHeading.top - showcase.bottom),
		};
	});
	expect(boundaries).toEqual({ borders: ["0px", "0px"], firstGap: 240, secondGap: 240 });
});

test("homepage hero reveals a live DOM demonstration", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/", { waitUntil: "domcontentloaded" });
	await expect(page.locator(".signal, .macbook-scroll, .hero__macbook, .hero__screenshot, .hero canvas, .hero video")).toHaveCount(0);
	const gradient = page.locator(".hero__gradient");
	const stage = page.locator(".hero__stage");
	const demo = page.locator(".demo");
	await stage.waitFor({ state: "attached" });
	await expect.poll(() => gradient.evaluate((element: HTMLElement) => element.style.opacity), { timeout: 5000 }).toBe("1");
	const entrance = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const markRoot = html(".hero__mark").closest(".hero__mark-button");
		if (!(markRoot instanceof HTMLElement)) throw new Error(".hero__mark-button");
		const title = html(".hero h1");
		const actions = html(".hero__actions");
		const stage = html(".hero__stage");
		const gradient = html(".hero__gradient");
		const lead = html(".story__intro p");
		const texture = html(".hero__texture");
		const inline = (el: HTMLElement) => el.style.opacity;
		return {
			identity: [inline(markRoot), inline(title), inline(actions)],
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
	await expect(demo).toBeVisible();
	await expect(demo).toHaveAttribute("data-phase", "done", { timeout: 15000 });
	await expect(demo.locator(".chat-markdown")).toHaveCount(1);
	await expect(demo.getByText("New task").first()).toBeVisible();
	const layout = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const hero = html(".hero").getBoundingClientRect();
		const gradientElement = html(".hero__gradient");
		const gradientBounds = gradientElement.getBoundingClientRect();
		const copy = html(".hero__copy").getBoundingClientRect();
		const stageBounds = html(".hero__stage").getBoundingClientRect();
		const demoBounds = html(".demo").getBoundingClientRect();
		const code = html(".demo .chat-markdown");
		return {
			gap: Math.round(stageBounds.top - copy.bottom),
			widths: [Math.round(gradientBounds.width), Math.round(stageBounds.width), Math.round(demoBounds.width)],
			bottomOffsets: [Math.round(hero.bottom - gradientBounds.bottom), Math.round(hero.bottom - stageBounds.bottom)],
			selectable: getComputedStyle(code).userSelect,
			neutral: !getComputedStyle(gradientElement).backgroundImage.includes("8, 9, 10"),
		};
	});
	expect(layout).toMatchObject({ gap: 72, widths: [1440, 1392, 1392], bottomOffsets: [0, 40], selectable: "text", neutral: true });
	const documentTop = await stage.evaluate(element => Math.round(element.getBoundingClientRect().top + scrollY));
	await page.evaluate(() => globalThis.scrollTo(0, 500));
	await page.waitForTimeout(100);
	expect(await stage.evaluate(element => Math.round(element.getBoundingClientRect().top + scrollY))).toBe(documentTop);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/", { waitUntil: "domcontentloaded" });
	await expect(stage).toHaveCSS("opacity", "1");
	const mobile = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const demoBounds = html(".demo").getBoundingClientRect();
		const gradientBounds = html(".hero__gradient").getBoundingClientRect();
		const heroBottom = html(".hero").getBoundingClientRect().bottom;
		return {
			gap: Math.round(html(".hero__stage").getBoundingClientRect().top - html(".hero__copy").getBoundingClientRect().bottom),
			widths: [Math.round(gradientBounds.width), Math.round(demoBounds.width)],
			bottomOffsets: [Math.round(heroBottom - gradientBounds.bottom), Math.round(heroBottom - html(".hero__stage").getBoundingClientRect().bottom)],
			overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
		};
	});
	expect(mobile).toEqual({ gap: 56, widths: [390, 342], bottomOffsets: [0, 28], overflow: 0 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/", { waitUntil: "domcontentloaded" });
	await stage.waitFor({ state: "attached" });
	const reduced = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const stage = html(".hero__stage");
		return {
			stage: [getComputedStyle(stage).opacity, getComputedStyle(stage).transform],
			gradient: getComputedStyle(html(".hero__gradient")).opacity,
			grid: getComputedStyle(html(".hero__texture"), "::before").animationName,
			phase: html(".demo").dataset.phase,
			output: html(".demo .chat-markdown").textContent,
		};
	});
	expect(reduced).toMatchObject({ stage: ["1", "none"], gradient: "1", grid: "none", phase: "done" });
	expect(reduced.output).toContain("What I changed");
	expect(reduced.output).toContain("Qwen3.8-27B");
});

test("mobile sections stack their hierarchy without separators", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/mobile");
	const desktop = await page.locator(".mobile-section").evaluateAll((sections) => {
		function child(root: Element, selector: string): HTMLElement {
			const element = root.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		return sections.map((section, index) => {
			const heading = child(section, "h2").getBoundingClientRect();
			const description = child(section, "p").getBoundingClientRect();
			const previous = index > 0 ? sections[index - 1].getBoundingClientRect() : null;
			return { border: getComputedStyle(section).borderTopWidth, aligned: Math.round(heading.left) === Math.round(description.left), gap: previous ? Math.round(heading.top - previous.bottom) : null };
		});
	});
	expect(desktop).toEqual([
		{ border: "0px", aligned: true, gap: null },
		{ border: "0px", aligned: true, gap: 120 },
		{ border: "0px", aligned: true, gap: 120 },
	]);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/mobile");
	const mobileGaps = await page.locator(".mobile-section").evaluateAll((sections) => {
		return sections.slice(1).map((section, index) => {
			const heading = section.querySelector("h2");
			if (!(heading instanceof HTMLElement)) throw new Error("h2");
			return Math.round(heading.getBoundingClientRect().top - sections[index].getBoundingClientRect().bottom);
		});
	});
	expect(mobileGaps).toEqual([80, 80]);
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/mobile");
	const shieldAlignment = await page.locator('[aria-labelledby="security-title"]').evaluate((section) => {
		const shieldNode = section.querySelector("ul + div");
		if (!(shieldNode instanceof HTMLElement)) throw new Error("shield");
		const shield = shieldNode.getBoundingClientRect();
		const bounds = section.getBoundingClientRect();
		return { right: Math.round(bounds.right - shield.right), followsList: Boolean(section.querySelector("ul + div")) };
	});
	expect(shieldAlignment).toEqual({ right: 0, followsList: true });
});

test("mobile page keeps stable gutters, type, and actions at narrow widths", async ({ page }) => {
	for (const width of [390, 320]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto("/mobile");
		const sections = await page.locator(".mobile-section").evaluateAll((elements) => {
			function child(root: Element, selector: string): HTMLElement {
				const element = root.querySelector(selector);
				if (!(element instanceof HTMLElement)) throw new Error(selector);
				return element;
			}
			return elements.map((element) => {
				const bounds = element.getBoundingClientRect();
				const heading = getComputedStyle(child(element, "h2"));
				return {
					left: Math.round(bounds.left),
					width: Math.round(bounds.width),
					heading: [heading.fontSize, heading.lineHeight],
				};
			});
		});
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
		expect(actions).toHaveLength(2);
		for (const group of actions) {
			expect(group.links).toHaveLength(2);
			expect(group.links[0][2]).toBeGreaterThanOrEqual(48);
			expect(group.links[1][2]).toBeGreaterThanOrEqual(48);
			expect(group.links[1][0]).toBeGreaterThan(group.links[0][0]);
			expect(group.gap).toBeLessThanOrEqual(0);
		}
		const store = page.locator(".page-intro .button-group, .page-cta .button-group");
		await expect(store.getByRole("link", { name: "Download on App Store" })).toHaveCount(2);
		await expect(store.getByRole("link", { name: "Download on Google Play" })).toHaveCount(2);
		await expect(store.getByRole("link", { name: "Download on App Store" }).first()).toHaveAttribute(
			"href",
			"https://apps.apple.com/us/app/kittylitter/id6759521788",
		);
		await expect(store.getByRole("link", { name: "Download on Google Play" }).first()).toHaveAttribute(
			"href",
			"https://play.google.com/store/apps/details?id=com.sigkitten.litter.android",
		);
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
	const radios = page.locator('.story__options [role="radio"]');
	await expect(radios).toHaveCount(3);
	await expect(radios).toHaveText(["Control", "Serve", "Work"]);
	await radios.nth(0).focus();
	await page.keyboard.press("ArrowDown");
	await expect(radios.nth(1)).toBeFocused();
});

test("KittyLitter intro follows the stacked homepage hierarchy", async ({ page }) => {
	await page.goto("/");
	const intro = page.locator(".kitty__intro");
	const layout = await intro.evaluate((element) => {
		function child(root: Element, selector: string): HTMLElement {
			const node = root.querySelector(selector);
			if (!(node instanceof HTMLElement)) throw new Error(selector);
			return node;
		}
		const section = element.closest("section");
		if (!(section instanceof HTMLElement)) throw new Error("section");
		const heading = child(element, "h2").getBoundingClientRect();
		const copy = child(element, ".kitty__copy").getBoundingClientRect();
		const box = element.getBoundingClientRect();
		return {
			stacked: copy.top >= heading.bottom,
			width: Math.round(box.width),
			align: getComputedStyle(element).textAlign,
			pinnedRight: Math.abs(box.right - section.getBoundingClientRect().right) <= 1,
		};
	});
	expect(layout).toEqual({ stacked: true, width: 760, align: "right", pinnedRight: true });
	await expect(intro.getByRole("link")).toHaveCount(1);
	await expect(intro.getByRole("link", { name: "See how mobile works" })).toHaveAttribute("href", "/mobile");
	await expect(page.getByRole("link", { name: "Download on App Store" })).toHaveCount(0);
	await expect(page.getByRole("link", { name: "Download on Google Play" })).toHaveCount(0);
	await expect(page.getByRole("link", { name: "Get KittyLitter" })).toHaveCount(0);
});

test("product page media is equal and fully framed", async ({ page }) => {
	await page.goto("/product");
	await page.locator('img[loading="lazy"]').last().scrollIntoViewIfNeeded();
	await page.waitForFunction(() =>
		[...document.querySelectorAll('img[loading="lazy"]')].every(
			(image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
		),
	);
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
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const body = getComputedStyle(document.body);
		const title = getComputedStyle(html("h1"));
		const subheadline = getComputedStyle(html(".story h2"));
		const feature = getComputedStyle(html(".story__option-title"));
		return {
			body: [body.fontFamily, body.fontSize, body.fontWeight, body.lineHeight, body.letterSpacing],
			title: [title.fontFamily, title.fontSize, title.fontWeight, title.lineHeight, title.letterSpacing],
			subheadline: [subheadline.fontSize, subheadline.fontWeight, subheadline.lineHeight, subheadline.letterSpacing],
			feature: [feature.fontSize, feature.fontWeight, feature.lineHeight, feature.letterSpacing],
		};
	});
	expect(desktop.body).toEqual([expect.stringContaining("Geist Sans"), "16px", "400", "24px", "normal"]);
	expect(desktop.title).toEqual([expect.stringContaining("Geist Sans"), "70px", "500", "78px", "-1.4px"]);
	expect(desktop.subheadline).toEqual(["42px", "500", "48px", "normal"]);
	expect(desktop.feature).toEqual(["28px", "500", "36px", "normal"]);
	await page.goto("/docs");
	const docsType = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const heading = getComputedStyle(html(".docs-section h2"));
		const emphasis = getComputedStyle(html(".docs-prose strong"));
		const code = getComputedStyle(html(".docs-code"));
		const sections = [...document.querySelectorAll(".docs-section")];
		const first = sections[0];
		const second = sections[1];
		if (!(first instanceof HTMLElement) || !(second instanceof HTMLElement)) throw new Error("docs-section");
		return {
			heading: [heading.fontSize, heading.lineHeight, heading.fontWeight],
			emphasis: emphasis.fontWeight,
			code: [code.fontSize, code.lineHeight, code.fontWeight],
			sectionGap: Math.round(second.getBoundingClientRect().top - first.getBoundingClientRect().bottom),
		};
	});
	expect(docsType).toEqual({ heading: ["24px", "32px", "500"], emphasis: "500", code: ["14px", "20px", "400"], sectionGap: 80 });
	const fullWidthLayouts = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const docs = html(".docs-layout").getBoundingClientRect();
		const article = html(".docs-prose").getBoundingClientRect();
		return { docs: Math.round(docs.width), article: Math.round(article.width), left: Math.round(docs.left) };
	});
	expect(fullWidthLayouts).toEqual({ docs: 1392, article: 1104, left: 24 });
	await page.goto("/prompt");
	const setupWidth = await page.locator('section[aria-label="Setup handoff"]').evaluate(element => Math.round(element.getBoundingClientRect().width));
	expect(setupWidth).toBe(1392);
	await page.goto("/mobile");
	const hierarchy = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const section = getComputedStyle(html("h2"));
		const compact = getComputedStyle(html("h3"));
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
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const title = html("h1");
		const subheadline = getComputedStyle(html(".story h2"));
		const titleStyle = getComputedStyle(title);
		return {
			lines: Math.round(title.getBoundingClientRect().height / Number.parseFloat(titleStyle.lineHeight)),
			wrap: titleStyle.whiteSpace,
			titleSize: [titleStyle.fontSize, titleStyle.lineHeight],
			subheadline: [subheadline.fontSize, subheadline.lineHeight, subheadline.letterSpacing],
		};
	});
	expect(mobile.lines).toBeLessThanOrEqual(2);
	expect(mobile.wrap).toBe("normal");
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
			elements.filter(element =>
				!element.closest(".demo") &&
				getComputedStyle(element).textTransform === "uppercase",
			).length,
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
	await expect.poll(async () => panel.getByRole("menuitem").allTextContents()).toEqual([
		"Overview",
		"Documentation",
		"Setup",
		"Agents",
		"Mobile",
	]);
	await expect(panel.getByRole("menuitem", { name: "GitHub", exact: true })).toHaveCount(0);
	await expect(panel.getByRole("menuitem", { name: "Download", exact: true })).toHaveCount(0);
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
			.evaluateAll((anchors: HTMLAnchorElement[]) =>
				anchors.map((anchor) => anchor.href),
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
	const copyPath = await icon.evaluate((el) => {
		const path = el.querySelector("path");
		if (path === null) throw new Error("path");
		return path.getAttribute("d");
	});
	await icon.click();
	await page.waitForTimeout(250);
	const checkPath = await icon.evaluate((el) => {
		const path = el.querySelector("path");
		if (path === null) throw new Error("path");
		return path.getAttribute("d");
	});
	expect(copyPath).not.toBe(checkPath);
	await expect(page.getByRole("status")).toContainText("Copied to clipboard");
	const clipboard = await page.evaluate(() => navigator.clipboard.readText());
	expect(clipboard).toContain("Set up Local Studio completely");
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/prompt");
	const overflow = await page.locator(".prompt-block pre").evaluate((element) => ({
		size: element.scrollWidth - element.clientWidth,
		wrap: getComputedStyle(element).overflowWrap,
	}));
	expect(overflow.size).toBeLessThanOrEqual(0);
});

test("unknown routes render a local not-found page", async ({ page }) => {
	await page.goto("/not-a-route");
	await expect(page).toHaveTitle("Page not found - Local Studio");
	await expect(
		page.getByRole("heading", { level: 1, name: "This page is not local." }),
	).toBeVisible();
});

test("machine page stays in the viewport and only scrolls vertically", async ({ page }) => {
	for (const size of [
		{ width: 320, height: 568 },
		{ width: 390, height: 844 },
		{ width: 1440, height: 900 },
	]) {
		await page.setViewportSize(size);
		await page.goto("/machine");
		const layout = await page.locator(".machine__inner").evaluate((inner: HTMLElement) => {
			const banner = inner.querySelector(".machine__banner");
			if (!(banner instanceof HTMLElement)) throw new Error("banner");
			const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
			const style = getComputedStyle(banner);
			const rect = banner.getBoundingClientRect();
			const box = inner.getBoundingClientRect();
			const nav = document.querySelector("header");
			if (!(nav instanceof HTMLElement)) throw new Error("header");
			const navBox = nav.getBoundingClientRect();
			return {
				overflow,
				bannerAlign: style.textAlign,
				bannerHeight: rect.height,
				innerWidth: box.width,
				asciiLines: banner.querySelector("pre")?.textContent?.split("\n").length ?? 0,
				asciiMark: banner.querySelector("pre")?.textContent?.includes("█████") ?? false,
				belowNav: rect.top >= navBox.bottom,
				containerCentered: Math.abs(box.left + box.width / 2 - window.innerWidth / 2) <= 2,
				bannerFits: banner.scrollWidth <= banner.clientWidth + 1,
			};
		});
		expect(layout.overflow, `${size.width} overflow`).toBeLessThanOrEqual(0);
		expect(layout.asciiLines, `${size.width} ascii`).toBe(16);
		expect(layout.asciiMark, `${size.width} mark`).toBe(true);
		expect(layout.bannerAlign, `${size.width} align`).toBe("left");
		expect(layout.belowNav, `${size.width} below nav`).toBe(true);
		expect(layout.containerCentered, `${size.width} container`).toBe(true);
		expect(layout.bannerFits, `${size.width} fit`).toBe(true);
		expect(layout.bannerHeight, `${size.width} stacked`).toBeGreaterThan(80);
		if (size.width >= 1440) expect(layout.innerWidth, "desktop width").toBeGreaterThan(700);
	}
});
