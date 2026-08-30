import * as stylex from "@stylexjs/stylex";

const lightScheme = "@media (prefers-color-scheme: light)";

export const depth = stylex.defineVars({
	highlight: stylex.types.color({ default: "rgba(255,255,255,0.05)", [lightScheme]: "rgba(255,255,255,0.88)" }),
	near: stylex.types.color({ default: "rgba(0,0,0,0.28)", [lightScheme]: "rgba(26,28,31,0.11)" }),
	far: stylex.types.color({ default: "rgba(0,0,0,0.16)", [lightScheme]: "rgba(26,28,31,0.055)" }),
	hairline: stylex.types.color({ default: "rgba(255,255,255,0.02)", [lightScheme]: "rgba(26,28,31,0.07)" }),
});

export const constants = stylex.defineConsts({
	demoWidth: "1392px",
	demoHeight: "787px",
	composerWidth: "clamp(28rem, 42rem, 48vw)",
	fontSans:
		'"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	fontMono:
		'ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
	fs2xs: "10px",
	fsXs: "11px",
	fsSm: "12px",
	fsMd: "13px",
	fsBase: "14px",
	fsLg: "16px",
	fsXl: "18px",
	fs2xl: "20px",
	fs3xl: "24px",
	toolbarHeight: "44px",
	paneToolbarHeight: "40px",
	sidebarRowHeight: "30px",
	sidebarRowGap: "1px",
	sidebarRowRadius: "8px",
	sidebarPaddingX: "7px",
	composerRadius: "25px",
	composerElevation:
		`inset 0 1px 0 ${depth.highlight}, 0 2px 5px ${depth.near}, 0 12px 32px ${depth.far}`,
	panelElevation:
		`inset 0 1px 0 ${depth.highlight}, 0 1px 2px ${depth.near}, 0 6px 16px ${depth.far}`,
	panelElevationHover:
		`inset 0 1px 0 ${depth.highlight}, 0 1px 3px ${depth.near}, 0 8px 20px ${depth.far}`,
	recessedElevation:
		`inset 0 1px 3px ${depth.near}, inset 0 -1px 0 ${depth.hairline}`,
	headerElevation:
		`0 1px 0 ${depth.hairline}, 0 4px 12px ${depth.far}`,
	radiusXs: "4px",
	radius2xl: "16px",
	iconScale: "0.84",
});

export const tokens = stylex.defineVars({
	bg: stylex.types.color({ default: "#181818" }),
	fg: stylex.types.color({ default: "#f7f8f8" }),
	dim: stylex.types.color({ default: "#d1d1d1" }),
	surface: stylex.types.color({ default: "#232323" }),
	surface2: stylex.types.color({ default: "#ffffff14" }),
	border: stylex.types.color({ default: "#ffffff14" }),
	separator: stylex.types.color({ default: "#ffffff0a" }),
	hover: stylex.types.color({ default: "#ffffff0f" }),
	active: stylex.types.color({ default: "#ffffff1a" }),
	frameEdge: stylex.types.color({ default: "#ffffff1a" }),
	frameShade: stylex.types.color({ default: "#050505" }),
	accent: stylex.types.color({ default: "#8ac7ff" }),
	link: stylex.types.color({ default: "#4ea7fc" }),
	ok: stylex.types.color({ default: "#40c977" }),
	err: stylex.types.color({ default: "#ff6764" }),
	warn: stylex.types.color({ default: "#ff8549" }),
	agentBg: stylex.types.color({ default: "#181818" }),
	sidebarBg: stylex.types.color({ default: "#1c1c1c" }),
	composer: stylex.types.color({ default: "#232323" }),
	composerPlaceholder: stylex.types.color({
		default: "color-mix(in srgb, #d1d1d1 40%, transparent)",
	}),
	colorHeader: stylex.types.color({ default: "#1c1c1c" }),
	colorPanel: stylex.types.color({ default: "#181818" }),
	colorInput: stylex.types.color({ default: "#ffffff0f" }),
	colorSelected: stylex.types.color({ default: "#202a38" }),
	colorSurfaceHover: stylex.types.color({ default: "#272727" }),
	colorPopoverBorder: stylex.types.color({ default: "#ffffff1a" }),
	uiBg: stylex.types.color({ default: "#181818" }),
	uiFg: stylex.types.color({ default: "#f7f8f8" }),
	uiMuted: stylex.types.color({ default: "#d1d1d1" }),
	uiSurface: stylex.types.color({ default: "#232323" }),
	uiSurface2: stylex.types.color({ default: "#ffffff14" }),
	uiBorder: stylex.types.color({ default: "#ffffff14" }),
	uiSeparator: stylex.types.color({ default: "#ffffff0a" }),
	uiHover: stylex.types.color({ default: "#ffffff0f" }),
	uiActive: stylex.types.color({ default: "#ffffff1a" }),
	uiAccent: stylex.types.color({ default: "#8ac7ff" }),
	hl1: stylex.types.color({ default: "#d1d1d1" }),
	hl2: stylex.types.color({ default: "#8f8f8f" }),
	hl3: stylex.types.color({ default: "oklch(55.6% 0 0)" }),
	fg05: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 5%, transparent)",
	}),
	fg10: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 10%, transparent)",
	}),
	fg035: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 3.5%, transparent)",
	}),
	fg025: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 2.5%, transparent)",
	}),
	dim15: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 15%, transparent)",
	}),
	uiMuted45: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 45%, transparent)",
	}),
	fg40: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 40%, transparent)",
	}),
	fg65: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 65%, transparent)",
	}),
	fg75: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 75%, transparent)",
	}),
	fg80: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 80%, transparent)",
	}),
	fg82: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 82%, transparent)",
	}),
	fg85: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 85%, transparent)",
	}),
	fg85Srgb: stylex.types.color({
		default: "color-mix(in srgb, #f7f8f8 85%, transparent)",
	}),
	fg90: stylex.types.color({
		default: "color-mix(in oklab, #f7f8f8 90%, transparent)",
	}),
	dim35: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 35%, transparent)",
	}),
	dim45: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 45%, transparent)",
	}),
	dim50: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 50%, transparent)",
	}),
	dim55: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 55%, transparent)",
	}),
	dim65: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 65%, transparent)",
	}),
	dim70: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 70%, transparent)",
	}),
	dim75: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 75%, transparent)",
	}),
	dim80: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 80%, transparent)",
	}),
	border40: stylex.types.color({
		default: "color-mix(in oklab, #ffffff14 40%, transparent)",
	}),
	border80: stylex.types.color({
		default: "color-mix(in oklab, #ffffff14 80%, transparent)",
	}),
	separator45: stylex.types.color({
		default: "color-mix(in oklab, #ffffff0a 45%, transparent)",
	}),
	separator55: stylex.types.color({
		default: "color-mix(in oklab, #ffffff0a 55%, transparent)",
	}),
	separator70: stylex.types.color({
		default: "color-mix(in oklab, #ffffff0a 70%, transparent)",
	}),
	uiAccent12: stylex.types.color({
		default: "color-mix(in oklab, #8ac7ff 12%, transparent)",
	}),
	uiMuted75: stylex.types.color({
		default: "color-mix(in oklab, #d1d1d1 75%, transparent)",
	}),
	hover60: stylex.types.color({
		default: "color-mix(in oklab, #ffffff0d 60%, transparent)",
	}),
	ok055: stylex.types.color({
		default: "color-mix(in oklab, #40c977 5.5%, transparent)",
	}),
	ok07: stylex.types.color({
		default: "color-mix(in oklab, #40c977 7%, transparent)",
	}),
	err05: stylex.types.color({
		default: "color-mix(in oklab, #ff6764 5%, transparent)",
	}),
	err065: stylex.types.color({
		default: "color-mix(in oklab, #ff6764 6.5%, transparent)",
	}),
	blue20: stylex.types.color({
		default: "color-mix(in oklab, oklch(62.3% 0.214 259.815) 20%, transparent)",
	}),
	blue38: stylex.types.color({
		default: "color-mix(in oklab, oklch(62.3% 0.214 259.815) 38%, transparent)",
	}),
	blue62: stylex.types.color({
		default: "color-mix(in oklab, oklch(62.3% 0.214 259.815) 62%, transparent)",
	}),
	blue90: stylex.types.color({
		default: "color-mix(in oklab, oklch(62.3% 0.214 259.815) 90%, transparent)",
	}),
	colorFileNode: stylex.types.color({ default: "#7cbfff" }),
	colorSkillNode: stylex.types.color({ default: "#c5a1fb" }),
	colorCommandNode: stylex.types.color({ default: "#c6c6c6" }),
	colorSessionNode: stylex.types.color({ default: "#9adcf7" }),
	colorSyntaxKeyword: stylex.types.color({ default: "#339cff" }),
	colorSyntaxString: stylex.types.color({ default: "#85df7b" }),
	colorSyntaxTitle: stylex.types.color({ default: "#f67576" }),
	colorSyntaxValue: stylex.types.color({ default: "#ff66ad" }),
	colorSyntaxComment: stylex.types.color({ default: "#8f8f8f" }),
	colorSyntaxDeletion: stylex.types.color({ default: "#ff6764" }),
	animatedGradientStrong: stylex.types.color({ default: "#f7f8f8" }),
	animatedGradientSoft: stylex.types.color({ default: "#ffffff38" }),
	selection: stylex.types.color({ default: "#a8dcff" }),
	selectionInk: stylex.types.color({ default: "#000" }),
});
