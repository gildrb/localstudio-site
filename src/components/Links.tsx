import type { AnchorHTMLAttributes, ReactNode } from "react";
import { downloadLabel, downloadPath } from "../domain/route";
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
	label: downloadLabel(),
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
