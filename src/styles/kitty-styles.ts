import * as stylex from "@stylexjs/stylex";
import { colors, constants, lengths } from "./public-tokens.stylex";

const kittyCarouselGutter = `max(24px, calc((100vw - ${lengths.pageWidth}) / 2))`;
const kittyCardWidth = "min(620px, calc(100vw - 48px))";
const kittyMobileCardWidth = "min(78vw, 320px)";

export const kittyStyles = stylex.create({
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
