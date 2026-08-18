import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CtaPair } from "../components/Links";
import { LocalLink } from "../components/LocalLink";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

interface ResourceItem {
	name: string;
	text: string;
	href: string;
	external: boolean;
}

interface ResourceGroup {
	title: string;
	description: string;
	items: readonly ResourceItem[];
}

const groups: readonly ResourceGroup[] = [
	{
		title: "Getting started",
		description: "Three paths into Local Studio, from zero to first inference.",
		items: [
			{
				name: "Documentation",
				text: "Install the controller and desktop workspace, choose a runtime, and verify local inference.",
				href: "/docs",
				external: false,
			},
			{
				name: "Setup prompt",
				text: "A portable prompt that installs Local Studio with any coding model.",
				href: "/prompt",
				external: false,
			},
			{
				name: "Download for macOS",
				text: "The desktop app for Apple Silicon, hosted on GitHub Releases.",
				href: "/download/macos",
				external: false,
			},
		],
	},
	{
		title: "Agents",
		description:
			"Coding agents against your local controllers, on desktop and phone.",
		items: [
			{
				name: "Agent setup",
				text: "Controllers, providers, runtimes, and Pi sessions in one runbook.",
				href: "/agents",
				external: false,
			},
			{
				name: "KittyLitter",
				text: "The native iOS + Android client for Codex, Claude, OpenCode, Pi, and Droid.",
				href: "https://kittylitter.app",
				external: true,
			},
		],
	},
	{
		title: "Project",
		description:
			"Source, releases, and identity for everything under Local Studio.",
		items: [
			{
				name: "GitHub",
				text: "Source code, releases, and issue tracking.",
				href: "https://github.com/sybil-solutions/local-studio",
				external: true,
			},
			{
				name: "Brand assets",
				text: "Logo files for print and screen.",
				href: "/images/localstudio-logo.svg",
				external: false,
			},
		],
	},
];

function ResourceCell({ item }: { item: ResourceItem }) {
	const Icon = item.external ? ArrowUpRight : ArrowRight;
	return (
		<article className="group relative border-r border-white/10 p-8 transition-colors duration-[130ms] last:border-r-0 hover:bg-(--hover) max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:last:border-b-0">
			<h3 className="flex items-center gap-2">
				<LocalLink
					className="text-link text-white after:absolute after:inset-0"
					href={item.href}
					{...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
				>
					{item.name}
				</LocalLink>
				<Icon
					aria-hidden="true"
					className="text-(--subtlest) transition-colors duration-[130ms] group-hover:text-white"
					size={16}
					strokeWidth={1.25}
				/>
			</h3>
			<p className="mt-4 text-base/6 text-white/70">{item.text}</p>
		</article>
	);
}

export function ResourcesPage() {
	return (
		<PageShell>
			<PageIntro
				id="resources-title"
				layout="left"
				title="Everything around Local Studio."
				description="Documentation, setup paths, downloads, and the surrounding ecosystem in one place."
				actions={
					<CtaPair secondary={{ href: "/docs", label: "Read the docs" }} />
				}
			/>
			{groups.map((group, index) => (
				<section
					aria-labelledby={`resources-group-${index}`}
					className="page-section mx-auto w-[min(1399px,calc(100%_-_48px))] border-t border-white/10 py-30 max-[900px]:py-16"
					key={group.title}
				>
					<div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)] items-end gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-4">
						<h2 id={`resources-group-${index}`}>{group.title}</h2>
						<p className="text-base/6 text-white/70">{group.description}</p>
					</div>
					<div
						className={`mt-16 grid border border-white/10 max-[900px]:grid-cols-1 ${
							group.items.length === 3 ? "grid-cols-3" : "grid-cols-2"
						}`}
					>
						{group.items.map((item) => (
							<ResourceCell item={item} key={item.name} />
						))}
					</div>
				</section>
			))}
		</PageShell>
	);
}
