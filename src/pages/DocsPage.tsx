import { LocalLink } from "../components/LocalLink";
import { PageShell } from "../components/PageShell";

const toc = [
	["Prerequisites", "prerequisites"],
	["Quick start", "quick-start"],
	["Setup wizard", "setup-wizard"],
	["Runtime backends", "runtime-backends"],
	["Agent runtime", "agent-runtime"],
	["Remote / LAN", "remote-lan"],
	["Validation", "validation"],
];

const codeClass =
	"my-5 block max-w-full overflow-x-auto rounded-lg border border-white/10 px-5 py-4 font-mono text-sm/5 text-white/80";
const sectionClass = "scroll-mt-28";

export function DocsPage() {
	return (
		<PageShell
			footerLeft="Local Studio docs"
			footerRight="Desktop / web / controller / Pi"
		>
			<div className="mx-auto grid w-[min(1240px,calc(100%_-_48px))] grid-cols-[240px_minmax(0,760px)] justify-center gap-16 py-16 max-[900px]:grid-cols-1 max-[620px]:w-[calc(100%_-_24px)] max-[620px]:py-10">
				<aside className="sticky top-24 self-start max-[900px]:static">
					<p className="kicker">On this page</p>
					<nav aria-label="Documentation sections">
						<ul className="mt-4 grid gap-2 border-l border-white/10 p-0 pl-4 text-sm/5 text-white/60">
							{toc.map(([label, id]) => (
								<li key={id}>
									<LocalLink
										className="focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-white"
										href={`/docs#${id}`}
									>
										{label}
									</LocalLink>
								</li>
							))}
						</ul>
					</nav>
				</aside>
				<article className="min-w-0 text-base/6 text-white/70 [&_h2]:mt-16 [&_h2]:text-[28px]/9 [&_h2]:font-medium [&_h2]:text-white [&_li]:mb-2 [&_strong]:text-white">
					<header>
						<p className="kicker">Setup guide</p>
						<h1 className="mt-4 text-[40px]/[48px] font-medium tracking-[-0.02em] text-white max-[620px]:text-[32px]/10">
							Get Local Studio running
						</h1>
						<p className="mt-4 max-w-3xl">
							Local Studio is a local-first workstation for running, managing,
							and using self-hosted LLM backends. Two modules share one
							controller API: a Bun/Hono backend and a Next.js + React frontend
							with an Electron desktop shell.
						</p>
					</header>

					<section id="prerequisites" className={sectionClass}>
						<h2>Prerequisites</h2>
						<ul className="mt-4 list-disc pl-6">
							<li>
								<strong>Bun 1.x</strong> — for the controller.
							</li>
							<li>
								<strong>Node.js 20+ and npm</strong> — for the frontend.
							</li>
							<li>
								<strong>Python 3.10+ on PATH</strong> — engine installs use{" "}
								<code>uv</code> when present, pip otherwise.
							</li>
							<li>
								<strong>Git.</strong>
							</li>
							<li>
								<strong>NVIDIA driver + CUDA</strong> for vLLM/SGLang on Linux.
								Apple Silicon uses the MLX backend.
							</li>
						</ul>
					</section>

					<section id="quick-start" className={sectionClass}>
						<h2>Quick start</h2>
						<p className="mt-4">
							Run the preflight check first — it verifies toolchain, ports,
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
						<p className="rounded-lg border border-white/10 p-4">
							<code>npm ci</code> runs a postinstall patch against{" "}
							<code>@earendil-works/pi-ai</code>. If that step prints a warning,
							agent streaming may misrender — re-run <code>npm ci</code> to fix
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
								<strong>vLLM</strong> — CUDA throughput serving through
								configured, discovered, system, Docker, or bundled targets.
							</li>
							<li>
								<strong>SGLang</strong> — Structured and multi-turn serving
								through discovered or configured Python targets.
							</li>
							<li>
								<strong>llama.cpp</strong> — GGUF models through the
								llama-server binary. Great for CPU and modest hardware.
							</li>
							<li>
								<strong>MLX</strong> — Apple Silicon serving through
								mlx_lm.server. The default path on Mac.
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
							requires <code>LOCAL_STUDIO_API_KEY</code> — startup throws
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
							For the full agent runbook — controllers, providers, runtimes, and
							Pi sessions — see{" "}
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
