import { DownloadButton, TextLink } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

const groups = [
	{
		title: "Getting started",
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
] as const;

export function ResourcesPage() {
	return (
		<PageShell>
			<PageIntro
				id="resources-title"
				layout="left"
				title="Everything around Local Studio."
				description="Documentation, setup paths, downloads, and the surrounding ecosystem in one place."
				actions={
					<div className="button-group">
						<DownloadButton />
					</div>
				}
			/>
			<section className="section-width pb-30" aria-label="Resource groups">
				{groups.map((group) => (
					<div className="mt-16 first:mt-0" key={group.title}>
						<h2>{group.title}</h2>
						<ul className="mt-6 grid gap-4 p-0">
							{group.items.map((item) => (
								<li
									className="border border-white/10 p-6"
									key={item.name}
								>
									<div className="flex items-baseline justify-between gap-6">
										<strong className="text-base/6">{item.name}</strong>
										{item.external ? (
											<a
												className="text-link"
												href={item.href}
												target="_blank"
												rel="noreferrer"
											>
												Visit
											</a>
										) : (
											<TextLink href={item.href}>Open</TextLink>
										)}
									</div>
									<p className="mt-2 text-base/6 text-white/70">{item.text}</p>
								</li>
							))}
						</ul>
					</div>
				))}
			</section>
		</PageShell>
	);
}
