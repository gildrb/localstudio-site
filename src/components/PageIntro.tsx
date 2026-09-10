import { baseStyles, type PublicStyle } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { colors, constants, lengths } from "../styles/public-tokens.stylex";
import type { ReactNode } from "react";

interface PageIntroProps {
	readonly actions?: Readonly<ReactNode> | undefined;
	readonly aside?: Readonly<ReactNode> | undefined;
	readonly children?: Readonly<ReactNode> | undefined;
	readonly description: Readonly<ReactNode>;
	readonly id: string;
	readonly layout?: "centered" | "left" | "split";
	readonly sx?: PublicStyle;
	readonly title: Readonly<ReactNode>;
}

const pageWidth = `min(${lengths.pageWidth}, calc(100% - ${lengths.pageGutter}))`;

const styles = stylex.create({
	root: {
		display: "grid",
		width: pageWidth,
		minHeight: {
			default: "650px",
			"@media (max-width: 620px)": "540px",
		},
		marginInline: "auto",
		placeItems: "center",
		textAlign: "center",
	},
	left: {
		minHeight: 0,
		placeItems: "start",
		paddingTop: {
			default: "129px",
			"@media (max-width: 900px)": "80px",
			"@media (max-width: 620px)": "64px",
		},
		paddingBottom: {
			default: "120px",
			"@media (max-width: 900px)": "80px",
			"@media (max-width: 620px)": "64px",
		},
		textAlign: "left",
	},
	split: {
		gridTemplateColumns: {
			default: "minmax(0, 1.08fr) minmax(360px, 0.72fr)",
			"@media (max-width: 900px)": "1fr",
		},
		gap: {
			default: "80px",
			"@media (max-width: 900px)": "48px",
		},
		placeItems: "start",
		paddingTop: {
			default: "129px",
			"@media (max-width: 900px)": "80px",
			"@media (max-width: 620px)": "64px",
		},
		paddingBottom: {
			default: "120px",
			"@media (max-width: 900px)": "80px",
			"@media (max-width: 620px)": "64px",
		},
		textAlign: "left",
	},
	content: {
		width: "min(900px, 100%)",
		maxWidth: "100%",
		minWidth: 0,
	},
	contentWide: {
		width: "100%",
	},
	title: {
		maxWidth: "900px",
		marginInline: "auto",
	},
	titleLeft: {
		marginLeft: 0,
	},
	titleLeftWidth: {
		width: "max-content",
		maxWidth: "100%",
	},
	description: {
		maxWidth: "620px",
		marginTop: "24px",
		marginRight: "auto",
		marginBottom: 0,
		marginLeft: "auto",
		color: colors.fine,
		fontFamily: constants.fontSans,
		fontSize: "16px",
		fontWeight: 400,
		lineHeight: "24px",
	},
	descriptionLeft: {
		marginLeft: 0,
	},
	actions: {
		display: "flex",
		width: {
			default: "auto",
			"@media (max-width: 620px)": "100%",
		},
		maxWidth: {
			default: "none",
			"@media (max-width: 620px)": "100%",
		},
		alignItems: "center",
		justifyContent: {
			default: "center",
			"@media (max-width: 620px)": "center",
		},
		gap: "12px",
		marginTop: {
			default: "36px",
			"@media (max-width: 620px)": "32px",
		},
	},
	actionsSplit: {
		justifyContent: "flex-start",
	},
});

function PageIntroTitle({
	id,
	title,
	layout,
}: Readonly<Pick<PageIntroProps, "id" | "title" | "layout">>) {
	const alignedLeft = layout !== "centered";
	return (
		<h1
			id={id}
			tabIndex={-1}
			{...stylex.props(
				baseStyles.element,
				baseStyles.heading,
				baseStyles.headingOne,
				baseStyles.focusable,
				styles.title,
				alignedLeft && styles.titleLeft,
				layout === "left" && styles.titleLeftWidth,
			)}
		>
			{title}
		</h1>
	);
}

export function PageIntro(props: PageIntroProps) {
	const layout = props.layout ?? "centered";
	const hasActions = Boolean(props.actions);
	const hasAside = Boolean(props.aside);
	const alignedLeft = layout !== "centered";
	return (
		<section
			{...stylex.props(
				baseStyles.element,
				styles.root,
				layout === "left" && styles.left,
				layout === "split" && styles.split,
				props.sx,
			)}
			aria-labelledby={props.id}
		>
			<div {...stylex.props(baseStyles.element, styles.content, alignedLeft && styles.contentWide)}>
				<PageIntroTitle id={props.id} title={props.title} layout={layout} />
				<p
					{...stylex.props(
						baseStyles.element,
						baseStyles.paragraph,
						styles.description,
						alignedLeft && styles.descriptionLeft,
					)}
				>
					{props.description}
				</p>
				{hasActions ? (
					<div
						{...stylex.props(
							baseStyles.element,
							styles.actions,
							alignedLeft && styles.actionsSplit,
						)}
					>
						{props.actions}
					</div>
				) : null}
				{props.children}
			</div>
			{hasAside ? <div {...stylex.props(baseStyles.element)}>{props.aside}</div> : null}
		</section>
	);
}
