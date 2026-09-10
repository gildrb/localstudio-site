import { site } from "../domain/site.ts";
import { release } from "../domain/release.ts";
import {
	docsPath,
	downloadLabel,
	downloadPath,
	homePath,
	overviewPath,
	routes,
	setupPath,
} from "../domain/route.ts";
import { markdownPage } from "./markdown-format.ts";

const SITE_ORIGIN = site.origin;
const DOWNLOAD = release;

const runtimeBackends = `## Runtime backends

- vLLM - CUDA throughput
- SGLang - structured / multi-turn
- llama.cpp - GGUF / llama-server
- MLX - Apple Silicon / mlx_lm.server`;

export function indexMarkdown(): string {
	return markdownPage(
		routes[homePath].title,
		`Company: [Sybil Solutions](${site.company.url}).

Local intelligence. Local Studio is a local-first workstation for running, managing, and using self-hosted language-model backends on local or remote controllers.

- [${downloadLabel()}](${SITE_ORIGIN}${downloadPath}) - v${DOWNLOAD.version}, ${DOWNLOAD.label}, arm64
- [Setup prompt](${SITE_ORIGIN}/setup)
- [Home](${SITE_ORIGIN}${homePath})
- [KittyLitter](${SITE_ORIGIN}/mobile)

## Control

Local and remote controllers, live status, launch state, logs, and metrics.

## Serve

vLLM, SGLang, MLX, and llama.cpp behind one OpenAI-compatible surface.

## Work

Models, providers, browser, files, terminal, and agents in the same session.

## KittyLitter

Native iOS + Android client for Codex, Claude, OpenCode, Pi, and Droid. LAN, SSH, or Alleycat. [kittylitter.app](${site.products.kittyLitter.url}).
`,
	);
}

export function mobileMarkdown(): string {
	return markdownPage(
		"Mobile - KittyLitter + Local Studio",
		`Pair KittyLitter once, then read and continue the same Local Studio sessions from your phone. The work still runs on your Mac.

Requirements: Local Studio ${site.products.kittyLitter.minimumLocalStudio}+, KittyLitter ${site.products.kittyLitter.minimumVersion}+, Mac reachable.

## Pair

1. Local Studio → Settings → Profile & phone → Connect your phone
2. KittyLitter server scanner → Local Studio → scan QR (or paste connection JSON)
3. Open the Local Studio server in KittyLitter; sessions are the same

## Runtime

KittyLitter is not a cloud copy. One session list. Complete timeline (content, reasoning, tool calls, results). Filesystem and agent runtime stay on the Mac.

## Security

QR and connection JSON are private controller credentials. Treat them like a password. This site has no pairing upload. Bridge requests are signed and replay-protected.

Download on App Store: ${site.products.kittyLitter.appStore}
Download on Google Play: ${site.products.kittyLitter.playStore}
`,
	);
}

export function docsMarkdown(): string {
	return markdownPage(
		routes[docsPath].title,
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

${runtimeBackends}

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
		routes[setupPath].title,
		`Give the portable prompt on ${SITE_ORIGIN}/setup to a coding model that can operate a terminal on the target machine.

Repository: ${site.products.localStudio.repository}

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
		routes[overviewPath].title,
		`- [Documentation](${SITE_ORIGIN}/docs)
- [Setup prompt](${SITE_ORIGIN}/setup)
- [${downloadLabel()}](${SITE_ORIGIN}${downloadPath})
- [Agent setup](${SITE_ORIGIN}/agents)
- [KittyLitter](${site.products.kittyLitter.url})
- [GitHub](${site.products.localStudio.repository})
- [Company](${site.company.url})
`,
	);
}

export function downloadMarkdown(): string {
	return markdownPage(
		routes[downloadPath].title,
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
