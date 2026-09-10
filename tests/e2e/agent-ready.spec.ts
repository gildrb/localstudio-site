import { expect, test } from "@playwright/test";
import * as v from "valibot";
import type { BrowserFixtures } from "./browser-fixtures";

import { routePaths } from "../../src/domain/route";

const pages = routePaths;

test("robots.txt is plain text with crawl rules, AI bots, sitemap, and content signals", async ({
	request,
}: BrowserFixtures<"request">) => {
	const response = await request.get("/robots.txt");
	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toMatch(/text\/plain/u);
	const body = await response.text();
	expect(body).toContain("User-agent: *");
	expect(body).toContain("Allow: /");
	expect(body).toContain("Content-Signal: search=yes, ai-input=yes, ai-train=yes");
	expect(body).toContain("User-agent: GPTBot");
	expect(body).toContain("User-agent: OAI-SearchBot");
	expect(body).toContain("User-agent: Claude-Web");
	expect(body).toContain("User-agent: Google-Extended");
	expect(body).toContain("User-agent: Amazonbot");
	expect(body).toContain("User-agent: anthropic-ai");
	expect(body).toContain("User-agent: Bytespider");
	expect(body).toContain("User-agent: CCBot");
	expect(body).toContain("User-agent: Applebot-Extended");
	expect(body).toContain("Sitemap: https://localstudio.ai/sitemap.xml");
});

test("sitemap.xml lists canonical HTML routes", async ({ request }: BrowserFixtures<"request">) => {
	const response = await request.get("/sitemap.xml");
	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toMatch(/xml/u);
	const body = await response.text();
	expect(body).toContain("<urlset");
	for (const path of pages) {
		const loc = path === "/" ? "https://localstudio.ai/" : `https://localstudio.ai${path}`;
		expect(body).toContain(`<loc>${loc}</loc>`);
	}
});

test("homepage sends RFC 8288 Link headers for agent discovery", async ({
	request,
}: BrowserFixtures<"request">) => {
	const response = await request.get("/");
	expect(response.status()).toBe(200);
	const link = response.headers()["link"] ?? "";
	expect(link).toContain('rel="api-catalog"');
	expect(link).toContain("/.well-known/api-catalog");
	expect(link).toContain('rel="describedby"');
	expect(link).toContain("/llms.txt");
	expect(link).toContain('rel="service-doc"');
	expect(link).toContain("/docs");
});

test("Accept text/markdown returns markdown for HTML routes", async ({
	request,
}: BrowserFixtures<"request">) => {
	for (const path of pages) {
		const response = await request.get(path, {
			headers: { Accept: "text/markdown" },
		});
		expect(response.status(), path).toBe(200);
		expect(response.headers()["content-type"], path).toMatch(/text\/markdown/u);
		expect(response.headers()["x-markdown-tokens"], path).toMatch(/^[1-9]\d*$/u);
		const body = await response.text();
		expect(body.length, path).toBeGreaterThan(80);
		expect(body, path).toContain("Sybil Solutions");
	}
});

test("markdown twins and discovery files are served as markdown or catalog types", async ({
	request,
}: BrowserFixtures<"request">) => {
	const markdown = await request.get("/llms.txt");
	expect(markdown.status()).toBe(200);
	expect(markdown.headers()["content-type"]).toMatch(/text\/markdown/u);
	const llms = await markdown.text();
	expect(llms).toContain("Local Studio");
	expect(llms).toContain("KittyLitter");
	expect(llms).toContain("Codex Shim");

	const catalog = await request.get("/.well-known/api-catalog");
	expect(catalog.status()).toBe(200);
	expect(catalog.headers()["content-type"]).toMatch(/linkset\+json/u);
	expect(await catalog.text()).toContain("https://localstudio.ai/");

	const card = await request.get("/.well-known/agent-card.json");
	expect(card.status()).toBe(200);
	expect(await card.text()).toContain("Sybil Solutions");
});

test("machine page names the company and both featured products", async ({
	page,
}: BrowserFixtures) => {
	await page.goto("/machine");
	const text = await page.locator("[data-page-focus]").innerText();
	expect(text).toContain("Sybil Solutions");
	expect(text).toContain("Local Studio");
	expect(text).toContain("KittyLitter");
	expect(text).toContain("Codex Shim");
	expect(text).toContain("https://www.sybilsolutions.ai/");
	expect(text).toContain("https://github.com/sybil-solutions/local-studio");
	expect(text).toContain("https://kittylitter.app");
	expect(text).toContain("Alleycat");
	expect(text).toContain("vLLM");
});

test("raw homepage is useful without JavaScript and links developer resources", async ({
	request,
}: BrowserFixtures<"request">) => {
	const response = await request.get("/");
	const html = await response.text();
	const body = html.match(/<body>([\s\S]+?)<\/body>/u)?.[1] ?? "";
	const text = body
		.replaceAll(/<(script|style|template)[^>]*>[\s\S]*?<\/\1>/gu, " ")
		.replaceAll(/<[^>]+>/gu, " ")
		.replaceAll(/\s+/gu, " ")
		.trim();
	expect(body).toContain("<h1");
	expect(text.length).toBeGreaterThan(500);
	expect(body).toContain('href="/developers"');
	expect(body).toContain('href="/openapi.json"');
});

test("developer and trust pages are server-visible", async ({
	request,
}: BrowserFixtures<"request">) => {
	for (const path of ["/developers", "/about", "/contact", "/privacy"]) {
		const response = await request.get(path);
		expect(response.status(), path).toBe(200);
		expect(response.headers()["content-type"], path).toContain("text/html");
		const body = await response.text();
		expect(body, path).toContain("<h1>");
		expect(body.replaceAll(/<[^>]+>/gu, " ").length, path).toBeGreaterThan(500);
	}
});

test("OpenAPI and public REST endpoints are reachable", async ({
	request,
}: BrowserFixtures<"request">) => {
	const schema = await request.get("/openapi.json");
	expect(schema.status()).toBe(200);
	expect(schema.headers()["content-type"]).toContain("application/json");
	const schemaBody = v.parse(v.object({ openapi: v.string() }), await schema.json());
	expect(schemaBody.openapi).toBe("3.1.0");
	const status = await request.get("/api/v1/status");
	expect(status.status()).toBe(200);
	const statusBody = v.parse(v.object({ status: v.string() }), await status.json());
	expect(statusBody.status).toBe("ok");
	const products = await request.get("/api/v1/products");
	const productsBody = v.parse(v.object({ products: v.array(v.unknown()) }), await products.json());
	expect(productsBody.products).toHaveLength(3);
	const missing = await request.get("/api/v1/missing");
	expect(missing.status()).toBe(404);
	const missingBody = v.parse(
		v.object({ error: v.object({ resolution: v.unknown() }) }),
		await missing.json(),
	);
	expect(missingBody.error.resolution).toBeTruthy();
});

test("markdown 404 gives agents recovery links", async ({
	request,
}: BrowserFixtures<"request">) => {
	const response = await request.get("/path-that-does-not-exist", {
		headers: { Accept: "text/markdown" },
	});
	expect(response.status()).toBe(404);
	expect(response.headers()["content-type"]).toContain("text/markdown");
	const body = await response.text();
	expect(body).toContain("/sitemap.xml");
	expect(body).toContain("/llms.txt");
	expect(body).toContain("/developers");
});
