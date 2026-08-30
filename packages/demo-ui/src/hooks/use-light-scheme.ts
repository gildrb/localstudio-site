import { useSyncExternalStore } from "react";

const query = "(prefers-color-scheme: light)";

function subscribe(change: () => void) {
	const media = window.matchMedia(query);
	media.addEventListener("change", change);
	return () => media.removeEventListener("change", change);
}

export function useLightScheme() {
	return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
