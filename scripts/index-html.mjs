#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { site } from "../src/domain/site.ts";
import { routes } from "../src/domain/route.ts";
import { assets } from "../src/domain/asset.ts";
import { release } from "../src/domain/release.ts";

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
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
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
    <title>${routes["/"].title} by ${company.name}</title>
  </head>
  <body>
    <div id="root"></div>
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
