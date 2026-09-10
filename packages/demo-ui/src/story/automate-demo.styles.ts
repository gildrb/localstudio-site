import * as stylex from "@stylexjs/stylex";
import { constants, depth, tokens } from "../styles/tokens.stylex.ts";

export const styles = stylex.create({
	div71: {
		display: "flex",
		minHeight: "0px",
		width: {
			default: "820px",
			"@media (width < 48rem)": "680px",
		},
	},
	section72: {
		display: "flex",
		minHeight: "0px",
		width: {
			default: "320px",
			"@media (width < 48rem)": "280px",
		},
		flexShrink: 0,
		flexDirection: "column",
		borderRightStyle: "solid",
		borderRightWidth: "1px",
		borderTopColor: tokens.uiBorder,
		borderRightColor: tokens.uiBorder,
		borderBottomColor: tokens.uiBorder,
		borderLeftColor: tokens.uiBorder,
		backgroundColor: tokens.uiBg,
		boxShadow: `1px 0 0 ${depth.hairline}, 6px 0 16px ${depth.far}`,
	},
	header73: {
		display: "flex",
		height: "calc(0.25rem * 14)",
		flexShrink: 0,
		alignItems: "center",
		justifyContent: "space-between",
		borderBottomStyle: "solid",
		borderBottomWidth: "1px",
		borderTopColor: tokens.uiBorder,
		borderRightColor: tokens.uiBorder,
		borderBottomColor: tokens.uiBorder,
		borderLeftColor: tokens.uiBorder,
		paddingLeft: "calc(0.25rem * 4)",
		paddingRight: "calc(0.25rem * 4)",
	},
	div74: {
		minWidth: "0px",
	},
	p78: {
		fontSize: constants.fsXs,
		color: tokens.uiMuted,
	},
	plus86: {
		height: "calc(0.25rem * 3)",
		width: "calc(0.25rem * 3)",
	},
	ul116: {
		display: { default: null, "::-webkit-scrollbar": "none" },
		scrollbarWidth: "none",
		minHeight: "0px",
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: "0%",
		borderBottomStyle: "solid",
		borderTopStyle: "solid",
		overflowY: "auto",
		paddingTop: "calc(0.25rem * 1.5)",
		paddingRight: "calc(0.25rem * 1.5)",
		paddingBottom: "calc(0.25rem * 1.5)",
		paddingLeft: "calc(0.25rem * 1.5)",
	},
	div202: {
		display: "flex",
		alignItems: "center",
		rowGap: "calc(0.25rem * 2)",
		columnGap: "calc(0.25rem * 2)",
	},
	h3205: {
		fontSize: constants.fsSm,
		fontWeight: 500,
	},
	lucideScale: {
		display: "block",
		verticalAlign: "middle",
		scale: constants.iconScale,
		transformOrigin: "center",
	},
});
