import * as stylex from "@stylexjs/stylex";
import { colors, constants, lengths } from "./public-tokens.stylex";

const desktopNavHeight = `max(${lengths.navHeight}, calc(env(safe-area-inset-top, 0px) + 40px))`;
const mobileNavHeight = `max(${lengths.navHeight}, calc(env(safe-area-inset-top, 0px) + 44px))`;

export const storyStyles = stylex.create({
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
		overflow: "visible",
	},
	storyVisual: {
		position: "relative",
		isolation: "isolate",
		display: "grid",
		width: "100%",
		minWidth: 0,
		maxWidth: "100%",
		margin: 0,
		overflow: "visible",
	},
	storyDemoTransition: {
		gridArea: "1 / 1",
		minWidth: 0,
		opacity: 0,
		visibility: "hidden",
		pointerEvents: "none",
	},
	storyDemoOrder: (order: number) => ({
		zIndex: order,
	}),
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
});
