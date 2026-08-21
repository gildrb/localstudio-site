import instructions from "../content/agent-instructions.txt?raw";
import probes from "../content/agent-probes.txt?raw";
import { PromptBlock } from "../components/PromptBlock";
import { CtaPair } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

const container = "mx-auto w-[min(1399px,calc(100%_-_48px))]";
const sectionTitle = "max-w-3xl";
const prose = "text-base/6 text-white/70";

const scope = [
	"Controllers stay saved; switching is non-destructive.",
	"Provider keys live in controller config, not prompts.",
	"provider/model routes to that provider.",
	"Default model names hit the active backend.",
	"Pi sessions load selected skills and local tools.",
];

const capabilities = [
	["Controllers", "Lifecycle, logs, metrics, recipes, provider config, proxy."],
	["Providers", "OpenAI-compatible upstreams addressed as provider/model."],
	["Pi agents", "Skills, project context, browser, files, terminal."],
] as const;

export function AgentsPage() {
	return (
		<PageShell>
			<PageIntro
				id="agents-title"
				layout="left"
				title="Set up the stack"
				description="A copy-paste instruction sheet for coding agents covering controllers, providers, runtimes, and Pi."
				actions={
					<CtaPair secondary={{ href: "/docs", label: "Read the docs" }} />
				}
			/>
			<section
				className={`${container} page-section pb-30`}
				aria-labelledby="agents-capabilities-title"
			>
				<div className="max-w-3xl">
					<h2 id="agents-capabilities-title" className={sectionTitle}>
						Three moving parts
					</h2>
					<p className={`mt-6 ${prose}`}>
						The agent runtime talks to saved controllers, routes through
						providers, and loads local tools. Configure each once.
					</p>
				</div>
				<div className="surface-panel mt-16 grid grid-cols-3 border border-white/10 max-[900px]:grid-cols-1">
					{capabilities.map(([title, text]) => (
						<article
							className="min-h-64 border-r border-white/10 p-8 last:border-r-0 max-[900px]:min-h-0 max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:last:border-b-0"
							key={title}
						>
							<h3>
								{title === "Pi agents" ? (
									<>
										<span translate="no">Pi</span> agents
									</>
								) : (
									title
								)}
							</h3>
							<p className={`mt-4 ${prose}`}>{text}</p>
						</article>
					))}
				</div>
			</section>
			<section
				className={`${container} page-section border-t border-white/10 py-30 max-[900px]:py-16`}
				aria-labelledby="instructions-title"
			>
				<div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)] items-end gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-4">
					<h2 id="instructions-title">One sheet for the agent</h2>
					<p className={prose}>
						Paste it into any coding agent. It operates the real install and
						never touches secrets.
					</p>
				</div>
				<div className="mt-16">
					<PromptBlock label="Agent setup instructions" text={instructions} />
				</div>
				<aside className="mt-16 grid min-w-0 grid-cols-2 gap-6 max-[900px]:grid-cols-1">
					<section className="min-w-0" aria-labelledby="agents-scope-title">
							<h3 id="agents-scope-title" className="text-base/6 font-medium">
								Scope
							</h3>
							<ul className="surface-card mt-4 grid border border-white/10 p-0 text-base/6 text-white/70">
								{scope.map((item, index) => (
									<li
										className="flex gap-4 border-b border-white/10 p-4 last:border-b-0"
										key={item}
									>
										<span className="font-mono text-sm/6 text-white/40">
											{String(index + 1).padStart(2, "0")}
										</span>
										{item}
									</li>
								))}
							</ul>
					</section>
					<section className="min-w-0" aria-labelledby="agents-probes-title">
							<h3 id="agents-probes-title" className="text-base/6 font-medium">
								Useful probes
							</h3>
							<pre className="docs-code surface-compact mt-4 block max-w-full overflow-x-auto border border-white/10 px-5 py-4 font-mono text-sm/5 text-white/80">
								{probes}
							</pre>
					</section>
				</aside>
			</section>
			<section
				className={`${container} page-cta`}
				aria-labelledby="agents-cta-title"
			>
				<div>
					<h2 id="agents-cta-title">Give your agents a local home</h2>
					<div className="hero__actions">
						<CtaPair secondary={{ href: "/setup", label: "Setup prompt" }} />
					</div>
				</div>
			</section>
		</PageShell>
	);
}
