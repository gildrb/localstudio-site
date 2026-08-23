import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSkySelection } from "./hooks/use-sky-selection";
import { HomePage } from "./pages/HomePage";
import { MachinePage } from "./pages/MachinePage";
import { MachineContext } from "./app/machine-mode";
import { redirectFor, routeTitle } from "./domain/route";
import {
	emitNavigation,
	isRoutePath,
	normalizePath,
	scrollToHash,
	subscribeToNavigation,
} from "./app/browser-location";

const DocsPage = lazy(() =>
	import("./pages/DocsPage").then(({ DocsPage }) => ({ default: DocsPage })),
);
const DownloadPage = lazy(() =>
	import("./pages/DownloadPage").then(({ DownloadPage }) => ({ default: DownloadPage })),
);
const prefetchRoutes = () => {
	void import("./pages/DocsPage");
	void import("./pages/DownloadPage");
	void import("./pages/NotFoundPage");
	void import("./pages/ProductPage");
	void import("./pages/PromptPage");
	void import("./pages/ResourcesPage");
};
const NotFoundPage = lazy(() =>
	import("./pages/NotFoundPage").then(({ NotFoundPage }) => ({ default: NotFoundPage })),
);
const ProductPage = lazy(() =>
	import("./pages/ProductPage").then(({ ProductPage }) => ({ default: ProductPage })),
);
const PromptPage = lazy(() =>
	import("./pages/PromptPage").then(({ PromptPage }) => ({ default: PromptPage })),
);
const ResourcesPage = lazy(() =>
	import("./pages/ResourcesPage").then(({ ResourcesPage }) => ({ default: ResourcesPage })),
);

type NavigationSource = "load" | "push" | "pop";

function routeFor(pathname: string) {
	if (pathname === "/machine") return <MachinePage />;
	if (!isRoutePath(pathname)) return <NotFoundPage />;
	if (pathname === "/product") return <ProductPage />;
	if (pathname === "/docs") return <DocsPage />;
	if (pathname === "/setup") return <PromptPage />;
	if (pathname === "/download") return <DownloadPage />;
	if (pathname === "/overview") return <ResourcesPage />;
	return <HomePage />;
}

export default function App() {
	useSkySelection();
	useEffect(() => {
		const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
		const cancel = window.cancelIdleCallback ?? ((id: number) => window.clearTimeout(id));
		const id = idle(prefetchRoutes);
		return () => cancel(id);
	}, []);
	const [location, setLocation] = useState(
		() => `${window.location.pathname}${window.location.hash}`,
	);
	const navigationSource = useRef<NavigationSource>("load");
	const pathname = normalizePath(location.split("#")[0] ?? "");
	const redirect = redirectFor(pathname);
	const machineMode = pathname === "/machine";

	const toggleMachine = useCallback((next: boolean) => {
		window.history.pushState({}, "", next ? "/machine" : "/");
		emitNavigation();
	}, []);
	const machine = useMemo(
		() => ({ machineMode, toggleMachine }),
		[machineMode, toggleMachine],
	);

	useEffect(() => {
		if (!redirect) return;
		window.history.replaceState({}, "", redirect);
		emitNavigation();
	}, [redirect]);

	useEffect(() => {
		function updateLocation(source: NavigationSource) {
			navigationSource.current = source;
			if (source === "push" && !window.location.hash) {
				window.scrollTo({ top: 0, behavior: "instant" });
			}
			setLocation(`${window.location.pathname}${window.location.hash}`);
		}
		function handlePopState() {
			updateLocation("pop");
		}
		const unsubscribe = subscribeToNavigation(() => updateLocation("push"));
		window.addEventListener("popstate", handlePopState);
		return () => {
			unsubscribe();
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);

	useEffect(() => {
		document.title = isRoutePath(pathname)
			? routeTitle(pathname)
			: "Page not found - Local Studio";
		const hash = window.location.hash;
		let frame = 0;
		let timeout = 0;
		let observer: MutationObserver | undefined;

		const stopWaiting = () => {
			observer?.disconnect();
			window.clearTimeout(timeout);
		};
		const finishNavigation = () => {
			if (hash) return scrollToHash(hash);
			if (navigationSource.current !== "push") return true;
			const heading = document.querySelector("main h1, .machine");
			if (!(heading instanceof HTMLElement)) return false;
			heading.focus({ preventScroll: true });
			return true;
		};

		frame = window.requestAnimationFrame(() => {
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
	}, [location, pathname]);

	return (
		<MachineContext.Provider value={machine}>
			<Suspense fallback={<div className="route-pending" aria-hidden="true" />}>
				{routeFor(pathname)}
			</Suspense>
		</MachineContext.Provider>
	);
}
