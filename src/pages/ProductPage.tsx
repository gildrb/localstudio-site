import { DownloadButton, TextLink } from "../components/Links";
import { PageShell } from "../components/PageShell";

const sections = [
	{
		title: "Control the runtime.",
		text: "Launch and evict models, manage recipes and downloads, and watch GPU, process, log, and usage state from one controller.",
		image: "/images/usage-proxy.png",
		alt: "Local Studio usage screen showing requests, sessions, token activity, and runtime status.",
	},
	{
		title: "Run the backend that fits.",
		text: "Configure vLLM, SGLang, llama.cpp, or MLX targets, then serve them through one OpenAI-compatible proxy. Runtime discovery and saved selections stay with the controller.",
		image: "/images/configure-models.png",
		alt: "Local Studio Configure screen showing model and runtime settings.",
	},
	{
		title: "Work where models run.",
		text: "Use the Pi-powered Workbench for agent sessions with models, providers, browser, files, terminal, and registered tools in one timeline.",
		image: "/images/workbench-terminal.png",
		alt: "Local Studio Workbench showing an agent session, terminal output, and tool activity.",
	},
] as const;

const container =
	"mx-auto w-[min(1240px,calc(100%_-_48px))] max-[620px]:w-[calc(100%_-_24px)]";

export function ProductPage() {
	return (
		<PageShell>
			<section
				className={`${container} py-28 max-[620px]:py-20`}
				aria-labelledby="product-title"
			>
				<header className="max-w-3xl">
					<h1 id="product-title">One place to run local AI.</h1>
					<p className="mt-8 max-w-2xl text-base/6 text-white/70">
						Local Studio is a local-first workstation for running, managing,
						and using self-hosted language-model backends on local or remote
						controllers.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-6">
						<DownloadButton />
						<TextLink href="/docs" arrow="right">
							Read the docs
						</TextLink>
					</div>
				</header>
				<figure className="mt-20 overflow-hidden rounded-xl border border-white/10">
					<img
						className="block h-auto w-full"
						src="/images/workbench-browser.png"
						alt="Local Studio Workbench showing a coding agent and integrated browser."
						width="5118"
						height="2800"
						fetchPriority="high"
					/>
				</figure>
			</section>

			<section className={`${container} pb-30`} aria-label="Product capabilities">
				{sections.map((section, index) => (
					<article
						className={`grid min-h-[720px] items-center gap-30 py-20 max-[900px]:min-h-0 max-[900px]:grid-cols-1 max-[900px]:gap-12 ${index % 2 ? "grid-cols-[minmax(0,1.28fr)_minmax(260px,.72fr)]" : "grid-cols-[minmax(260px,.72fr)_minmax(0,1.28fr)]"}`}
						key={section.title}
					>
						<div className={index % 2 ? "order-2 max-[900px]:order-none" : undefined}>
							<h2 className="text-[42px]/12 font-medium max-[620px]:text-[32px]/10">
								{section.title}
							</h2>
							<p className="mt-6 max-w-md text-base/6 text-white/70">
								{section.text}
							</p>
						</div>
						<figure
							className={`overflow-hidden rounded-xl border border-white/10 ${index % 2 ? "order-1 max-[900px]:order-none" : ""}`}
						>
							<img
								className="block h-auto w-full"
								src={section.image}
								alt={section.alt}
								width="5118"
								height="2800"
								loading="lazy"
								decoding="async"
							/>
						</figure>
					</article>
				))}
			</section>
		</PageShell>
	);
}
