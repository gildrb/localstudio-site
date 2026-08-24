import { assets } from "../domain/asset.ts";
type Inline =
	| { readonly kind: "text"; readonly text: string }
	| { readonly kind: "term"; readonly term: string };
export type Prose = readonly Inline[];

const text = (value: string): Inline => ({ kind: "text", text: value });
const term = (value: string): Inline => ({ kind: "term", term: value });

export const productFeatures = [
	{
		slug: "run",
		demoScenes: ["serve", "work"],
		storyTitle: "Run",
		storyDescription: [
			text("Models, runtimes, hardware, downloads, and controllers—one place to get local AI running."),
		],
		productTitle: "Run the model that fits",
		productText: [
			text("Choose "),
			term("vLLM"),
			text(", "),
			term("SGLang"),
			text(", "),
			term("llama.cpp"),
			text(", or "),
			term("MLX"),
			text("; match models to the hardware; manage downloads; and launch them through one OpenAI-compatible controller."),
		],
		image: assets.configureModels,
		alt: "Local Studio model configuration showing searchable models, hardware fit, runtimes, and downloads.",
	},
	{
		slug: "work",
		demoScenes: ["workbench"],
		storyTitle: "Work",
		storyDescription: [
			text("Agents, providers, browser, files, terminal, tools, sessions, and approvals in one Workbench."),
		],
		productTitle: "Work in one continuous session",
		productText: [
			text("Bring models and providers into the "),
			term("Pi"),
			text("-powered Workbench. Agents can browse, edit files, use the terminal and registered tools, and pause for your approval without leaving the session."),
		],
		image: assets.workbenchTerminal,
		alt: "Local Studio Workbench showing an agent session with terminal output, files, tools, and review state.",
	},
	{
		slug: "own",
		demoScenes: ["automate", "configure", "control"],
		storyTitle: "Own",
		storyDescription: [
			text("Local data, automations, controller identity, private remote access, and mobile continuation."),
		],
		productTitle: "Own the system behind the work",
		productText: [
			text("Keep data and automations on your controller. Give each machine an identity, connect privately from elsewhere, and continue the same sessions from your phone."),
		],
		image: assets.usageProxy,
		alt: "Local Studio usage screen showing controller-held sessions, requests, and token activity.",
	},
] as const;

export function renderInlineMarkdown(prose: Prose): string {
	return prose.map((part) => (part.kind === "text" ? part.text : part.term)).join("");
}
