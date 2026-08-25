import * as stylex from "@stylexjs/stylex";

export const constants = stylex.defineConsts({
	demoWidth: "1392px",
	demoHeight: "787px",
	composerWidth: "clamp(28rem, 42rem, 48vw)",
	fontSans:
		'"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	fontMono:
		'ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
	mobile: "@media (max-width: 640px)",
	compact: "@media (max-width: 768px)",
	reducedMotion: "@media (prefers-reduced-motion: reduce)",
	narrowComposer: "@container (max-width: 27rem)",
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
	composerElevation: "0 8px 24px rgba(0, 0, 0, 0.11)",
	radiusXs: "4px",
	radius2xl: "16px",
	iconScale: "0.84",
});

export const tokens = stylex.defineVars({
	bg: stylex.types.color({ default: "#181818" }),
	fg: stylex.types.color({ default: "#fff" }),
	dim: stylex.types.color({ default: "#ffffffb3" }),
	surface: stylex.types.color({ default: "#212121" }),
	surface2: stylex.types.color({ default: "#ffffff14" }),
	border: stylex.types.color({ default: "#ffffff14" }),
	separator: stylex.types.color({ default: "#ffffff0a" }),
	hover: stylex.types.color({ default: "#ffffff0d" }),
	active: stylex.types.color({ default: "#ffffff14" }),
	accent: stylex.types.color({ default: "#fff" }),
	link: stylex.types.color({ default: "#339cff" }),
	ok: stylex.types.color({ default: "#40c977" }),
	err: stylex.types.color({ default: "#ff6764" }),
	warn: stylex.types.color({ default: "#ff8549" }),
	agentBg: stylex.types.color({ default: "#181818" }),
	sidebarBg: stylex.types.color({
		default: "color-mix(in srgb, #212121 45%, #181818)",
	}),
	composer: stylex.types.color({
		default: "color-mix(in srgb, #212121 45%, #181818)",
	}),
	composerPlaceholder: stylex.types.color({
		default: "color-mix(in srgb, #fff 32%, transparent)",
	}),
	colorHeader: stylex.types.color({ default: "#181818" }),
	colorPanel: stylex.types.color({ default: "#181818" }),
	colorInput: stylex.types.color({ default: "#ffffff0d" }),
	colorSelected: stylex.types.color({ default: "#ffffff14" }),
	colorSurfaceHover: stylex.types.color({ default: "#282828" }),
	colorPopoverBorder: stylex.types.color({ default: "transparent" }),
	uiBg: stylex.types.color({ default: "#181818" }),
	uiFg: stylex.types.color({ default: "#fff" }),
	uiMuted: stylex.types.color({ default: "#ffffffb3" }),
	uiSurface: stylex.types.color({ default: "#212121" }),
	uiSurface2: stylex.types.color({ default: "#ffffff14" }),
	uiBorder: stylex.types.color({ default: "#ffffff14" }),
	uiSeparator: stylex.types.color({ default: "#ffffff0a" }),
	uiHover: stylex.types.color({ default: "#ffffff0d" }),
	uiActive: stylex.types.color({ default: "#ffffff14" }),
	uiAccent: stylex.types.color({ default: "#fff" }),
	hl1: stylex.types.color({ default: "#ffffffb3" }),
	hl2: stylex.types.color({ default: "#ffffff80" }),
	hl3: stylex.types.color({ default: "oklch(55.6% 0 0)" }),
	fg05: stylex.types.color({
		default: "color-mix(in oklab, #fff 5%, transparent)",
	}),
	fg10: stylex.types.color({
		default: "color-mix(in oklab, #fff 10%, transparent)",
	}),
	fg035: stylex.types.color({
		default: "color-mix(in oklab, #fff 3.5%, transparent)",
	}),
	fg025: stylex.types.color({
		default: "color-mix(in oklab, #fff 2.5%, transparent)",
	}),
	dim15: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 15%, transparent)",
	}),
	uiMuted45: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 45%, transparent)",
	}),
	fg40: stylex.types.color({
		default: "color-mix(in oklab, #fff 40%, transparent)",
	}),
	fg65: stylex.types.color({
		default: "color-mix(in oklab, #fff 65%, transparent)",
	}),
	fg75: stylex.types.color({
		default: "color-mix(in oklab, #fff 75%, transparent)",
	}),
	fg80: stylex.types.color({
		default: "color-mix(in oklab, #fff 80%, transparent)",
	}),
	fg82: stylex.types.color({
		default: "color-mix(in oklab, #fff 82%, transparent)",
	}),
	fg85: stylex.types.color({
		default: "color-mix(in oklab, #fff 85%, transparent)",
	}),
	fg85Srgb: stylex.types.color({
		default: "color-mix(in srgb, #fff 85%, transparent)",
	}),
	fg90: stylex.types.color({
		default: "color-mix(in oklab, #fff 90%, transparent)",
	}),
	dim35: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 35%, transparent)",
	}),
	dim45: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 45%, transparent)",
	}),
	dim50: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 50%, transparent)",
	}),
	dim55: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 55%, transparent)",
	}),
	dim65: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 65%, transparent)",
	}),
	dim70: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 70%, transparent)",
	}),
	dim75: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 75%, transparent)",
	}),
	dim80: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 80%, transparent)",
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
		default: "color-mix(in oklab, #fff 12%, transparent)",
	}),
	uiMuted75: stylex.types.color({
		default: "color-mix(in oklab, #ffffffb3 75%, transparent)",
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
	animatedGradientStrong: stylex.types.color({ default: "#fff" }),
	animatedGradientSoft: stylex.types.color({ default: "#ffffff38" }),
	selection: stylex.types.color({ default: "#a8dcff" }),
	selectionInk: stylex.types.color({ default: "#000" }),
});
