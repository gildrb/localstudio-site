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
const scrollState = v.object({
	[scrollStateKey]: v.tuple([v.number(), v.number()]),
});
const historyRecord = v.record(v.string(), v.unknown());

export function saveScrollPosition() {
	const previousState: unknown = window.history.state;
	const previous = v.safeParse(historyRecord, previousState);
	window.history.replaceState(
		{
			...(previous.success ? previous.output : null),
			[scrollStateKey]: [window.scrollX, window.scrollY],
		},
		"",
	);
}

export function readScrollPosition() {
	const state: unknown = window.history.state;
	const result = v.safeParse(scrollState, state);
	if (!result.success) return null;
	const [x, y] = result.output[scrollStateKey];
	return { x, y };
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
