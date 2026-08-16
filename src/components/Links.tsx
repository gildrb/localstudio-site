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
