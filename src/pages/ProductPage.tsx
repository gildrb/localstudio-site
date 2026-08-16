import { DownloadButton, TextLink } from "../components/Links";
import { MediaFrame } from "../components/MediaFrame";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { frameSizes, heroSizes, responsiveSrcSet } from "../images";

const sections = [
	{
		title: "Control the runtime.",
		text: "Launch and evict models, manage recipes and downloads, and watch GPU, process, log, and usage state from one controller.",
		image: "/images/usage-proxy.png",
		alt: "Local Studio usage screen showing requests, sessions, token activity, and runtime status.",
	},
	{
		title: "Run the backend that fits.",
		text: (
			<>
				Configure <span translate="no">vLLM</span>,{" "}
				<span translate="no">SGLang</span>,{" "}
				<span translate="no">llama.cpp</span>, or{" "}
				<span translate="no">MLX</span> targets, then serve them through one
				OpenAI-compatible proxy. Runtime discovery and saved selections stay
				with the controller.
			</>
		),
		image: "/images/configure-models.png",
		alt: "Local Studio Configure screen showing model and runtime settings.",
	},
	{
		title: "Work where models run.",
		text: (
			<>
				Use the <span translate="no">Pi</span>-powered Workbench for agent
				sessions with models, providers, browser, files, terminal, and
				registered tools in one timeline.
			</>
		),
		image: "/images/workbench-terminal.png",
		alt: "Local Studio Workbench showing an agent session, terminal output, and tool activity.",
	},
] as const;

const container =
	"mx-auto w-[min(1240px,calc(100%_-_48px))] max-[620px]:w-[calc(100%_-_24px)]";

export function ProductPage() {
	return (
		<PageShell>
			<PageIntro
				id="product-title"
				title="One place to run local AI."
				description={
					<>
						<span translate="no">Local Studio</span> is a local-first
						workstation for running, managing, and using self-hosted
						language-model backends on local or remote controllers.
					</>
				}
				actions={
					<div className="button-group">
						<DownloadButton />
						<TextLink href="/docs">Read the docs</TextLink>
					</div>
				}
			/>
			<section
				className={`${container} pb-30`}
				aria-label="Product capabilities"
			>
				<MediaFrame
					className="mb-30"
					src="/images/workbench-browser-1300.png"
					srcSet={responsiveSrcSet("/images/workbench-browser.png")}
					sizes={heroSizes}
					alt="Local Studio Workbench showing a coding agent and integrated browser."
					width="5118"
					height="2800"
					fetchPriority="high"
				/>
				{sections.map((section, index) => (
					<article
						className={`grid min-h-[720px] items-center gap-30 py-20 max-[900px]:min-h-0 max-[900px]:grid-cols-1 max-[900px]:gap-12 ${index % 2 ? "grid-cols-[minmax(0,1.28fr)_minmax(260px,.72fr)]" : "grid-cols-[minmax(260px,.72fr)_minmax(0,1.28fr)]"}`}
						key={section.title}
					>
						<div
							className={
								index % 2 ? "order-2 max-[900px]:order-none" : undefined
							}
						>
							<h2 className="text-[42px]/12 font-medium max-[620px]:text-[32px]/10">
								{section.title}
							</h2>
							<p className="mt-6 max-w-md text-base/6 text-white/70">
								{section.text}
							</p>
						</div>
						<MediaFrame
							className={index % 2 ? "order-1 max-[900px]:order-none" : ""}
							src={section.image}
							srcSet={responsiveSrcSet(section.image)}
							sizes={frameSizes}
							alt={section.alt}
							width="5118"
							height="2800"
							loading="lazy"
							decoding="async"
						/>
					</article>
				))}
			</section>
		</PageShell>
	);
}
