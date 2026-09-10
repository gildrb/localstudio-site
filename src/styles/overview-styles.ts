import * as stylex from "@stylexjs/stylex";
import { colors, constants, times } from "./public-tokens.stylex";

export const overviewStyles = stylex.create({
	overviewRows: {
		display: "grid",
		marginTop: 24,
		marginRight: 0,
		marginBottom: 0,
		marginLeft: 0,
		paddingTop: 0,
		paddingRight: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		listStyleType: "none",
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: colors.border,
	},
	overviewRow: {
		display: "grid",
		gridTemplateColumns: {
			default: "minmax(0, 240px) minmax(0, 1fr)",
			"@media (max-width: 900px)": "minmax(0, 1fr)",
		},
		columnGap: {
			default: 32,
			"@media (max-width: 900px)": 0,
		},
		rowGap: {
			default: 0,
			"@media (max-width: 900px)": 6,
		},
		alignItems: "start",
		justifyItems: {
			"@media (max-width: 900px)": "start",
		},
		minHeight: {
			default: 56,
			"@media (max-width: 900px)": 0,
		},
		paddingTop: {
			default: 12,
			"@media (max-width: 900px)": 14,
		},
		paddingBottom: {
			default: 12,
			"@media (max-width: 900px)": 14,
		},
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: colors.border,
	},
	overviewLabel: {
		color: colors.foreground,
		fontFamily: constants.fontSans,
		fontSize: 16,
		fontWeight: 500,
		lineHeight: "24px",
	},
	overviewLabelCode: {
		fontFamily: constants.fontMono,
		fontWeight: 400,
		letterSpacing: 0,
		overflowWrap: "anywhere",
	},
	overviewLink: {
		display: "inline-flex",
		minWidth: { default: 0, "@media (max-width: 900px)": "44px" },
		minHeight: { default: "24px", "@media (max-width: 900px)": "44px" },
		justifySelf: "start",
		alignItems: "center",
		columnGap: 6,
		color: {
			default: colors.dim,
			"@media (hover: hover)": {
				":hover": colors.foreground,
			},
		},
		textDecoration: "none",
	},
	overviewArrow: {
		flexShrink: 0,
		color: "currentColor",
		transitionProperty: "color",
		transitionDuration: times.fast,
		transitionTimingFunction: "ease-out",
	},
	overviewText: {
		marginTop: 0,
		marginRight: 0,
		marginBottom: 0,
		marginLeft: 0,
		color: colors.fine,
	},
	overviewTextLink: {
		display: "inline-flex",
		minHeight: { default: "24px", "@media (max-width: 900px)": "44px" },
		alignItems: "center",
		color: {
			default: colors.foreground,
			"@media (hover: hover)": {
				":hover": colors.foreground,
			},
		},
		textDecoration: "none",
	},
});
