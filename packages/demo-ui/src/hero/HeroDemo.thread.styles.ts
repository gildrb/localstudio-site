import * as stylex from "@stylexjs/stylex";
import { constants, tokens } from "../styles/tokens.stylex.ts";
export const styles = stylex.create({
	div787: {
		paddingTop: {
			default: "calc(0.25rem * 4)",
			"@media (width >= 40rem)": "calc(0.25rem * 6)",
		},
		paddingBottom: "0px",
	},
	div791: {
		paddingTop: "calc(0.25rem * 2)",
	},
	div796: {
		paddingTop: "calc(0.25rem * 2)",
		paddingBottom: "calc(0.25rem * 4)",
	},
	article797: {
		minWidth: "0px",
	},
	chatMarkdown: {
		whiteSpace: "pre-wrap",
	},
	div805: {
		paddingTop: {
			default: "calc(0.25rem * 4)",
			"@media (width >= 40rem)": "calc(0.25rem * 6)",
		},
		paddingBottom: "calc(0.25rem * 4)",
	},
	codexShimmerText: {
		fontSize: constants.fsBase,
		fontWeight: 400,
		lineHeight: "calc(0.25rem * 5)",
	},
	a844: {
		marginTop: "calc(0.25rem * 3)",
		display: "flex",
		width: "100%",
		alignItems: "center",
		justifyContent: "space-between",
		borderTopLeftRadius: "0.5rem",
		borderTopRightRadius: "0.5rem",
		borderBottomRightRadius: "0.5rem",
		borderBottomLeftRadius: "0.5rem",
		borderTopStyle: "solid",
		borderRightStyle: "solid",
		borderBottomStyle: "solid",
		borderLeftStyle: "solid",
		borderTopWidth: "1px",
		borderRightWidth: "1px",
		borderBottomWidth: "1px",
		borderLeftWidth: "1px",
		borderTopColor: tokens.border,
		borderRightColor: tokens.border,
		borderBottomColor: tokens.border,
		borderLeftColor: tokens.border,
		backgroundColor: {
			default: tokens.colorPanel,
			":hover": tokens.hover,
		},
		boxShadow: {
			default: constants.panelElevation,
			":hover": constants.panelElevationHover,
		},
		transitionProperty: "background-color, box-shadow",
		transitionDuration: "160ms",
		paddingLeft: "calc(0.25rem * 3)",
		paddingRight: "calc(0.25rem * 3)",
		paddingTop: "calc(0.25rem * 2.5)",
		paddingBottom: "calc(0.25rem * 2.5)",
		fontSize: constants.fsSm,
		fontWeight: 500,
		color: tokens.fg,
	},
	span847: {
		color: tokens.dim,
	},
	leadMessage: {
		paddingTop: {
			default: "calc(0.25rem * 4)",
			"@media (width >= 40rem)": "calc(0.25rem * 6)",
		},
		paddingBottom: "0px",
	},
	timelineMessage: {
		paddingTop: "calc(0.25rem * 2)",
		paddingBottom: "calc(0.25rem * 4)",
	},
});
