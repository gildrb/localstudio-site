import { site } from "../domain/site.ts";
import { routePaths, routes } from "../domain/route.ts";
import { markdownPage } from "./markdown-format.ts";

const SITE_ORIGIN = site.origin;

const apiLinkset = {
	linkset: [
		{
			anchor: `${SITE_ORIGIN}/`,
			"api-catalog": [
				{
					href: `${SITE_ORIGIN}/.well-known/api-catalog`,
					type: "application/linkset+json",
				},
			],
			"service-desc": [
				{
					href: `${SITE_ORIGIN}/openapi.json`,
					type: "application/vnd.oai.openapi+json;version=3.1",
				},
				{
					href: `${SITE_ORIGIN}/.well-known/agent-card.json`,
					type: "application/json",
				},
			],
			"service-doc": [
				{
					href: `${SITE_ORIGIN}/developers`,
					type: "text/html",
				},
				{
					href: `${SITE_ORIGIN}/docs`,
					type: "text/html",
				},
				{
					href: `${SITE_ORIGIN}/docs.md`,
					type: "text/markdown",
				},
				{
					href: `${SITE_ORIGIN}/llms.txt`,
					type: "text/markdown",
				},
			],
			describedby: [
				{
					href: `${SITE_ORIGIN}/llms.txt`,
					type: "text/markdown",
				},
				{
					href: `${SITE_ORIGIN}/machine`,
					type: "text/html",
				},
			],
		},
	],
};

export function sitemapMarkdown(): string {
	const rows = routePaths.map(
		(path) => `- [${path}](${SITE_ORIGIN}${path}) - ${routes[path].summary}`,
	);
	return markdownPage("Sitemap", rows.join("\n"));
}

export function apiCatalog(): string {
	const document = JSON.stringify(apiLinkset, null, 2);
	return `${document}\n`;
}

export function agentCard(): string {
	return `${JSON.stringify(
		{
			name: "Local Studio",
			description:
				"Public product site and machine-readable index for Local Studio, KittyLitter, and Codex Shim by Sybil Solutions.",
			url: `${SITE_ORIGIN}/`,
			documentationUrl: `${SITE_ORIGIN}/docs`,
			provider: {
				organization: "Sybil Solutions",
				url: site.company.url,
			},
			preferredTransport: "https",
			additionalInterfaces: [
				{ url: `${SITE_ORIGIN}/llms.txt`, type: "text/markdown" },
				{ url: `${SITE_ORIGIN}/machine`, type: "text/html" },
				{
					url: `${SITE_ORIGIN}/.well-known/api-catalog`,
					type: "application/linkset+json",
				},
			],
		},
		null,
		2,
	)}\n`;
}
