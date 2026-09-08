import * as stylex from "@stylexjs/stylex";
import { colors, constants, lengths } from "./public-tokens.stylex";

const desktopNavHeight = `max(${lengths.navHeight}, calc(env(safe-area-inset-top, 0px) + 40px))`;
const mobileNavHeight = `max(${lengths.navHeight}, calc(env(safe-area-inset-top, 0px) + 44px))`;
const pageWidth = `min(${lengths.pageWidth}, calc(100% - ${lengths.pageGutter}))`;
const heroStagePadding = `calc((100% - ${pageWidth}) / 2)`;
const heroStageClippedWidth = `calc(100% - ${heroStagePadding})`;
const heroTextShadow = `0 0 8px color-mix(in oklab, ${colors.background} 16%, transparent), 0 1px 2px color-mix(in oklab, ${colors.background} 20%, transparent)`;
const kittyCarouselGutter = `max(24px, calc((100vw - ${lengths.pageWidth}) / 2))`;
const kittyCardWidth = "min(620px, calc(100vw - 48px))";
const kittyMobileCardWidth = "min(78vw, 320px)";
const sponsorRotation = stylex.keyframes({
	from: { transform: "translateX(0)" },
	to: { transform: "translateX(calc(-100% + 100vw - 48px))" },
});

export const styles = stylex.create({
	sectionWidth: {
		width: pageWidth,
		marginInline: "auto",
	},
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
		inset: 0,
		zIndex: 0,
		display: "block",
		width: "100%",
		height: "100%",
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
			default: "calc(clamp(72px, 11svh, 120px) - clamp(720px, 58vw, 940px) * 0.5)",
			"@media (max-width: 900px)": "calc(24px - min(96vw, 620px) * 0.5)",
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
		maskImage: "linear-gradient(to right, transparent 1.2%, rgb(0 0 0 / 15.625%) 3.525%, rgb(0 0 0 / 50%) 5.85%, rgb(0 0 0 / 84.375%) 8.175%, black 10.5%, black 89.5%, rgb(0 0 0 / 84.375%) 91.825%, rgb(0 0 0 / 50%) 94.15%, rgb(0 0 0 / 15.625%) 96.475%, transparent 98.8%), linear-gradient(to bottom, transparent 1.8%, rgb(0 0 0 / 15.625%) 4.225%, rgb(0 0 0 / 50%) 6.65%, rgb(0 0 0 / 84.375%) 9.075%, black 11.5%, black 78%, rgb(0 0 0 / 84.375%) 82.875%, rgb(0 0 0 / 50%) 87.75%, rgb(0 0 0 / 15.625%) 92.625%, transparent 97.5%)",
		maskComposite: "intersect",
	},
	heroAtmosphereBackgroundPoster: {
		position: "absolute",
		inset: 0,
		maskImage: {
			default: "none",
			"@media (prefers-color-scheme: light)": {
				default: "radial-gradient(ellipse 65% 70% at 50% calc(clamp(72px, 11svh, 120px) + clamp(720px, 58vw, 940px) / 3.04), black 0%, rgb(0 0 0 / 87.89%) 25%, rgb(0 0 0 / 56.25%) 50%, rgb(0 0 0 / 19.14%) 75%, transparent 100%)",
				"@media (max-width: 900px)": "radial-gradient(ellipse 65% 70% at 50% calc(24px + min(96vw, 620px) / 3.04), black 0%, rgb(0 0 0 / 87.89%) 25%, rgb(0 0 0 / 56.25%) 50%, rgb(0 0 0 / 19.14%) 75%, transparent 100%)",
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
			[stylex.when.ancestor(
				':has([aria-label="Local Studio workbench"][data-clip-right])',
			)]: 0,
			"@media (max-width: 900px)": 0,
		},
		marginBottom: 0,
		marginLeft: {
			default: "auto",
			[stylex.when.ancestor(
				':has([aria-label="Local Studio workbench"][data-clip-right])',
			)]: heroStagePadding,
			"@media (max-width: 900px)": "calc(48px / 2)",
		},
		width: {
			default: pageWidth,
			[stylex.when.ancestor(
				':has([aria-label="Local Studio workbench"][data-clip-right])',
			)]: heroStageClippedWidth,
			"@media (max-width: 900px)": "calc(100% - 48px / 2)",
		},
		overflow: {
			default: "visible",
			[stylex.when.ancestor(
				':has([aria-label="Local Studio workbench"][data-clip-right])',
			)]: "clip",
			"@media (max-width: 900px)": "clip",
		},
	},
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
	story: {
		paddingTop: lengths.storyGap,
		paddingRight: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		overflowX: {
			default: "visible",
			"@media (max-width: 900px)": "clip",
		},
	},
	storyShowcase: {
		position: "relative",
	},
	storySticky: {
		position: "sticky",
		zIndex: 1,
		top: {
			default: desktopNavHeight,
			"@media (max-width: 900px)": mobileNavHeight,
		},
		display: "grid",
		gridTemplateColumns: {
			default: "minmax(280px, 0.58fr) minmax(0, 1.42fr)",
			"@media (max-width: 900px)": "minmax(0, 1fr)",
		},
		alignItems: "center",
		alignContent: {
			default: "normal",
			"@media (max-width: 900px)": "center",
		},
		height: {
			default: `calc(100svh - ${desktopNavHeight})`,
			"@media (max-width: 900px)": `calc(100svh - ${mobileNavHeight})`,
		},
		columnGap: {
			default: "clamp(40px, 5vw, 80px)",
			"@media (max-width: 900px)": "24px",
		},
		rowGap: {
			default: "clamp(40px, 5vw, 80px)",
			"@media (max-width: 900px)": "24px",
		},
		paddingBlock: {
			default: "clamp(24px, 5svh, 48px)",
			"@media (max-width: 900px)": "20px",
		},
	},
	storyOptionsWindow: {
		alignSelf: "center",
		width: "100%",
		height: {
			default: `min(787px, calc(100svh - ${desktopNavHeight} - 48px))`,
			"@media (max-width: 900px)": "auto",
		},
		minHeight: 0,
		overflow: "visible",
	},
	storyOptions: {
		display: "grid",
		gridTemplateRows: {
			default: "repeat(5, minmax(0, 1fr))",
			"@media (max-width: 900px)": "minmax(0, auto)",
		},
		width: "100%",
		height: {
			default: "100%",
			"@media (max-width: 900px)": "auto",
		},
		margin: 0,
		padding: 0,
		listStyle: "none",
	},
	storyOptionsOffset: (offset: string) => ({
		transform: {
			default: `translateY(${offset})`,
			"@media (max-width: 900px)": "none",
		},
	}),
	storyOption: {
		position: "relative",
		display: "flex",
		gridArea: {
			default: "auto",
			"@media (max-width: 900px)": "1 / 1",
		},
		opacity: {
			default: 1,
			"@media (max-width: 900px)": 0,
		},
		pointerEvents: {
			default: "auto",
			"@media (max-width: 900px)": "none",
		},
		flexDirection: "column",
		justifyContent: "center",
		minHeight: 0,
		paddingTop: 0,
		paddingRight: {
			default: "14px",
			"@media (max-width: 900px)": 0,
		},
		paddingBottom: 0,
		paddingLeft: {
			default: "14px",
			"@media (max-width: 900px)": 0,
		},
		borderTopWidth: {
			default: "1px",
			"@media (max-width: 900px)": 0,
		},
		borderTopStyle: "solid",
		borderTopColor: colors.borderSoft,
	},
	storyOptionPosition: (offset: string) => ({
		transform: {
			default: "none",
			"@media (max-width: 900px)": `translate3d(0, ${offset}, 0)`,
		},
	}),
	storyFirstOption: {
		borderTopWidth: 0,
	},
	storySelectedOption: {
		opacity: 1,
		transform: "translate3d(0, 0, 0)",
		pointerEvents: "auto",
	},
	storyOptionControl: {
		display: "grid",
		width: "100%",
		minHeight: 0,
		gridTemplateColumns: "1fr",
		alignItems: "baseline",
		padding: 0,
		color: colors.quiet,
		textAlign: "left",
	},
	storyOptionTitle: {
		color: colors.foreground,
		fontFamily: constants.fontSans,
		fontSize: "28px",
		fontWeight: 425,
		lineHeight: "36px",
	},
	storyDescriptionMotion: {
		opacity: 0,
		transform: "translateY(6px)",
	},
	storyDescription: {
		maxWidth: "440px",
		marginTop: "8px",
		marginRight: 0,
		marginBottom: 0,
		marginLeft: 0,
		color: colors.fine,
		fontFamily: constants.fontSans,
		fontSize: "16px",
		fontWeight: 400,
		lineHeight: "24px",
	},
	storySelectedDescription: {
		opacity: 1,
		transform: "translateY(0)",
	},
	storyVisualHome: {
		alignSelf: "center",
		width: {
			default: "auto",
			"@media (max-width: 900px)": "100%",
		},
		maxHeight: {
			default: `min(787px, calc(100svh - ${desktopNavHeight} - 48px))`,
			"@media (max-width: 900px)": "none",
		},
		minHeight: 0,
		minWidth: 0,
		maxWidth: "100%",
		overflow: "clip",
	},
	storyVisual: {
		position: "relative",
		display: "grid",
		width: "100%",
		minWidth: 0,
		maxWidth: "100%",
		margin: 0,
		overflow: "clip",
	},
	storyDemoTransition: {
		gridArea: "1 / 1",
		minWidth: 0,
		opacity: 0,
		visibility: "hidden",
		pointerEvents: "none",
		contain: "paint",
		// Scene opacity and visibility are owned by Motion.
	},
	storySelectedDemo: {
		opacity: 1,
		visibility: "visible",
		pointerEvents: "auto",
	},
	storyScrollTrack: (height: string) => ({
		position: "relative",
		zIndex: 0,
		marginTop: {
			default: `calc(${desktopNavHeight} - 100svh)`,
			"@media (max-width: 900px)": `calc(${mobileNavHeight} - 100svh)`,
		},
		pointerEvents: "none",
		height,
	}),
	screenReaderOnly: {
		position: "absolute",
		width: "1px",
		height: "1px",
		padding: 0,
		margin: "-1px",
		overflow: "hidden",
		clip: "rect(0, 0, 0, 0)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
	kitty: {
		paddingTop: lengths.storyGap,
		paddingRight: 0,
		paddingBottom: 0,
		paddingLeft: 0,
	},
	kittyIntro: {
		textAlign: "left",
	},
	kittyHeading: {
		maxWidth: "760px",
		marginTop: 0,
		fontFamily: constants.fontSans,
		fontSize: {
			default: "56px",
			"@media (max-width: 620px)": "32px",
		},
		fontWeight: 425,
		lineHeight: {
			default: "60px",
			"@media (max-width: 620px)": "40px",
		},
		letterSpacing: constants.headerTracking,
	},
	kittyCarousel: {
		width: "100%",
		overflowX: "auto",
		marginTop: {
			default: "32px",
			"@media (max-width: 620px)": "24px",
		},
		cursor: {
			default: "grab",
			":active": "grabbing",
		},
		overscrollBehaviorX: "contain",
		scrollSnapType: {
			default: "none",
			"@media (max-width: 620px)": "x proximity",
		},
		scrollPaddingInline: {
			default: 0,
			"@media (max-width: 620px)": "20px",
		},
		scrollbarWidth: "none",
		touchAction: "pan-x pan-y",
		"::-webkit-scrollbar": {
			display: "none",
		},
	},
	kittyCarouselDragging: {
		userSelect: "none",
	},
	kittyItems: {
		display: "flex",
		width: "max-content",
		alignItems: "flex-start",
		columnGap: {
			default: "24px",
			"@media (max-width: 620px)": "16px",
		},
		rowGap: "24px",
		paddingInline: {
			default: kittyCarouselGutter,
			"@media (max-width: 620px)": "20px",
		},
	},
	kittyFeature: {
		minWidth: 0,
		scrollSnapAlign: {
			default: "none",
			"@media (max-width: 620px)": "start",
		},
		flexGrow: 0,
		flexShrink: 0,
		flexBasis: {
			default: kittyCardWidth,
			"@media (max-width: 620px)": kittyMobileCardWidth,
		},
	},
	kittyFeatureBody: {
		minHeight: "56px",
		paddingTop: "16px",
		paddingRight: 0,
		paddingBottom: "16px",
		paddingLeft: 0,
	},
	kittyFeatureTrigger: {
		display: "block",
		minWidth: 0,
		flexGrow: 1,
		padding: 0,
		borderWidth: 0,
		backgroundColor: "transparent",
		color: colors.foreground,
		fontFamily: constants.fontSans,
		fontSize: "16px",
		fontWeight: 500,
		lineHeight: "24px",
		textAlign: "left",
	},
	kittyFeatureDescription: {
		overflow: "hidden",
	},
	kittyFeatureDescriptionText: {
		maxWidth: "42ch",
		paddingTop: "12px",
		color: colors.fine,
		fontFamily: constants.fontSans,
		fontSize: "16px",
		fontWeight: 400,
		lineHeight: "24px",
	},
	kittyFeatureMedia: {
		position: "relative",
		isolation: "isolate",
		aspectRatio: "1",
		overflow: "hidden",
		padding: "1px",
		borderRadius: lengths.radiusFrame,
		backgroundImage: {
			default: `linear-gradient(to bottom, ${colors.borderStrong}, ${colors.borderSoft})`,
			":focus-visible": `linear-gradient(to bottom, ${colors.borderStrongHover}, ${colors.border})`,
		},
		"::after": {
			content: '""',
			position: "absolute",
			zIndex: 1,
			inset: "1px",
			borderRadius: `calc(${lengths.radiusFrame} - 1px)`,
			pointerEvents: "none",
			backgroundColor: colors.surfaceFaint,
			mixBlendMode: {
				default: "screen",
				"@media (prefers-color-scheme: light)": "multiply",
			},
		},
	},
	kittyFeatureImage: {
		display: "block",
		width: "100%",
		height: "100%",
		borderRadius: `calc(${lengths.radiusFrame} - 1px)`,
		objectFit: "cover",
		filter: "saturate(1.08) contrast(1.02)",
	},
});
