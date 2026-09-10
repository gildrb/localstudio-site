import * as stylex from "@stylexjs/stylex";
import { colors, constants } from "./public-tokens.stylex";

const sponsorRotation = stylex.keyframes({
	from: { transform: "translateX(0)" },
	to: { transform: "translateX(calc(-100% + 100vw - 48px))" },
});

export const sponsorStyles = stylex.create({
	sponsors: {
		marginTop: "96px",
	},
	sponsorsTitle: {
		marginTop: 0,
		marginRight: 0,
		marginBottom: "36px",
		marginLeft: 0,
		fontFamily: constants.fontSans,
		fontSize: "16px",
		fontWeight: 400,
		lineHeight: "24px",
		color: colors.dim,
		textAlign: "left",
	},
	sponsorsViewport: {
		width: "100%",
		overflow: "hidden",
	},
	sponsorsList: {
		display: "flex",
		width: {
			default: "100%",
			"@media (max-width: 900px)": "max-content",
		},
		flexShrink: 0,
		flexWrap: "nowrap",
		alignItems: "center",
		justifyContent: {
			default: "space-between",
			"@media (max-width: 900px)": "flex-start",
		},
		columnGap: {
			default: "16px",
			"@media (max-width: 900px)": "48px",
		},
		margin: 0,
		padding: 0,
		listStyle: "none",
		willChange: {
			default: "auto",
			"@media (max-width: 900px)": "transform",
			"@media (max-width: 900px) and (prefers-reduced-motion: reduce)": "auto",
		},
		animationName: {
			default: "none",
			"@media (max-width: 900px)": sponsorRotation,
			"@media (max-width: 900px) and (prefers-reduced-motion: reduce)": "none",
		},
		animationDuration: "30s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
		animationDirection: "alternate",
	},
	sponsorLogo: {
		display: "block",
		flexShrink: 0,
		color: colors.foreground,
		filter: {
			default: "none",
			"@media (prefers-color-scheme: light)": "invert(1)",
		},
		pointerEvents: "none",
		userSelect: "none",
	},
	sponsorLogoSize: (width: number, height: number) => ({
		width,
		height,
	}),
});
