import * as stylex from "@stylexjs/stylex";
import { colors, constants, lengths } from "./public-tokens.stylex";

const pageWidth = `min(${lengths.pageWidth}, calc(100% - ${lengths.pageGutter}))`;
const heroStagePadding = `calc((100% - ${pageWidth}) / 2)`;
const heroStageClippedWidth = `calc(100% - ${heroStagePadding})`;
const heroTextShadow = `0 0 8px color-mix(in oklab, ${colors.background} 16%, transparent), 0 1px 2px color-mix(in oklab, ${colors.background} 20%, transparent)`;

export const heroStyles = stylex.create({
	hero: {
		position: "relative",
		backgroundColor: colors.background,
		overflowX: "clip",
		overflowY: "visible",
		isolation: "isolate",
		paddingBottom: {
			default: "40px",
			"@media (max-width: 900px)": "28px",
		},
	},
	heroBackdrop: {
		position: "absolute",
		inset: 0,
		pointerEvents: "none",
	},
	heroAtmosphere: {
		position: "absolute",
		top: "-25svh",
		left: "-20%",
		zIndex: 0,
		display: "block",
		width: "140%",
		height: "calc(100% + 25svh)",
		pointerEvents: "none",
	},
	heroAtmospherePending: { visibility: "hidden" },
	heroAtmosphereForeground: { zIndex: 1 },
	heroAtmosphereIntro: { zIndex: 1, opacity: 0, visibility: "hidden" },
	heroAtmosphereImage: {
		position: "absolute",
		display: "block",
		left: "50%",
		top: {
			default: "calc(25svh + clamp(72px, 11svh, 120px) - clamp(720px, 58vw, 940px) * 0.5)",
			"@media (max-width: 900px)": "calc(25svh + 24px - min(96vw, 620px) * 0.5)",
		},
		width: {
			default: "calc(clamp(720px, 58vw, 940px) * 4)",
			"@media (max-width: 900px)": "calc(min(96vw, 620px) * 4)",
		},
		height: "auto",
		aspectRatio: "3760 / 4000",
		transform: "translateX(-50%)",
		userSelect: "none",
	},
	heroAtmospherePlaceholder: {
		overflow: "hidden",
		maskImage:
			"linear-gradient(to right, transparent 1.2%, rgb(0 0 0 / 15.625%) 3.525%, rgb(0 0 0 / 50%) 5.85%, rgb(0 0 0 / 84.375%) 8.175%, black 10.5%, black 89.5%, rgb(0 0 0 / 84.375%) 91.825%, rgb(0 0 0 / 50%) 94.15%, rgb(0 0 0 / 15.625%) 96.475%, transparent 98.8%), linear-gradient(to bottom, transparent 1.8%, rgb(0 0 0 / 15.625%) 4.225%, rgb(0 0 0 / 50%) 6.65%, rgb(0 0 0 / 84.375%) 9.075%, black 11.5%, black 78%, rgb(0 0 0 / 84.375%) 82.875%, rgb(0 0 0 / 50%) 87.75%, rgb(0 0 0 / 15.625%) 92.625%, transparent 97.5%)",
		maskComposite: "intersect",
	},
	heroAtmosphereBackgroundPoster: {
		position: "absolute",
		inset: 0,
		maskImage: {
			default: "none",
			"@media (prefers-color-scheme: light)": {
				default:
					"radial-gradient(ellipse 65% 70% at 50% calc(25svh + clamp(72px, 11svh, 120px) + clamp(720px, 58vw, 940px) / 3.04), black 0%, rgb(0 0 0 / 87.89%) 25%, rgb(0 0 0 / 56.25%) 50%, rgb(0 0 0 / 19.14%) 75%, transparent 100%)",
				"@media (max-width: 900px)":
					"radial-gradient(ellipse 65% 70% at 50% calc(25svh + 24px + min(96vw, 620px) / 3.04), black 0%, rgb(0 0 0 / 87.89%) 25%, rgb(0 0 0 / 56.25%) 50%, rgb(0 0 0 / 19.14%) 75%, transparent 100%)",
			},
		},
	},
	heroRender: {
		left: "50%",
		width: {
			default: "clamp(720px, 58vw, 940px)",
			"@media (max-width: 900px)": "min(96vw, 620px)",
		},
		opacity: { default: 1, "@media (max-width: 1200px)": 0.16 },
	},
	heroInner: {
		position: "relative",
		zIndex: 2,
		display: "flex",
		width: pageWidth,
		minHeight: 0,
		flexDirection: {
			default: "row",
			"@media (max-width: 620px)": "column",
		},
		alignItems: "flex-start",
		justifyContent: "flex-start",
		marginInline: "auto",
		paddingTop: {
			default: "clamp(140px, 18svh, 208px)",
			"@media (max-width: 900px)": "76px",
		},
		textAlign: "left",
	},
	heroCopy: {
		position: "relative",
		zIndex: 2,
		maxWidth: "790px",
	},
	heroHeading: {
		textShadow: heroTextShadow,
		marginTop: 0,
		fontFamily: constants.fontSans,
		fontSize: {
			default: "70px",
			"@media (max-width: 620px)": "40px",
		},
		fontWeight: 400,
		lineHeight: {
			default: "78px",
			"@media (max-width: 620px)": "44px",
		},
		letterSpacing: constants.heroTracking,
		textWrap: "balance",
	},
	heroTitleEnd: {
		whiteSpace: "nowrap",
	},
	heroMarkButton: {
		display: "inline-flex",
		width: { default: "0.78em", "@media (max-width: 620px)": "44px" },
		height: { default: "0.78em", "@media (max-width: 620px)": "44px" },
		minWidth: 0,
		minHeight: 0,
		marginTop: 0,
		marginRight: 0,
		marginBottom: 0,
		marginLeft: "0.14em",
		padding: 0,
		borderWidth: 0,
		verticalAlign: "-0.06em",
		backgroundColor: "transparent",
		cursor: "pointer",
	},
	heroMark: {
		display: "block",
		width: "100%",
		height: "100%",
		filter: {
			default: "none",
			"@media (prefers-color-scheme: light)": "invert(1)",
		},
	},
	heroThesis: {
		textShadow: heroTextShadow,
		marginTop: "12px",
		color: colors.foreground,
		fontFamily: constants.fontSans,
		fontSize: "16px",
		fontWeight: 400,
		lineHeight: "24px",
	},
	heroActions: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-start",
		columnGap: "12px",
		rowGap: "12px",
		marginTop: "36px",
	},
	heroStage: {
		position: "relative",
		zIndex: 4,
		marginTop: {
			default: "72px",
			"@media (max-width: 900px)": "56px",
		},
		marginRight: {
			default: "auto",
			[stylex.when.ancestor(':has([aria-label="Local Studio workbench"][data-clip-right])')]: 0,
			"@media (max-width: 900px)": 0,
		},
		marginBottom: 0,
		marginLeft: {
			default: "auto",
			[stylex.when.ancestor(':has([aria-label="Local Studio workbench"][data-clip-right])')]:
				heroStagePadding,
			"@media (max-width: 900px)": "calc(48px / 2)",
		},
		width: {
			default: pageWidth,
			[stylex.when.ancestor(':has([aria-label="Local Studio workbench"][data-clip-right])')]:
				heroStageClippedWidth,
			"@media (max-width: 900px)": "calc(100% - 48px / 2)",
		},
		overflow: {
			default: "visible",
			[stylex.when.ancestor(':has([aria-label="Local Studio workbench"][data-clip-right])')]:
				"clip",
			"@media (max-width: 900px)": "clip",
		},
	},
});
