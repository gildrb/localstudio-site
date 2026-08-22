import { expect, test } from "@playwright/test";

const routes = [
	["/", "Intelligence should be owned - Local Studio", "Intelligence should be owned"],
	["/product", "Product - Local Studio", "One place to run local AI"],
	["/mobile", "Mobile - Local Studio", "Your local agents"],
	["/docs", "Documentation - Local Studio", "Get Local Studio running"],
	["/setup", "Setup - Local Studio", "Give this to any coding model"],
	["/agents", "Agents - Local Studio", "Set up the stack"],
	["/download", "Download for macOS - Local Studio", "Download for macOS"],
	["/overview", "Overview - Local Studio", "Everything around Local Studio"],
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
		if (["/mobile", "/docs", "/setup", "/agents"].includes(route)) {
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
		await expect(actions.getByRole("link", { name: "Download for macOS" })).toHaveAttribute("href", "/download");
		await expect(actions.getByRole("link", { name: "Setup prompt" })).toHaveAttribute("href", "/setup");
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
		const showcaseTop = html(".story__showcase").getBoundingClientRect().top;
		const kittyHeading = html(".kitty h2").getBoundingClientRect();
		return {
			borders: [".hero", ".story"].map((selector) => getComputedStyle(html(selector)).borderBottomWidth),
			firstGap: Math.round(showcaseTop - hero.bottom),
			secondGap: Math.round(kittyHeading.top - showcase.bottom),
		};
	});
	expect(boundaries).toEqual({ borders: ["0px", "0px"], firstGap: 240, secondGap: 240 });
});

test("homepage hero reveals a live DOM demonstration", async ({ page }) => {
	test.setTimeout(60_000);
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/", { waitUntil: "domcontentloaded" });
	await expect(page.locator(".signal, .macbook-scroll, .hero__macbook, .hero__screenshot, .hero canvas, .hero video")).toHaveCount(0);
	const gradient = page.locator(".hero__gradient");
	const stage = page.locator(".hero__stage");
 const demo = page.locator(".hero .demo:not(.hero__demo-placeholder)");
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
		const inline = (el: HTMLElement) => el.style.opacity;
		return {
			markInTitle: title.contains(markRoot),
			identity: [inline(title), inline(actions)],
			atmosphere: [inline(stage), inline(gradient)],
			textNodeTransforms: [getComputedStyle(title).transform, getComputedStyle(lead).transform],
			texture: document.querySelectorAll(".hero__texture").length,
		};
	});
	expect(entrance.markInTitle).toBe(true);
	expect(entrance.identity).toEqual(["1", "1"]);
	expect(entrance.atmosphere).toEqual(["1", "1"]);
	expect(entrance.textNodeTransforms).toEqual(["none", "none"]);
	expect(entrance.texture).toBe(0);
	await expect(stage).toHaveCSS("opacity", "1");
	await expect(gradient).toHaveCSS("opacity", "1");
	await expect(demo).toBeVisible();
	await expect(demo).toHaveAttribute("data-phase", "done", { timeout: 30000 });
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
		const demoBounds = html(".hero .demo").getBoundingClientRect();
		const code = html(".hero .demo .chat-markdown");
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
 await expect(demo).toBeVisible();
	await expect(stage).toHaveCSS("opacity", "1");
	const mobile = await page.evaluate(() => {
		function html(selector: string): HTMLElement {
			const element = document.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		const demoBounds = html(".hero .demo").getBoundingClientRect();
		const gradientBounds = html(".hero__gradient").getBoundingClientRect();
		const heroBottom = html(".hero").getBoundingClientRect().bottom;
		return {
			gap: Math.round(html(".hero__stage").getBoundingClientRect().top - html(".hero__copy").getBoundingClientRect().bottom),
			widths: [Math.round(gradientBounds.width), Math.round(demoBounds.width)],
			bottomOffsets: [Math.round(heroBottom - gradientBounds.bottom), Math.round(heroBottom - html(".hero__stage").getBoundingClientRect().bottom)],
			overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
		};
	});
	expect(mobile).toEqual({ gap: 56, widths: [390, 366], bottomOffsets: [0, 28], overflow: 0 });
	await page.emulateMedia({ reducedMotion: "reduce" });
 await page.goto("/", { waitUntil: "domcontentloaded" });
 await expect(demo).toBeVisible();
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
			phase: html(".hero .demo").dataset.phase,
			output: html(".hero .demo .chat-markdown").textContent,
		};
	});
	expect(reduced).toMatchObject({ stage: ["1", "none"], gradient: "1", phase: "done" });
	expect(reduced.output).toContain("Ready for you");
	expect(reduced.output).toContain("Lake District");
});

test("mobile sections follow the hairline section system", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/mobile");
	const desktop = await page.locator(".page-section").evaluateAll((sections) => {
		function child(root: Element, selector: string): HTMLElement {
			const element = root.querySelector(selector);
			if (!(element instanceof HTMLElement)) throw new Error(selector);
			return element;
		}
		return sections.map((section, index) => {
			const heading = child(section, "h2").getBoundingClientRect();
			const previous = index > 0 ? sections[index - 1].getBoundingClientRect() : null;
			return {
				border: getComputedStyle(section).borderTopWidth,
				left: Math.round(heading.left),
				gap: previous ? Math.round(heading.top - previous.bottom) : null,
			};
		});
	});
	expect(desktop).toEqual([
		{ border: "0px", left: 24, gap: null },
		{ border: "1px", left: 24, gap: 121 },
		{ border: "1px", left: 24, gap: 121 },
	]);
	await expect(page.locator('[aria-labelledby="security-title"] ul + div')).toHaveCount(0);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/mobile");
	const mobileGaps = await page.locator(".page-section").evaluateAll((sections) => {
		return sections.slice(1).map((section, index) => {
			const heading = section.querySelector("h2");
			if (!(heading instanceof HTMLElement)) throw new Error("h2");
			return Math.round(heading.getBoundingClientRect().top - sections[index].getBoundingClientRect().bottom);
		});
	});
	expect(mobileGaps).toEqual([65, 65]);
});

test("mobile section typography and copy spacing match Agents", async ({ page }) => {
	for (const viewport of [
		{ width: 1440, height: 900 },
		{ width: 390, height: 844 },
	]) {
		await page.setViewportSize(viewport);
		await page.goto("/agents");
		const reference = await page.locator(".page-section").first().evaluate((section) => {
			const copy = section.firstElementChild;
			const heading = copy?.querySelector("h2");
			const description = copy?.querySelector("p");
			if (!(copy instanceof HTMLElement) || !(heading instanceof HTMLElement) || !(description instanceof HTMLElement)) {
				throw new Error("Agents section copy");
			}
			const copyBounds = copy.getBoundingClientRect();
			const headingBounds = heading.getBoundingClientRect();
			const descriptionBounds = description.getBoundingClientRect();
			const headingStyle = getComputedStyle(heading);
			const descriptionStyle = getComputedStyle(description);
			return {
				width: Math.round(copyBounds.width),
				gap: Math.round(descriptionBounds.top - headingBounds.bottom),
				heading: [headingStyle.fontSize, headingStyle.lineHeight, headingStyle.fontWeight],
				description: [descriptionStyle.fontSize, descriptionStyle.lineHeight, descriptionStyle.fontWeight],
			};
		});

		await page.goto("/mobile");
		const mobileSections = await page.locator(".page-section").evaluateAll((sections) =>
			sections.map((section) => {
				const copy = section.firstElementChild;
				const heading = copy?.querySelector("h2");
				const description = copy?.querySelector("p");
				if (!(copy instanceof HTMLElement) || !(heading instanceof HTMLElement) || !(description instanceof HTMLElement)) {
					throw new Error("Mobile section copy");
				}
				const copyBounds = copy.getBoundingClientRect();
				const headingBounds = heading.getBoundingClientRect();
				const descriptionBounds = description.getBoundingClientRect();
				const headingStyle = getComputedStyle(heading);
				const descriptionStyle = getComputedStyle(description);
				return {
					width: Math.round(copyBounds.width),
					gap: Math.round(descriptionBounds.top - headingBounds.bottom),
					heading: [headingStyle.fontSize, headingStyle.lineHeight, headingStyle.fontWeight],
					description: [descriptionStyle.fontSize, descriptionStyle.lineHeight, descriptionStyle.fontWeight],
				};
			}),
		);
		expect(mobileSections).toEqual(Array(3).fill(reference));
	}
});

test("mobile page keeps stable gutters, type, and actions at narrow widths", async ({ page }) => {
	for (const width of [390, 320]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto("/mobile");
		const sections = await page.locator(".page-section").evaluateAll((elements) => {
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

test("shared navbar always uses a contained dark blur", async ({ page }) => {
	for (const route of ["/", "/docs", "/setup", "/agents"]) {
		await page.goto(route);
		const header = page.locator("header.nav");
		expect(await header.evaluate(element => getComputedStyle(element).position)).toBe("sticky");
		const surface = await header.evaluate(element => ({
			headerBackground: getComputedStyle(element).backgroundColor,
			headerFilter: getComputedStyle(element).backdropFilter,
			overlayBackground: getComputedStyle(element, "::before").backgroundColor,
			overlayFilter: getComputedStyle(element, "::before").backdropFilter,
		}));
		expect(surface).toEqual({
			headerBackground: "rgba(0, 0, 0, 0)",
			headerFilter: "none",
			overlayBackground: "rgba(0, 0, 0, 0.64)",
			overlayFilter: "blur(24px) brightness(0.7)",
		});
		await page.locator("footer").scrollIntoViewIfNeeded();
		await expect.poll(() => header.evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(0);
		expect(await header.evaluate(element => [
			getComputedStyle(element, "::before").backgroundColor,
			getComputedStyle(element, "::before").backdropFilter,
		])).toEqual([surface.overlayBackground, surface.overlayFilter]);
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
	expect(rest).toEqual({ color: "rgb(122, 122, 122)", duration: true });
	await link.hover();
	await page.waitForTimeout(150);
	const hover = await link.evaluate(element => ({
		color: getComputedStyle(element).color,
	}));
	expect(hover).toEqual({ color: "rgb(255, 255, 255)" });
	for (const route of ["/mobile", "/docs", "/setup"]) {
		await page.goto(route);
		const action = page.locator(".page-intro .text-link");
		expect(await action.evaluate(element => getComputedStyle(element).transitionDuration.split(", ").every(d => d === "0.13s"))).toBe(true);
	}
});

test("homepage capability story keeps active copy centered and progresses quickly", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");
	const showcase = page.locator(".story__showcase");
	const items = page.locator(".story__option");
	await showcase.evaluate((element) => {
		document.documentElement.style.scrollBehavior = "auto";
		const navHeight =
			Number.parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
			) || 72;
		window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - navHeight);
	});
	await expect(items.nth(0)).toHaveAttribute("aria-current", "step");
	await expect(page.locator('.story__visual[data-active-feature="Control"] .demo')).toHaveAttribute(
		"data-scene",
		"control",
	);
	const pacing = await showcase.evaluate((element) => {
		const sticky = element.querySelector(".story__sticky");
		const story = element.closest(".story");
		const active = element.querySelector(".story__option.is-active");
		const optionsWindow = element.querySelector(".story__options-window");
		if (
			!(sticky instanceof HTMLElement) ||
			!(story instanceof HTMLElement) ||
			!(active instanceof HTMLElement) ||
			!(optionsWindow instanceof HTMLElement)
		) {
			throw new Error("story geometry");
		}
		const optionsBox = optionsWindow.getBoundingClientRect();
		const activeBox = active.getBoundingClientRect();
		return {
			activeOffset: Math.abs(
				activeBox.top + activeBox.height / 2 - (optionsBox.top + optionsBox.height / 2),
			),
			sceneViewportShare:
				(element.getBoundingClientRect().height - sticky.offsetHeight) /
				(element.querySelectorAll(".story__option").length * sticky.offsetHeight),
			storyPageShare:
				story.offsetHeight / (document.documentElement.scrollHeight - window.innerHeight),
		};
	});
	expect(pacing.activeOffset).toBeLessThanOrEqual(2);
	expect(pacing.sceneViewportShare).toBeLessThanOrEqual(0.55);
	expect(pacing.storyPageShare).toBeGreaterThanOrEqual(0.5);
	expect(pacing.storyPageShare).toBeLessThanOrEqual(0.61);
	await showcase.evaluate((element) => {
		const navHeight =
			Number.parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
			) || 72;
		const sticky = element.querySelector(".story__sticky");
		if (!(sticky instanceof HTMLElement)) throw new Error("story sticky");
		const sceneSpan = (element.getBoundingClientRect().height - sticky.offsetHeight) / 5;
		const top = window.scrollY + element.getBoundingClientRect().top;
		window.scrollTo(0, top - navHeight + sceneSpan * 1.1);
	});
	await expect(items.nth(1)).toHaveAttribute("aria-current", "step");
	await expect
		.poll(async () =>
			items.nth(1).evaluate((element) => {
				const optionsWindow = document.querySelector(".story__options-window");
				const control = document.querySelectorAll(".story__option")[0];
				if (!(optionsWindow instanceof HTMLElement) || !(control instanceof HTMLElement)) {
					throw new Error("story positions");
				}
				const optionsBox = optionsWindow.getBoundingClientRect();
				const serveBox = element.getBoundingClientRect();
				return {
					centerOffset: Math.round(
						Math.abs(
							serveBox.top +
								serveBox.height / 2 -
								(optionsBox.top + optionsBox.height / 2),
						),
					),
					controlAbove: control.getBoundingClientRect().bottom <= serveBox.top + 1,
				};
			}),
		)
		.toEqual({ centerOffset: 0, controlAbove: true });
	await showcase.evaluate((element) => {
		const navHeight =
			Number.parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
			) || 72;
		const sticky = element.querySelector(".story__sticky");
		if (!(sticky instanceof HTMLElement)) throw new Error("story sticky");
		const sceneSpan = (element.getBoundingClientRect().height - sticky.offsetHeight) / 5;
		const top = window.scrollY + element.getBoundingClientRect().top;
		window.scrollTo(0, top - navHeight + sceneSpan * 2.1);
	});
	await expect(items.nth(2)).toHaveAttribute("aria-current", "step");
	await expect(page.locator('.story__visual[data-active-feature="Work"] .demo')).toHaveAttribute(
		"data-scene",
		"work",
	);
	await expect(page).toHaveURL(/\/$/);
});

test("story exposes five ordered scroll steps without manual controls", async ({ page }) => {
	await page.goto("/");
	const options = page.locator(".story__options");
	await expect(options.locator(".story__option")).toHaveCount(5);
	expect(await options.locator(".story__option-title").allTextContents()).toEqual([
		"Control",
		"Serve",
		"Work",
		"Automate",
		"Configure",
	]);
	expect(
		await options.evaluate((element) =>
			[...element.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")].filter(
				(candidate) => candidate instanceof HTMLElement && candidate.tabIndex >= 0,
			).length,
		),
	).toBe(0);
});

test("demo internals stay out of the tab order", async ({ page }) => {
 await page.setViewportSize({ width: 1440, height: 900 });
 await page.goto("/");
 await page.locator(".story__visual").scrollIntoViewIfNeeded();
 await expect(page.locator(".story__visual .demo[data-scene]")).toBeVisible();
 const tabStops = await page.evaluate(() => {
  const count = (selector: string) => {
   const root = document.querySelector(selector);
   if (!root) return -1;
   return [...root.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")].filter(
    (element) => element instanceof HTMLElement && element.tabIndex >= 0,
   ).length;
  };
  return [count(".hero .demo"), count(".story__visual .demo[data-scene]")];
 });
 expect(tabStops).toEqual([0, 0]);
});
test("mobile story stays pinned while scroll reveals every capability", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	const showcase = page.locator(".story__showcase");
	const items = page.locator(".story__option");
	await showcase.evaluate((element) => {
		document.documentElement.style.scrollBehavior = "auto";
		const navHeight =
			Number.parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
			) || 72;
		window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - navHeight);
	});
	await expect(items.nth(0)).toHaveAttribute("aria-current", "step");
	const pinned = await page.evaluate(() => {
		const root = document.documentElement;
		const sticky = document.querySelector(".story__sticky");
		const visual = document.querySelector(".story__visual");
		if (!(sticky instanceof HTMLElement) || !(visual instanceof HTMLElement)) return null;
		const navHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue("--nav-height")) || 72;
		const stickyBox = sticky.getBoundingClientRect();
		const visualBox = visual.getBoundingClientRect();
		return {
			position: getComputedStyle(sticky).position,
			atNav: Math.abs(stickyBox.top - navHeight) < 2,
			fillsStage: Math.abs(stickyBox.height - (window.innerHeight - navHeight)) < 2,
			inGutter: visualBox.left >= 20 && visualBox.right <= window.innerWidth - 20,
		};
	});
	expect(pinned).toEqual({
		position: "sticky",
		atNav: true,
		fillsStage: true,
		inGutter: true,
	});
	await showcase.evaluate((element) => {
		const navHeight =
			Number.parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
			) || 72;
		const top = window.scrollY + element.getBoundingClientRect().top;
		const sticky = element.querySelector(".story__sticky");
		if (!(sticky instanceof HTMLElement)) throw new Error("story sticky");
		const sceneSpan = (element.getBoundingClientRect().height - sticky.offsetHeight) / 5;
		window.scrollTo(0, top - navHeight + sceneSpan * 3.1);
	});
	await expect(items.nth(3)).toHaveAttribute("aria-current", "step");
	const demo = page.locator('.story__visual[data-active-feature="Automate"] .demo');
	await expect(demo).toHaveAttribute("data-scene", "automate");
	await expect(demo.getByRole("heading", { name: "Automations" })).toBeVisible();
	await expect(demo.getByText("Lake District packing reminder")).toBeVisible();
	const transform = await demo.locator(".demo__app").evaluate((element) => {
		if (!(element instanceof HTMLElement)) return "";
		return element.style.transform;
	});
	expect(transform.startsWith("scale(")).toBe(true);
	expect(transform.includes("translate(-224px, 0px)")).toBe(true);
	await showcase.evaluate((element) => {
		const navHeight =
			Number.parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
			) || 72;
		const top = window.scrollY + element.getBoundingClientRect().top;
		const sticky = element.querySelector(".story__sticky");
		if (!(sticky instanceof HTMLElement)) throw new Error("story sticky");
		const sceneSpan = (element.getBoundingClientRect().height - sticky.offsetHeight) / 5;
		window.scrollTo(0, top - navHeight + sceneSpan * 4.1);
	});
	await expect(items.nth(4)).toHaveAttribute("aria-current", "step");
	await expect(page.locator('.story__visual[data-active-feature="Configure"] .demo')).toHaveAttribute(
		"data-scene",
		"configure",
	);
	await page.locator(".kitty").scrollIntoViewIfNeeded();
	await expect(page.getByRole("heading", { name: "Leave the desk. Keep the session." })).toBeVisible();
});

test("KittyLitter focuses on three core benefits", async ({ page }) => {
	await page.goto("/");
	const features = page.locator(".kitty__feature");
	await expect(features).toHaveCount(3);
	await expect(features.getByRole("heading").allTextContents()).resolves.toEqual([
		"Sessions everywhere",
		"Multi-agent",
		"Alleycat",
	]);
	const columns = await page.locator(".kitty__grid").evaluate((element) =>
		getComputedStyle(element).gridTemplateColumns.split(" "),
	);
	expect(columns).toHaveLength(3);
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
	await page.goto("/setup");
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
		"Sybil Solutions",
		"GitHub",
	]);
	await expect(
		panel.getByRole("menuitem", { name: "Overview", exact: true }),
	).toHaveAttribute("href", "/overview");
	await expect(
		panel.getByRole("menuitem", { name: "Documentation", exact: true }),
	).toHaveAttribute("href", "/docs");
	await expect(
		panel.getByRole("menuitem", { name: "Setup", exact: true }),
	).toHaveAttribute("href", "/setup");
	await expect(panel.getByRole("menuitem", { name: "Download", exact: true })).toHaveCount(0);
	await panel.getByRole("menuitem", { name: "Overview", exact: true }).click();
	await expect(page).toHaveURL("/overview");
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
	await page.goto("/setup");
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
	await page.goto("/setup");
	const overflow = await page.locator(".prompt-block pre").evaluate((element) => ({
		size: element.scrollWidth - element.clientWidth,
		wrap: getComputedStyle(element).overflowWrap,
	}));
	expect(overflow.size).toBeLessThanOrEqual(0);
});

test("setup and agent prompts share the Show more interaction", async ({ page }) => {
	for (const prompt of [
		{ route: "/setup", label: "Portable setup prompt" },
		{ route: "/agents", label: "Agent setup instructions" },
	]) {
		await page.goto(prompt.route);
		const block = page.getByRole("region", { name: prompt.label });
		const pre = block.locator("pre");
		const toggle = block.getByRole("button", { name: "Show more" });
		await expect(toggle).toHaveAttribute("aria-expanded", "false");
		expect(await pre.evaluate((element) => getComputedStyle(element).overflowY)).toBe("hidden");
		const collapsed = await pre.evaluate((element) => element.clientHeight);
		await toggle.click();
		await expect(block.getByRole("button", { name: "Show less" })).toHaveAttribute(
			"aria-expanded",
			"true",
		);
		const grown = await pre.evaluate((element) => element.clientHeight);
		expect(grown).toBeGreaterThan(collapsed);
	}

	await page.goto("/agents");
	const agentPrompt = page.getByRole("region", { name: "Agent setup instructions" });
	await expect(agentPrompt.locator(":scope > div")).toHaveCount(0);
});

test("unknown routes render a local not-found page", async ({ page }) => {
	await page.goto("/not-a-route");
	await expect(page).toHaveTitle("Page not found - Local Studio");
	await expect(
		page.getByRole("heading", { level: 1, name: "This page is not local" }),
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
