import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { notFoundTitle, redirectFor, routeTitle } from "../domain/route";
import {
	emitNavigation,
	isRoutePath,
	normalizePath,
	readScrollPosition,
	saveScrollPosition,
	scrollToHash,
	subscribeToNavigation,
} from "./browser-location";

type NavigationSource = "load" | "push" | "pop";

function trackBrowserNavigation(onPush: () => void, onPop: () => void) {
	const previousScrollRestoration = window.history.scrollRestoration;
	window.history.scrollRestoration = "manual";
	let saveFrame = 0;
	function saveCurrentScroll() {
		saveFrame = 0;
		saveScrollPosition();
	}
	function scheduleScrollSave() {
		if (saveFrame === 0) saveFrame = window.requestAnimationFrame(saveCurrentScroll);
	}
	const unsubscribe = subscribeToNavigation(onPush);
	window.addEventListener("scroll", scheduleScrollSave, { passive: true });
	window.addEventListener("popstate", onPop);
	return () => {
		if (saveFrame !== 0) window.cancelAnimationFrame(saveFrame);
		saveScrollPosition();
		window.history.scrollRestoration = previousScrollRestoration;
		unsubscribe();
		window.removeEventListener("scroll", scheduleScrollSave);
		window.removeEventListener("popstate", onPop);
	};
}

function restoreNavigationScroll(
	source: NavigationSource,
	savedPosition: Readonly<ReturnType<typeof readScrollPosition>>,
) {
	if (savedPosition !== null && source !== "push") {
		const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
		if (maxScroll + 1 < savedPosition.y) return false;
		window.scrollTo({ left: savedPosition.x, top: savedPosition.y, behavior: "instant" });
		return true;
	}
	if (source !== "push") return true;
	window.scrollTo({ top: 0, behavior: "instant" });
	const heading = document.querySelector("main h1, [data-page-focus]");
	if (!(heading instanceof HTMLElement)) return false;
	heading.focus({ preventScroll: true });
	return true;
}

function useNavigationRedirect(location: string) {
	const pathname = normalizePath(location.split("#")[0] ?? "");
	const redirect = redirectFor(pathname);
	useEffect(() => {
		if (redirect === null || redirect.length === 0) return;
		window.history.replaceState(window.history.state, "", redirect);
		emitNavigation();
	}, [redirect]);
}

export function useBrowserNavigation() {
	const [location, setLocation] = useState(
		() => `${window.location.pathname}${window.location.hash}`,
	);
	const source = useRef<NavigationSource>("load");
	const pendingScroll = useRef(readScrollPosition());
	useNavigationRedirect(location);
	useEffect(() => {
		function updateLocation(nextSource: NavigationSource) {
			source.current = nextSource;
			startTransition(() => {
				setLocation(`${window.location.pathname}${window.location.hash}`);
			});
		}
		function handlePush() {
			pendingScroll.current = null;
			updateLocation("push");
		}
		function handlePop() {
			pendingScroll.current = readScrollPosition();
			updateLocation("pop");
		}
		return trackBrowserNavigation(handlePush, handlePop);
	}, []);
	const restoreScroll = useCallback(() => {
		const finished = restoreNavigationScroll(source.current, pendingScroll.current);
		if (finished && pendingScroll.current !== null && source.current !== "push") {
			pendingScroll.current = null;
		}
		return finished;
	}, []);
	return [location, restoreScroll] as const;
}

function observeNavigationCompletion(finishNavigation: () => boolean) {
	let timeout = 0;
	let observer: MutationObserver | undefined;
	const stopWaiting = () => {
		observer?.disconnect();
		window.clearTimeout(timeout);
	};
	const frame = window.requestAnimationFrame(() => {
		if (finishNavigation()) return;
		observer = new MutationObserver(() => {
			if (finishNavigation()) stopWaiting();
		});
		observer.observe(document.body, { childList: true, subtree: true });
		timeout = window.setTimeout(stopWaiting, 3000);
	});
	return () => {
		window.cancelAnimationFrame(frame);
		stopWaiting();
	};
}

export function useNavigationScroll(
	location: string,
	pathname: string,
	restoreScroll: () => boolean,
) {
	useEffect(() => {
		document.title = isRoutePath(pathname) ? routeTitle(pathname) : notFoundTitle();
		// Redirects run before scroll completion, so use their destination just as the live URL does.
		const destination = new URL(redirectFor(pathname) ?? location, window.location.origin);
		const hash = destination.hash;
		return observeNavigationCompletion(() =>
			hash.length > 0 ? scrollToHash(hash) : restoreScroll(),
		);
	}, [location, pathname, restoreScroll]);
}
