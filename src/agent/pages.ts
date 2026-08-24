import { site } from "../domain/site.ts";

const navigation = `<nav aria-label="Primary"><a href="/">Local Studio</a><a href="/developers">Developers</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav>`;
const style = `<style>:root{--background:rgb(10 10 10);--foreground:rgb(237 237 237);--quiet:rgb(181 181 181);--hairline:rgb(51 51 51)}html{color-scheme:dark;background:var(--background);color:var(--foreground);font:16px/1.6 system-ui,sans-serif}body{max-width:860px;margin:0 auto;padding:32px 24px 80px}nav{display:flex;gap:20px;flex-wrap:wrap;margin-bottom:80px}a{color:var(--foreground)}h1{font-size:clamp(2.5rem,7vw,4.5rem);line-height:1.05;letter-spacing:-.04em}h2{margin-top:48px}pre{overflow:auto;padding:20px;border:1px solid var(--hairline);border-radius:12px}p,li{color:var(--quiet)}footer{margin-top:80px;padding-top:24px;border-top:1px solid var(--hairline)}</style>`;

function page(title: string, description: string, content: string): string {
	return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${description}"><link rel="canonical" href="${site.origin}/${title.toLowerCase()}"><title>${title} - Local Studio by Sybil Solutions</title>${style}</head><body>${navigation}<main><h1>${title}</h1>${content}</main><footer>Local Studio by <a href="${site.company.url}">Sybil Solutions</a> · <a href="/llms.txt">Agent reference</a> · <a href="/sitemap.xml">Sitemap</a></footer></body></html>
`;
}

export const developerHtml = page(
	"Developers",
	"Local Studio developer portal: public API, OpenAPI schema, MCP tools, authentication, errors, and quickstart examples.",
	`<p>Build agent integrations with Local Studio by Sybil Solutions. This portal describes the public, read-only product metadata API hosted on this site and points to the separate controller API that runs on each Local Studio installation. Start with the machine-readable <a href="/openapi.json">OpenAPI 3.1 specification</a> or the <a href="/.well-known/mcp">MCP Streamable HTTP endpoint</a>.</p>
<h2>Quickstart and sandbox</h2><p>The public endpoints are a safe production sandbox. They require no account, API key, or write access. Responses are JSON and may be cached. Use them to test discovery, schema ingestion, function calling, health checks, and product lookup without creating user data.</p><pre><code>curl -s ${site.origin}/api/v1/status
curl -s ${site.origin}/api/v1/products
curl -s ${site.origin}/openapi.json</code></pre>
<h2>Authentication</h2><p>No authentication is required for this site's public metadata API. Local Studio's controller is different: it binds to <code>127.0.0.1:8080</code> by default. A non-loopback controller requires <code>LOCAL_STUDIO_API_KEY</code>. Keep controller keys out of prompts, URLs, source control, and logs.</p>
<h2>Errors and limits</h2><p>API errors use JSON with a stable error code, a human-readable message, a resolution hint, and a documentation link. The public metadata surface is intentionally small and read-only. Use normal conditional requests and avoid repeated polling. No webhooks are offered by this marketing site.</p>
<h2>Agent protocols</h2><p>Function-calling clients should derive tools from <a href="/openapi.json">OpenAPI</a>. MCP clients can initialize at <code>/.well-known/mcp</code>, list tools, and call the read-only product catalog tool. Agents should also read <a href="/llms.txt">llms.txt</a>, <a href="/agents.md">agents.md</a>, and the <a href="/.well-known/api-catalog">API catalog</a>.</p>`,
);

export const aboutHtml = page(
	"About",
	"About Local Studio and Sybil Solutions, the team building local-first software for self-hosted AI.",
	`<p>Local Studio is a local-first macOS workstation made by <a href="${site.company.url}">Sybil Solutions</a>. It helps people run, manage, and use self-hosted language-model backends without turning their work into a cloud account. The product brings controllers, models, providers, a browser, files, terminals, and coding agents into one Workbench.</p>
<p>The workstation supports local and remote controllers and common inference runtimes including vLLM, SGLang, llama.cpp, and MLX. Its OpenAI-compatible proxy gives applications one surface while model execution remains under the operator's control. The desktop source is public under Apache-2.0, and signed Apple Silicon builds are published through GitHub Releases.</p>
<p>Sybil Solutions also supports KittyLitter, a native iOS and Android companion for Codex, Claude, OpenCode, Pi, and Droid, and Codex Shim, a local Responses API bridge for bring-your-own-key models. These products share one goal: useful AI software should keep infrastructure choices, credentials, files, and sessions in the user's hands.</p>
<p>This website is the canonical product and documentation index for Local Studio. Use the <a href="/docs">documentation</a> to install the workstation, the <a href="/setup">setup prompt</a> for agent-assisted installation, or the <a href="/developers">developer portal</a> for machine-readable integration resources.</p>`,
);

export const contactHtml = page(
	"Contact",
	"Contact Sybil Solutions about Local Studio support, security, partnerships, and developer integrations.",
	`<p>Contact Sybil Solutions about Local Studio at <a href="mailto:${site.company.contact}">${site.company.contact}</a>. Email is the official contact channel for product questions, responsible security reports, partnerships, developer integrations, and corrections to this website. Include “Local Studio” and a short topic in the subject so the request can be routed correctly.</p>
<p>For technical support, include the Local Studio version, macOS version, controller runtime, expected result, actual result, and the smallest safe reproduction. Remove API keys, QR pairing payloads, connection JSON, private model paths, prompts, and user files before sending logs or screenshots. Public code issues may also be reported in the relevant <a href="${site.products.localStudio.repository}">GitHub repository</a>.</p>
<p>For security reports, describe the affected component, impact, prerequisites, and reproducible steps. Do not publish active credentials or personal data. Sybil Solutions does not ask for controller keys, provider keys, KittyLitter connection payloads, or remote shell credentials by email.</p>
<p>Local Studio is an online-first product and Sybil Solutions does not publish a visitor office or telephone support line on this site. The verified organization links are the <a href="${site.company.url}">company website</a>, <a href="${site.company.github}">GitHub organization</a>, and <a href="${site.company.x}">X profile</a>. Agents should use these canonical links for identity checks.</p>`,
);

export const privacyHtml = page(
	"Privacy",
	"Privacy information for the Local Studio product website and its local-first desktop and mobile software.",
	`<p>This page explains the privacy boundary of the Local Studio product website. The site is a public documentation and download surface. It does not provide user accounts, accept model prompts, upload local files, sell personal information, or expose a hosted inference service. The public metadata API is read-only and does not require an API key.</p>
<p>Hosting and network providers may process standard request data such as IP address, user agent, requested URL, timestamp, and diagnostic logs to deliver and protect the site. Links to GitHub, Apple, Google, KittyLitter, Sybil Solutions, and social profiles lead to third-party services with their own privacy terms. This site does not control those services.</p>
<p>Local Studio itself is local-first. Models, provider credentials, Workbench files, terminal activity, and controller state remain on systems selected by the operator. A controller binds to loopback by default. Operators who enable LAN or remote access are responsible for access controls, API keys, network policy, retention, and the privacy obligations of their environment.</p>
<p>KittyLitter pairing data and connection JSON are credentials and should be treated like passwords. Do not send them through this website or include them in public issue reports. For privacy questions or requests about information sent directly to Sybil Solutions, email <a href="mailto:${site.company.contact}">${site.company.contact}</a> with enough detail to locate the communication. This notice was last updated ${site.lastmod}.</p>`,
);

export const homepagePrerender = `<main class="prerender-home"><h1>Intelligence should be owned</h1><p><strong>Local Studio by Sybil Solutions</strong> is a local-first macOS workstation for running, managing, and using self-hosted language-model backends. It connects to local or remote controllers and supports vLLM, SGLang, llama.cpp, and MLX behind one OpenAI-compatible surface.</p><p>Use one Workbench for models, providers, browser research, files, terminals, and coding agents while keeping infrastructure choices and data under your control. Local Studio is open source under Apache-2.0. Signed Apple Silicon builds are available from GitHub Releases.</p><p>KittyLitter is the native iOS and Android companion for Codex, Claude, OpenCode, Pi, and Droid. It continues the same sessions while work stays on your Mac or server. Codex Shim exposes bring-your-own-key models to Codex Desktop through a local Responses API bridge.</p><p><a href="/developers">Developer portal</a> · <a href="/openapi.json">OpenAPI specification</a> · <a href="/docs">Documentation</a> · <a href="/about">About</a> · <a href="/contact">Contact</a> · <a href="/privacy">Privacy</a> · <a href="/llms.txt">Agent instructions</a></p></main>`;

export const notFoundHtml = page(
	"Page not found",
	"The requested Local Studio page does not exist. Use the recovery links to continue.",
	`<p>The requested resource does not exist. Agents and people can recover through the <a href="/sitemap.xml">XML sitemap</a>, <a href="/sitemap.md">markdown sitemap</a>, <a href="/llms.txt">agent reference</a>, <a href="/developers">developer portal</a>, or <a href="/docs">documentation index</a>.</p>`,
);

export const notFoundMarkdown = `# 404: Page not found

The requested Local Studio resource does not exist.

- [Sitemap](/sitemap.xml)
- [Agent reference](/llms.txt)
- [Developer portal](/developers)
- [Documentation](/docs)
`;
