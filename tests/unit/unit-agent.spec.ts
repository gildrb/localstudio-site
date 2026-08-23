import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import {
	HOMEPAGE_LINK_HEADER,
	agentDocument,
	agentDocuments,
	markdownTokenCount,
	wantsMarkdown,
} from "../../src/agent/documents";
import { markdownPages, routePaths } from "../../src/domain/route";
import { site } from "../../src/domain/site";
import { productFeatures, renderInlineMarkdown } from "../../src/content/product";
import { productMarkdown } from "../../src/agent/markdown";

test("robots and sitemap stay deterministic", () => {
	const robots = agentDocument("/robots.txt");
	expect(robots?.contentType).toMatch(/text\/plain/);
	expect(robots?.body).toContain("User-agent: *");
	expect(robots?.body).toContain("Allow: /");
	expect(robots?.body).toContain("Sitemap: https://localstudio.ai/sitemap.xml");
	expect(robots?.body).toContain("User-agent: GPTBot");

	const sitemap = agentDocument("/sitemap.xml");
	expect(sitemap?.contentType).toMatch(/xml/);
	for (const path of routePaths) {
		const loc = path === "/" ? `${site.origin}/` : `${site.origin}${path}`;
		expect(sitemap?.body).toContain(`<loc>${loc}</loc>`);
	}
});

test("every HTML route has a markdown twin", () => {
	const twins = markdownPages();
	for (const path of routePaths) {
		const markdownPath = twins.get(path);
		expect(markdownPath, path).toBeDefined();
		const document = agentDocument(markdownPath ?? "");
		expect(document?.contentType, path).toMatch(/text\/markdown/);
		expect(document?.body.length, path).toBeGreaterThan(80);
		expect(document?.body, path).toContain("Sybil Solutions");
	}
});

test("discovery documents and Accept negotiation are shared", () => {
	expect(wantsMarkdown("text/markdown")).toBe(true);
	expect(wantsMarkdown("text/html,text/markdown")).toBe(false);
	expect(markdownTokenCount("abcd")).toBe("1");
	expect(HOMEPAGE_LINK_HEADER).toContain('rel="api-catalog"');
	expect(HOMEPAGE_LINK_HEADER).toContain("/.well-known/api-catalog");
	expect(HOMEPAGE_LINK_HEADER).toContain("/llms.txt");

	const llms = agentDocument("/llms.txt");
	expect(llms?.body).toContain("Local Studio");
	expect(llms?.body).toContain("KittyLitter");
	expect(agentDocument("/.well-known/api-catalog")?.contentType).toMatch(
		/linkset\+json/,
	);
	expect(agentDocument("/.well-known/agent-card.json")?.body).toContain(
		"Sybil Solutions",
	);
	expect(agentDocuments().map((document) => document.path)).toContain(
		"/machine.md",
	);
});

test("product markdown is generated from canonical feature prose", () => {
	const body = productMarkdown();
	for (const feature of productFeatures) {
		expect(body).toContain(feature.productTitle);
		expect(body).toContain(renderInlineMarkdown(feature.productText));
	}
});

test("vercel headers match agent document content types", () => {
	const body = readFileSync("vercel.json", "utf8");
	expect(body).toContain(`"value": "${agentDocument("/robots.txt")?.contentType}"`);
	expect(body).toContain(`"value": "${agentDocument("/sitemap.xml")?.contentType}"`);
	expect(body).toContain(`"value": "${agentDocument("/llms.txt")?.contentType}"`);
	expect(body).toContain(
		`"value": "${agentDocument("/.well-known/api-catalog")?.contentType}"`,
	);
	expect(body).toContain(
		`"value": "${agentDocument("/.well-known/agent-card.json")?.contentType}"`,
	);
});
