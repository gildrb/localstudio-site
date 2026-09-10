import { expect, test, type ConsoleMessage, type Route } from "@playwright/test";
import type { BrowserFixtures } from "./browser-fixtures";
import { routes, routePaths } from "../../src/domain/route";

const pages = routePaths;

test("/product redirects to the homepage", async ({ page }: BrowserFixtures) => {
	await page.goto("/product");
	await expect(page).toHaveURL(/\/$/u);
	await expect(page.getByRole("heading", { level: 1, name: routes["/"].heading })).toBeVisible();
});

test("overview omits the retired product page", async ({ page }: BrowserFixtures) => {
	await page.goto("/overview");
	await expect(page.locator('a[href="/product"]')).toHaveCount(0);
	await expect(page.locator('#this-site a[href="/"]')).toBeVisible();
});

test("/mobile redirects to the homepage mobile section", async ({ page }: BrowserFixtures) => {
	await page.goto("/mobile");
	await expect(page).toHaveURL(/\/#mobile$/u);
});

test("/agents redirects to setup", async ({ page }: BrowserFixtures) => {
	await page.goto("/agents");
	await expect(page).toHaveURL(/\/setup$/u);
});

for (const path of pages) {
	test(`${path} loads`, async ({ page }: BrowserFixtures) => {
		const errors: string[] = [];
		page.on("console", (message: Readonly<ConsoleMessage>) => {
			if (message.type() === "error") errors.push(message.text());
		});
		await page.goto(path);
		await expect(page).toHaveTitle(routes[path].title);
		await expect(page.getByRole("heading", { level: 1, name: routes[path].heading })).toBeVisible();
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
		);
		expect(overflow).toBeLessThanOrEqual(0);
		expect(errors).toEqual([]);
	});
}

test("client navigation renders routes immediately", async ({ page }: BrowserFixtures) => {
	const targets = ["/overview", "/machine", "/docs", "/setup", "/download"] as const;
	for (const target of targets) {
		await page.goto("/");
		await page.evaluate(() => {
			const root = document.querySelector("#root");
			if (!(root instanceof HTMLElement)) return;
			root.dataset["mainDropped"] = "false";
			new MutationObserver(() => {
				if (!root.querySelector("main")) root.dataset["mainDropped"] = "true";
			}).observe(root, { childList: true, subtree: true });
		});
		await page
			.locator(`a[href="${target}"]`)
			.first()
			.evaluate<void, never, HTMLAnchorElement>(
				(link: Readonly<Pick<HTMLAnchorElement, "click">>) => {
					link.click();
				},
			);
		await expect(page).toHaveURL(new RegExp(`${target}$`, "u"));
		await expect(
			page.getByRole("heading", {
				level: 1,
				name: routes[target].heading,
			}),
		).toBeVisible();
		await expect(page.locator("#root")).toHaveAttribute("data-main-dropped", "false");
	}
});

test("primary information routes need no late JavaScript", async ({ page }: BrowserFixtures) => {
	const targets = ["/setup", "/docs", "/overview"] as const;
	await page.goto("/");
	await expect(page.getByRole("heading", { level: 1, name: routes["/"].heading })).toBeVisible();
	await page.route(/\/assets\/.*\.js$/u, (route: Readonly<Pick<Route, "abort">>) => route.abort());
	for (const target of targets) {
		await page
			.locator(`a[href="${target}"]`)
			.first()
			.evaluate<void, never, HTMLAnchorElement>(
				(link: Readonly<Pick<HTMLAnchorElement, "click">>) => {
					link.click();
				},
			);
		await expect(page).toHaveURL(new RegExp(`${target}$`, "u"));
		await expect(
			page.getByRole("heading", { level: 1, name: routes[target].heading }),
		).toBeVisible();
	}
});

test("unknown routes render not-found", async ({ page }: BrowserFixtures) => {
	await page.goto("/does-not-exist");
	await expect(page).toHaveTitle("Page not found - Local Studio");
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
