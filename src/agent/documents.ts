import { robotsTxt } from "./robots.ts";
import { sitemapXml } from "./sitemap.ts";
import { machineText } from "./machine.ts";
import { site } from "../domain/site.ts";
import { documentPaths, docsPath, machinePath, markdownPathFor, routes } from "../domain/route.ts";
import {
	agentCard,
	apiCatalog,
	docsMarkdown,
	downloadMarkdown,
	indexMarkdown,
	llmsFull,
	llmsTxt,
	markdownDocument,
	markdownPage,
	productMarkdown,
	promptMarkdown,
	resourcesMarkdown,
	sitemapMarkdown,
} from "./markdown.ts";

type AgentDocument = {
	readonly path: string;
	readonly body: string;
	readonly contentType: string;
};

export const HOMEPAGE_LINK_HEADER = [
	`</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
	`<${site.origin}/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
	`</llms.txt>; rel="describedby"; type="text/markdown"`,
	`</index.md>; rel="alternate"; type="text/markdown"`,
	`<${docsPath}>; rel="service-doc"; type="text/html"`,
	`<${docsPath}.md>; rel="service-doc"; type="text/markdown"`,
	`</.well-known/agent-card.json>; rel="service-desc"; type="application/json"`,
	`</sitemap.xml>; rel="describedby"; type="application/xml"`,
	`<${site.origin}/>; rel="canonical"; type="text/html"`,
].join(", ");

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
		{ path: "/docs.md", body: docsMarkdown(), contentType: markdown },
		{ path: "/setup.md", body: promptMarkdown(), contentType: markdown },
		{ path: "/overview.md", body: resourcesMarkdown(), contentType: markdown },
		{ path: "/download.md", body: downloadMarkdown(), contentType: markdown },
		...documentPaths().map((path) => ({
			path,
			body: markdownDocument(path),
			contentType: markdown,
		})),
		{
			path: "/machine.md",
			body: markdownPage(routes[machinePath].title, machineText()),
			contentType: markdown,
		},
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

export { markdownPathFor };

export function wantsMarkdown(acceptHeader: string): boolean {
	return (
		acceptHeader.includes("text/markdown") &&
		!acceptHeader.includes("text/html")
	);
}

export function markdownTokenCount(body: string): string {
	return String(Math.max(1, Math.ceil(body.length / 4)));
}
