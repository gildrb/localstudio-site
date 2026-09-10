import * as stylex from "@stylexjs/stylex";
import { colors, constants, lengths, times } from "./public-tokens.stylex";

const mobile = "@media (max-width: 900px)";

const canHover = "@media (hover: hover)";

const pageWidth = `min(${lengths.pageWidth}, calc(100% - ${lengths.pageGutter}))`;

export const desktopStyles = stylex.create({
	mega: {
		position: "absolute",
		zIndex: 3,
		top: "calc(100% - 24px)",
		right: 0,
		left: 0,
		height: "188px",
		isolation: "isolate",
		backgroundColor: "transparent",
		display: { default: "block", [mobile]: "none" },
	},
	megaResources: { height: "188px" },
	megaInner: {
		position: "relative",
		zIndex: 1,
		width: pageWidth,
		marginInlineStart: "auto",
		marginInlineEnd: "auto",
		paddingTop: "12px",
		paddingRight: 0,
		paddingBottom: "32px",
		paddingLeft: 0,
	},
	megaGrid: (offset: number) => ({
		display: "grid",
		gridTemplateColumns: "repeat(2, minmax(0, max-content))",
		columnGap: "64px",
		paddingLeft: offset,
	}),
	megaSection: { minWidth: 0 },
	menuItems: {
		display: "grid",
		rowGap: 0,
		marginTop: 0,
		marginRight: 0,
		marginBottom: 0,
		marginLeft: 0,
		paddingTop: 0,
		paddingRight: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		listStyleType: "none",
	},
	menuItem: {
		display: "flex",
		minHeight: "48px",
		alignItems: "center",
		marginInlineStart: "-12px",
		marginInlineEnd: "-12px",
		paddingTop: 0,
		paddingRight: "12px",
		paddingBottom: 0,
		paddingLeft: "12px",
		borderRadius: lengths.radiusControl,
		color: {
			default: colors.chrome,
			":hover": { default: colors.chrome, [canHover]: colors.foreground },
		},
		fontFamily: constants.fontSans,
		fontSize: "19px",
		fontWeight: 425,
		lineHeight: "28px",
		textDecoration: "none",
		textAlign: "left",
		transitionProperty: "color",
		transitionDuration: times.fast,
		transitionTimingFunction: "ease-out",
		backgroundColor: "transparent",
	},
});
