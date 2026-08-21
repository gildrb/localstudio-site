import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(listener: () => void) {
	const media = window.matchMedia(REDUCED_MOTION_QUERY);
	media.addEventListener("change", listener);
	return () => media.removeEventListener("change", listener);
}

function getSnapshot() {
	return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function useReducedMotion() {
	return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
