import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { CtaPair } from "../components/Links";
import { LocalLink } from "../components/LocalLink";
import { PageCta } from "../components/PageCta";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import {
	docsPath,
	downloadPath,
	overviewPath,
	routePaths,
	routes,
	setupPath,
	type RoutePath,
} from "../domain/route";
import { release } from "../domain/release";
import { site } from "../domain/site";

const toc = [
	["Start here", "start-here"],
	["This site", "this-site"],
	["Local Studio", "local-studio"],
	["Runtimes", "runtimes"],
	["KittyLitter", "kittylitter"],
	["Codex Shim", "codex-shim"],
	["For machines", "for-machines"],
	["Source and company", "source"],
] as const;

interface OverviewEntry {
	label: string;
	text: ReactNode;
	href?: string;
	external?: boolean;
	plain?: boolean;
	code?: boolean;
}

const starts: readonly OverviewEntry[] = [
	{
		label: "Documentation",
		text: "Install the controller and the desktop workspace, choose a runtime backend, launch a model, and verify local inference end to end.",
		href: docsPath,
	},
	{
		label: "Setup prompt",
		text: "One portable prompt. Give it to any coding model and it installs Local Studio on the machine it runs on, then proves a real inference request.",
		href: setupPath,
	},
	{
		label: "Download for macOS",
		text: `The signed and notarized Apple Silicon DMG. ${release.label}, v${release.version}, hosted on GitHub Releases with auto-updates.`,
		href: downloadPath,
	},
];

function routeEntry(path: RoutePath): OverviewEntry {
	return {
		label: path,
		text: routes[path].summary,
		href: path,
		code: true,
	};
}

const siteRoutes = routePaths.map(routeEntry);

const studioFacts: readonly OverviewEntry[] = [
	{
		label: "Current",
		text: `v${release.version}, published ${release.published}. Signed, notarized, and self-updating from GitHub Releases.`,
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

const studioSurfaces: readonly OverviewEntry[] = [
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

const runtimes: readonly OverviewEntry[] = [
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

const kittyRows: readonly OverviewEntry[] = [
	{
		label: "Connect",
		text: "LAN auto-discovery, SSH to any machine, or Alleycat peer-to-peer QR pairing through NATs and firewalls. No VPN, public IP, or port forwarding.",
	},
	{
		label: "Pairing",
		text: "Local Studio 2.9.0+ and KittyLitter 1.6.0+. Settings → Profile & phone → Connect your phone, then scan. The QR and copied JSON are controller credentials; treat them as secrets.",
	},
	{
		label: "In the box",
		text: "Realtime voice, 70+ editor themes, an embedded Ghostty terminal, and LitterWatch for Apple Watch.",
	},
	{
		label: "Get it",
		text: (
			<>
				<a href={site.products.kittyLitter.url} target="_blank" rel="noreferrer">
					kittylitter.app
				</a>{" "}
				· <a href={site.products.kittyLitter.appStore} target="_blank" rel="noreferrer">App Store</a>{" "}
				· <a href={site.products.kittyLitter.playStore} target="_blank" rel="noreferrer">Google Play</a>
			</>
		),
	},
	{
		label: "Source",
		text: "GPL-3.0 with an App Store / Google Play exception. Open source and free.",
		href: site.products.kittyLitter.source,
		external: true,
	},
];

const shimRows: readonly OverviewEntry[] = [
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

const machineRows: readonly OverviewEntry[] = [
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

const sourceRows: readonly OverviewEntry[] = [
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

function arrow(entry: OverviewEntry) {
	const Icon = entry.external ? ArrowUpRight : ArrowRight;
	return (
		<Icon
			aria-hidden="true"
			className="overview-row__arrow"
			size={14}
			strokeWidth={1.25}
		/>
	);
}

function OverviewRow({ entry }: { entry: OverviewEntry }) {
	const labelClass = `overview-row__label${entry.code ? " overview-row__label--code" : ""}`;
	let label: ReactNode;
	if (!entry.href) {
		label = <span className={labelClass}>{entry.label}</span>;
	} else {
		const linkClass = `${labelClass} overview-row__link`;
		label = entry.external ? (
			<a
				className={linkClass}
				href={entry.href}
				target="_blank"
				rel="noreferrer"
			>
				{entry.label}
				{arrow(entry)}
			</a>
		) : entry.plain ? (
			<a className={linkClass} href={entry.href}>
				{entry.label}
				{arrow(entry)}
			</a>
		) : (
			<LocalLink className={linkClass} href={entry.href}>
				{entry.label}
				{arrow(entry)}
			</LocalLink>
		);
	}
	return (
		<li className="overview-row">
			{label}
			<p className="overview-row__text">{entry.text}</p>
		</li>
	);
}

const codeClass =
	"docs-code surface-compact my-8 block max-w-full overflow-x-auto border border-white/10 px-5 py-4 font-mono text-sm/5 text-white/80";
const sectionClass = "docs-section scroll-mt-28";

export function ResourcesPage() {
	return (
		<PageShell>
			<PageIntro
				id="resources-title"
				layout="left"
				title={routes[overviewPath].heading}
				description="Documentation, setup paths, downloads, and the surrounding ecosystem in one place."
				actions={
					<CtaPair secondary={{ href: docsPath, label: "Read the docs" }} />
				}
			/>
			<div className="docs-layout section-width grid grid-cols-[240px_minmax(0,1fr)] gap-12 pb-30 max-[900px]:grid-cols-1 max-[900px]:gap-12">
				<aside className="sticky top-24 self-start max-[900px]:static">
					<p className="docs-toc__label text-sm/5">On this page</p>
					<nav className="docs-toc" aria-label="Overview sections">
						<ul className="docs-toc__list mt-4 grid gap-2 border-l p-0 pl-4 text-base/6">
							{toc.map(([label, id]) => (
								<li key={id}>
									<LocalLink href={`${overviewPath}#${id}`}>{label}</LocalLink>
								</li>
							))}
						</ul>
					</nav>
				</aside>
				<article className="docs-prose min-w-0 text-base/6 text-(--dim) [&_li]:mb-2">
					<p>
						One page, everything on the map: the site, the desktop app, the
						phone client, the shim, the machine surface, and where the source
						lives. If it exists around <span translate="no">Local Studio</span>,
						it is linked from here.
					</p>
					<section id="start-here" className={sectionClass}>
						<h2>Start here</h2>
						<p className="mt-4">
							Three ways in, depending on what you are holding.
						</p>
						<ul className="overview-rows">
							{starts.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="this-site" className={sectionClass}>
						<h2>This site</h2>
						<p className="mt-4">Every route and what it holds.</p>
						<ul className="overview-rows">
							{siteRoutes.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="local-studio" className={sectionClass}>
						<h2>Local Studio</h2>
						<p className="mt-4">
							A local-first workstation for running, managing, and using
							self-hosted LLM backends. Two modules share one controller API,
							and it keeps the model, the runtime, and the hardware together.
							Nothing important disappears behind a provider abstraction.
						</p>
						<ul className="overview-rows">
							{studioFacts.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
						<p className="mt-8">
							Day-to-day operation runs through three surfaces.
						</p>
						<ul className="overview-rows">
							{studioSurfaces.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="runtimes" className={sectionClass}>
						<h2>Runtimes</h2>
						<p className="mt-4">
							Recipes launch through the controller runtime layer; a chat proxy
							call never launches a model silently. Discovery and saved
							selections stay with the controller and surface in Settings.
						</p>
						<ul className="overview-rows">
							{runtimes.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="kittylitter" className={sectionClass}>
						<h2>KittyLitter</h2>
						<p className="mt-4">
							The native iOS and Android client for Codex, Claude, OpenCode, Pi,
							and Droid, and the mobile companion for Local Studio. Work still
							runs on your Mac or server; sessions, streaming, reasoning, and
							tool results follow the phone.
						</p>
						<ul className="overview-rows">
							{kittyRows.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="codex-shim" className={sectionClass}>
						<h2>Codex Shim</h2>
						<p className="mt-4">
							A local Python/aiohttp server that exposes an OpenAI
							Responses-compatible endpoint on loopback, so Codex Desktop can
							run BYOK models: OpenAI, Anthropic, Z.ai, DeepSeek, Gemini,
							OpenRouter, and local proxies. Codex keeps its native UX; routing
							moves local.
						</p>
						<ul className="overview-rows">
							{shimRows.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="for-machines" className={sectionClass}>
						<h2>For machines</h2>
						<p className="mt-4">
							Every HTML route above has a markdown twin: append{" "}
							<code>.md</code> or send <code>Accept: text/markdown</code>. The
							homepage advertises the catalog, docs, and agent card through RFC
							8288 Link headers.
						</p>
						<pre className={codeClass}>
							curl -H "Accept: text/markdown" {site.origin}{docsPath}
						</pre>
						<ul className="overview-rows">
							{machineRows.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="source" className={sectionClass}>
						<h2>Source and company</h2>
						<ul className="overview-rows">
							{sourceRows.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
				</article>
			</div>
			<PageCta id="resources-cta-title" />
		</PageShell>
	);
}
