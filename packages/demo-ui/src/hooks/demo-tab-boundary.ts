import { useEffect, type RefObject } from "react";

const FOCUSABLE =
	'a[href], area[href], button, input, select, textarea, summary, audio[controls], video[controls], [contenteditable="true"], [tabindex]';

function removeTabStops(root: HTMLElement) {
	for (const element of root.querySelectorAll(FOCUSABLE)) {
		if (element instanceof HTMLElement && element.tabIndex !== -1) {
			element.tabIndex = -1;
		}
	}
}

export function useDemoTabBoundary(ref: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const root = ref.current;
		if (!root) return;
		removeTabStops(root);
		const blockInternalNavigation = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			const anchor = target.closest("a");
			if (!anchor || !root.contains(anchor)) return;
			const href = anchor.getAttribute("href");
			if (!href || href.startsWith("/") || href.startsWith("#")) {
				event.preventDefault();
			}
		};
		root.addEventListener("click", blockInternalNavigation, true);
		const observer = new MutationObserver(() => removeTabStops(root));
		observer.observe(root, { childList: true, subtree: true });
		return () => {
			root.removeEventListener("click", blockInternalNavigation, true);
			observer.disconnect();
		};
	}, [ref]);
}
