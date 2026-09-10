import { machineStyles } from "./machine-styles";
import { overviewStyles } from "./overview-styles";
import * as stylex from "@stylexjs/stylex";
import { colors, constants, lengths, times } from "./public-tokens.stylex";

const pageWidth = `min(${lengths.pageWidth}, calc(100% - ${lengths.pageGutter}))`;

const sharedStyles = stylex.create({
	sectionWidth: {
		width: pageWidth,
		marginLeft: "auto",
		marginRight: "auto",
	},
	pageBottom: {
		paddingBottom: { default: 120, "@media (max-width: 620px)": 96 },
	},
	docsSection: {
		marginTop: 80,
		scrollMarginTop: 112,
	},
	docsSectionHeading: {
		color: colors.foreground,
		fontSize: 24,
		fontWeight: 425,
		lineHeight: "32px",
		letterSpacing: 0,
	},
	docsSectionLead: {
		marginTop: 24,
	},
	marginTop16: {
		marginTop: 16,
	},
	marginTop32: {
		marginTop: 32,
	},
	docsList: {
		paddingLeft: 24,
		listStyleType: "disc",
	},
	docsListItem: {
		marginBottom: 8,
	},
	docsStrong: {
		color: colors.foreground,
		fontWeight: 500,
	},
	docsInlineCode: {
		overflowWrap: "anywhere",
	},
	docsCode: {
		display: "block",
		maxWidth: "100%",
		overflowX: "auto",
		marginTop: 32,
		marginRight: 0,
		marginBottom: 32,
		marginLeft: 0,
		paddingBlock: 16,
		paddingInline: 20,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderSoft,
		borderRadius: lengths.radiusCompact,
		color: colors.fine,
		fontFamily: constants.fontMono,
		fontSize: 16,
		fontWeight: 400,
		lineHeight: "24px",
	},
	docsNotice: {
		padding: 16,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.borderSoft,
		borderRadius: lengths.radiusCompact,
	},
	downloadIntro: {
		minHeight: 0,
		paddingTop: {
			default: "calc(72px + clamp(140px, 18svh, 208px) + 24px)",
			"@media (max-width: 620px)": 100,
		},
	},
	downloadCta: {
		width: {
			default: "100%",
			"@media (min-width: 621px)": 340,
		},
	},
	downloadMeta: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		columnGap: 16,
		rowGap: 8,
		marginTop: 16,
		color: colors.fine,
		fontFamily: constants.fontSans,
		fontSize: 16,
		fontWeight: 400,
		lineHeight: "24px",
	},
	button: {
		display: "inline-flex",
		minHeight: 40,
		alignItems: "center",
		justifyContent: "center",
		columnGap: 8,
		paddingInline: 16,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: colors.foreground,
		borderRadius: lengths.radiusControl,
		color: colors.buttonInk,
		backgroundColor: colors.foreground,
		boxShadow: {
			default: `0 6px 20px ${colors.shadowControl}, 0 1px 6px ${colors.shadowControlDirect}`,
			"@media (hover: hover)": {
				":hover": `0 8px 24px ${colors.shadowControl}, 0 2px 8px ${colors.focusHalo}`,
			},
		},
		fontWeight: 500,
		textDecoration: "none",
		transitionProperty: "color, background, border-color, box-shadow",
		transitionDuration: times.fast,
		transitionTimingFunction: "ease-out",
		width: { "@media (max-width: 620px)": "auto" },
	},
	notFoundRoutes: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		marginTop: 32,
	},
	notFoundRoute: {
		display: "flex",
		alignItems: "center",
		minHeight: {
			default: 32,
			"@media (max-width: 620px)": 44,
		},
		paddingTop: 4,
		paddingRight: 12,
		paddingBottom: 4,
		paddingLeft: 12,
		color: {
			default: colors.dim,
			"@media (hover: hover)": {
				":hover": colors.foreground,
			},
		},
		textDecoration: "none",
	},
});

export const styles = {
	...sharedStyles,
	...machineStyles,
	...overviewStyles,
};
