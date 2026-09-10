import * as v from "valibot";
import { hashAnchor } from "../domain/route";

export {
	hashAnchor,
	isRoutePath,
	normalizePath,
	routePaths,
	type RoutePath,
} from "../domain/route";

type NavigationListener = () => void;

const navigationListeners = new Set<NavigationListener>();
const scrollStateKey = "__localStudioScroll";
const historyStateSchema = v.looseObject({});
const scrollPositionSchema = v.tuple([v.number(), v.number()]);

export function saveScrollPosition() {
	const current: unknown = window.history.state;
	const state = v.safeParse(historyStateSchema, current);
	window.history.replaceState(
		{ ...(state.success ? state.output : {}), [scrollStateKey]: [window.scrollX, window.scrollY] },
		"",
	);
}

export function readScrollPosition() {
	const current: unknown = window.history.state;
	const state = v.safeParse(historyStateSchema, current);
	if (!state.success) return null;
	const saved = v.safeParse(scrollPositionSchema, state.output[scrollStateKey]);
	return saved.success ? { x: saved.output[0], y: saved.output[1] } : null;
}

export function pushNavigation(next: string) {
	saveScrollPosition();
	window.history.pushState({ [scrollStateKey]: [0, 0] }, "", next);
	emitNavigation();
}

export function subscribeToNavigation(listener: NavigationListener) {
	navigationListeners.add(listener);
	return () => {
		navigationListeners.delete(listener);
	};
}

export function emitNavigation() {
	for (const listener of navigationListeners) {
		listener();
	}
}

export function scrollToHash(hash: string) {
	const anchor = hashAnchor(hash);
	let target: Element | null;
	try {
		target = document.querySelector(anchor);
	} catch {
		return false;
	}
	if (!target) return false;
	target.scrollIntoView({ block: "start", behavior: "instant" });
	const heading = target.matches("h1, h2, h3") ? target : target.querySelector("h1, h2, h3");
	const focusTarget =
		heading instanceof HTMLElement ? heading : target instanceof HTMLElement ? target : null;
	if (focusTarget === null) return true;
	if (!focusTarget.hasAttribute("tabindex")) {
		focusTarget.tabIndex = -1;
	}
	focusTarget.focus({ preventScroll: true });
	return true;
}
