import { docsPath, downloadPath, routePaths, routes, setupPath } from "../domain/route";
import { release } from "../domain/release";
import { site } from "../domain/site";

const releaseDateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "UTC",
});
const publishedLabel = releaseDateFormatter.format(new Date(`${release.published}T00:00:00Z`));

export const toc = [
	["Start Here", "start-here"],
	["This Site", "this-site"],
	["Local Studio", "local-studio"],
	["Runtimes", "runtimes"],
	["KittyLitter", "kittylitter"],
	["Codex Shim", "codex-shim"],
	["For Machines", "for-machines"],
	["Source and Company", "source"],
] as const;

export interface OverviewTextLink {
	readonly href: string;
	readonly label: string;
}

export type OverviewEntry = {
	readonly label: string;
	readonly href?: string;
	readonly external?: boolean;
	readonly plain?: boolean;
	readonly code?: boolean;
} & (
	| { readonly text: string; readonly links?: never }
	| { readonly text?: never; readonly links: readonly OverviewTextLink[] }
);

export const starts: readonly OverviewEntry[] = [
	{
		label: "Documentation",
		text: "Install the controller and the desktop workspace, choose a runtime backend, launch a model, and verify local inference end to end.",
		href: docsPath,
	},
	{
		label: "Setup Prompt",
		text: "One portable prompt. Give it to any coding model and it installs Local Studio on the machine it runs on, then proves a real inference request.",
		href: setupPath,
	},
	{
		label: "Download for macOS",
		text: `The signed and notarized Apple Silicon DMG. ${release.label}, v${release.version}, hosted on GitHub Releases with auto-updates.`,
		href: downloadPath,
	},
];

export const siteRoutes: readonly OverviewEntry[] = routePaths.map((path) => ({
	label: path,
	text: routes[path].summary,
	href: path,
	code: true,
}));

export const studioFacts: readonly OverviewEntry[] = [
	{
		label: "Current",
		text: `v${release.version}, published ${publishedLabel}. Signed, notarized, and self-updating from GitHub Releases.`,
	},
	{
		label: "Platform",
		text: "macOS desktop app for Apple Silicon.",
	},
	{
		label: "Controller",
		text: "Bun + Hono on 127.0.0.1:8080. Owns model lifecycle, recipes, downloads, system state, and the OpenAI-compatible proxy.",
	},
	{
		label: "Frontend",
		text: "Next.js 16 + React 19 in an Electron shell. The Workbench agent surface lives at /agent.",
	},
	{
		label: "License",
		text: "Apache-2.0.",
	},
	{
		label: "Repository",
		text: "Source, releases, and issue tracking.",
		href: site.products.localStudio.repository,
		external: true,
	},
];

export const studioSurfaces: readonly OverviewEntry[] = [
	{
		label: "Control",
		text: "Launch and evict models, manage recipes and downloads, and watch GPU, process, log, and usage state across local and remote controllers.",
	},
	{
		label: "Serve",
		text: "vLLM, SGLang, MLX, and llama.cpp behind one OpenAI-compatible proxy: chat, models, tokenization, audio.",
	},
	{
		label: "Work",
		text: "Models, providers, browser, files, terminal, and agents in one session through the Pi-powered Workbench.",
	},
];

export const runtimes: readonly OverviewEntry[] = [
	{
		label: "vLLM",
		text: "CUDA throughput serving on Linux and NVIDIA. Configured, discovered, system, Docker, or bundled targets.",
	},
	{
		label: "SGLang",
		text: "Structured and multi-turn serving through discovered or configured Python launch-server targets.",
	},
	{
		label: "llama.cpp",
		text: "GGUF models through llama-server. Strong on CPU and modest GPUs.",
	},
	{
		label: "MLX",
		text: "Apple Silicon serving through mlx_lm.server. The default path on Mac.",
	},
];

export const kittyRows: readonly OverviewEntry[] = [
	{
		label: "Connect",
		text: "LAN auto-discovery, SSH to any machine, or Alleycat peer-to-peer QR pairing through NATs and firewalls. No VPN, public IP, or port forwarding.",
	},
	{
		label: "Pairing",
		text: `Local Studio ${site.products.kittyLitter.minimumLocalStudio}+ and KittyLitter ${site.products.kittyLitter.minimumVersion}+. Settings → Profile & phone → Connect your phone, then scan. The QR and copied JSON are controller credentials; treat them as secrets.`,
	},
	{
		label: "In the box",
		text: "Realtime voice, 70+ editor themes, an embedded Ghostty terminal, and LitterWatch for Apple Watch.",
	},
	{
		label: "Get it",
		links: [
			{ href: site.products.kittyLitter.url, label: "kittylitter.app" },
			{ href: site.products.kittyLitter.appStore, label: "App Store" },
			{ href: site.products.kittyLitter.playStore, label: "Google Play" },
		],
	},
	{
		label: "Source",
		text: "GPL-3.0 with an App Store / Google Play exception. Open source and free.",
		href: site.products.kittyLitter.source,
		external: true,
	},
];

export const shimRows: readonly OverviewEntry[] = [
	{
		label: "Extras",
		text: "Optional ChatGPT Codex passthrough, Cursor Composer passthrough, an Auto Router that picks the cheapest capable model per task, and a macOS patch that unhides custom catalog entries.",
	},
	{
		label: "Shape",
		text: "Python 3.11+ / aiohttp, binds 127.0.0.1, configures through ~/.codex-shim/models.json. MIT.",
	},
	{
		label: "Repository",
		text: "Source and releases.",
		href: site.products.codexShim.repository,
		external: true,
	},
];

export const machineRows: readonly OverviewEntry[] = [
	{
		label: "/machine",
		text: "The whole index as plain text: company, products, architecture, controller API, discovery.",
		href: "/machine",
		plain: true,
		code: true,
	},
	{
		label: "/llms.txt",
		text: "Curated markdown map of the site for language models.",
		href: "/llms.txt",
		plain: true,
		code: true,
	},
	{
		label: "/llms-full.txt",
		text: "Every markdown page in one file.",
		href: "/llms-full.txt",
		plain: true,
		code: true,
	},
	{
		label: "agent-card",
		text: "Agent card for agent-to-agent discovery at /.well-known/agent-card.json.",
		href: "/.well-known/agent-card.json",
		plain: true,
		code: true,
	},
	{
		label: "api-catalog",
		text: "Machine API catalog as linkset JSON at /.well-known/api-catalog.",
		href: "/.well-known/api-catalog",
		plain: true,
		code: true,
	},
	{
		label: "/sitemap.xml",
		text: "Crawler discovery for the canonical HTML routes; /sitemap.md is the markdown twin.",
		href: "/sitemap.xml",
		plain: true,
		code: true,
	},
	{
		label: "/robots.txt",
		text: "Crawl rules, AI bot policy, and content signals.",
		href: "/robots.txt",
		plain: true,
		code: true,
	},
];

export const sourceRows: readonly OverviewEntry[] = [
	{
		label: "local-studio",
		text: "The desktop app, controller, and frontend. Apache-2.0.",
		href: site.products.localStudio.repository,
		external: true,
		code: true,
	},
	{
		label: "litter",
		text: "KittyLitter for iOS and Android. GPL-3.0 with a store exception.",
		href: site.products.kittyLitter.source,
		external: true,
		code: true,
	},
	{
		label: "codex-shim",
		text: "The BYOK Responses shim. MIT.",
		href: site.products.codexShim.repository,
		external: true,
		code: true,
	},
	{
		label: "ls-web",
		text: "This website.",
		href: site.source,
		external: true,
		code: true,
	},
	{
		label: "Sybil Solutions",
		text: "The company behind Local Studio. Software, AI, automation.",
		href: site.company.url,
		external: true,
	},
];
