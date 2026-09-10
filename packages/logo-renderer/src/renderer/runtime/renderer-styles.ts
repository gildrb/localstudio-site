import * as stylex from "@stylexjs/stylex";
import { rendererTimes } from "../renderer-tokens.stylex";

export const rendererStyles = stylex.create({
	element: {
		boxSizing: "border-box",
		"::before": { boxSizing: "border-box" },
		"::after": { boxSizing: "border-box" },
	},
	container: {
		position: "absolute",
		zIndex: 1,
		top: {
			default: "clamp(72px, 11svh, 120px)",
			"@media (max-width: 900px)": "24px",
		},
		left: "50%",
		width: {
			default: "clamp(720px, 58vw, 940px)",
			"@media (max-width: 900px)": "min(96vw, 620px)",
		},
		aspectRatio: "1.52",
		transform: "translateX(-50%)",
		pointerEvents: "none",
		contain: "layout paint",
	},
	layer: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		display: "block",
		width: "100%",
		height: "100%",
	},
	canvas: {
		opacity: 1,
	},
	canvasPending: { visibility: "hidden" },
	fallback: {
		maxWidth: "100%",
		userSelect: "none",
		paddingTop: "9.5%",
		paddingRight: "9.5%",
		paddingBottom: "9.5%",
		paddingLeft: "9.5%",
		objectFit: "contain",
		opacity: 0,
		filter: {
			default: "invert(1)",
			"@media (prefers-color-scheme: light)": "none",
		},
		transitionProperty: "opacity",
		transitionDuration: rendererTimes.fade,
		transitionTimingFunction: "ease-out",
	},
	fallbackVisible: { opacity: 0.16 },
	posterImage: {
		display: "block",
		width: "100%",
		height: "100%",
	},
});
