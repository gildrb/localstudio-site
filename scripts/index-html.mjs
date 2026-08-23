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
const org = { "@type": "Organization", name: company.name, url: company.url, email: company.contact, sameAs: [company.alias, company.github, company.x] };
const app = (name, url, extra) => ({ "@type": "SoftwareApplication", name, url, applicationCategory: "DeveloperApplication", ...extra });
const jsonLd = { "@context": "https://schema.org", "@graph": [
	org,
	app(studio, `${site.origin}/`, { operatingSystem: "macOS", license: "https://www.apache.org/licenses/LICENSE-2.0", downloadUrl: release.latestAlias, publisher: { "@type": "Organization", name: org.name, url: org.url } }),
	app(kitty, `${products.kittyLitter.url}/`, { operatingSystem: "iOS, Android", isRelatedTo: { "@type": "SoftwareApplication", name: studio } }),
] };
const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0a0a" />
    <meta name="description" content="${studio} by ${company.name} - local-first workstation for self-hosted LLM backends. Companion: ${kitty}." />
    <link rel="canonical" href="${site.origin}/" />
    <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
    <link rel="alternate" type="text/markdown" href="/index.md" title="Markdown homepage" />
    <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM reference" />
    <link rel="describedby" type="text/markdown" href="/llms.txt" />
    <link rel="api-catalog" href="/.well-known/api-catalog" type="application/linkset+json" />
    <link rel="preload" href="${assets.fontSans}" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="${assets.fontMono}" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="${assets.logoMesh}" as="fetch" crossorigin />
    <link rel="preload" href="${assets.logoMeshBin}" as="fetch" crossorigin />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <title>${routes["/"].title}</title>
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
