import { ArrowRight, ArrowUpRight } from "lucide-react";
import { docsPath, downloadLabel, downloadPath, setupPath } from "../domain/route";
import { site } from "../domain/site";
import { CtaPair } from "../components/Links";
import { LocalLink } from "../components/LocalLink";
import { PageCta } from "../components/PageCta";
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
				href: docsPath,
				external: false,
			},
			{
				name: "Setup prompt",
				text: "A portable prompt that installs Local Studio with any coding model.",
				href: setupPath,
				external: false,
			},
			{
				name: downloadLabel(),
				text: "The desktop app for Apple Silicon, hosted on GitHub Releases.",
				href: downloadPath,
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
				name: "KittyLitter",
				text: "The native iOS + Android client for Codex, Claude, OpenCode, Pi, and Droid.",
				href: site.products.kittyLitter.url,
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
				href: site.products.localStudio.repository,
				external: true,
			},
		],
	},
];
const prose = "text-base/6 text-white/70";

function ResourceCell({ item }: { item: ResourceItem }) {
	const Icon = item.external ? ArrowUpRight : ArrowRight;
	return (
		<article className="group relative border-r border-white/10 p-8 transition-colors duration-[130ms] last:border-r-0 hover:bg-(--hover) max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:last:border-b-0">
			<h3 className="flex items-center gap-2">
				<LocalLink
					className="text-link after:absolute after:inset-0"
					href={item.href}
					{...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
				>
					{item.name}
				</LocalLink>
				<Icon
					aria-hidden="true"
					className="text-(--quiet) transition-colors duration-[130ms] group-hover:text-white"
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
				title="Everything around Local Studio"
				description="Documentation, setup paths, downloads, and the surrounding ecosystem in one place."
				actions={
					<CtaPair secondary={{ href: docsPath, label: "Read the docs" }} />
				}
			/>
			{groups.map((group, index) => (
				<section
					aria-labelledby={`resources-group-${index}`}
					className={`section-width page-section ${
						index === 0 ? "pb-30" : "border-t border-white/10 py-30 max-[900px]:py-16"
					}`}
					key={group.title}
				>
					<div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)] items-end gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-4">
						<h2 id={`resources-group-${index}`}>{group.title}</h2>
						<p className={prose}>{group.description}</p>
					</div>
					<div
						className={`surface-panel mt-16 grid border border-white/10 max-[900px]:grid-cols-1 ${
							group.items.length === 3 ? "grid-cols-3" : "grid-cols-2"
						}`}
					>
						{group.items.map((item) => (
							<ResourceCell item={item} key={item.name} />
						))}
					</div>
				</section>
			))}
			<PageCta id="resources-cta-title" />
		</PageShell>
	);
}
