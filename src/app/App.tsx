import { Suspense } from "react";
import { useSkySelection } from "../hooks/use-sky-selection";
import { pages } from "./pages";
import { NotFoundPage } from "../pages/NotFoundPage";
import { isRoutePath, normalizePath } from "./browser-location";
import { useBrowserNavigation, useNavigationScroll } from "./navigation-effects";

export default function App() {
	useSkySelection();
	const [location, restoreScroll] = useBrowserNavigation();
	const pathname = normalizePath(location.split("#")[0] ?? "");
	const Page = isRoutePath(pathname) ? pages[pathname] : null;
	useNavigationScroll(location, pathname, restoreScroll);
	if (Page === null) return <NotFoundPage />;
	return (
		<Suspense fallback={null}>
			<Page />
		</Suspense>
	);
}
