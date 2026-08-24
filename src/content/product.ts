import { assets } from "../domain/asset.ts";
type Inline =
	| { readonly kind: "text"; readonly text: string }
	| { readonly kind: "term"; readonly term: string };
export type Prose = readonly Inline[];

const text = (value: string): Inline => ({ kind: "text", text: value });
const term = (value: string): Inline => ({ kind: "term", term: value });

export const productFeatures = [
	{
		slug: "control",
		storyTitle: "Control",
		storyDescription: [
			text("Local and remote controllers, live status, launch state, logs, and metrics."),
		],
		productTitle: "Control the runtime",
		productText: [
			text("Launch and evict models, manage recipes and downloads, and watch GPU, process, log, and usage state from one controller."),
		],
		image: assets.usageProxy,
		alt: "Local Studio usage screen showing proxied tokens, requests, sessions, active days, and token activity.",
	},
	{
		slug: "serve",
		storyTitle: "Serve",
		storyDescription: [
			term("vLLM"),
			text(", "),
			term("SGLang"),
			text(", "),
			term("MLX"),
			text(", and "),
			term("llama.cpp"),
			text(" behind one OpenAI-compatible surface."),
		],
		productTitle: "Run the backend that fits",
		productText: [
			text("Configure "),
			term("vLLM"),
			text(", "),
			term("SGLang"),
			text(", "),
			term("llama.cpp"),
			text(", or "),
			term("MLX"),
			text(" targets, then serve them through one OpenAI-compatible proxy. Runtime discovery and saved selections stay with the controller."),
		],
		image: assets.configureModels,
		alt: "Local Studio model configuration screen showing searchable Hugging Face models, hardware fit, and downloads.",
	},
	{
		slug: "work",
		storyTitle: "Work",
		storyDescription: [
			text("Models, providers, browser, files, terminal, and agents in the same session."),
		],
		productTitle: "Work where models run",
		productText: [
			text("Use the "),
			term("Pi"),
			text("-powered Workbench for agent sessions with models, providers, browser, files, terminal, and registered tools in one timeline."),
		],
		image: assets.workbenchTerminal,
		alt: "Local Studio workbench with agent reasoning, terminal output, repository changes, and tool activity.",
	},
	{
		slug: "automate",
		storyTitle: "Automate",
		storyDescription: [
			text("Scheduled health checks, downloads, and reports that run on this machine."),
		],
		productTitle: "Keep the machine working",
		productText: [
			text("Automations run on the controller. Proxy checks, model pulls, and recap jobs stay on your hardware."),
		],
		image: assets.workbenchTerminal,
		alt: "Local Studio automations list with scheduled controller tasks.",
	},
	{
		slug: "configure",
		storyTitle: "Configure",
		storyDescription: [
			text("Hardware, runtimes, and controller identity for the machine the models run on."),
		],
		productTitle: "Name the hardware",
		productText: [
			text("Runtimes, devices, and controller settings stay with the machine. Nothing important is hidden in a cloud console."),
		],
		image: assets.configureModels,
		alt: "Local Studio configure screen showing local hardware and runtime targets.",
	},
] as const;

export function renderInlineMarkdown(prose: Prose): string {
	return prose.map((part) => (part.kind === "text" ? part.text : part.term)).join("");
}
