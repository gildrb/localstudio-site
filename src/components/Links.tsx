import type { AnchorHTMLAttributes, ReactNode } from "react";
import { DownloadIcon } from "./DownloadIcon";
import { LocalLink } from "./LocalLink";

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode;
	href: string;
	arrow?: "up" | "right";
}

export function TextLink({
	children,
	href,
	arrow = "right",
	className = "",
	...props
}: TextLinkProps) {
	return (
		<LocalLink className={`text-link ${className}`} href={href} {...props}>
			{children}
			<span aria-hidden="true">{arrow === "right" ? "→" : "↗"}</span>
		</LocalLink>
	);
}

interface DownloadButtonProps {
	iconSize?: number;
}

export function DownloadButton({ iconSize = 18 }: DownloadButtonProps) {
	return (
		<LocalLink className="button" href="/download/macos">
			<DownloadIcon size={iconSize} />
			Download for macOS
		</LocalLink>
	);
}
