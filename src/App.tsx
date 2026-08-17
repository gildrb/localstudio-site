import { useEffect, useRef, useState } from "react";
import { AgentsPage } from "./pages/AgentsPage";
import { DocsPage } from "./pages/DocsPage";
import { DownloadPage } from "./pages/DownloadPage";
import { HomePage } from "./pages/HomePage";
import { MachinePage } from "./pages/MachinePage";
import { MobilePage } from "./pages/MobilePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductPage } from "./pages/ProductPage";
import { PromptPage } from "./pages/PromptPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { MachineContext } from "./machine";
import {
	emitNavigation,
	isRoutePath,
	normalizePath,
	type RoutePath,
	scrollToHash,
	subscribeToNavigation,
} from "./routing";

const titles = {
	"/": "Local intelligence. - Local Studio",
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

	const machine = {
		machineMode,
		toggleMachine: (next: boolean) => {
			window.history.pushState({}, "", next ? "/machine" : "/");
			emitNavigation();
		},
	};

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
		if (hash) {
			window.requestAnimationFrame(() => scrollToHash(hash));
		} else if (navigationSource.current === "push") {
			window.scrollTo({ top: 0 });
			const heading = document.querySelector("main h1, .machine");
			if (heading instanceof HTMLElement) {
				heading.focus({ preventScroll: true });
			}
		}
	}, [location, pathname]);

	return (
		<MachineContext.Provider value={machine}>
			{routeFor(pathname)}
		</MachineContext.Provider>
	);
}
