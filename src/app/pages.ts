import { lazy } from "react";
import {
	docsPath,
	downloadPath,
	homePath,
	machinePath,
	overviewPath,
	productPath,
	setupPath,
	type RoutePath,
} from "../domain/route";

export const pages = {
	[homePath]: lazy(() =>
		import("../pages/HomePage").then(({ HomePage }) => ({ default: HomePage })),
	),
	[productPath]: lazy(() =>
		import("../pages/ProductPage").then(({ ProductPage }) => ({ default: ProductPage })),
	),
	[docsPath]: lazy(() =>
		import("../pages/DocsPage").then(({ DocsPage }) => ({ default: DocsPage })),
	),
	[setupPath]: lazy(() =>
		import("../pages/PromptPage").then(({ PromptPage }) => ({ default: PromptPage })),
	),
	[downloadPath]: lazy(() =>
		import("../pages/DownloadPage").then(({ DownloadPage }) => ({ default: DownloadPage })),
	),
	[overviewPath]: lazy(() =>
		import("../pages/ResourcesPage").then(({ ResourcesPage }) => ({ default: ResourcesPage })),
	),
	[machinePath]: lazy(() =>
		import("../pages/MachinePage").then(({ MachinePage }) => ({ default: MachinePage })),
	),
} as const satisfies Record<RoutePath, ReturnType<typeof lazy>>;

