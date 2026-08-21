export { isRoutePath, routePaths, type RoutePath } from "./routes";

type NavigationListener = () => void;

const navigationListeners = new Set<NavigationListener>();

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

export function normalizePath(pathname: string) {
	if (pathname !== "/" && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}
	return pathname;
}

export function scrollToHash(hash: string) {
	const anchor = hash.split("=")[0];
	let target: Element | null;
	try {
		target = document.querySelector(anchor);
	} catch {
		return false;
	}
	if (!target) return false;
	target.scrollIntoView({ block: "start", behavior: "instant" });
	const heading = target.matches("h1, h2, h3")
		? target
		: target.querySelector("h1, h2, h3");
	const focusTarget =
		heading instanceof HTMLElement
			? heading
			: target instanceof HTMLElement
				? target
				: null;
	if (focusTarget === null) return true;
	if (!focusTarget.hasAttribute("tabindex")) {
		focusTarget.tabIndex = -1;
	}
	focusTarget.focus({ preventScroll: true });
	return true;
}

