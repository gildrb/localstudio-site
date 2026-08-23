import type { AnchorHTMLAttributes, ReactNode } from "react";
import { downloadPath } from "../domain/route";
import { site } from "../domain/site";
import { LocalLink } from "./LocalLink";

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode;
	href: string;
}

function TextLink({
	children,
	href,
	className = "",
	...props
}: TextLinkProps) {
	return (
		<LocalLink className={`text-link ${className}`} href={href} {...props}>
			{children}
		</LocalLink>
	);
}
interface Cta {
	href: string;
	label: ReactNode;
}

const downloadCta = {
	href: downloadPath,
	label: "Download for macOS",
} satisfies Cta;

export function DownloadButton() {
	return (
		<LocalLink className="button" href={downloadCta.href}>
			{downloadCta.label}
		</LocalLink>
	);
}

interface CtaPairProps {
	primary?: Cta;
	secondary: Cta;
}

export function CtaPair({ primary = downloadCta, secondary }: CtaPairProps) {
	return (
		<div className="button-group cta-pair">
			<LocalLink className="button" href={primary.href}>
				{primary.label}
			</LocalLink>
			<TextLink href={secondary.href}>{secondary.label}</TextLink>
		</div>
	);
}
export function StoreButtons() {
	return (
		<div className="button-group">
			<LocalLink
				className="button"
				href={site.products.kittyLitter.appStore}
				target="_blank"
				rel="noreferrer"
			>
				Download on App Store
			</LocalLink>
			<TextLink href={site.products.kittyLitter.playStore} target="_blank" rel="noreferrer">
				Download on Google Play
			</TextLink>
		</div>
	);
}
