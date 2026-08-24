import type { ComponentType } from "react";
import { DocsPage } from "../pages/DocsPage";
import { DownloadPage } from "../pages/DownloadPage";
import { HomePage } from "../pages/HomePage";
import { MachinePage } from "../pages/MachinePage";
import { ProductPage } from "../pages/ProductPage";
import { PromptPage } from "../pages/PromptPage";
import { ResourcesPage } from "../pages/ResourcesPage";
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
	[homePath]: HomePage,
	[productPath]: ProductPage,
	[docsPath]: DocsPage,
	[setupPath]: PromptPage,
	[downloadPath]: DownloadPage,
	[overviewPath]: ResourcesPage,
	[machinePath]: MachinePage,
} as const satisfies Record<RoutePath, ComponentType>;

