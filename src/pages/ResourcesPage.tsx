import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { CtaPair } from "../components/Links";
import { LocalLink } from "../components/LocalLink";
import { DocsLayout } from "../components/DocsLayout";
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
} from "../domain/route";
import { release } from "../domain/release";
import { site } from "../domain/site";
import { styles } from "../styles/pages-styles";

const releaseDateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeZone: "UTC",
});
const publishedLabel = releaseDateFormatter.format(
	new Date(`${release.published}T00:00:00Z`),
);

const toc = [
	["Start Here", "start-here"],
	["This Site", "this-site"],
	["Local Studio", "local-studio"],
	["Runtimes", "runtimes"],
	["KittyLitter", "kittylitter"],
	["Codex Shim", "codex-shim"],
	["For Machines", "for-machines"],
	["Source and Company", "source"],
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

const siteRoutes: readonly OverviewEntry[] = routePaths.map((path) => ({
	label: path,
	text: routes[path].summary,
	href: path,
	code: true,
}));

const studioFacts: readonly OverviewEntry[] = [
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
		text: `Local Studio ${site.products.kittyLitter.minimumLocalStudio}+ and KittyLitter ${site.products.kittyLitter.minimumVersion}+. Settings → Profile & phone → Connect your phone, then scan. The QR and copied JSON are controller credentials; treat them as secrets.`,
	},
	{
		label: "In the box",
		text: "Realtime voice, 70+ editor themes, an embedded Ghostty terminal, and LitterWatch for Apple Watch.",
	},
	{
		label: "Get it",
		text: (
			<>
				<a
					{...stylex.props(baseStyles.element, baseStyles.interactive, baseStyles.focusable, styles.overviewTextLink)}
					href={site.products.kittyLitter.url}
					target="_blank"
					rel="noreferrer"
				>
					kittylitter.app
				</a>{" "}
				· <a {...stylex.props(baseStyles.element, baseStyles.interactive, baseStyles.focusable, styles.overviewTextLink)} href={site.products.kittyLitter.appStore} target="_blank" rel="noreferrer">App Store</a>{" "}
				· <a {...stylex.props(baseStyles.element, baseStyles.interactive, baseStyles.focusable, styles.overviewTextLink)} href={site.products.kittyLitter.playStore} target="_blank" rel="noreferrer">Google Play</a>
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
			{...stylex.props(styles.overviewArrow)}
			aria-hidden="true"
			size={14}
			strokeWidth={1.25}
		/>
	);
}

function OverviewLabel({ entry }: { entry: OverviewEntry }) {
	return (
		<span
			{...stylex.props(baseStyles.element, 
				styles.overviewLabel,
				entry.code && styles.overviewLabelCode,
			)}
		>
			{entry.label}
		</span>
	);
}

function OverviewRow({ entry }: { entry: OverviewEntry }) {
	let label: ReactNode;
	if (!entry.href) {
		label = <OverviewLabel entry={entry} />;
	} else if (entry.external) {
		label = (
			<a
				{...stylex.props(baseStyles.element, baseStyles.interactive, baseStyles.focusable, styles.overviewLink)}
				href={entry.href}
				target="_blank"
				rel="noreferrer"
			>
				<OverviewLabel entry={entry} />
				{arrow(entry)}
			</a>
		);
	} else if (entry.plain) {
		label = (
			<a {...stylex.props(baseStyles.element, baseStyles.interactive, baseStyles.focusable, styles.overviewLink)} href={entry.href}>
				<OverviewLabel entry={entry} />
				{arrow(entry)}
			</a>
		);
	} else {
		label = (
			<LocalLink sx={styles.overviewLink} href={entry.href}>
				<OverviewLabel entry={entry} />
				{arrow(entry)}
			</LocalLink>
		);
	}
	return (
		<li {...stylex.props(baseStyles.element, styles.overviewRow, styles.docsListItem)}>
			{label}
			<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.overviewText)}>{entry.text}</p>
		</li>
	);
}

export function ResourcesPage() {
	return (
		<PageShell>
			<PageIntro
				id="resources-title"
				title={routes[overviewPath].heading}
				description="Documentation, setup paths, downloads, and the surrounding ecosystem in one place."
				actions={
					<CtaPair secondary={{ href: docsPath, label: "Read the docs" }} />
				}
			/>
			<DocsLayout toc={toc} path={overviewPath} label="Overview sections">
					<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
						One page, everything on the map: the site, the desktop app, the
						phone client, the shim, the machine surface, and where the source
						lives. If it exists around <span translate="no" {...stylex.props(baseStyles.element)}>Local Studio</span>,
						it is linked from here.
					</p>
					<section id="start-here" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Start Here</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							Three ways in, depending on what you are holding.
						</p>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.overviewRows)}>
							{starts.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="this-site" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>This Site</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>Every route and what it holds.</p>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.overviewRows)}>
							{siteRoutes.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="local-studio" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Local Studio</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							A local-first workstation for running, managing, and using
							self-hosted LLM backends. Two modules share one controller API,
							and it keeps the model, the runtime, and the hardware together.
							Nothing important disappears behind a provider abstraction.
						</p>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.overviewRows)}>
							{studioFacts.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.marginTop32)}>
							Day-to-day operation runs through three surfaces.
						</p>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.overviewRows)}>
							{studioSurfaces.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="runtimes" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Runtimes</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							Recipes launch through the controller runtime layer; a chat proxy
							call never launches a model silently. Discovery and saved
							selections stay with the controller and surface in Settings.
						</p>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.overviewRows)}>
							{runtimes.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="kittylitter" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>KittyLitter</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							The native iOS and Android client for Codex, Claude, OpenCode, Pi,
							and Droid, and the mobile companion for Local Studio. Work still
							runs on your Mac or server; sessions, streaming, reasoning, and
							tool results follow the phone.
						</p>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.overviewRows)}>
							{kittyRows.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="codex-shim" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Codex Shim</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							A local Python/aiohttp server that exposes an OpenAI
							Responses-compatible endpoint on loopback, so Codex Desktop can
							run BYOK models: OpenAI, Anthropic, Z.ai, DeepSeek, Gemini,
							OpenRouter, and local proxies. Codex keeps its native UX; routing
							moves local.
						</p>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.overviewRows)}>
							{shimRows.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="for-machines" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>For Machines</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							Every HTML route above has a markdown twin: append{" "}
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>.md</code> or send <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>Accept: text/markdown</code>. The
							homepage advertises the catalog, docs, and agent card through RFC
							8288 Link headers.
						</p>
						<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
							curl -H "Accept: text/markdown" {site.origin}{docsPath}
						</pre>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.overviewRows)}>
							{machineRows.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
					<section id="source" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Source and Company</h2>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.overviewRows)}>
							{sourceRows.map((entry) => (
								<OverviewRow entry={entry} key={entry.label} />
							))}
						</ul>
					</section>
			</DocsLayout>
			<PageCta id="resources-cta-title" />
		</PageShell>
	);
}
