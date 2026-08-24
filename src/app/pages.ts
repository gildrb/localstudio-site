import { lazy, type ComponentType } from "react";
import { HomePage } from "../pages/HomePage";
import { MachinePage } from "../pages/MachinePage";
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

const DocsPage = lazy(() =>
	import("../pages/DocsPage").then(({ DocsPage }) => ({ default: DocsPage })),
);
const DownloadPage = lazy(() =>
	import("../pages/DownloadPage").then(({ DownloadPage }) => ({ default: DownloadPage })),
);
const ProductPage = lazy(() =>
	import("../pages/ProductPage").then(({ ProductPage }) => ({ default: ProductPage })),
);
const PromptPage = lazy(() =>
	import("../pages/PromptPage").then(({ PromptPage }) => ({ default: PromptPage })),
);
const ResourcesPage = lazy(() =>
	import("../pages/ResourcesPage").then(({ ResourcesPage }) => ({ default: ResourcesPage })),
);

export const pages = {
	[homePath]: HomePage,
	[productPath]: ProductPage,
	[docsPath]: DocsPage,
	[setupPath]: PromptPage,
	[downloadPath]: DownloadPage,
	[overviewPath]: ResourcesPage,
	[machinePath]: MachinePage,
} as const satisfies Record<RoutePath, ComponentType>;

export function prefetchPages() {
	void import("../pages/DocsPage");
	void import("../pages/DownloadPage");
	void import("../pages/NotFoundPage");
	void import("../pages/ProductPage");
	void import("../pages/PromptPage");
	void import("../pages/ResourcesPage");
}
