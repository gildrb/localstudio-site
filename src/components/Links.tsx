import type { AnchorHTMLAttributes, ReactNode } from "react";
import { DownloadIcon } from "./DownloadIcon";

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode;
	arrow?: "up" | "right";
}

export function TextLink({
	children,
	arrow = "up",
	className = "",
	...props
}: TextLinkProps) {
	return (
		<a className={`text-link ${className}`} {...props}>
			{children}
			<span aria-hidden="true">{arrow === "right" ? "→" : "↗"}</span>
		</a>
	);
}

interface DownloadButtonProps {
	iconSize?: number;
}

export function DownloadButton({ iconSize = 18 }: DownloadButtonProps) {
	return (
		<a className="button" href="https://localstudio.ai/download/macos">
			<DownloadIcon size={iconSize} />
			Download for macOS
		</a>
	);
}
