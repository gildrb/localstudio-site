import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { scrollToHash } from "../routing";

interface LocalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode;
	href: string;
}

export function LocalLink({
	children,
	href,
	onClick,
	...props
}: LocalLinkProps) {
	function handleClick(event: MouseEvent<HTMLAnchorElement>) {
		onClick?.(event);
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey ||
			props.target
		) {
			return;
		}

		const target = new URL(href, window.location.href);
		if (target.origin !== window.location.origin) {
			return;
		}

		event.preventDefault();
		const next = `${target.pathname}${target.search}${target.hash}`;
		const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
		if (next !== current) {
			window.history.pushState({}, "", next);
			window.dispatchEvent(new PopStateEvent("popstate"));
		} else if (target.hash) {
			scrollToHash(target.hash);
		} else {
			window.scrollTo({ top: 0 });
		}
	}

	return (
		<a href={href} onClick={handleClick} {...props}>
			{children}
		</a>
	);
}
