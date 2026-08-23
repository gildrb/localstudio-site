import { robotsTxt } from "./robots.ts";
import { sitemapXml } from "./sitemap.ts";
export { HTML_ROUTES, LASTMOD, type HtmlRoute, type HtmlRoutePath } from "./routes.ts";
import { release } from "../domain/release.ts";
import { site } from "../domain/site.ts";

export type AgentDocument = {
	readonly path: string;
	readonly body: string;
	readonly contentType: string;
};

export const SITE_ORIGIN = site.origin;
export { machineSections, machineText, type MachineSection } from "./machine.ts";

export const DOWNLOAD = release;

export const HOMEPAGE_LINK_HEADER = [
	`</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
	`<${SITE_ORIGIN}/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
	`</llms.txt>; rel="describedby"; type="text/markdown"`,
	`</index.md>; rel="alternate"; type="text/markdown"`,
	`</docs>; rel="service-doc"; type="text/html"`,
	`</docs.md>; rel="service-doc"; type="text/markdown"`,
	`</.well-known/agent-card.json>; rel="service-desc"; type="application/json"`,
	`</sitemap.xml>; rel="describedby"; type="application/xml"`,
	`<${SITE_ORIGIN}/>; rel="canonical"; type="text/html"`,
].join(", ");

import { machineText } from "./machine.ts";
import {
	markdownPage, llmsTxt, indexMarkdown, productMarkdown, mobileMarkdown, docsMarkdown, promptMarkdown, agentsMarkdown, resourcesMarkdown, downloadMarkdown, servicesMarkdown, peopleMarkdown, showcaseMarkdown, faqMarkdown, sitemapMarkdown, apiCatalog, agentCard, llmsFull
} from "./markdown.ts";
export function agentDocuments(): readonly AgentDocument[] {
	const markdown = "text/markdown; charset=utf-8";
	const llms = llmsTxt();
	return [
		{
			path: "/robots.txt",
			body: robotsTxt(),
			contentType: "text/plain; charset=utf-8",
		},
		{
			path: "/sitemap.xml",
			body: sitemapXml(),
			contentType: "application/xml; charset=utf-8",
		},
		{ path: "/sitemap.md", body: sitemapMarkdown(), contentType: markdown },
		{ path: "/llms.txt", body: llms, contentType: markdown },
		{ path: "/llms-full.txt", body: llmsFull(), contentType: markdown },
		{ path: "/index.md", body: indexMarkdown(), contentType: markdown },
		{ path: "/product.md", body: productMarkdown(), contentType: markdown },
		{ path: "/mobile.md", body: mobileMarkdown(), contentType: markdown },
		{ path: "/docs.md", body: docsMarkdown(), contentType: markdown },
		{ path: "/setup.md", body: promptMarkdown(), contentType: markdown },
		{ path: "/agents.md", body: agentsMarkdown(), contentType: markdown },
		{ path: "/overview.md", body: resourcesMarkdown(), contentType: markdown },
		{
			path: "/download.md",
			body: downloadMarkdown(),
			contentType: markdown,
		},
		{
			path: "/machine.md",
			body: markdownPage("Machine-readable index", machineText()),
			contentType: markdown,
		},
		{ path: "/services.md", body: servicesMarkdown(), contentType: markdown },
		{ path: "/people.md", body: peopleMarkdown(), contentType: markdown },
		{ path: "/showcase.md", body: showcaseMarkdown(), contentType: markdown },
		{ path: "/faq.md", body: faqMarkdown(), contentType: markdown },
		{ path: "/.well-known/llms.txt", body: llms, contentType: markdown },
		{
			path: "/.well-known/api-catalog",
			body: apiCatalog(),
			contentType: "application/linkset+json; charset=utf-8",
		},
		{
			path: "/.well-known/agent-card.json",
			body: agentCard(),
			contentType: "application/json; charset=utf-8",
		},
	];
}

export function agentDocument(path: string): AgentDocument | null {
	return agentDocuments().find((document) => document.path === path) ?? null;
}

export { markdownPathFor } from "../domain/route.ts";

export function wantsMarkdown(acceptHeader: string): boolean {
	return (
		acceptHeader.includes("text/markdown") &&
		!acceptHeader.includes("text/html")
	);
}

export function markdownTokenCount(body: string): string {
	return String(Math.max(1, Math.ceil(body.length / 4)));
}
