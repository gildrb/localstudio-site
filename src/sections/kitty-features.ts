import { assets } from "../domain/asset";

export type KittyFeature = {
	readonly title: string;
	readonly text: string;
	readonly image: string;
	readonly image2x: string;
	readonly alt: string;
};

export const features = [
	{
		title: "Sessions everywhere",
		text: "Pick up exactly where you left off. Sessions, threads, and context follow you across phone and desktop.",
		image: assets.kittyIphone06,
		image2x: assets.kittyIphone06_2x,
		alt: "KittyLitter sessions continuing on an iPhone.",
	},
	{
		title: "Generative UI",
		text: "Interactive agent output stays native and usable on the phone instead of collapsing into a text transcript.",
		image: assets.kittyIphone07,
		image2x: assets.kittyIphone07_2x,
		alt: "KittyLitter generative interface running on an iPhone.",
	},
	{
		title: "Remote connections",
		text: "Connect to agents on another machine and keep the same coding workflow away from your desk.",
		image: assets.kittyIphone02,
		image2x: assets.kittyIphone02_2x,
		alt: "KittyLitter remote connection running on an iPhone.",
	},
	{
		title: "Debug anywhere",
		text: "Inspect long-running tasks, tool output, and failures without reopening the desktop workspace.",
		image: assets.kittyIphone03,
		image2x: assets.kittyIphone03_2x,
		alt: "KittyLitter debugging workflow on an iPhone.",
	},
	{
		title: "Plans",
		text: "Review and continue structured agent plans from the same mobile session.",
		image: assets.kittyIphone04,
		image2x: assets.kittyIphone04_2x,
		alt: "KittyLitter plan view on an iPhone.",
	},
	{
		title: "Voice input",
		text: "Real-time voice turns spoken context into agent prompts while you walk, drive, or think.",
		image: assets.kittyIphone05,
		image2x: assets.kittyIphone05_2x,
		alt: "KittyLitter voice input on an iPhone.",
	},
	{
		title: "Explore projects",
		text: "Browse project context and find the session or file you need from the phone.",
		image: assets.kittyIphone08,
		image2x: assets.kittyIphone08_2x,
		alt: "KittyLitter project explorer on an iPhone.",
	},
	{
		title: "Usage insights",
		text: "See session activity and usage without leaving the mobile workspace.",
		image: assets.kittyIphone09,
		image2x: assets.kittyIphone09_2x,
		alt: "KittyLitter usage statistics on an iPhone.",
	},
	{
		title: "More tools",
		text: "Keep the surrounding controls and utilities available wherever the session goes.",
		image: assets.kittyIphone10,
		image2x: assets.kittyIphone10_2x,
		alt: "Additional KittyLitter tools on an iPhone.",
	},
	{
		title: "Codex in your pocket",
		text: "Your servers and recent coding sessions stay within reach from one native mobile client.",
		image: assets.kittyIphone01,
		image2x: assets.kittyIphone01_2x,
		alt: "KittyLitter home screen on an iPhone.",
	},
] as const satisfies readonly KittyFeature[];
