import type { AnchorHTMLAttributes, ReactNode } from "react";
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

export function DownloadButton() {
	return (
		<LocalLink className="button" href="/download/macos">
			Download for macOS
		</LocalLink>
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
