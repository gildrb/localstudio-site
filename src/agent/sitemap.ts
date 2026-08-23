import { site } from "../domain/site.ts";
import { HTML_ROUTES, LASTMOD } from "./routes.ts";

export function sitemapXml(): string {
	const SITE_ORIGIN = site.origin;
	const urls = HTML_ROUTES.map((route) => {
		const loc = `${SITE_ORIGIN}${route.path === "/" ? "/" : route.path}`;
		return [
			"  <url>",
			`    <loc>${loc}</loc>`,
			`    <lastmod>${LASTMOD}</lastmod>`,
			"    <changefreq>weekly</changefreq>",
			`    <priority>${route.priority}</priority>`,
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
