import { site } from "../domain/site.ts";

import { markdownPage } from "./markdown-format.ts";

const SITE_ORIGIN = site.origin;

export function servicesMarkdown(): string {
	return markdownPage(
		"Services / products - Sybil Solutions",
		`Operator: Sybil Solutions (${site.company.url}).

| Product | What | URL |
| --- | --- | --- |
| Local Studio | Local-first macOS workstation for self-hosted LLM backends | ${SITE_ORIGIN} |
| KittyLitter | Native iOS+Android client for Codex, Claude, OpenCode, Pi, Droid | ${site.products.kittyLitter.url} |
| Codex Shim | Local Responses-API shim for Codex Desktop BYOK | ${site.products.codexShim.repository} |

This website does not expose a public cloud inference API. The Local Studio controller API is local (\`127.0.0.1:8080\`) on the user's machine.
`,
	);
}

export function peopleMarkdown(): string {
	return markdownPage(
		"People",
		`## Organization

- **Sybil Solutions** - Software · AI · Automation. ${site.company.url}
- Contact: ${site.company.contact}
- GitHub org: ${site.company.github}
- X: ${site.company.x}

## Products and source

- Local Studio - ${site.products.localStudio.repository}
- Codex Shim - ${site.products.codexShim.repository}
- KittyLitter / Litter - ${site.products.kittyLitter.source} (also associated with 0xSero)

This marketing site source: ${site.source}
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

Sybil Solutions (${site.company.url}).

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
