import { useMachine } from "../machine";
import { LocalLink } from "../components/LocalLink";
import { PageShell } from "../components/PageShell";

const banner = `                    ::::::::::::
              ::::::::::::::::::::::
           ::::::::::::::::::::::::::::
         ::::::::::::::::::::::::::::::::
       ::::::::::::::::::::::::::::::::::::
      :::::::::::::::::::::::::::::::::::::::
    :::::::::::        ::::        :::::::::::
   ::::::::::           ::           ::::::::::
  ::::::::::           ::::           ::::::::::
  :::::::::            ::::            ::::::::::
 ::::::::::           :::::            ::::::::::
:::::::::::            ::::            ::::::::::
:::::::::: :::::       ::::       ::::: ::::::::::
:::::::     :::::::     ::     :::::::    ::::::::
::::::       :::::::          :::::::       ::::::
:::::           :::::        ::::            :::::
:::::                                        :::::
:::::                                        :::::
 ::::                                        :::::
 :::::                                      :::::
 ::::::                                    :::::
  :::::::                                :::::::
   ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::
     :::::::::::::::::::::::::::::::::::::::
       ::::::::::::::::::::::::::::::::::::
         ::::::::::::::::::::::::::::::::
           ::::::::::::::::::::::::::::
              ::::::::::::::::::::::
                  :::::::::::`;

const sections: Array<[string, string[]]> = [
	[
		"ABOUT",
		[
			"name .......... local studio",
			"aka ........... localstudio",
			"platform ...... macOS desktop app (Apple Silicon)",
			"website ....... this site",
			"repository .... github.com/sybil-solutions/local-studio",
			"license ....... open source",
			"companion ..... KittyLitter (iOS + Android client)",
		],
	],
	[
		"PRODUCT",
		[
			"local-studio is a local-first workstation for running, managing, and using",
			"self-hosted language-model backends on local or remote controllers.",
			"",
			"one controller api serves two modules: a bun/hono backend and a",
			"next.js + react frontend with an electron desktop shell.",
			"",
			"keeps the model, the runtime, and the hardware together. nothing",
			"important disappears behind a provider abstraction.",
		],
	],
	[
		"CAPABILITIES",
		[
			"* control",
			"  local and remote controllers, live status, launch state, logs,",
			"  and metrics from one surface.",
			"* serve",
			"  vllm, sglang, mlx, and llama.cpp behind one openai-compatible proxy.",
			"* work",
			"  models, providers, browser, files, terminal, and agents in the same",
			"  session through the pi-powered workbench.",
		],
	],
	[
		"RUNTIMES",
		[
			"- vllm ........ cuda throughput serving (linux/nvidia)",
			"- sglang ...... structured and multi-turn serving (python)",
			"- llama.cpp ... gguf models through llama-server (cpu and modest gpus)",
			"- mlx ......... apple silicon serving through mlx_lm.server (mac default)",
		],
	],
	[
		"MOBILE",
		[
			"kittylitter is a native ios + android client for codex, claude,",
			"opencode, pi, and droid. connect from your local network, over ssh,",
			"or via alleycat peer-to-peer pairing — from anywhere.",
			"",
			"features: multi-agent, auto-discovery, alleycat, ssh connections,",
			"voice input, 70+ themes. open source and always free.",
			"url: kittylitter.app",
		],
	],
	[
		"DOWNLOAD",
		[
			"artifact ...... local-studio-arm64.dmg",
			"size .......... 255 mb",
			"arch .......... arm64",
			"platform ...... macos",
			"hosted ........ github releases v2.11.2",
			"url ........... /download/macos",
		],
	],
	[
		"AGENTS",
		[
			"provider keys live in controller config, not prompts.",
			"provider/model routes to that provider; default model names hit the",
			"active backend. pi sessions load selected skills and local tools.",
			"the full runbook lives at /agents.",
		],
	],
	[
		"ROUTES",
		[
			"/ ............. home",
			"/product ...... product tour",
			"/mobile ....... kittylitter pairing and features",
			"/docs ......... installation and operations guide",
			"/prompt ....... portable setup prompt for coding models",
			"/agents ....... agent setup runbook",
			"/resources .... everything around local studio",
			"/download/macos release download",
		],
	],
];

export function MachinePage() {
	const { toggleMachine } = useMachine();
	return (
		<PageShell>
		<main className="machine" id="content" tabIndex={-1}>
			<div className="machine__inner">
			<button
				className="machine__banner"
				type="button"
				onClick={() => toggleMachine(false)}
				aria-label="Back to the human page"
			>
				{banner}
			</button>
			<p className="machine__title">
				<span translate="no">local studio</span> :: machine-readable index
			</p>
			<p className="machine__note">
				plain-text mirror of the site for agents, crawlers, and humans who
				prefer it raw.
			</p>
			<nav className="machine__routes" aria-label="Site routes">
				{sections
					.find(([name]) => name === "ROUTES")?.[1]
					.map((line) => {
						const route = line.split(" ")[0];
						return (
							<LocalLink href={route} key={route}>
								{route}
							</LocalLink>
						);
					})}
			</nav>
			{sections.map(([name, lines]) => (
				<section className="machine__section" key={name}>
					<h2>
						── {name}{" "}
						{"─".repeat(Math.max(2, 80 - name.length - 5))}
					</h2>
					<pre>{lines.join("\n")}</pre>
				</section>
			))}
				<section className="machine__section" aria-label="For agents">
					<h2>
						── FOR_AGENTS{" "}
						{"─".repeat(56)}
					</h2>
					<pre>{`llms.txt ....... /llms.txt
agents.md ...... /agents.md
sitemap.md ..... /sitemap.md
index.md ....... /index.md
services.md .... /services.md
people.md ...... /people.md
showcase.md .... /showcase.md
faq.md ......... /faq.md

every page also serves markdown: append .md to a URL, or request it
with Accept: text/markdown`}</pre>
				</section>
				<p className="machine__end">:: end of index ::</p>
			</div>
		</main>
		</PageShell>
	);
}
