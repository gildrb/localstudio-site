import { CtaPair } from "../components/Links";
import { LocalLink } from "../components/LocalLink";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

const toc = [
	["Prerequisites", "prerequisites"],
	["Quick start", "quick-start"],
	["Setup wizard", "setup-wizard"],
	["Runtime backends", "runtime-backends"],
	["Agent runtime", "agent-runtime"],
	["Remote / LAN", "remote-lan"],
	["Validation", "validation"],
] as const;

const codeClass =
	"docs-code surface-compact my-8 block max-w-full overflow-x-auto border border-white/10 px-5 py-4 font-mono text-sm/5 text-white/80";
const sectionClass = "docs-section scroll-mt-28";

export function DocsPage() {
	return (
		<PageShell>
			<PageIntro
				id="docs-title"
				layout="left"
				title="Get Local Studio running"
				description="Install the controller and desktop workspace, choose a runtime, launch a model, and verify local inference."
				actions={
					<CtaPair
						secondary={{ href: "/prompt", label: "Setup prompt" }}
					/>
				}
			/>
			<div className="docs-layout section-width grid grid-cols-[240px_minmax(0,1fr)] gap-12 pb-30 max-[900px]:grid-cols-1 max-[900px]:gap-12">
				<aside className="sticky top-24 self-start max-[900px]:static">
					<p className="docs-toc__label text-sm/5">On this page</p>
					<nav className="docs-toc" aria-label="Documentation sections">
						<ul className="docs-toc__list mt-4 grid gap-2 border-l p-0 pl-4 text-base/6">
							{toc.map(([label, id]) => (
								<li key={id}>
									<LocalLink href={`/docs#${id}`}>{label}</LocalLink>
								</li>
							))}
						</ul>
					</nav>
				</aside>
				<article className="docs-prose min-w-0 text-base/6 text-(--dim) [&_li]:mb-2">
					<p>
						<span translate="no">Local Studio</span> is a local-first
						workstation for running, managing, and using self-hosted LLM
						backends. Two modules share one controller API: a{" "}
						<span translate="no">Bun</span>/Hono backend and a Next.js + React
						frontend with an Electron desktop shell.
					</p>
					<section id="prerequisites" className={sectionClass}>
						<h2>Prerequisites</h2>
						<ul className="mt-4 list-disc pl-6">
							<li>
								<strong>
									<span translate="no">Bun</span> 1.x
								</strong>{" "}
								for the controller.
							</li>
							<li>
								<strong>Node.js 20+ and npm</strong> for the frontend.
							</li>
							<li>
								<strong>Python 3.10+ on PATH.</strong> Engine installs use{" "}
								<code>uv</code> when present, pip otherwise.
							</li>
							<li>
								<strong>Git.</strong>
							</li>
							<li>
								<strong>
									NVIDIA driver + <span translate="no">CUDA</span>
								</strong>{" "}
								for vLLM/SGLang on Linux. Apple Silicon uses the{" "}
								<span translate="no">MLX</span> backend.
							</li>
						</ul>
					</section>

					<section id="quick-start" className={sectionClass}>
						<h2>Quick start</h2>
						<p className="mt-4">
							Run the preflight check first. It verifies toolchain, ports,
							directories, and network:
						</p>
						<pre className={codeClass}>npm run doctor</pre>
						<p>
							Start the controller (listens on <code>127.0.0.1:8080</code>; data
							dir and SQLite are created automatically, model weights live in{" "}
							<code>LOCAL_STUDIO_MODELS_DIR</code>, default <code>/models</code>
							):
						</p>
						<pre className={codeClass}>
							cd controller &amp;&amp; bun install &amp;&amp; bun src/main.ts
						</pre>
						<p>
							Start the frontend in a second terminal, then open{" "}
							<code>http://localhost:3000/setup</code>:
						</p>
						<pre className={codeClass}>
							cd frontend &amp;&amp; npm ci &amp;&amp; npm run dev
						</pre>
						<p className="surface-compact border border-white/10 p-4">
							<code>npm ci</code> runs a postinstall patch against{" "}
							<code>@earendil-works/pi-ai</code>. If that step prints a warning,
							agent streaming may misrender. Re-run <code>npm ci</code> to fix
							it.
						</p>
					</section>

					<section id="setup-wizard" className={sectionClass}>
						<h2>Setup wizard</h2>
						<p className="mt-4">
							The first-run <code>/setup</code> wizard walks through choosing a
							models directory, installing an engine, downloading a model,
							launching it, and benchmarking. Engine installs (vLLM/SGLang/MLX)
							land in{" "}
							<code>&lt;data dir&gt;/runtime/venvs/&lt;backend&gt;-latest</code>
							.
						</p>
					</section>

					<section id="runtime-backends" className={sectionClass}>
						<h2>Runtime backends</h2>
						<p className="mt-4">
							Recipes launch through the controller runtime layer. Wired backend
							families:
						</p>
						<ul className="mt-4 list-disc pl-6">
							<li>
								<strong>
									<span translate="no">vLLM</span>
								</strong>{" "}
								- CUDA throughput serving through configured, discovered,
								system, Docker, or bundled targets.
							</li>
							<li>
								<strong>
									<span translate="no">SGLang</span>
								</strong>{" "}
								- Structured and multi-turn serving through discovered or
								configured Python targets.
							</li>
							<li>
								<strong>
									<span translate="no">llama.cpp</span>
								</strong>{" "}
								- GGUF models through the llama-server binary. Great for CPU and
								modest hardware.
							</li>
							<li>
								<strong>
									<span translate="no">MLX</span>
								</strong>{" "}
								- Apple Silicon serving through mlx_lm.server. The default path
								on Mac.
							</li>
						</ul>
						<p>
							Runtime target discovery is surfaced in Settings; selections
							persist in the controller data directory.
						</p>
					</section>

					<section id="agent-runtime" className={sectionClass}>
						<h2>Agent runtime</h2>
						<p className="mt-4">
							The agent surface lives at <code>/agent</code> in the frontend. It
							uses <code>@earendil-works/pi-coding-agent</code> through the
							frontend runtime rather than shelling out to a separate agent
							process. Agent skills and extensions are loaded by the frontend
							runtime and surfaced in the session UI.
						</p>
						<p className="mt-4">
							Agent file operations are local-only, stored under{" "}
							<code>data/agentfs</code>.
						</p>
					</section>

					<section id="remote-lan" className={sectionClass}>
						<h2>Remote / LAN deployment</h2>
						<p className="mt-4">
							The controller binds <code>127.0.0.1</code> by default. Binding a
							non-loopback host (e.g. <code>LOCAL_STUDIO_HOST=0.0.0.0</code>)
							requires <code>LOCAL_STUDIO_API_KEY</code>. Startup throws
							without it. On a trusted LAN you may instead set{" "}
							<code>LOCAL_STUDIO_ALLOW_UNAUTHENTICATED=true</code> to opt out of
							authentication.
						</p>
						<p className="mt-4">
							Point the frontend at a remote controller with{" "}
							<code>BACKEND_URL</code> or <code>NEXT_PUBLIC_API_URL</code>{" "}
							(default <code>http://localhost:8080</code>). Configure{" "}
							<code>.env.local</code> first:
						</p>
						<pre className={codeClass}>
							REMOTE_HOST=192.168.x.x REMOTE_USER=username
							REMOTE_PATH=/home/user/project{`\n`}# Optional: REMOTE_SSH_KEY
							(defaults to ~/.ssh/id_ed25519)
						</pre>
						<pre className={codeClass}>
							./scripts/deploy-remote.sh controller # sync + build + restart
							controller{`\n`}./scripts/deploy-remote.sh frontend # sync + build
							+ restart frontend{`\n`}./scripts/deploy-remote.sh status #
							inspect remote processes
						</pre>
						<p>
							Local daemon helper:{" "}
							<code>./scripts/daemon.sh &#123;start|stop|status&#125;</code>.
						</p>
					</section>

					<section id="validation" className={sectionClass}>
						<h2>Validation</h2>
						<p className="mt-4">After setup, confirm the stack is healthy:</p>
						<ul className="mt-4 list-disc pl-6">
							<li>
								Settings switches controllers and the runtime state updates.
							</li>
							<li>
								System shows installed engines and the active service topology.
							</li>
							<li>
								A model launches through a recipe and /status reflects it.
							</li>
							<li>
								/v1/chat/completions works locally and through a provider route.
							</li>
							<li>
								/agent completes a turn using the selected model and local
								tools.
							</li>
						</ul>
						<pre className={codeClass}>
							npm run check # contracts + structure + frontend quality +
							controller typecheck{`\n`}npm run test:integration # controller
							integration + frontend regression
						</pre>
						<p>
							For the full agent runbook covering controllers, providers, runtimes, and{" "}
							<span translate="no">Pi</span> sessions, see{" "}
							<LocalLink
								className="text-white underline underline-offset-4"
								href="/agents"
							>
								the agents page
							</LocalLink>
							.
						</p>
					</section>
				</article>
			</div>
		</PageShell>
	);
}
