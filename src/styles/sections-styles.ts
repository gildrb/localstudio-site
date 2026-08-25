import * as stylex from "@stylexjs/stylex";
import { colors, constants, lengths, times } from "./public-tokens.stylex";

const reducedMotion = "@media (prefers-reduced-motion: reduce)";
const desktopNavHeight = `max(${lengths.navHeight}, calc(env(safe-area-inset-top, 0px) + 40px))`;
const mobileNavHeight = `max(${lengths.navHeight}, calc(env(safe-area-inset-top, 0px) + 44px))`;
const storyDemoEnter = stylex.keyframes({
	from: {
		opacity: 0,
		transform: "translateY(6px)",
	},
	to: {
		opacity: 1,
		transform: "translateY(0)",
	},
});

const pageWidth = `min(${lengths.pageWidth}, calc(100% - ${lengths.pageGutter}))`;
const heroStagePadding = `calc((100% - ${pageWidth}) / 2)`;
const heroStageClippedWidth = `calc(100% - ${heroStagePadding})`;
const kittyCarouselGutter = `max(24px, calc((100vw - ${lengths.pageWidth}) / 2))`;
const kittyCardWidth = `min(400px, calc((min(${lengths.pageWidth}, calc(100vw - ${lengths.pageGutter})) - 48px) / 3))`;

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
		justifyContent: "center",
		marginInline: "auto",
		paddingTop: {
			default: "clamp(140px, 18svh, 208px)",
			"@media (max-width: 900px)": "76px",
		},
		textAlign: "center",
	},
	heroCopy: {
		position: "relative",
		zIndex: 2,
		maxWidth: "790px",
		"::before": {
			content: '""',
			inset: "-60% -80%",
			backgroundImage:
				"radial-gradient(50% 50% at 50% 50%, rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.025) 55%, transparent 100%)",
			pointerEvents: "none",
		},
	},
	heroHeading: {
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
		letterSpacing: {
			default: constants.headerTracking,
			"@media (max-width: 620px)": "-0.022em",
		},
		textWrap: "balance",
		textShadow: "0 1px 2px rgb(0 0 0 / 0.16)",
	},
	heroTitleEnd: {
		whiteSpace: "nowrap",
	},
	heroMarkButton: {
		display: "inline-flex",
		width: "0.78em",
		height: "0.78em",
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
	},
	heroThesis: {
		marginTop: "12px",
		color: colors.foreground,
		fontFamily: constants.fontSans,
		fontSize: "16px",
		fontWeight: 500,
		lineHeight: "24px",
		textShadow: "0 1px 4px rgb(0 0 0 / 0.18)",
	},
	heroActions: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
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
	heroDemoPlaceholder: {
		height: {
			default: "787px",
			"@media (max-width: 900px)": "auto",
		},
		aspectRatio: {
			default: "auto",
			"@media (max-width: 900px)": "950 / 787",
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
		color: colors.quiet,
		textAlign: "left",
	},
	sponsorsList: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: {
			default: "space-between",
			"@media (max-width: 900px)": "center",
		},
		columnGap: "48px",
		rowGap: "24px",
		margin: 0,
		padding: 0,
		listStyle: "none",
	},
	sponsorImage: {
		display: "block",
		width: "auto",
	},
	sponsorImageSize: (width: number, height: number) => ({
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
		display: {
			default: "grid",
			"@media (max-width: 900px)": "block",
		},
		gridTemplateRows: "repeat(5, minmax(0, 1fr))",
		width: "100%",
		height: {
			default: "100%",
			"@media (max-width: 900px)": "auto",
		},
		margin: 0,
		padding: 0,
		listStyle: "none",
		transitionProperty: "transform",
		transitionDuration: times.feature,
		transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	},
	storyOptionsOffset: (offset: string) => ({
		transform: {
			default: `translateY(${offset})`,
			"@media (max-width: 900px)": "none",
		},
	}),
	storyOption: {
		position: "relative",
		display: {
			default: "flex",
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
	storyFirstOption: {
		borderTopWidth: 0,
	},
	storySelectedOption: {
		display: "flex",
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
		color: colors.quiet,
		fontFamily: constants.fontSans,
		fontSize: "28px",
		fontWeight: 425,
		lineHeight: "36px",
		transitionProperty: "color",
		transitionDuration: times.fast,
		transitionTimingFunction: "ease-out",
	},
	storySelectedOptionTitle: {
		color: colors.foreground,
	},
	storyDescription: {
		maxWidth: "440px",
		marginTop: "8px",
		marginRight: 0,
		marginBottom: 0,
		marginLeft: 0,
		color: colors.dim,
		fontFamily: constants.fontSans,
		fontSize: "16px",
		fontWeight: 400,
		lineHeight: "24px",
		opacity: 0,
		transform: "translateY(6px)",
		filter: "blur(8px)",
		transitionProperty: "opacity, transform, filter",
		transitionDuration: times.feature,
		transitionTimingFunction:
			"cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.16, 1, 0.3, 1)",
	},
	storySelectedDescription: {
		opacity: 1,
		transform: "translateY(0)",
		filter: "blur(0)",
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
		width: "100%",
		minWidth: 0,
		maxWidth: "100%",
		margin: 0,
		overflow: "clip",
	},
	storyDemoTransition: {
		contain: "paint",
		willChange: "opacity, transform",
		animationName: {
			default: storyDemoEnter,
			[reducedMotion]: "none",
		},
		animationDuration: times.feature,
		animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
		animationIterationCount: {
			default: 1,
			[reducedMotion]: 1,
		},
		animationFillMode: "both",
	},
	storyDemoPlaceholder: {
		width: "100%",
		maxHeight: {
			default: "787px",
			"@media (max-width: 900px)": "none",
		},
		aspectRatio: {
			default: "820 / 787",
			"@media (max-width: 900px)": "680 / 580",
		},
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
		marginTop: "32px",
		cursor: {
			default: "grab",
			":active": "grabbing",
		},
		overscrollBehaviorX: "contain",
		scrollbarWidth: "none",
		touchAction: "pan-y",
		"::-webkit-scrollbar": {
			display: "none",
		},
	},
	kittyItems: {
		display: "flex",
		width: "max-content",
		alignItems: "flex-start",
		columnGap: "24px",
		rowGap: "24px",
		paddingInline: kittyCarouselGutter,
	},
	kittyFeature: {
		minWidth: 0,
		flexGrow: 0,
		flexShrink: 0,
		flexBasis: {
			default: kittyCardWidth,
			"@media (max-width: 900px)": "calc((100vw - 48px - 24px) / 2)",
			"@media (max-width: 620px)": "calc(100vw - 48px)",
		},
	},
	kittyFeatureBody: {
		minHeight: "56px",
		paddingTop: "16px",
		paddingRight: 0,
		paddingBottom: "16px",
		paddingLeft: 0,
		cursor: "pointer",
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
		cursor: "pointer",
	},
	kittyFeatureDescription: {
		overflow: "hidden",
	},
	kittyFeatureDescriptionText: {
		maxWidth: "42ch",
		paddingTop: "12px",
		color: colors.dim,
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
		backgroundImage: `linear-gradient(${colors.surfaceFaint}, ${colors.surfaceFaint}), linear-gradient(to bottom, ${colors.border}, rgb(0 0 0))`,
		"::before": {
			content: '""',
			position: "absolute",
			zIndex: 1,
			inset: 0,
			pointerEvents: "none",
			backgroundColor: colors.background,
			mixBlendMode: "lighten",
		},
		"::after": {
			content: '""',
			position: "absolute",
			zIndex: 1,
			inset: 0,
			pointerEvents: "none",
			backgroundColor: colors.mediaTone,
			mixBlendMode: "darken",
		},
	},
	kittyFeatureImage: {
		display: "block",
		width: "100%",
		height: "100%",
		objectFit: "cover",
		filter: "grayscale(1) contrast(0.88)",
	},
});
