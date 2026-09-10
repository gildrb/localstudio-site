import {
	starts,
	siteRoutes,
	studioFacts,
	studioSurfaces,
	runtimes,
	kittyRows,
	shimRows,
	sourceRows,
	type OverviewEntry,
} from "./resources-data";

export interface OverviewSectionContent {
	readonly id: string;
	readonly title: string;
	readonly lead?: string;
	readonly entries: readonly OverviewEntry[];
	readonly more?: { readonly lead: string; readonly entries: readonly OverviewEntry[] };
}

export const overviewSections: readonly OverviewSectionContent[] = [
	{
		id: "start-here",
		title: "Start Here",
		lead: "Three ways in, depending on what you are holding.",
		entries: starts,
	},
	{
		id: "this-site",
		title: "This Site",
		lead: "Every route and what it holds.",
		entries: siteRoutes,
	},
	{
		id: "local-studio",
		title: "Local Studio",
		lead: "A local-first workstation for running, managing, and using self-hosted LLM backends. Two modules share one controller API, and it keeps the model, the runtime, and the hardware together. Nothing important disappears behind a provider abstraction.",
		entries: studioFacts,
		more: { lead: "Day-to-day operation runs through three surfaces.", entries: studioSurfaces },
	},
	{
		id: "runtimes",
		title: "Runtimes",
		lead: "Recipes launch through the controller runtime layer; a chat proxy call never launches a model silently. Discovery and saved selections stay with the controller and surface in Settings.",
		entries: runtimes,
	},
	{
		id: "kittylitter",
		title: "KittyLitter",
		lead: "The native iOS and Android client for Codex, Claude, OpenCode, Pi, and Droid, and the mobile companion for Local Studio. Work still runs on your Mac or server; sessions, streaming, reasoning, and tool results follow the phone.",
		entries: kittyRows,
	},
	{
		id: "codex-shim",
		title: "Codex Shim",
		lead: "A local Python/aiohttp server that exposes an OpenAI Responses-compatible endpoint on loopback, so Codex Desktop can run BYOK models: OpenAI, Anthropic, Z.ai, DeepSeek, Gemini, OpenRouter, and local proxies. Codex keeps its native UX; routing moves local.",
		entries: shimRows,
	},
];

export const sourceSection: OverviewSectionContent = {
	id: "source",
	title: "Source and Company",
	entries: sourceRows,
};
