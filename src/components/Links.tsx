import type { AnchorHTMLAttributes, ReactNode } from "react";
import { downloadPath } from "../domain/route";
import { LocalLink } from "./LocalLink";

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode;
	href: string;
}

export function TextLink({
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
const appStoreHref =
	"https://apps.apple.com/us/app/kittylitter/id6759521788";
const playStoreHref =
	"https://play.google.com/store/apps/details?id=com.sigkitten.litter.android";

export function StoreButtons() {
	return (
		<div className="button-group">
			<LocalLink
				className="button"
				href={appStoreHref}
				target="_blank"
				rel="noreferrer"
			>
				Download on App Store
			</LocalLink>
			<TextLink href={playStoreHref} target="_blank" rel="noreferrer">
				Download on Google Play
			</TextLink>
		</div>
	);
}
