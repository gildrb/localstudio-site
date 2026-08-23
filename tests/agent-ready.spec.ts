import { expect, test } from "@playwright/test";

import { routePaths } from "../src/domain/route";

const pages = routePaths;

test("robots.txt is plain text with crawl rules, AI bots, sitemap, and content signals", async ({
	request,
}) => {
	const response = await request.get("/robots.txt");
	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toMatch(/text\/plain/);
	const body = await response.text();
	expect(body).toContain("User-agent: *");
	expect(body).toContain("Allow: /");
	expect(body).toContain(
		"Content-Signal: search=yes, ai-input=yes, ai-train=yes",
	);
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

test("sitemap.xml lists canonical HTML routes", async ({ request }) => {
	const response = await request.get("/sitemap.xml");
	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toMatch(/xml/);
	const body = await response.text();
	expect(body).toContain("<urlset");
	for (const path of pages) {
		const loc =
			path === "/"
				? "https://localstudio.ai/"
				: `https://localstudio.ai${path}`;
		expect(body).toContain(`<loc>${loc}</loc>`);
	}
});

test("homepage sends RFC 8288 Link headers for agent discovery", async ({
	request,
}) => {
	const response = await request.get("/");
	expect(response.status()).toBe(200);
	const link = response.headers().link ?? "";
	expect(link).toContain('rel="api-catalog"');
	expect(link).toContain("/.well-known/api-catalog");
	expect(link).toContain('rel="describedby"');
	expect(link).toContain("/llms.txt");
	expect(link).toContain('rel="service-doc"');
	expect(link).toContain("/docs");
});

test("Accept text/markdown returns markdown for HTML routes", async ({
	request,
}) => {
	for (const path of pages) {
		const response = await request.get(path, {
			headers: { Accept: "text/markdown" },
		});
		expect(response.status(), path).toBe(200);
		expect(response.headers()["content-type"], path).toMatch(/text\/markdown/);
		expect(response.headers()["x-markdown-tokens"], path).toMatch(/^[1-9]\d*$/);
		const body = await response.text();
		expect(body.length, path).toBeGreaterThan(80);
		expect(body, path).toContain("Sybil Solutions");
	}
});

test("markdown twins and discovery files are served as markdown or catalog types", async ({
	request,
}) => {
	const markdown = await request.get("/llms.txt");
	expect(markdown.status()).toBe(200);
	expect(markdown.headers()["content-type"]).toMatch(/text\/markdown/);
	const llms = await markdown.text();
	expect(llms).toContain("Local Studio");
	expect(llms).toContain("KittyLitter");
	expect(llms).toContain("Codex Shim");

	const catalog = await request.get("/.well-known/api-catalog");
	expect(catalog.status()).toBe(200);
	expect(catalog.headers()["content-type"]).toMatch(/linkset\+json/);
	expect(await catalog.text()).toContain("https://localstudio.ai/");

	const card = await request.get("/.well-known/agent-card.json");
	expect(card.status()).toBe(200);
	expect(await card.text()).toContain("Sybil Solutions");
});

test("machine page names the company and both featured products", async ({
	page,
}) => {
	await page.goto("/machine");
	const text = await page.locator(".machine").innerText();
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
