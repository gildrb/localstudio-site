import { site } from "../domain/site.ts";
import { routePaths, routes } from "../domain/route.ts";

export function sitemapXml(): string {
	const SITE_ORIGIN = site.origin;
	const urls = routePaths.map((path) => {
		const loc = `${SITE_ORIGIN}${path === "/" ? "/" : path}`;
		return [
			"  <url>",
			`    <loc>${loc}</loc>`,
			`    <lastmod>${site.lastmod}</lastmod>`,
			"    <changefreq>weekly</changefreq>",
			`    <priority>${routes[path].priority.toFixed(1)}</priority>`,
			"  </url>",
		].join("\n");
	});
	return [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...urls,
		"</urlset>",
		"",
	].join("\n");
}
