import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { docsPath, routes, setupPath } from "../domain/route";
import { CtaPair } from "../components/Links";
import { DocsLayout } from "../components/DocsLayout";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { site } from "../domain/site";
import { styles } from "../styles/pages-styles";

const toc = [
	["Prerequisites", "prerequisites"],
	["Quick Start", "quick-start"],
	["Setup Wizard", "setup-wizard"],
	["Runtime Backends", "runtime-backends"],
	["Agent Runtime", "agent-runtime"],
	["Remote / LAN", "remote-lan"],
	["Validation", "validation"],
] as const;

export function DocsPage() {
	return (
		<PageShell>
			<PageIntro
				id="docs-title"
				title={routes[docsPath].heading}
				description="Install the controller and desktop workspace, choose a runtime, launch a model, and verify local inference."
				actions={
					<CtaPair
						secondary={{ href: setupPath, label: "Setup Prompt" }}
					/>
				}
			/>
			<DocsLayout toc={toc} path={docsPath} label="Documentation sections">
					<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
						<span translate="no" {...stylex.props(baseStyles.element)}>{site.products.localStudio.name}</span> is a local-first
						workstation for running, managing, and using self-hosted LLM
						backends. Two modules share one controller API: a{" "}
						<span translate="no" {...stylex.props(baseStyles.element)}>Bun</span>/Hono backend and a Next.js + React
						frontend with an Electron desktop shell.
					</p>
					<section id="prerequisites" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Prerequisites</h2>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.docsSectionLead, styles.docsList)}>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
									<span translate="no" {...stylex.props(baseStyles.element)}>Bun</span> 1.x
								</strong>{" "}
								for the controller.
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>Node.js 20+ and npm</strong> for the frontend.
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>Python 3.10+ on PATH.</strong> Engine installs use{" "}
								<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>uv</code> when present, pip otherwise.
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>Git.</strong>
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
									NVIDIA driver + <span translate="no" {...stylex.props(baseStyles.element)}>CUDA</span>
								</strong>{" "}
								for vLLM/SGLang on Linux. Apple Silicon uses the{" "}
								<span translate="no" {...stylex.props(baseStyles.element)}>MLX</span> backend.
							</li>
						</ul>
					</section>

					<section id="quick-start" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Quick Start</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							Run the preflight check first. It verifies toolchain, ports,
							directories, and network:
						</p>
						<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>npm run doctor</pre>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
							Start the controller (listens on <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>127.0.0.1:8080</code>; data
							dir and SQLite are created automatically, model weights live in{" "}
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>LOCAL_STUDIO_MODELS_DIR</code>, default <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>/models</code>
							):
						</p>
						<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
							cd controller &amp;&amp; bun install &amp;&amp; bun src/main.ts
						</pre>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
							Start the frontend in a second terminal, then open{" "}
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>http://localhost:3000/setup</code>:
						</p>
						<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
							cd frontend &amp;&amp; npm ci &amp;&amp; npm run dev
						</pre>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsNotice)}>
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>npm ci</code> runs a postinstall patch against{" "}
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>@earendil-works/pi-ai</code>. If that step prints a warning,
							agent streaming may misrender. Re-run <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>npm ci</code> to fix
							it.
						</p>
					</section>

					<section id="setup-wizard" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Setup Wizard</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							The first-run <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>/setup</code> wizard walks through choosing a
							models directory, installing an engine, downloading a model,
							launching it, and benchmarking. Engine installs (vLLM/SGLang/MLX)
							land in{" "}
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>&lt;data dir&gt;/runtime/venvs/&lt;backend&gt;-latest</code>
							.
						</p>
					</section>

					<section id="runtime-backends" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Runtime Backends</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							Recipes launch through the controller runtime layer. Wired backend
							families:
						</p>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.marginTop16, styles.docsList)}>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
									<span translate="no" {...stylex.props(baseStyles.element)}>vLLM</span>
								</strong>{" "}
								- CUDA throughput serving through configured, discovered,
								system, Docker, or bundled targets.
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
									<span translate="no" {...stylex.props(baseStyles.element)}>SGLang</span>
								</strong>{" "}
								- Structured and multi-turn serving through discovered or
								configured Python targets.
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
									<span translate="no" {...stylex.props(baseStyles.element)}>llama.cpp</span>
								</strong>{" "}
								- GGUF models through the llama-server binary. Great for CPU and
								modest hardware.
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
									<span translate="no" {...stylex.props(baseStyles.element)}>MLX</span>
								</strong>{" "}
								- Apple Silicon serving through mlx_lm.server. The default path
								on Mac.
							</li>
						</ul>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
							Runtime target discovery is surfaced in Settings; selections
							persist in the controller data directory.
						</p>
					</section>

					<section id="agent-runtime" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Agent Runtime</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							The agent surface lives at <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>/agent</code> in the frontend. It
							uses <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>@earendil-works/pi-coding-agent</code> through the
							frontend runtime rather than shelling out to a separate agent
							process. Agent skills and extensions are loaded by the frontend
							runtime and surfaced in the session UI.
						</p>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.marginTop16)}>
							Agent file operations are local-only, stored under{" "}
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>data/agentfs</code>.
						</p>
					</section>

					<section id="remote-lan" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Remote / LAN Deployment</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
							The controller binds <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>127.0.0.1</code> by default. Binding a
							non-loopback host (e.g. <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>LOCAL_STUDIO_HOST=0.0.0.0</code>)
							requires <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>LOCAL_STUDIO_API_KEY</code>. Startup throws
							without it. On a trusted LAN you may instead set{" "}
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>LOCAL_STUDIO_ALLOW_UNAUTHENTICATED=true</code> to opt out of
							authentication.
						</p>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.marginTop16)}>
							Point the frontend at a remote controller with{" "}
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>BACKEND_URL</code> or <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>NEXT_PUBLIC_API_URL</code>{" "}
							(default <code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>http://localhost:8080</code>). Configure{" "}
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>.env.local</code> first:
						</p>
						<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
							REMOTE_HOST=192.168.x.x REMOTE_USER=username
							REMOTE_PATH=/home/user/project{`\n`}# Optional: REMOTE_SSH_KEY
							(defaults to ~/.ssh/id_ed25519)
						</pre>
						<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
							./scripts/deploy-remote.sh controller # sync + build + restart
							controller{`\n`}./scripts/deploy-remote.sh frontend # sync + build
							+ restart frontend{`\n`}./scripts/deploy-remote.sh status #
							inspect remote processes
						</pre>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
							Local daemon helper:{" "}
							<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>./scripts/daemon.sh &#123;start|stop|status&#125;</code>.
						</p>
					</section>

					<section id="validation" {...stylex.props(baseStyles.element, styles.docsSection)}>
						<h2 {...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.headingTwo, styles.docsSectionHeading)}>Validation</h2>
						<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>After setup, confirm the stack is healthy:</p>
						<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.marginTop16, styles.docsList)}>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								Settings switches controllers and the runtime state updates.
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								System shows installed engines and the active service topology.
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								A model launches through a recipe and /status reflects it.
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								/v1/chat/completions works locally and through a provider route.
							</li>
							<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
								/agent completes a turn using the selected model and local
								tools.
							</li>
						</ul>
						<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
							npm run check # contracts + structure + frontend quality +
							controller typecheck{`\n`}npm run test:integration # controller
							integration + frontend regression
						</pre>
					</section>
			</DocsLayout>
		</PageShell>
	);
}
