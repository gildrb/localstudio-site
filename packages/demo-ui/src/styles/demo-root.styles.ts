import * as stylex from "@stylexjs/stylex";
import { tokens } from "./tokens.stylex.ts";

export const lightTheme = stylex.createTheme(tokens, {
	bg: stylex.types.color({ default: "#fff" }),
	fg: stylex.types.color({ default: "#1a1c1f" }),
	dim: stylex.types.color({ default: "#5f6165" }),
	surface: stylex.types.color({ default: "#fff" }),
	surface2: stylex.types.color({ default: "#1a1c1f14" }),
	border: stylex.types.color({ default: "#1a1c1f14" }),
	separator: stylex.types.color({ default: "#1a1c1f0d" }),
	hover: stylex.types.color({ default: "#1a1c1f0d" }),
	active: stylex.types.color({ default: "#1a1c1f14" }),
	frameEdge: stylex.types.color({ default: "#1a1c1f1f" }),
	frameShade: stylex.types.color({ default: "#e8e8e8" }),
	accent: stylex.types.color({ default: "#0d0d0d" }),
	link: stylex.types.color({ default: "#0285ff" }),
	ok: stylex.types.color({ default: "#00a240" }),
	err: stylex.types.color({ default: "#e02e2a" }),
	warn: stylex.types.color({ default: "#e25507" }),
	agentBg: stylex.types.color({ default: "#fff" }),
	sidebarBg: stylex.types.color({ default: "#f9f9f9" }),
	composer: stylex.types.color({ default: "#f9f9f9" }),
	composerPlaceholder: stylex.types.color({
		default: "color-mix(in srgb, #1a1c1f 40%, transparent)",
	}),
	colorHeader: stylex.types.color({ default: "#fff" }),
	colorPanel: stylex.types.color({ default: "#fff" }),
	colorInput: stylex.types.color({ default: "#fff" }),
	colorSelected: stylex.types.color({ default: "#1a1c1f14" }),
	colorSurfaceHover: stylex.types.color({ default: "#ededed" }),
	colorPopoverBorder: stylex.types.color({ default: "#1a1c1f14" }),
	uiBg: stylex.types.color({ default: "#fff" }),
	uiFg: stylex.types.color({ default: "#1a1c1f" }),
	uiMuted: stylex.types.color({ default: "#5f6165" }),
	uiSurface: stylex.types.color({ default: "#fff" }),
	uiSurface2: stylex.types.color({ default: "#1a1c1f14" }),
	uiBorder: stylex.types.color({ default: "#1a1c1f14" }),
	uiSeparator: stylex.types.color({ default: "#1a1c1f0d" }),
	uiHover: stylex.types.color({ default: "#1a1c1f0d" }),
	uiActive: stylex.types.color({ default: "#1a1c1f14" }),
	uiAccent: stylex.types.color({ default: "#0d0d0d" }),
	hl1: stylex.types.color({ default: "#5f6165" }),
	hl2: stylex.types.color({ default: "#73777d" }),
	hl3: stylex.types.color({ default: "#73777d" }),
	fg05: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 5%, transparent)",
	}),
	fg10: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 10%, transparent)",
	}),
	fg035: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 3.5%, transparent)",
	}),
	fg025: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 2.5%, transparent)",
	}),
	dim15: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 15%, transparent)",
	}),
	uiMuted45: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 45%, transparent)",
	}),
	fg40: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 40%, transparent)",
	}),
	fg65: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 65%, transparent)",
	}),
	fg75: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 75%, transparent)",
	}),
	fg80: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 80%, transparent)",
	}),
	fg82: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 82%, transparent)",
	}),
	fg85: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 85%, transparent)",
	}),
	fg85Srgb: stylex.types.color({
		default: "color-mix(in srgb, #1a1c1f 85%, transparent)",
	}),
	fg90: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 90%, transparent)",
	}),
	dim35: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 35%, transparent)",
	}),
	dim45: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 45%, transparent)",
	}),
	dim50: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 50%, transparent)",
	}),
	dim55: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 55%, transparent)",
	}),
	dim65: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 65%, transparent)",
	}),
	dim70: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 70%, transparent)",
	}),
	dim75: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 75%, transparent)",
	}),
	dim80: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 80%, transparent)",
	}),
	border40: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f14 40%, transparent)",
	}),
	border80: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f14 80%, transparent)",
	}),
	separator45: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f0d 45%, transparent)",
	}),
	separator55: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f0d 55%, transparent)",
	}),
	separator70: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f0d 70%, transparent)",
	}),
	uiAccent12: stylex.types.color({
		default: "color-mix(in oklab, #0d0d0d 12%, transparent)",
	}),
	uiMuted75: stylex.types.color({
		default: "color-mix(in oklab, #5f6165 75%, transparent)",
	}),
	hover60: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f0d 60%, transparent)",
	}),
	ok055: stylex.types.color({
		default: "color-mix(in oklab, #00a240 5.5%, transparent)",
	}),
	ok07: stylex.types.color({
		default: "color-mix(in oklab, #00a240 7%, transparent)",
	}),
	err05: stylex.types.color({
		default: "color-mix(in oklab, #e02e2a 5%, transparent)",
	}),
	err065: stylex.types.color({
		default: "color-mix(in oklab, #e02e2a 6.5%, transparent)",
	}),
	blue20: stylex.types.color({ default: "color-mix(in oklab, #0269cc 20%, transparent)" }),
	blue38: stylex.types.color({ default: "color-mix(in oklab, #0269cc 38%, transparent)" }),
	blue62: stylex.types.color({ default: "color-mix(in oklab, #0269cc 62%, transparent)" }),
	blue90: stylex.types.color({ default: "color-mix(in oklab, #0269cc 90%, transparent)" }),
	colorFileNode: stylex.types.color({ default: "#0269cc" }),
	colorSkillNode: stylex.types.color({ default: "#8036ea" }),
	colorCommandNode: stylex.types.color({ default: "#5d5d5d" }),
	colorSessionNode: stylex.types.color({ default: "#0a8787" }),
	colorSyntaxKeyword: stylex.types.color({ default: "#0269cc" }),
	colorSyntaxString: stylex.types.color({ default: "#00692a" }),
	colorSyntaxTitle: stylex.types.color({ default: "#ba2623" }),
	colorSyntaxValue: stylex.types.color({ default: "#c22f88" }),
	colorSyntaxComment: stylex.types.color({ default: "#767a7e" }),
	colorSyntaxDeletion: stylex.types.color({ default: "#ba2623" }),
	animatedGradientStrong: stylex.types.color({ default: "#0d0d0d" }),
	animatedGradientSoft: stylex.types.color({ default: "#0d0d0d38" }),
	selection: stylex.types.color({ default: "#b9e3ff" }),
	selectionInk: stylex.types.color({ default: "#000" }),
});

export { demoStyles } from "./demo-content.styles.ts";
