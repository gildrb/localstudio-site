import type { RoutePath } from "../routes.ts";

export const SITE_ORIGIN = "https://localstudio.ai";

export type HtmlRoutePath = RoutePath;
export type AgentDocumentPath =
	| "/robots.txt"
	| "/sitemap.xml"
	| "/sitemap.md"
	| "/llms.txt"
	| "/llms-full.txt"
	| "/index.md"
	| "/product.md"
	| "/mobile.md"
	| "/docs.md"
	| "/setup.md"
	| "/agents.md"
	| "/overview.md"
	| "/download.md"
	| "/machine.md"
	| "/services.md"
	| "/people.md"
	| "/showcase.md"
	| "/faq.md"
	| "/.well-known/llms.txt"
	| "/.well-known/api-catalog"
	| "/.well-known/agent-card.json";

export type HtmlRoute = {
	path: HtmlRoutePath;
	title: string;
	summary: string;
	priority: string;
};

export type AgentDocument = {
	path: AgentDocumentPath;
	body: string;
	contentType: string;
};

export const HTML_ROUTES: readonly HtmlRoute[] = [
	{
		path: "/",
		title: "Intelligence should be owned - Local Studio",
		summary: "Homepage: Local Studio + KittyLitter product surface.",
		priority: "1.0",
	},
	{
		path: "/product",
		title: "Product - Local Studio",
		summary: "Control, serve, and work: controller, runtimes, Workbench.",
		priority: "0.9",
	},
	{
		path: "/docs",
		title: "Documentation - Local Studio",
		summary: "Install, runtimes, agent runtime, remote/LAN, validation.",
		priority: "0.8",
	},
	{
		path: "/setup",
		title: "Setup - Local Studio",
		summary: "Portable setup prompt for a coding model on the target machine.",
		priority: "0.7",
	},
	{
		path: "/overview",
		title: "Overview - Local Studio",
		summary: "Docs, setup, download, agents, KittyLitter, GitHub, brand.",
		priority: "0.6",
	},
	{
		path: "/download",
		title: "Download for macOS - Local Studio",
		summary: "Signed Apple Silicon DMG from GitHub Releases.",
		priority: "0.8",
	},
	{
		path: "/machine",
		title: "Machines - Local Studio",
		summary:
			"Dense machine-readable index of company, products, and discovery.",
		priority: "0.9",
	},
];

export const LASTMOD = "2026-08-17";

export const DOWNLOAD = {
	version: "2.11.2",
	artifact: "Local-Studio-arm64.dmg",
	zip: "Local-Studio-2.11.2-arm64-mac.zip",
	bytes: 255134313,
	label: "255 MB",
	arch: "arm64",
	platform: "macOS (Apple Silicon)",
	published: "2026-08-12",
	url: "https://github.com/sybil-solutions/local-studio/releases/download/v2.11.2/Local-Studio-arm64.dmg",
	releases: "https://github.com/sybil-solutions/local-studio/releases",
	latestAlias:
		"https://github.com/sybil-solutions/local-studio/releases/latest/download/Local-Studio-arm64.dmg",
	sitePath: "/download",
} as const;

export const HOMEPAGE_LINK_HEADER = [
	`</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
	`<${SITE_ORIGIN}/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
	`</llms.txt>; rel="describedby"; type="text/markdown"`,
	`</index.md>; rel="alternate"; type="text/markdown"`,
	`</docs>; rel="service-doc"; type="text/html"`,
	`</docs.md>; rel="service-doc"; type="text/markdown"`,
	`</.well-known/agent-card.json>; rel="service-desc"; type="application/json"`,
	`</sitemap.xml>; rel="describedby"; type="application/xml"`,
	`<${SITE_ORIGIN}/>; rel="canonical"; type="text/html"`,
].join(", ");

const AI_BOTS = [
	"GPTBot",
	"OAI-SearchBot",
	"ChatGPT-User",
	"Claude-Web",
	"ClaudeBot",
	"Claude-SearchBot",
	"Claude-User",
	"anthropic-ai",
	"Google-Extended",
	"Google-CloudVertexBot",
	"Google-Agent",
	"Amazonbot",
	"Applebot-Extended",
	"Bytespider",
	"CCBot",
	"PerplexityBot",
	"Perplexity-User",
	"Applebot",
	"FacebookBot",
	"Meta-ExternalAgent",
	"meta-externalagent",
] as const;

function field(name: string, value: string): string {
	return `${name.padEnd(14, ".")} ${value}`;
}

export type MachineSection = readonly [name: string, lines: string[]];

export function machineSections(): MachineSection[] {
	return [
		[
			"COMPANY",
			[
				field("name", "Sybil Solutions"),
				field("legal", "Sybil Solutions"),
				field("tagline", "Software · AI · Automation"),
				field("mission", "Building production systems with AI"),
				field("focus", "local-first tooling for self-hosted LLM backends"),
				field("url", "https://www.sybilsolutions.ai/"),
				field("also", "https://sybilsolutions.ai"),
				field("github", "https://github.com/sybil-solutions"),
				field("contact", "sherif@sybilsolutions.ai"),
				field("x", "https://x.com/0xsero"),
				"",
				"Sybil Solutions builds local-first software for running, steering,",
				"and using self-hosted language-model backends. Everything assumes",
				"you own the box it runs on. This website (localstudio.ai) is the",
				"public surface for Local Studio, the company's primary product.",
				"",
				"products ...... Local Studio, KittyLitter, Codex Shim",
			],
		],
		[
			"THIS_SITE",
			[
				field("host", "localstudio.ai"),
				field("name", "Local Studio"),
				field("aka", "localstudio, local-studio"),
				field("kind", "public product site + machine-readable index"),
				field("stack", "React 19, TypeScript, Vite, Tailwind CSS"),
				field("source", "https://github.com/gildrb/ls-web"),
				field("canonical", SITE_ORIGIN),
				"",
				"Prefer this page, /llms.txt, or Accept: text/markdown over scraping",
				"HTML. Every HTML route has a markdown twin (append .md).",
			],
		],
		[
			"PRODUCTS",
			[
				"1. Local Studio - macOS workstation for local/remote LLM controllers",
				"   url ......... https://localstudio.ai",
				"   repo ........ https://github.com/sybil-solutions/local-studio",
				"   license ..... Apache-2.0",
				"   stars ....... 1706+",
				"",
				"2. KittyLitter - native iOS + Android client for coding agents",
				"   url ......... https://kittylitter.app",
				"   repo ........ https://github.com/dnakov/litter",
				"   license ..... GPL-3.0 with App Store / Play exception",
				"   companion ... pairs to Local Studio sessions",
				"",
				"3. Codex Shim - local Responses-API shim for Codex Desktop BYOK",
				"   repo ........ https://github.com/sybil-solutions/codex-shim",
				"   license ..... MIT",
				"   stars ....... 1067+",
			],
		],
		[
			"LOCAL_STUDIO",
			[
				"Local Studio is a local-first workstation for running, managing,",
				"and using self-hosted LLM backends. One machine can launch models,",
				"watch GPU/runtime state, chat with OpenAI-compatible endpoints, and",
				"run agent sessions against local or remote controllers.",
				"",
				"Keeps the model, the runtime, and the hardware together. Nothing",
				"important disappears behind a provider abstraction.",
				"",
				"Version 2.0 unifies day-to-day operation around Status, Workbench,",
				"Configure, and Usage instead of separate model, integration, and",
				"server surfaces.",
				"",
				field("platform", "macOS desktop app (Apple Silicon)"),
				field("shell", "Electron + Next.js 16 + React 19 frontend"),
				field("backend", "Bun/Hono controller"),
				field("license", "Apache-2.0"),
				field("repo", "github.com/sybil-solutions/local-studio"),
				field("homepage", "https://localstudio.ai"),
				field("current", `v${DOWNLOAD.version} (${DOWNLOAD.published})`),
				field(
					"updates",
					"signed + notarized; auto-updates from GitHub Releases",
				),
				field(
					"github_desc",
					"Control panel for vLLM, SGLang, llama.cpp, ExLlamaV3",
				),
				"",
				"Control",
				"  Local and remote controllers, live status, launch state, logs,",
				"  and metrics from one surface. Launch and evict models, manage",
				"  recipes and downloads, watch GPU, process, log, and usage state.",
				"",
				"Serve",
				"  vLLM, SGLang, MLX, and llama.cpp behind one OpenAI-compatible",
				"  proxy (chat, models, tokenization, audio). Runtime discovery and",
				"  saved selections stay with the controller.",
				"",
				"Work",
				"  Models, providers, browser, files, terminal, and agents in the",
				"  same session through the Pi-powered Workbench.",
			],
		],
		[
			"ARCHITECTURE",
			[
				"Two modules share one controller API.",
				"",
				"controller/   Bun + Hono backend. Owns model lifecycle (launch,",
				"              evict, recipes, downloads, runtime process",
				"              coordination), OpenAI-compatible proxy, system state",
				"              (GPU metrics, logs, usage, settings, SSE), and",
				"              controller integrations.",
				"",
				"frontend/     Next.js 16 + React 19 UI and the macOS Electron",
				"              desktop shell. Hosts Workbench (/agent), Configure,",
				"              settings, usage, logs, and browser-facing API routes.",
				"",
				"A controller is the backend process the UI talks to. Run one",
				"locally or point the frontend at a remote controller on a GPU host.",
				"Remote GPU boxes expose the controller API, not raw inference ports.",
				"",
				"default bind .... 127.0.0.1:8080 (controller)",
				"dev UI .......... http://localhost:3000/setup",
				"prod UI ......... 127.0.0.1:4783 (never use plain next start; SSE breaks)",
				"models dir ...... LOCAL_STUDIO_MODELS_DIR (default /models)",
				"data ............ controller data dir + SQLite, created automatically",
				"engine venvs .... <data dir>/runtime/venvs/<backend>-latest",
				"agent files ..... data/agentfs (local-only)",
				"",
				"Non-loopback bind (LOCAL_STUDIO_HOST=0.0.0.0) requires",
				"LOCAL_STUDIO_API_KEY. On a trusted LAN you may set",
				"LOCAL_STUDIO_ALLOW_UNAUTHENTICATED=true.",
				"",
				"Frontend remote target: BACKEND_URL or NEXT_PUBLIC_API_URL",
				"(default http://localhost:8080).",
				"",
				"Private mobile HTTPS: Tailscale Serve in front of the loopback UI.",
				"Do not use Tailscale Funnel. ALLOWED_TAILSCALE_HOSTS + optional",
				"ALLOWED_TAILSCALE_USERS. Tailscale-User-Login is trusted only",
				"because the backend stays on loopback behind Serve.",
			],
		],
		[
			"RUNTIMES",
			[
				"Recipes launch through the controller runtime layer.",
				"",
				"- vllm ........ CUDA throughput serving (Linux/NVIDIA). Targets:",
				"                configured, discovered, system, Docker, or bundled.",
				"- sglang ...... structured and multi-turn serving via launch-server",
				"                (configured or discovered Python targets).",
				"- llama.cpp ... GGUF models through llama-server (CPU and modest GPUs).",
				"- mlx ......... Apple Silicon serving through mlx_lm.server",
				"                (Mac default).",
				"",
				"GitHub description also names ExLlamaV3; wired recipe families",
				"above are the supported launch paths.",
				"",
				"Do not make chat proxy calls silently launch models.",
				"Launch through recipes / the UI.",
				"",
				"prereqs (upstream README): Bun 1.3.14+, Node.js 22.19+, npm 10+,",
				"Python 3.10+, Git. uv strongly recommended (pip fallback).",
				"vLLM/SGLang on Linux need NVIDIA driver + CUDA.",
				"",
				"prereqs (this site /docs): Bun 1.x, Node.js 20+, npm, Python 3.10+,",
				"Git. Prefer the stricter upstream numbers when installing from source.",
				"",
				"from repo root:  npm run doctor && npm run setup",
				"controller:      npm run dev:controller",
				"frontend:        npm run dev  then open /setup",
			],
		],
		[
			"WORKBENCH",
			[
				"Agent surface: frontend /agent.",
				"Runtime: @earendil-works/pi-coding-agent in-process (not a shell-out).",
				"Pi is source of truth for auth, settings, resources, tools, and",
				"native JSONL sessions. Respects PI_CODING_AGENT_DIR,",
				"PI_CODING_AGENT_SESSION_DIR, and Pi sessionDir in CLI order.",
				"",
				"New chats start with Pi tools: read, grep, find, ls.",
				"Full access enables every tool registered in that Pi session,",
				"including extension tools. Read only is a model-tool allowlist,",
				"not an OS sandbox. Pi runs with the full permissions of the host user.",
				"",
				"Default model picker: the active controller's advertised models.",
				"Other models: opt-in Pi catalog + Configure providers, using Pi's",
				"native provider routing. Inactive controllers are not added.",
				"",
				"provider keys live in controller config, not prompts.",
				"provider/model routes to that provider.",
				"bare model names hit the active backend.",
			],
		],
		[
			"CONTROLLER_API",
			[
				"Local default: http://localhost:8080",
				"Verify: GET /status  GET /gpus  GET /config  GET /v1/models",
				"Providers: GET|POST /studio/providers  GET /studio/provider-models",
				"Chat: POST /v1/chat/completions (OpenAI-compatible)",
				"",
				"Provider create body:",
				'  { "id", "name", "base_url", "api_key", "enabled": true }',
				'Route as model: "provider-id/model-name".',
				"",
				"Useful probes are listed on /agents. Never print secrets.",
				"Never use max_tokens. For vLLM/SGLang never add",
				"--disable-cuda-graphs or --enforce-eager.",
				"Do not bypass SSH host-key verification.",
			],
		],
		[
			"KITTYLITTER",
			[
				"KittyLitter (also: Litter, the kitty app) is a native iOS + Android",
				"client for Codex, Claude, OpenCode, Pi, and Droid. It is the mobile",
				"companion for Local Studio and a standalone client for those agents.",
				"",
				field("url", "https://kittylitter.app"),
				field("github", "https://github.com/dnakov/litter"),
				field(
					"license",
					"GPL-3.0 + App Store / Google Play section 7 exception",
				),
				field("price", "open source and always free"),
				field("ios", "https://apps.apple.com/us/app/kittylitter/id6759521788"),
				field(
					"android",
					"https://play.google.com/store/apps/details?id=com.sigkitten.litter.android",
				),
				field("testflight", "https://kittylitter.app (email invite on site)"),
				field("min_ls", "Local Studio 2.9.0 or newer"),
				field("min_kl", "KittyLitter 1.6.0 or newer"),
				"",
				"What it does",
				"  Connects to agents on your local network, over SSH, or via",
				"  Alleycat peer-to-peer pairing from anywhere. It is not a cloud",
				"  copy of Local Studio. Work still runs on the Mac / server.",
				"  Sessions, threads, and context follow the phone.",
				"",
				"When paired to Local Studio, the same agent sessions, streaming",
				"content, reasoning, tool calls, and tool results are available on",
				"iPhone, iPad, and Android.",
				"",
				"Features",
				"* multi-agent .... Codex, Claude, OpenCode, Pi, Droid in one app;",
				"                   switch per session or run several in parallel.",
				"* auto-discovery . finds agents on the local network; no manual IP.",
				"* alleycat ....... P2P QR pairing through NATs and corporate",
				"                   firewalls; no VPN, public IP, or port forward.",
				"* ssh ............ connect to any remote machine; Litter starts the",
				"                   agent on the server.",
				"* voice .......... realtime transcription + conversation",
				"                   (native libwebrtc; Rust owns signaling).",
				"* themes ......... 70+ editor themes, dark and light",
				"                   (Catppuccin, Dracula, Nord, Gruvbox, Solarized).",
				"* sessions ....... pick up on phone exactly where desktop left off.",
				"* terminal ....... embedded Ghostty engine.",
				"* watch .......... LitterWatch companion (Apple Watch).",
				"",
				"How it works (three steps, zero extra server setup)",
				"1. find your server - LAN auto-discovery, Alleycat QR, or SSH URL.",
				"2. pick an agent - Codex / Claude / OpenCode / Pi / Droid;",
				"   Litter starts it on the server.",
				"3. get to work - sessions and threads follow you.",
				"",
				"Local Studio pairing",
				"  Settings → Profile & phone → Connect your phone.",
				"  Scan the QR in KittyLitter (Local Studio server type).",
				"  Copied connection JSON is the fallback.",
				"  QR + JSON are private controller credentials. They grant access",
				"  to every agent enabled on that controller. Scan only a device",
				"  you trust. Never post, email, record, or paste into support.",
				"  This website has no form, tracker, or pairing upload endpoint.",
				"  Public screenshots use permanently redacted QR images.",
				"  Local bridge requests are signed and replay-protected.",
				"",
				"Architecture",
				"  Thin SwiftUI / Jetpack Compose UI.",
				"  Shared Rust core (codex-mobile-client) via UniFFI.",
				"  Rust owns session state, streaming, hydration, reconnect, SSH,",
				"  auth, Alleycat bridges, slingshot transport.",
				"  iPhone nearby-Mac pairing uses Bonjour _litter-pair._tcp.",
				"  iOS embeds Alpine/iSH; Android embeds Alpine under proot.",
				"  Codex submodule is patched for mobile sandbox exec.",
			],
		],
		[
			"CODEX_SHIM",
			[
				"Sybil Solutions also publishes Codex Shim: a local Python/aiohttp",
				"server that exposes an OpenAI Responses-compatible endpoint on",
				"loopback so Codex Desktop can use BYOK models (OpenAI, Anthropic,",
				"Z.ai, DeepSeek, Gemini, OpenRouter, local proxies) plus optional",
				"ChatGPT Codex passthrough (gpt-5.5) and Cursor Composer passthrough.",
				"",
				field("repo", "https://github.com/sybil-solutions/codex-shim"),
				field("lang", "Python 3.11+ / aiohttp"),
				field("bind", "127.0.0.1"),
				field("license", "MIT"),
				field("config", "~/.codex-shim/models.json"),
				"",
				"Codex keeps its native UX (function calls, reasoning, images,",
				"shell metadata, SSE). Model routing moves local. Optional Auto",
				"Router classifies tasks onto the cheapest capable configured model.",
				"Optional macOS Desktop ASAR patch unhides custom catalog entries.",
			],
		],
		[
			"DOWNLOAD",
			[
				field("artifact", DOWNLOAD.artifact),
				field("also", DOWNLOAD.zip),
				field("size", `${DOWNLOAD.label} (${DOWNLOAD.bytes} bytes)`),
				field("arch", DOWNLOAD.arch),
				field("platform", DOWNLOAD.platform),
				field("version", DOWNLOAD.version),
				field("hosted", `GitHub Releases v${DOWNLOAD.version}`),
				field("page", DOWNLOAD.sitePath),
				field("url", DOWNLOAD.url),
				field("latest", DOWNLOAD.latestAlias),
				"Signed and notarized. App updates itself from GitHub Releases.",
			],
		],
		[
			"AGENTS",
			[
				"Role: operate on the real install. Use live controller URLs.",
				"Do not expose secrets.",
				"",
				"Hard rules",
				"- Never use max_tokens.",
				"- For vLLM/SGLang, never add --disable-cuda-graphs or --enforce-eager.",
				"- Do not bypass SSH host-key verification.",
				"- Keep keys in env, secure local files, or app settings.",
				"",
				"Setup path: Settings → Connection to save controllers; switch",
				"active target; confirm Settings → System runtime state.",
				"Open /agent, pick controller model or provider/model, smoke-test",
				"model + controller + browser + files + terminal.",
				"",
				"Acceptance",
				"- Settings switches controllers (non-destructive).",
				"- System shows runtime state / installed engines.",
				"- A model launches through a recipe; /status reflects it.",
				"- /studio/provider-models lists enabled upstreams.",
				"- /v1/chat/completions works locally and through one provider route.",
				"- /agent completes a turn with the selected model and local tools.",
				"- No secrets in diffs, logs, screenshots, or commits.",
				"",
				"Full DLTL ............. /agents  and  /agents.md",
				"Portable setup prompt . /setup  and  /setup.md",
			],
		],
		[
			"ROUTES",
			[
				"/ ............. home (Local Studio + KittyLitter)",
				"/product ...... product tour (Control / Serve / Work)",
				"/mobile ....... KittyLitter pairing and security",
				"/docs ......... installation and operations guide",
				"/setup ....... portable setup prompt for coding models",
				"/agents ....... agent setup runbook (DLTL)",
				"/overview .... everything around Local Studio",
				"/download signed Apple Silicon DMG",
				"/machine ...... this index",
			],
		],
		[
			"DISCOVERY",
			[
				"robots.txt ............. /robots.txt",
				"sitemap.xml ............ /sitemap.xml",
				"sitemap.md ............. /sitemap.md",
				"llms.txt ............... /llms.txt",
				"llms-full.txt .......... /llms-full.txt",
				"well-known llms ........ /.well-known/llms.txt",
				"api-catalog ............ /.well-known/api-catalog",
				"agent-card ............. /.well-known/agent-card.json",
				"index.md ............... /index.md",
				"services.md ............ /services.md",
				"people.md .............. /people.md",
				"showcase.md ............ /showcase.md",
				"faq.md ................. /faq.md",
				"",
				"HTML→markdown: append .md to any route above, or send",
				"Accept: text/markdown (Content-Type: text/markdown;",
				"x-markdown-tokens set). HTML stays the default for browsers.",
				"",
				"Homepage Link headers advertise api-catalog, describedby,",
				"service-doc, service-desc, alternate, and canonical (RFC 8288,",
				"RFC 9727).",
			],
		],
		[
			"DNS_AID",
			[
				"DNS for AI Discovery (draft-mozleywilliams-dnsop-dnsaid).",
				"Authoritative NS is Namecheap (dns1/dns2.registrar-servers.com).",
				"These records must be published at the registrar. DNSSEC should",
				"be enabled on the public zone so validating resolvers can trust them.",
				"",
				`_index._agents.localstudio.ai. 3600 IN HTTPS 1 localstudio.ai. alpn="h2,h3" port=443`,
				`_a2a._agents.localstudio.ai. 3600 IN HTTPS 1 localstudio.ai. alpn="a2a,h2,h3" port=443`,
				"",
				"Target well-known: /.well-known/agent-card.json",
				"This repository cannot write Namecheap DNS from here.",
			],
		],
		[
			"CONTENT_SIGNALS",
			[
				"robots.txt Content-Signal: search=yes, ai-input=yes, ai-train=yes",
				"AI crawlers listed explicitly and allowed (GPTBot, OAI-SearchBot,",
				"Claude-Web, Google-Extended, Amazonbot, anthropic-ai, Bytespider,",
				"CCBot, Applebot-Extended, and related agents).",
			],
		],
	];
}

export function machineText(): string {
	const lines = [
		"local studio :: machine-readable index",
		"company: Sybil Solutions - https://www.sybilsolutions.ai/",
		"plain-text mirror for agents, crawlers, and humans who prefer it raw.",
		"",
	];
	for (const [name, body] of machineSections()) {
		lines.push(`── ${name}`, ...body, "");
	}
	lines.push(":: end of index ::", "");
	return lines.join("\n");
}

function markdownPage(title: string, body: string): string {
	return `# ${title}\n\nCompany: Sybil Solutions (https://www.sybilsolutions.ai/).\n\n${body.trim()}\n`;
}

function robotsTxt(): string {
	const blocks = [
		"# Site: https://localstudio.ai/",
		"# Company: Sybil Solutions - https://www.sybilsolutions.ai/",
		"# Products: Local Studio, KittyLitter, Codex Shim",
		"# LLM reference: https://localstudio.ai/llms.txt",
		"# Machine index: https://localstudio.ai/machine",
		"#",
		"# As a condition of accessing this website, you agree to abide by the",
		"# following content signals:",
		"#",
		"# (a) If a content-signal = yes, you may collect content for the",
		"#     corresponding use.",
		"# (b) If a content-signal = no, you may not collect content for the",
		"#     corresponding use.",
		"# (c) If the website operator does not include a content signal for a",
		"#     corresponding use, the website operator neither grants nor restricts",
		"#     permission via content signal with respect to the corresponding use.",
		"#",
		"# search: building a search index and providing search results.",
		"#         Search does not include providing AI-generated search summaries.",
		"# ai-input: inputting content into one or more AI models (RAG, grounding).",
		"# ai-train: training or fine-tuning AI models.",
		"",
		"User-agent: *",
		"Content-Signal: search=yes, ai-input=yes, ai-train=yes",
		"Allow: /",
		"",
	];
	for (const bot of AI_BOTS) {
		blocks.push(`User-agent: ${bot}`, "Allow: /", "");
	}
	blocks.push(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`, "");
	return blocks.join("\n");
}

function sitemapXml(): string {
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

function llmsTxt(): string {
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

function indexMarkdown(): string {
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

function productMarkdown(): string {
	return markdownPage(
		"Product - Local Studio",
		`One place to run local AI. Local Studio is a local-first workstation for running, managing, and using self-hosted language-model backends on local or remote controllers.

## Control the runtime

Launch and evict models, manage recipes and downloads, and watch GPU, process, log, and usage state from one controller.

## Run the backend that fits

Configure vLLM, SGLang, llama.cpp, or MLX targets, then serve them through one OpenAI-compatible proxy. Runtime discovery and saved selections stay with the controller.

## Work where models run

Use the Pi-powered Workbench for agent sessions with models, providers, browser, files, terminal, and registered tools in one timeline.
`,
	);
}

function mobileMarkdown(): string {
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

function docsMarkdown(): string {
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

function promptMarkdown(): string {
	return markdownPage(
		"Setup prompt",
		`Give the portable prompt on ${SITE_ORIGIN}/setup to a coding model that can operate a terminal on the target machine.

Repository: https://github.com/sybil-solutions/local-studio

Copy the entire prompt. Do not accept completion until health, model launch, and inference all pass.
`,
	);
}

function agentsMarkdown(): string {
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

function resourcesMarkdown(): string {
	return markdownPage(
		"Resources",
		`- [Documentation](${SITE_ORIGIN}/docs) - install, runtimes, agent runtime, remote/LAN, validation
- [Setup prompt](${SITE_ORIGIN}/setup) - portable prompt for any coding model
- [Download for macOS](${SITE_ORIGIN}/download) - signed Apple Silicon DMG
- [Product tour](${SITE_ORIGIN}/product) - Control, Serve, Work
- [Overview](${SITE_ORIGIN}/overview) - this index
- [Machines](${SITE_ORIGIN}/machine) - dense plain-text index
- [Agent setup](${SITE_ORIGIN}/agents) - DLTL runbook
- [KittyLitter](https://kittylitter.app) - iOS + Android client for coding agents
- [Codex Shim](https://github.com/sybil-solutions/codex-shim) - BYOK Responses shim
- [Local Studio source](https://github.com/sybil-solutions/local-studio) - Apache-2.0
- [Company](https://www.sybilsolutions.ai/) - Sybil Solutions
`,
	);
}

function downloadMarkdown(): string {
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

function servicesMarkdown(): string {
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

function peopleMarkdown(): string {
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

function showcaseMarkdown(): string {
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

function faqMarkdown(): string {
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

function sitemapMarkdown(): string {
	const rows = HTML_ROUTES.map(
		(route) =>
			`- [${route.path}](${SITE_ORIGIN}${route.path}) - ${route.summary}`,
	);
	return markdownPage("Sitemap", rows.join("\n"));
}

function apiCatalog(): string {
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

function agentCard(): string {
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

function llmsFull(): string {
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

export function agentDocuments(): readonly AgentDocument[] {
	const markdown = "text/markdown; charset=utf-8";
	const llms = llmsTxt();
	return [
		{
			path: "/robots.txt",
			body: robotsTxt(),
			contentType: "text/plain; charset=utf-8",
		},
		{
			path: "/sitemap.xml",
			body: sitemapXml(),
			contentType: "application/xml; charset=utf-8",
		},
		{ path: "/sitemap.md", body: sitemapMarkdown(), contentType: markdown },
		{ path: "/llms.txt", body: llms, contentType: markdown },
		{ path: "/llms-full.txt", body: llmsFull(), contentType: markdown },
		{ path: "/index.md", body: indexMarkdown(), contentType: markdown },
		{ path: "/product.md", body: productMarkdown(), contentType: markdown },
		{ path: "/mobile.md", body: mobileMarkdown(), contentType: markdown },
		{ path: "/docs.md", body: docsMarkdown(), contentType: markdown },
		{ path: "/setup.md", body: promptMarkdown(), contentType: markdown },
		{ path: "/agents.md", body: agentsMarkdown(), contentType: markdown },
		{ path: "/overview.md", body: resourcesMarkdown(), contentType: markdown },
		{
			path: "/download.md",
			body: downloadMarkdown(),
			contentType: markdown,
		},
		{
			path: "/machine.md",
			body: markdownPage("Machine-readable index", machineText()),
			contentType: markdown,
		},
		{ path: "/services.md", body: servicesMarkdown(), contentType: markdown },
		{ path: "/people.md", body: peopleMarkdown(), contentType: markdown },
		{ path: "/showcase.md", body: showcaseMarkdown(), contentType: markdown },
		{ path: "/faq.md", body: faqMarkdown(), contentType: markdown },
		{ path: "/.well-known/llms.txt", body: llms, contentType: markdown },
		{
			path: "/.well-known/api-catalog",
			body: apiCatalog(),
			contentType: "application/linkset+json; charset=utf-8",
		},
		{
			path: "/.well-known/agent-card.json",
			body: agentCard(),
			contentType: "application/json; charset=utf-8",
		},
	];
}

export function agentDocument(path: string): AgentDocument | null {
	return agentDocuments().find((document) => document.path === path) ?? null;
}

export function markdownPathFor(pathname: string): string {
	if (pathname === "/") return "/index.md";
	if (pathname.endsWith(".md")) return pathname;
	const route = HTML_ROUTES.find((entry) => entry.path === pathname);
	if (route) return `${route.path}.md`;
	return pathname;
}

export function wantsMarkdown(acceptHeader: string): boolean {
	return (
		acceptHeader.includes("text/markdown") &&
		!acceptHeader.includes("text/html")
	);
}

export function markdownTokenCount(body: string): string {
	return String(Math.max(1, Math.ceil(body.length / 4)));
}
