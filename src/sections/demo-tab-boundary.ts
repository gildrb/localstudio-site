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
		const observer = new MutationObserver(() => removeTabStops(root));
		observer.observe(root, { childList: true, subtree: true });
		return () => observer.disconnect();
	}, [ref]);
}
