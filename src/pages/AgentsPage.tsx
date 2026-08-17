import instructions from "../content/agent-instructions.txt?raw";
import probes from "../content/agent-probes.txt?raw";
import { CtaPair } from "../components/Links";
import { MediaFrame } from "../components/MediaFrame";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { frameSizes, responsiveSrcSet, storySizes } from "../images";

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
];

export function AgentsPage() {
	return (
		<PageShell>
			<PageIntro
				id="agents-title"
				layout="left"
				title="Set up the stack."
				description={
					<>
						A compact <span translate="no">DLTL</span>, a copy-paste
						instruction sheet for coding agents covering controllers,
						providers, runtimes, and <span translate="no">Pi</span>.
					</>
				}
				actions={
					<CtaPair
						secondary={{ href: "/", label: "Back to overview" }}
					/>
				}
			/>
			<section
				className="mx-auto w-[min(1240px,calc(100%_-_48px))] pb-30"
				aria-label="Agent setup"
			>
				<div className="mt-16 grid grid-cols-[minmax(240px,.72fr)_minmax(0,1.28fr)] items-start gap-10 max-[900px]:grid-cols-[minmax(0,1fr)]">
					<aside className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8">
						<section>
							<h2>Scope</h2>
							<p className="mt-4 text-base/6 text-white/70">
								Multi-controller. Multi-provider. Runtime-aware. Local-tool
								aware.
							</p>
							<ul className="mt-6 grid border border-white/10 p-0 text-base/6 text-white/70">
								{scope.map((item) => (
									<li
										className="border-b border-white/10 p-4 last:border-b-0"
										key={item}
									>
										○ &nbsp; {item}
									</li>
								))}
							</ul>
						</section>
						<section>
							<h2>Useful probes</h2>
							<pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 p-5 font-mono text-sm/5 text-white/80">
								{probes}
							</pre>
						</section>
					</aside>
					<section
						className="min-w-0 overflow-hidden rounded-lg border border-white/10"
						aria-labelledby="instructions-title"
					>
						<div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
							<h2
								id="instructions-title"
								className="text-sm/5 font-normal text-white/70"
							>
								Agent instructions
							</h2>
							<span className="rounded-full border border-white/10 px-2 py-1 font-mono text-sm/5 text-white/50">
								<span translate="no">DLTL</span>
							</span>
						</div>
						<pre className="max-h-[1320px] overflow-auto whitespace-pre-wrap p-6 font-mono text-sm/5 text-white/80">
							{instructions}
						</pre>
					</section>
				</div>
			</section>

			<section
				className="mx-auto w-[min(1240px,calc(100%_-_48px))] border-t border-white/10 py-30"
				aria-labelledby="agents-media-title"
			>
				<div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)] items-end gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-8">
					<div>
						<h2 id="agents-media-title">Runtime. Agent. Models.</h2>
					</div>
					<p className="text-base/6 text-white/70">
						The setup path is visible in the app.
					</p>
				</div>
				<div className="mt-16 grid grid-cols-[1.12fr_.72fr] gap-5 max-[900px]:grid-cols-1">
					<MediaFrame
						caption={
							<>
								<strong>Workbench</strong>
								<span>live app capture</span>
							</>
						}
						src="/images/workbench-browser.png"
						srcSet={responsiveSrcSet("/images/workbench-browser.png")}
						sizes={storySizes}
						alt="Local Studio workbench with a coding agent and integrated browser."
						width="5118"
						height="2800"
						loading="lazy"
						decoding="async"
					/>
					<div className="grid gap-5">
						<MediaFrame
							caption={
								<>
									<strong>Tools</strong>
									<span>live app capture</span>
								</>
							}
							src="/images/workbench-terminal.png"
							srcSet={responsiveSrcSet("/images/workbench-terminal.png")}
							sizes={frameSizes}
							alt="Local Studio workbench showing terminal and agent tool activity."
							width="5118"
							height="2800"
							loading="lazy"
							decoding="async"
						/>
						<MediaFrame
							caption={
								<>
									<strong>Configure</strong>
									<span>live app capture</span>
								</>
							}
							src="/images/configure-models.png"
							srcSet={responsiveSrcSet("/images/configure-models.png")}
							sizes={frameSizes}
							alt="Local Studio model configuration screen."
							width="5118"
							height="2800"
							loading="lazy"
							decoding="async"
						/>
					</div>
				</div>
				<div className="mt-20 grid grid-cols-3 border border-white/10 max-[900px]:grid-cols-1">
					{capabilities.map(([title, text]) => (
						<article
							className="min-h-56 border-r border-white/10 p-8 last:border-r-0 max-[900px]:min-h-0 max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:last:border-b-0"
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
							<p className="mt-4 text-base/6 text-white/70">{text}</p>
						</article>
					))}
				</div>
			</section>
		</PageShell>
	);
}
