import * as stylex from "@stylexjs/stylex";

const lightScheme = "@media (prefers-color-scheme: light)";

export const colors = stylex.defineVars({
	background: stylex.types.color({ default: "#000000", [lightScheme]: "#ffffff" }),
	foreground: stylex.types.color({ default: "#f7f8f8", [lightScheme]: "#0a0a0a" }),
	fine: stylex.types.color({ default: "#e8e8e8", [lightScheme]: "#404040" }),
	dim: stylex.types.color({ default: "#d1d1d1", [lightScheme]: "#595959" }),
	quiet: stylex.types.color({ default: "#bababa", [lightScheme]: "#6b6b6b" }),
	chrome: stylex.types.color({ default: "#a1a1a1", [lightScheme]: "#737373" }),
	border: stylex.types.color({ default: "rgba(255,255,255,0.08)", [lightScheme]: "rgba(0,0,0,0.10)" }),
	borderSoft: stylex.types.color({ default: "rgba(255,255,255,0.06)", [lightScheme]: "rgba(0,0,0,0.07)" }),
	borderStrong: stylex.types.color({ default: "rgba(255,255,255,0.10)", [lightScheme]: "rgba(0,0,0,0.14)" }),
	borderStrongHover: stylex.types.color({ default: "rgba(255,255,255,0.28)", [lightScheme]: "rgba(0,0,0,0.34)" }),
	hover: stylex.types.color({ default: "rgba(255,255,255,0.06)", [lightScheme]: "rgba(0,0,0,0.05)" }),
	surfaceFaint: stylex.types.color({ default: "rgba(255,255,255,0.03)", [lightScheme]: "rgba(0,0,0,0.025)" }),
	buttonInk: stylex.types.color({ default: "#000000", [lightScheme]: "#ffffff" }),
	mediaRingInner: stylex.types.color({ default: "rgba(255,255,255,0.04)", [lightScheme]: "rgba(0,0,0,0.035)" }),
	mediaRingOuter: stylex.types.color({ default: "rgba(255,255,255,0.10)", [lightScheme]: "rgba(0,0,0,0.11)" }),
	shadowAmbient: stylex.types.color({ default: "rgba(0,0,0,0.72)", [lightScheme]: "rgba(0,0,0,0.16)" }),
	shadowDirect: stylex.types.color({ default: "rgba(0,0,0,0.42)", [lightScheme]: "rgba(0,0,0,0.10)" }),
	shadowControl: stylex.types.color({ default: "rgba(0,0,0,0.28)", [lightScheme]: "rgba(0,0,0,0.10)" }),
	shadowControlDirect: stylex.types.color({ default: "rgba(0,0,0,0.18)", [lightScheme]: "rgba(0,0,0,0.06)" }),
	focusHalo: stylex.types.color({ default: "rgba(255,255,255,0.18)", [lightScheme]: "rgba(0,0,0,0.18)" }),
	selectionSkyBright: stylex.types.color({ default: "#007cc4", [lightScheme]: "#6eeaff" }),
	selectionSkyDay: stylex.types.color({ default: "#006fca", [lightScheme]: "#78e2ff" }),
	selectionSkyBlue: stylex.types.color({ default: "#1e60c9", [lightScheme]: "#8adaff" }),
	selectionSkyDusk: stylex.types.color({ default: "#4a4fbd", [lightScheme]: "#a7d1ff" }),
	selectionSkyNight: stylex.types.color({ default: "#6738a5", [lightScheme]: "#cac7ff" }),
	selectionInk: stylex.types.color({ default: "#ffffff", [lightScheme]: "#000000" }),
	primaryButtonSurface: stylex.types.color({ default: "#ffffff", [lightScheme]: "#ffffff" }),
	primaryButtonInk: stylex.types.color({ default: "#000000", [lightScheme]: "#000000" }),
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
		default: "100ms",
		"@media (prefers-reduced-motion: reduce)": "0s",
	}),
});

export const constants = stylex.defineConsts({
	fontSansName: "Geist Sans",
	fontMonoName: "Geist Mono",
	fontSans: '"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	fontMono: '"Geist Mono", ui-monospace, monospace',
	headerTracking: "-0.02em",
	heroTracking: "-0.03em",
});
