import { useEffect, useState } from "react";
import { AgentsPage } from "./pages/AgentsPage";
import { DocsPage } from "./pages/DocsPage";
import { DownloadPage } from "./pages/DownloadPage";
import { HomePage } from "./pages/HomePage";
import { MobilePage } from "./pages/MobilePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductPage } from "./pages/ProductPage";
import { PromptPage } from "./pages/PromptPage";
import { isRoutePath, normalizePath, scrollToHash } from "./routing";

const titles = {
	"/": "Local Studio",
	"/product": "Product — Local Studio",
	"/mobile": "Mobile — Local Studio",
	"/docs": "Docs — Local Studio",
	"/prompt": "Setup Prompt — Local Studio",
	"/agents": "Agents — Local Studio",
	"/download/macos": "Download — Local Studio",
};

export default function App() {
	const [location, setLocation] = useState(
		() => `${window.location.pathname}${window.location.hash}`,
	);
	const pathname = normalizePath(location.split("#")[0]);

	useEffect(() => {
		function updateLocation() {
			setLocation(`${window.location.pathname}${window.location.hash}`);
		}
		window.addEventListener("popstate", updateLocation);
		return () => window.removeEventListener("popstate", updateLocation);
	}, []);

	useEffect(() => {
		document.title = isRoutePath(pathname)
			? titles[pathname]
			: "Page not found — Local Studio";
		const hash = window.location.hash;
		if (hash) {
			window.requestAnimationFrame(() => scrollToHash(hash));
		} else {
			window.scrollTo({ top: 0 });
		}
	}, [location, pathname]);

	if (!isRoutePath(pathname)) return <NotFoundPage />;
	if (pathname === "/product") return <ProductPage />;
	if (pathname === "/mobile") return <MobilePage />;
	if (pathname === "/docs") return <DocsPage />;
	if (pathname === "/prompt") return <PromptPage />;
	if (pathname === "/agents") return <AgentsPage />;
	if (pathname === "/download/macos") return <DownloadPage />;
	return <HomePage />;
}
