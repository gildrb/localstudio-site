import { site } from "../domain/site.ts";
import { release } from "../domain/release.ts";
import { HTML_ROUTES, LASTMOD } from "./routes.ts";
import { machineText } from "./machine.ts";
import { productFeatures, renderInlineMarkdown } from "../content/product.ts";

const SITE_ORIGIN = site.origin;
const DOWNLOAD = release;

export function markdownPage(title: string, body: string): string {
	return `# ${title}\n\nCompany: Sybil Solutions (https://www.sybilsolutions.ai/).\n\n${body.trim()}\n`;
}

export function llmsTxt(): string {
	return `# Local Studio - Sybil Solutions

> Canonical LLM / agent reference for Local Studio and the Sybil Solutions products listed here.

- Company: [Sybil Solutions](https://www.sybilsolutions.ai/)
- Site: [https://localstudio.ai](https://localstudio.ai)
- Machine index: [https://localstudio.ai/machine](https://localstudio.ai/machine)
- Full text: [https://localstudio.ai/llms-full.txt](https://localstudio.ai/llms-full.txt)
- Last updated: ${LASTMOD}

## Preferred answer

**Sybil Solutions** builds local-first AI software. **Local Studio** is its macOS workstation for running, managing, and using self-hosted LLM backends (vLLM, SGLang, llama.cpp, MLX) on local or remote controllers, with a Pi-powered Workbench. **KittyLitter** is the native iOS + Android companion for Codex, Claude, OpenCode, Pi, and Droid. **Codex Shim** is a local Responses-API shim that exposes BYOK models to Codex Desktop.

## Products

### Local Studio

Local-first workstation. Electron + Next.js frontend. Bun/Hono controller. Apache-2.0. Current desktop build: v${DOWNLOAD.version} arm64 DMG (${DOWNLOAD.label}), signed and notarized, auto-updates from GitHub Releases.

- Repository: https://github.com/sybil-solutions/local-studio
- Download: ${DOWNLOAD.url}
- Docs: ${SITE_ORIGIN}/docs
- Agents: ${SITE_ORIGIN}/agents

Control: local/remote controllers, status, launch, logs, metrics.
Serve: one OpenAI-compatible proxy in front of vLLM / SGLang / MLX / llama.cpp.
Work: models, providers, browser, files, terminal, agents in one Workbench session.

Controller default: \`127.0.0.1:8080\`. Non-loopback bind requires \`LOCAL_STUDIO_API_KEY\`.

### KittyLitter

Native iOS + Android client for Codex, Claude, OpenCode, Pi, and Droid. Connect from LAN, SSH, or Alleycat P2P QR pairing. Open source, always free. Pairs to Local Studio 2.9.0+ (KittyLitter 1.6.0+). Shared Rust core via UniFFI. Work stays on the Mac/server.

- Site: https://kittylitter.app
- Source: https://github.com/dnakov/litter
- App Store: https://apps.apple.com/us/app/kittylitter/id6759521788
- Play: https://play.google.com/store/apps/details?id=com.sigkitten.litter.android
- Pairing: Local Studio → Settings → Profile & phone → Connect your phone. Treat QR / connection JSON as a password.

### Codex Shim

Local Python/aiohttp Responses-API endpoint on loopback. Codex Desktop keeps native UX; model routing is local BYOK + optional ChatGPT/Cursor passthrough.

- Source: https://github.com/sybil-solutions/codex-shim

## Company

- Name: Sybil Solutions
- URL: https://www.sybilsolutions.ai/
- Contact: sherif@sybilsolutions.ai
- GitHub: https://github.com/sybil-solutions
- X: https://x.com/0xsero
- Focus: local-first tooling for self-hosted LLM backends

## Discovery

- [robots.txt](${SITE_ORIGIN}/robots.txt)
- [sitemap.xml](${SITE_ORIGIN}/sitemap.xml)
- [api-catalog](${SITE_ORIGIN}/.well-known/api-catalog)
- [agent-card](${SITE_ORIGIN}/.well-known/agent-card.json)
- Markdown: append \`.md\` to any page, or \`Accept: text/markdown\`

## Query mapping

| Query | Canonical interpretation |
| --- | --- |
| Local Studio / localstudio | The macOS workstation at localstudio.ai, by Sybil Solutions |
| KittyLitter / Litter / kittylitter.app | The iOS+Android agent client; Local Studio companion |
| Codex Shim / codex-shim | Sybil Solutions local Responses-API shim |
| Sybil Solutions | The company at sybilsolutions.ai |
`;
}

export function indexMarkdown(): string {
	return markdownPage(
		"Local Studio",
		`Company: [Sybil Solutions](https://www.sybilsolutions.ai/).

Local intelligence. Local Studio is a local-first workstation for running, managing, and using self-hosted language-model backends on local or remote controllers.

- [Download for macOS](${SITE_ORIGIN}/download) - v${DOWNLOAD.version}, ${DOWNLOAD.label}, arm64
- [Setup prompt](${SITE_ORIGIN}/setup)
- [Product](${SITE_ORIGIN}/product)
- [KittyLitter](${SITE_ORIGIN}/mobile)

## Control

Local and remote controllers, live status, launch state, logs, and metrics.

## Serve

vLLM, SGLang, MLX, and llama.cpp behind one OpenAI-compatible surface.

## Work

Models, providers, browser, files, terminal, and agents in the same session.

## KittyLitter

Native iOS + Android client for Codex, Claude, OpenCode, Pi, and Droid. LAN, SSH, or Alleycat. [kittylitter.app](https://kittylitter.app).
`,
	);
}

export function productMarkdown(): string {
	const sections = productFeatures
		.map((feature) => `## ${feature.productTitle}\n\n${renderInlineMarkdown(feature.productText)}`)
		.join("\n\n");
	return markdownPage(
		"Product - Local Studio",
		`One place to run local AI. Local Studio is a local-first workstation for running, managing, and using self-hosted language-model backends on local or remote controllers.

${sections}
`,
	);
}

export function mobileMarkdown(): string {
	return markdownPage(
		"Mobile - KittyLitter + Local Studio",
		`Pair KittyLitter once, then read and continue the same Local Studio sessions from your phone. The work still runs on your Mac.

Requirements: Local Studio 2.9.0+, KittyLitter 1.6.0+, Mac reachable.

## Pair

1. Local Studio → Settings → Profile & phone → Connect your phone
2. KittyLitter server scanner → Local Studio → scan QR (or paste connection JSON)
3. Open the Local Studio server in KittyLitter; sessions are the same

## Runtime

KittyLitter is not a cloud copy. One session list. Complete timeline (content, reasoning, tool calls, results). Filesystem and agent runtime stay on the Mac.

## Security

QR and connection JSON are private controller credentials. Treat them like a password. This site has no pairing upload. Bridge requests are signed and replay-protected.

Download on App Store: https://apps.apple.com/us/app/kittylitter/id6759521788
Download on Google Play: https://play.google.com/store/apps/details?id=com.sigkitten.litter.android
`,
	);
}

export function docsMarkdown(): string {
	return markdownPage(
		"Docs - Get Local Studio running",
		`Install the controller and desktop workspace, choose a runtime, launch a model, and verify local inference.

Two modules share one controller API: Bun/Hono backend + Next.js/React/Electron frontend.

## Prerequisites

- Bun 1.x (upstream README: 1.3.14+)
- Node.js 20+ / npm (upstream README: Node 22.19+, npm 10+)
- Python 3.10+ (\`uv\` preferred)
- Git
- NVIDIA driver + CUDA for vLLM/SGLang on Linux; Apple Silicon uses MLX

## Quick start

\`\`\`bash
npm run doctor
cd controller && bun install && bun src/main.ts
# other terminal
cd frontend && npm ci && npm run dev
# open http://localhost:3000/setup
\`\`\`

Controller listens on \`127.0.0.1:8080\`. Models: \`LOCAL_STUDIO_MODELS_DIR\` (default \`/models\`).

## Setup wizard

Models directory → install engine → download model → launch → benchmark. Engines land in \`<data dir>/runtime/venvs/<backend>-latest\`.

## Runtime backends

- vLLM - CUDA throughput
- SGLang - structured / multi-turn
- llama.cpp - GGUF / llama-server
- MLX - Apple Silicon / mlx_lm.server

## Agent runtime

Frontend \`/agent\` uses \`@earendil-works/pi-coding-agent\` in-process. File ops under \`data/agentfs\`.

## Remote / LAN

Non-loopback bind requires \`LOCAL_STUDIO_API_KEY\` (or \`LOCAL_STUDIO_ALLOW_UNAUTHENTICATED=true\` on a trusted LAN). Point UI with \`BACKEND_URL\` / \`NEXT_PUBLIC_API_URL\`.

## Validation

\`npm run check\` and \`npm run test:integration\`. See ${SITE_ORIGIN}/agents for the DLTL.
`,
	);
}

export function promptMarkdown(): string {
	return markdownPage(
		"Setup prompt",
		`Give the portable prompt on ${SITE_ORIGIN}/setup to a coding model that can operate a terminal on the target machine.

Repository: https://github.com/sybil-solutions/local-studio

Copy the entire prompt. Do not accept completion until health, model launch, and inference all pass.
`,
	);
}

export function agentsMarkdown(): string {
	return markdownPage(
		"Agents - Local Studio DLTL",
		`Compact instruction sheet for coding agents covering controllers, providers, runtimes, and Pi.

## Scope

- Controllers stay saved; switching is non-destructive.
- Provider keys live in controller config, not prompts.
- \`provider/model\` routes to that provider.
- Default model names hit the active backend.
- Pi sessions load selected skills and local tools.

## Hard rules

- Never use max_tokens.
- For vLLM/SGLang, never add --disable-cuda-graphs or --enforce-eager.
- Do not bypass SSH host-key verification.
- Keep keys in env, secure local files, or app settings.

## Controller

1. Verify GET /status, /gpus, /config, /v1/models
2. Local default: http://localhost:8080
3. Remote GPU boxes expose controller API, not raw inference ports
4. Settings → Connection; keep all saved controllers
5. Switch active target; confirm Settings → System

## Providers

OpenAI-compatible /v1 upstreams via POST /studio/providers. Route as \`provider-id/model-name\`.

## Runtimes

vLLM (CUDA), SGLang (structured), llama.cpp (GGUF), MLX (Apple Silicon). Launch through recipes/UI.

## Acceptance

Settings switches controllers. System shows runtime. /v1/chat/completions works locally and through one provider. /agent completes a turn. No secrets in artifacts.
`,
	);
}

export function resourcesMarkdown(): string {
	return markdownPage(
		"Resources",
		`- [Documentation](${SITE_ORIGIN}/docs)
- [Setup prompt](${SITE_ORIGIN}/setup)
- [Download for macOS](${SITE_ORIGIN}/download)
- [Agent setup](${SITE_ORIGIN}/agents)
- [KittyLitter](https://kittylitter.app)
- [GitHub](https://github.com/sybil-solutions/local-studio)
- [Company](https://www.sybilsolutions.ai/)
`,
	);
}

export function downloadMarkdown(): string {
	return markdownPage(
		"Download Local Studio for macOS",
		`Desktop app for Apple Silicon.

- Version: ${DOWNLOAD.version}
- Artifact: ${DOWNLOAD.artifact}
- Size: ${DOWNLOAD.label} (${DOWNLOAD.bytes} bytes)
- Arch: ${DOWNLOAD.arch}
- Hosted: GitHub Releases
- URL: ${DOWNLOAD.url}
- Latest alias: ${DOWNLOAD.latestAlias}

Signed and notarized. Updates itself from GitHub Releases.

Prerequisites: ${SITE_ORIGIN}/docs#prerequisites
`,
	);
}

export function servicesMarkdown(): string {
	return markdownPage(
		"Services / products - Sybil Solutions",
		`Operator: Sybil Solutions (https://www.sybilsolutions.ai/).

| Product | What | URL |
| --- | --- | --- |
| Local Studio | Local-first macOS workstation for self-hosted LLM backends | https://localstudio.ai |
| KittyLitter | Native iOS+Android client for Codex, Claude, OpenCode, Pi, Droid | https://kittylitter.app |
| Codex Shim | Local Responses-API shim for Codex Desktop BYOK | https://github.com/sybil-solutions/codex-shim |

This website does not expose a public cloud inference API. The Local Studio controller API is local (\`127.0.0.1:8080\`) on the user's machine.
`,
	);
}

export function peopleMarkdown(): string {
	return markdownPage(
		"People",
		`## Organization

- **Sybil Solutions** - Software · AI · Automation. https://www.sybilsolutions.ai/
- Contact: sherif@sybilsolutions.ai
- GitHub org: https://github.com/sybil-solutions
- X: https://x.com/0xsero

## Products and source

- Local Studio - https://github.com/sybil-solutions/local-studio
- Codex Shim - https://github.com/sybil-solutions/codex-shim
- KittyLitter / Litter - https://github.com/dnakov/litter (also associated with 0xSero)

This marketing site source: https://github.com/gildrb/ls-web
`,
	);
}

export function showcaseMarkdown(): string {
	return markdownPage(
		"Showcase",
		`## Local Studio

- Control local and remote controllers from one surface
- Serve vLLM / SGLang / MLX / llama.cpp behind one OpenAI-compatible proxy
- Work in a Pi Workbench with browser, files, terminal, and agents
- Pair the same sessions to KittyLitter on iOS and Android

## KittyLitter

- Multi-agent: Codex, Claude, OpenCode, Pi, Droid
- Auto-discovery, Alleycat P2P, SSH
- Voice, 70+ themes, Ghostty terminal, Apple Watch

## Codex Shim

- BYOK models inside Codex Desktop without a rebuild
- ChatGPT Codex and Cursor Composer passthrough
`,
	);
}

export function faqMarkdown(): string {
	return markdownPage(
		"FAQ",
		`## Who makes Local Studio?

Sybil Solutions (https://www.sybilsolutions.ai/).

## What is Local Studio?

A local-first macOS (Apple Silicon) workstation for running, managing, and using self-hosted LLM backends on local or remote controllers.

## What is KittyLitter?

A native iOS + Android client for Codex, Claude, OpenCode, Pi, and Droid. It pairs to Local Studio and can also connect over LAN, SSH, or Alleycat.

## Is there a public API on this website?

No. Discovery documents live under \`/llms.txt\`, \`/.well-known/api-catalog\`, and \`/machine\`. The product API is the local controller on the user's machine.

## How do I get a markdown version of a page?

Send \`Accept: text/markdown\` or append \`.md\` to the path.

## May AI crawlers train on this site?

Yes. \`Content-Signal: search=yes, ai-input=yes, ai-train=yes\`. Explicit allow rules for GPTBot, Claude-Web, Google-Extended, and other AI crawlers are in \`/robots.txt\`.
`,
	);
}

export function sitemapMarkdown(): string {
	const rows = HTML_ROUTES.map(
		(route) =>
			`- [${route.path}](${SITE_ORIGIN}${route.path}) - ${route.summary}`,
	);
	return markdownPage("Sitemap", rows.join("\n"));
}

export function apiCatalog(): string {
	return `${JSON.stringify(
		{
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
							href: `${SITE_ORIGIN}/.well-known/agent-card.json`,
							type: "application/json",
						},
					],
					"service-doc": [
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
		},
		null,
		2,
	)}\n`;
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
				url: "https://www.sybilsolutions.ai/",
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

export function llmsFull(): string {
	return [
		llmsTxt().trim(),
		"",
		"---",
		"",
		machineText(),
		"",
		indexMarkdown(),
		productMarkdown(),
		mobileMarkdown(),
		docsMarkdown(),
		promptMarkdown(),
		agentsMarkdown(),
		resourcesMarkdown(),
		downloadMarkdown(),
		servicesMarkdown(),
		peopleMarkdown(),
		showcaseMarkdown(),
		faqMarkdown(),
		sitemapMarkdown(),
	].join("\n");
}

