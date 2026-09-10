import * as stylex from "@stylexjs/stylex";
import { colors, lengths, times } from "../styles/public-tokens.stylex";

export const styles = stylex.create({
	clipboard: { position: "fixed", opacity: 0 },
	button: {
		position: "absolute",
		zIndex: 3,
		top: "14px",
		right: "14px",
		display: "inline-flex",
		width: { default: "32px", "@media (max-width: 620px)": "44px" },
		height: { default: "32px", "@media (max-width: 620px)": "44px" },
		alignItems: "center",
		justifyContent: "center",
		padding: 0,
		borderWidth: "1px",
		borderRadius: lengths.radiusControl,
		color: colors.foreground,
		backgroundColor: {
			default: "transparent",
			"@media (hover: hover)": {
				default: "transparent",
				":hover": colors.hover,
			},
		},
		cursor: "pointer",
		opacity: 1,
		borderStyle: "solid",
		borderColor: {
			default: colors.borderStrong,
			"@media (hover: hover)": {
				default: colors.borderStrong,
				":hover": colors.borderStrongHover,
			},
		},
		boxShadow: `0 8px 24px ${colors.shadowControl}, 0 2px 8px ${colors.shadowControlDirect}`,
		transitionProperty: "background, border-color, box-shadow",
		transitionDuration: times.fast,
		transitionTimingFunction: "ease-out",
	},
	copied: {
		opacity: 1,
	},
	screenReaderOnly: {
		position: "absolute",
		width: "1px",
		height: "1px",
		margin: "-1px",
		padding: 0,
		overflow: "hidden",
		clip: "rect(0, 0, 0, 0)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
	glyph: {
		position: "relative",
		display: "inline-flex",
		width: "16px",
		height: "16px",
	},
	symbol: {
		position: "absolute",
		inset: 0,
		width: "100%",
		height: "100%",
		transformOrigin: "center",
	},
	path: {
		transformOrigin: "center",
		transitionProperty: "opacity, transform, filter",
		transitionDuration: times.glyph,
		transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	},
	visiblePath: {
		opacity: 1,
		transform: "scale(1)",
		filter: "blur(0)",
	},
	hiddenPath: {
		opacity: 0,
		transform: "scale(0.55)",
		filter: "blur(4px)",
	},
});
