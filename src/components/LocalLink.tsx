import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { decideSameOriginNavigation } from "../domain/route";
import { emitNavigation, scrollToHash } from "../app/browser-location";

export function LocalLink({
	children,
	href,
	onClick,
	...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
	children: ReactNode;
	href: string;
}) {
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

		const decision = decideSameOriginNavigation(
			href,
			window.location.origin,
			`${window.location.pathname}${window.location.search}${window.location.hash}`,
		);
		if (decision.kind === "external") return;
		event.preventDefault();
		if (decision.kind === "push") {
			window.history.pushState({}, "", decision.next);
			emitNavigation();
			return;
		}
		if (decision.kind === "hash") {
			scrollToHash(decision.hash);
			return;
		}
		window.scrollTo({ top: 0 });
	}

	return (
		<a href={href} onClick={handleClick} {...props}>
			{children}
		</a>
	);
}
