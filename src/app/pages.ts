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
import { prefetchRoutePages, routePageLoaders } from "./route-page-loaders";

const DocsPage = lazy(routePageLoaders[docsPath]);
const DownloadPage = lazy(routePageLoaders[downloadPath]);
const ProductPage = lazy(routePageLoaders[productPath]);
const PromptPage = lazy(routePageLoaders[setupPath]);
const ResourcesPage = lazy(routePageLoaders[overviewPath]);

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
  prefetchRoutePages();
  void import("../pages/NotFoundPage");
}
