#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { site } from "../src/domain/site.ts";
import { routes } from "../src/domain/route.ts";
import { assets } from "../src/domain/asset.ts";
import { release } from "../src/domain/release.ts";
import { homepagePrerender } from "../src/agent/pages.ts";

const dest = `${fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "")}/index.html`;
const { company, products } = site;
const studio = products.localStudio.name;
const kitty = products.kittyLitter.name;
const org = {
	"@type": "Organization",
	name: company.name,
	description: "Software company building local-first AI products including Local Studio, KittyLitter, and Codex Shim.",
	url: company.url,
	email: company.contact,
	contactPoint: { "@type": "ContactPoint", email: company.contact, contactType: "customer support", url: `${site.origin}/contact` },
	address: { "@type": "PostalAddress", name: "Sybil Solutions (online-first organization)", url: company.url },
	sameAs: [company.alias, company.github, company.x],
};
const app = (name, url, extra) => ({ "@type": "SoftwareApplication", name, url, applicationCategory: "DeveloperApplication", ...extra });
const jsonLd = { "@context": "https://schema.org", "@graph": [
	org,
	app(studio, `${site.origin}/`, { description: "Local-first macOS workstation for running and using self-hosted language-model backends.", operatingSystem: "macOS", license: "https://www.apache.org/licenses/LICENSE-2.0", downloadUrl: release.latestAlias, publisher: { "@type": "Organization", name: org.name, url: org.url } }),
	app(kitty, `${products.kittyLitter.url}/`, { operatingSystem: "iOS, Android", isRelatedTo: { "@type": "SoftwareApplication", name: studio } }),
] };
const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0a0a" />
    <meta name="description" content="${studio} by ${company.name} - local-first workstation for self-hosted LLM backends. Companion: ${kitty}." />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${routes["/"].title} by ${company.name}" />
    <meta property="og:description" content="Local-first workstation for running and using self-hosted language-model backends." />
    <meta property="og:image" content="${site.origin}${assets.wordmark}" />
    <meta property="og:url" content="${site.origin}/" />
    <link rel="canonical" href="${site.origin}/" />
    <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
    <link rel="alternate" type="text/markdown" href="/index.md" title="Markdown homepage" />
    <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM reference" />
    <link rel="describedby" type="text/markdown" href="/llms.txt" />
    <link rel="api-catalog" href="/.well-known/api-catalog" type="application/linkset+json" />
    <link rel="preload" href="${assets.fontSans}" as="font" type="font/woff2" crossorigin />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <style>.prerender-home{box-sizing:border-box;max-width:1240px;min-height:100svh;margin:auto;padding:clamp(140px,18svh,208px) 24px 96px;background:#0a0a0a;color:#ededed;font:16px/1.6 system-ui,sans-serif}.prerender-home h1{max-width:900px;margin:0 0 40px;font-size:clamp(40px,7vw,112px);line-height:1.05;letter-spacing:-.05em}.prerender-home p{max-width:760px;color:#a1a1a1}.prerender-home a{color:#ededed}</style>
    <title>${routes["/"].title} by ${company.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <noscript id="static-fallback">${homepagePrerender}</noscript>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
const command = process.argv[2] ?? "write";
if (command === "write") {
	writeFileSync(dest, body);
	console.log("wrote index.html");
} else if (command === "check") {
	if (readFileSync(dest, "utf8") !== body) {
		console.error("index.html is stale; run pnpm index:html");
		process.exit(1);
	}
	console.log("index.html ok");
} else {
	console.error(`unknown command: ${command}`);
	process.exit(1);
}
