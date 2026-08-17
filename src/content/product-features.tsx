import type { ReactNode } from "react";

export interface ProductFeature {
	readonly slug: string;
	readonly storyTitle: string;
	readonly storyDescription: ReactNode;
	readonly productTitle: string;
	readonly productText: ReactNode;
	readonly image: string;
	readonly alt: string;
}

export const productFeatures = [
	{
		slug: "control",
		storyTitle: "Control",
		storyDescription:
			"Local and remote controllers, live status, launch state, logs, and metrics.",
		productTitle: "Control the runtime.",
		productText:
			"Launch and evict models, manage recipes and downloads, and watch GPU, process, log, and usage state from one controller.",
		image: "/images/usage-proxy.png",
		alt: "Local Studio usage screen showing proxied tokens, requests, sessions, active days, and token activity.",
	},
	{
		slug: "serve",
		storyTitle: "Serve",
		storyDescription: (
			<>
				<span translate="no">vLLM</span>, <span translate="no">SGLang</span>,{" "}
				<span translate="no">MLX</span>, and{" "}
				<span translate="no">llama.cpp</span> behind one OpenAI-compatible
				surface.
			</>
		),
		productTitle: "Run the backend that fits.",
		productText: (
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
		alt: "Local Studio model configuration screen showing searchable Hugging Face models, hardware fit, and downloads.",
	},
	{
		slug: "work",
		storyTitle: "Work",
		storyDescription:
			"Models, providers, browser, files, terminal, and agents in the same session.",
		productTitle: "Work where models run.",
		productText: (
			<>
				Use the <span translate="no">Pi</span>-powered Workbench for agent
				sessions with models, providers, browser, files, terminal, and
				registered tools in one timeline.
			</>
		),
		image: "/images/workbench-terminal.png",
		alt: "Local Studio workbench with agent reasoning, terminal output, repository changes, and tool activity.",
	},
] as const satisfies readonly ProductFeature[];
