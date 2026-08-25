import * as stylex from "@stylexjs/stylex";
import { colors, constants, lengths, times } from "./public-tokens.stylex";

const desktop = "@media (min-width: 901px)";
const canHover = "@media (hover: hover)";
const pageInlinePadding =
	`max(24px, calc(50vw - ${lengths.pageWidth} / 2))`;

export const shellStyles = stylex.create({
	shell: {
		display: "flex",
		minHeight: "100svh",
		flexDirection: "column",
		paddingInlineStart: "env(safe-area-inset-left, 0px)",
		paddingInlineEnd: "env(safe-area-inset-right, 0px)",
		color: colors.foreground,
		backgroundColor: colors.background,
	},
	backShell: { position: "relative" },
	skipLink: {
		position: "fixed", zIndex: 100, top: "12px", left: "12px", paddingTop: "10px", paddingRight: "16px", paddingBottom: "10px", paddingLeft: "16px", borderRadius: lengths.radiusControl, backgroundColor: colors.foreground, color: colors.buttonInk, fontWeight: 500, textDecoration: "none", translate: { default: "0 calc(-100% - 24px)", ":focus": "0 0" },
	},
	backNav: {
		position: "absolute", zIndex: 1, top: 0, right: 0, left: 0, display: "flex", minHeight: "72px", alignItems: "center", justifyContent: "space-between", paddingInlineStart: pageInlinePadding, paddingInlineEnd: pageInlinePadding,
	},
	brand: { position: "relative", zIndex: 2, display: "flex", minWidth: 0, alignItems: "center", color: colors.foreground, textDecoration: "none" },
	backLink: { display: "inline-flex", minHeight: "38px", alignItems: "center", columnGap: "6px", color: { default: colors.dim, ":hover": { default: colors.dim, [canHover]: colors.foreground } }, fontFamily: constants.fontSans, fontSize: "14px", fontWeight: 400, lineHeight: "20px", textDecoration: "none", transitionProperty: "color", transitionDuration: times.fast, transitionTimingFunction: "ease-out" },
	main: { display: "flex", flexGrow: 1, flexDirection: "column", scrollMarginTop: "72px", outline: { default: null, ":focus-visible": "none" }, boxShadow: { default: null, ":focus": "none" } },
	backMain: { minHeight: "100svh" },
	backFooter: {
		position: {
			default: "relative",
			[desktop]: "absolute",
		},
		right: { default: null, [desktop]: 0 },
		bottom: { default: null, [desktop]: 0 },
		left: { default: null, [desktop]: 0 },
	},
});
