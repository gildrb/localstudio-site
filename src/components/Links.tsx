import { baseStyles, type PublicStyle } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { colors, constants, lengths, times } from "../styles/public-tokens.stylex";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { downloadLabel, downloadPath } from "../domain/route";
import { LocalLink } from "./LocalLink";

interface TextLinkProps
	extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "style"> {
	children: ReactNode;
	href: string;
	sx?: PublicStyle;
}

interface Cta {
	href: string;
	label: ReactNode;
}

interface CtaPairProps {
	primary?: Cta;
	secondary: Cta;
	sx?: PublicStyle;
}


const downloadCta = {
	href: downloadPath,
	label: downloadLabel(),
} satisfies Cta;

const styles = stylex.create({
	textLink: {
		display: "inline-flex",
		minHeight: {
			default: 0,
			"@media (max-width: 620px)": "44px",
		},
		alignItems: "center",
		gap: "4px",
		color: {
			default: colors.quiet,
			"@media (hover: hover)": {
				default: colors.quiet,
				":hover": colors.foreground,
			},
		},
		fontFamily: constants.fontSans,
		fontSize: "16px",
		fontWeight: 400,
		lineHeight: "24px",
		textDecoration: "none",
		transitionProperty: "color",
		transitionDuration: times.fast,
		transitionTimingFunction: "ease-out",
	},
	button: {
		display: "inline-flex",
		width: "auto",
		minHeight: "40px",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
		paddingBlock: '0',
		paddingInline: '16px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: lengths.radiusControl,
		color: colors.buttonInk,
		backgroundColor: {
			default: colors.foreground,
			"@media (hover: hover)": {
				default: colors.foreground,
				":hover": colors.foregroundHover,
			},
		},
		borderColor: {
			default: colors.foreground,
			"@media (hover: hover)": {
				default: colors.foreground,
				":hover": colors.foregroundHover,
			},
		},
		fontWeight: 500,
		textDecoration: "none",
		transitionProperty: "color, background, border-color",
		transitionDuration: times.fast,
		transitionTimingFunction: "ease-out",
	},
	group: {
		display: {
			default: "inline-flex",
			"@media (max-width: 620px)": "flex",
		},
		width: {
			default: "auto",
			"@media (max-width: 620px)": "100%",
		},
		maxWidth: "100%",
		minWidth: {
			default: "auto",
			"@media (max-width: 620px)": 0,
		},
		flexDirection: {
			default: "row",
			"@media (max-width: 620px)": "column",
		},
		flexWrap: {
			default: "nowrap",
			"@media (max-width: 620px)": "wrap",
		},
		alignItems: "stretch",
		gap: {
			default: "8px",
			"@media (max-width: 620px)": "12px",
		},
	},
	groupItem: {
		flex: {
			default: "0 1 auto",
			"@media (max-width: 620px)": "1 1 auto",
		},
		width: {
			default: "auto",
			"@media (max-width: 620px)": "100%",
		},
		minWidth: {
			default: "auto",
			"@media (max-width: 620px)": "max-content",
		},
		height: "auto",
		minHeight: {
			default: "40px",
			"@media (max-width: 620px)": "48px",
		},
		paddingInline: {
			default: "16px",
			"@media (max-width: 620px)": "12px",
		},
		paddingBlock: {
			default: 0,
			"@media (max-width: 620px)": "8px",
		},
		textAlign: "center",
		lineHeight: {
			default: "normal",
			"@media (max-width: 620px)": "16px",
		},
		whiteSpace: "nowrap",
	},
	secondary: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		paddingBlock: '0',
		paddingInline: '16px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: lengths.radiusControl,
		color: colors.foreground,
		backgroundColor: {
			default: "transparent",
			"@media (hover: hover)": {
				default: "transparent",
				":hover": colors.hover,
			},
		},
		borderColor: {
			default: colors.borderStrong,
			"@media (hover: hover)": {
				default: colors.borderStrong,
				":hover": colors.borderStrongHover,
			},
		},
		fontWeight: 400,
		transitionProperty: "color, background, border-color",
		transitionDuration: times.fast,
		transitionTimingFunction: "ease-out",
	},
});

function TextLink({ children, href, sx, ...props }: TextLinkProps) {
	return (
		<LocalLink sx={[styles.textLink, sx]} href={href} {...props}>
			{children}
		</LocalLink>
	);
}

export function DownloadButton({ sx }: { sx?: PublicStyle }) {
	return (
		<LocalLink sx={[styles.button, sx]} href={downloadCta.href}>
			{downloadCta.label}
		</LocalLink>
	);
}

export function CtaPair({ primary = downloadCta, secondary, sx }: CtaPairProps) {
	return (
		<div {...stylex.props(baseStyles.element, styles.group, sx)}>
			<LocalLink sx={[styles.button, styles.groupItem]} href={primary.href}>
				{primary.label}
			</LocalLink>
			<TextLink sx={[styles.secondary, styles.groupItem]} href={secondary.href}>
				{secondary.label}
			</TextLink>
		</div>
	);
}
