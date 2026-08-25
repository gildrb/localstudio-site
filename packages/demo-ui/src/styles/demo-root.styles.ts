import * as stylex from "@stylexjs/stylex";
import { constants, tokens } from "./tokens.stylex.ts";

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
	hl2: stylex.types.color({ default: "#8c8e91" }),
	fg05: stylex.types.color({
		default: "color-mix(in oklab, #1a1c1f 5%, transparent)",
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
});

const gradientPan = stylex.keyframes({
	"0%": { backgroundPosition: "0% 50%" },
	"50%": { backgroundPosition: "100% 50%" },
	"100%": { backgroundPosition: "0% 50%" },
});

const shimmerSweep = stylex.keyframes({
	from: { backgroundPosition: "100% 0" },
	to: { backgroundPosition: "0% 0" },
});

export const demoStyles = stylex.create({
	root: {
		display: "block",
		minWidth: 0,
		overflow: "clip",
		borderTopWidth: 0,
		borderRightWidth: 0,
		borderBottomWidth: 0,
		borderLeftWidth: 0,
		color: tokens.fg,
		boxShadow: "0 24px 80px rgba(0, 0, 0, 0.44)",
		fontFamily: constants.fontSans,
		fontSize: constants.fsBase,
		lineHeight: 1.5,
		scrollbarWidth: "none",
		userSelect: "text",
		content: { default: null, "::before": '""', "::after": '""' },
		top: { default: null, "::before": 0, "::after": 0 },
		right: { default: null, "::before": 0, "::after": 0 },
		bottom: { default: null, "::before": 0, "::after": 0 },
		left: { default: null, "::before": 0, "::after": 0 },
		position: {
			default: "relative",
			"::before": "absolute",
			"::after": "absolute",
		},
		zIndex: { default: null, "::before": 51, "::after": 50 },
		pointerEvents: { default: null, "::before": "none", "::after": "none" },
		borderTopLeftRadius: {
			default: "10px",
			"::before": "inherit",
			"::after": "inherit",
		},
		borderTopRightRadius: {
			default: "10px",
			"::before": "inherit",
			"::after": "inherit",
		},
		borderBottomRightRadius: {
			default: "10px",
			"::before": "inherit",
			"::after": "inherit",
		},
		borderBottomLeftRadius: {
			default: "10px",
			"::before": "inherit",
			"::after": "inherit",
		},
		paddingTop: { default: null, "::before": "1px" },
		paddingRight: { default: null, "::before": "1px" },
		paddingBottom: { default: null, "::before": "1px" },
		paddingLeft: { default: null, "::before": "1px" },
		backgroundImage: {
			default: null,
			"::before": "linear-gradient(180deg, #ffffff14, #000)",
			"::after":
				"radial-gradient(38% 32% at 0% 0%, color-mix(in srgb, #fff 2.2%, transparent), transparent 72%), linear-gradient(180deg, color-mix(in srgb, #fff 1%, transparent), transparent 10%)",
		},
		WebkitMaskImage: {
			default: null,
			"::before": "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
		},
		maskImage: {
			default: null,
			"::before": "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
		},
		maskClip: { default: null, "::before": "content-box, border-box" },
		maskComposite: { default: null, "::before": "exclude" },
		backgroundColor: { default: tokens.bg, "::selection": tokens.selection },
		WebkitTextFillColor: { default: null, "::selection": tokens.selectionInk },
	},
	mobile: {
		pointerEvents: "none",
		boxShadow: "none",
	},
	clipRight: {
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		boxShadow: "none",
		paddingRight: { default: null, "::before": 0 },
	},
	clipBottom: {
		borderBottomRightRadius: 0,
		borderBottomLeftRadius: 0,
		paddingBottom: { default: null, "::before": 0 },
	},
	viewport: {
		position: "relative",
		overflow: "clip",
	},
	viewportHeight: (height: number) => ({ height }),
	mobileViewport: {
		touchAction: "none",
		overscrollBehavior: "none",
	},
	app: {
		display: "flex",
		width: constants.demoWidth,
		height: constants.demoHeight,
		minHeight: 0,
		overflowX: "hidden",
		overflowY: "hidden",
	},
	heroAppTransform: (mobile: boolean, scale: number) => ({
		width: 1392,
		height: 787,
		transform: mobile ? `scale(${scale})` : null,
		transformOrigin: mobile ? "top left" : null,
	}),
	storyAppTransform: (scale: number, shiftX: number, shiftY: number) => ({
		width: 1392,
		height: 787,
		transform: `scale(${scale}) translate(${shiftX}px, ${shiftY}px)`,
		transformOrigin: "top left",
	}),
	fixedWidth: (width: number) => ({ width }),
	hiddenOverflow: {
		overflowX: "hidden",
		overflowY: "hidden",
		overscrollBehavior: "none",
		touchAction: "none",
	},
	chatMarkdown: {
		fontFamily: constants.fontSans,
		fontSize: "16px",
		lineHeight: 1.5,
		fontWeight: 400,
		color: tokens.fg85Srgb,
		letterSpacing: 0,
		whiteSpace: "pre-wrap",
		userSelect: "text",
		marginBottom: 0,
	},
	threadShell: {
		width: { default: "90%", [constants.mobile]: "100%" },
		maxWidth: "calc(42rem * 0.9)",
		userSelect: "text",
	},
	chatScroller: {
		scrollbarWidth: "none",
		overflowAnchor: "none",
		overscrollBehavior: "contain",
		scrollbarGutter: "stable",
		userSelect: "text",
		display: { default: null, "::-webkit-scrollbar": "none" },
		width: { default: null, "::-webkit-scrollbar": 0 },
		height: { default: null, "::-webkit-scrollbar": 0 },
	},
	sidebarScroller: {
		scrollbarWidth: "none",
		scrollbarGutter: "stable",
		contain: "layout paint",
		display: { default: null, "::-webkit-scrollbar": "none" },
		width: { default: null, "::-webkit-scrollbar": 0 },
		height: { default: null, "::-webkit-scrollbar": 0 },
	},
	composer: {
		containerType: "inline-size",
	},
	shimmerText: {
		color: { default: "transparent", [constants.reducedMotion]: tokens.dim },
		backgroundImage: {
			default:
				"linear-gradient(90deg, color-mix(in srgb, #fff 38%, transparent) 0%, color-mix(in srgb, #fff 38%, transparent) 35%, color-mix(in srgb, #fff 88%, transparent) 50%, color-mix(in srgb, #fff 38%, transparent) 65%, color-mix(in srgb, #fff 38%, transparent) 100%)",
			[constants.reducedMotion]: "none",
		},
		backgroundSize: "250% 100%",
		backgroundPosition: "100% 0",
		backgroundClip: "text",
		WebkitBackgroundClip: "text",
		animationName: { default: shimmerSweep, [constants.reducedMotion]: "none" },
		animationDuration: "1.2s",
		animationTimingFunction: "steps(48, end)",
		animationIterationCount: "infinite",
	},
	gradientText: {
		backgroundImage:
			"linear-gradient(110deg, #fff 0%, oklch(74.6% 0.16 232.661) 30%, #ffffff38 55%, oklch(82.8% 0.111 230.318) 80%, #fff 100%)",
		backgroundSize: "250% 250%",
		backgroundClip: "text",
		WebkitBackgroundClip: "text",
		color: "transparent",
		animationName: gradientPan,
		animationDuration: "6s",
		animationTimingFunction: "ease",
		animationIterationCount: "infinite",
	},
	reset: {
		boxSizing: "border-box",
		marginTop: 0,
		marginRight: 0,
		marginBottom: 0,
		marginLeft: 0,
		paddingTop: 0,
		paddingRight: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		borderTopStyle: "solid",
		borderRightStyle: "solid",
		borderBottomStyle: "solid",
		borderLeftStyle: "solid",
		borderTopWidth: 0,
		borderRightWidth: 0,
		borderBottomWidth: 0,
		borderLeftWidth: 0,
		borderTopColor: tokens.border,
		borderRightColor: tokens.border,
		borderBottomColor: tokens.border,
		borderLeftColor: tokens.border,
		backgroundColor: "transparent",
		color: "inherit",
		fontFamily: "inherit",
		fontSize: "inherit",
		fontWeight: "inherit",
		lineHeight: "inherit",
		listStyleType: "none",
		textDecorationLine: "none",
		outlineWidth: { default: 0, ":focus-visible": 2 },
		outlineStyle: { default: "none", ":focus-visible": "solid" },
		outlineColor: { default: "transparent", ":focus-visible": tokens.accent },
		outlineOffset: { default: 0, ":focus-visible": 2 },
	},
	controlReset: {
		fontSize: constants.fsSm,
		lineHeight: 1.5,
	},
});
