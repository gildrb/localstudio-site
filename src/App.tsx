import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HomePage } from "./pages/HomePage";
import { MachineContext } from "./machine";
import {
	emitNavigation,
	isRoutePath,
	normalizePath,
	type RoutePath,
	scrollToHash,
	subscribeToNavigation,
} from "./routing";

const AgentsPage = lazy(() =>
	import("./pages/AgentsPage").then(({ AgentsPage }) => ({ default: AgentsPage })),
);
const DocsPage = lazy(() =>
	import("./pages/DocsPage").then(({ DocsPage }) => ({ default: DocsPage })),
);
const DownloadPage = lazy(() =>
	import("./pages/DownloadPage").then(({ DownloadPage }) => ({ default: DownloadPage })),
);
const MachinePage = lazy(() =>
	import("./pages/MachinePage").then(({ MachinePage }) => ({ default: MachinePage })),
);
const MobilePage = lazy(() =>
	import("./pages/MobilePage").then(({ MobilePage }) => ({ default: MobilePage })),
);
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

const titles = {
	"/": "Intelligence should not be rented - Local Studio",
	"/product": "Product - Local Studio",
	"/mobile": "Mobile - Local Studio",
	"/docs": "Docs - Local Studio",
	"/prompt": "Setup Prompt - Local Studio",
	"/agents": "Agents - Local Studio",
	"/download/macos": "Download - Local Studio",
	"/resources": "Resources - Local Studio",
	"/machine": "Machines - Local Studio",
} as const satisfies Record<RoutePath, string>;

type NavigationSource = "load" | "push" | "pop";

function routeFor(pathname: string) {
	if (pathname === "/machine") return <MachinePage />;
	if (!isRoutePath(pathname)) return <NotFoundPage />;
	if (pathname === "/product") return <ProductPage />;
	if (pathname === "/mobile") return <MobilePage />;
	if (pathname === "/docs") return <DocsPage />;
	if (pathname === "/prompt") return <PromptPage />;
	if (pathname === "/agents") return <AgentsPage />;
	if (pathname === "/download/macos") return <DownloadPage />;
	if (pathname === "/resources") return <ResourcesPage />;
	return <HomePage />;
}

export default function App() {
	const [location, setLocation] = useState(
		() => `${window.location.pathname}${window.location.hash}`,
	);
	const navigationSource = useRef<NavigationSource>("load");
	const pathname = normalizePath(location.split("#")[0]);
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
		function updateLocation(source: NavigationSource) {
			navigationSource.current = source;
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
			? titles[pathname]
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
			window.scrollTo({ top: 0 });
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
