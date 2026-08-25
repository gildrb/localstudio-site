import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
	background: stylex.types.color({ default: "#0a0a0a" }),
	foreground: stylex.types.color({ default: "#ffffff" }),
	dim: stylex.types.color({ default: "#b3b3b3" }),
	subtlest: stylex.types.color({ default: "#8f8f8f" }),
	quiet: stylex.types.color({ default: "#7a7a7a" }),
	border: stylex.types.color({ default: "rgba(255,255,255,0.12)" }),
	borderSoft: stylex.types.color({ default: "rgba(255,255,255,0.1)" }),
	borderStrong: stylex.types.color({ default: "rgba(255,255,255,0.28)" }),
	borderStrongHover: stylex.types.color({ default: "rgba(255,255,255,0.4)" }),
	hover: stylex.types.color({ default: "rgba(255,255,255,0.08)" }),
	surfaceFaint: stylex.types.color({ default: "rgba(255,255,255,0.02)" }),
	navSurface: stylex.types.color({ default: "rgba(10,10,10,0.78)" }),
	foregroundHover: stylex.types.color({ default: "#eaeaea" }),
	buttonInk: stylex.types.color({ default: "#000000" }),
	mediaTone: stylex.types.color({ default: "#e5e5e5" }),
	mediaRingInner: stylex.types.color({ default: "rgba(255,255,255,0.012)" }),
	mediaRingOuter: stylex.types.color({ default: "rgba(255,255,255,0.035)" }),
	depthShadow: stylex.types.color({ default: "rgba(0,0,0,0.52)" }),
	depthShadowDemo: stylex.types.color({ default: "rgba(0,0,0,0.44)" }),
	focusRing: stylex.types.color({ default: "#0070f3" }),
	selectionSkyBright: stylex.types.color({ default: "#a8dcff" }),
	selectionSkyDay: stylex.types.color({ default: "#76bfff" }),
	selectionSkyBlue: stylex.types.color({ default: "#438fe0" }),
	selectionSkyDusk: stylex.types.color({ default: "#285ca8" }),
	selectionSkyNight: stylex.types.color({ default: "#132b52" }),
	selection: stylex.types.color({ default: "#a8dcff" }),
	selectionInk: stylex.types.color({ default: "#000000" }),
});

export const lengths = stylex.defineVars({
	pageWidth: stylex.types.length({ default: "1399px" }),
	pageGutter: stylex.types.length({ default: "48px" }),
	navHeight: stylex.types.length({ default: "72px" }),
	radiusControl: stylex.types.length({ default: "6px" }),
	radiusCompact: stylex.types.length({ default: "8px" }),
	radiusFrame: stylex.types.length({ default: "10px" }),
	radiusMediaFrame: stylex.types.length({ default: "14px" }),
	radiusPanel: stylex.types.length({ default: "16px" }),
	storyGap: stylex.types.length({
		default: "120px",
		"@media (max-width: 620px)": "96px",
	}),
});

export const times = stylex.defineVars({
	fast: stylex.types.time({
		default: "130ms",
		"@media (prefers-reduced-motion: reduce)": "0.01ms",
	}),
	glyph: stylex.types.time({
		default: "180ms",
		"@media (prefers-reduced-motion: reduce)": "0.01ms",
	}),
	normal: stylex.types.time({
		default: "240ms",
		"@media (prefers-reduced-motion: reduce)": "0.01ms",
	}),
	feature: stylex.types.time({
		default: "450ms",
		"@media (prefers-reduced-motion: reduce)": "0.01ms",
	}),
});

export const constants = stylex.defineConsts({
	fontSansName: "Geist Sans",
	fontMonoName: "Geist Mono",
	fontSans: '"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	fontMono: '"Geist Mono", ui-monospace, monospace',
	headerTracking: "-0.02em",
});
