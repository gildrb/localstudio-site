import type { ComponentType } from "react";
import {
  docsPath,
  downloadPath,
  normalizePath,
  overviewPath,
  productPath,
  setupPath,
} from "../domain/route";

type PageModule = Promise<{ default: ComponentType }>;
type PageLoader = () => PageModule;

export const routePageLoaders = {
  [docsPath]: () =>
    import("../pages/DocsPage").then(({ DocsPage }) => ({ default: DocsPage })),
  [downloadPath]: () =>
    import("../pages/DownloadPage").then(({ DownloadPage }) => ({
      default: DownloadPage,
    })),
  [productPath]: () =>
    import("../pages/ProductPage").then(({ ProductPage }) => ({
      default: ProductPage,
    })),
  [setupPath]: () =>
    import("../pages/PromptPage").then(({ PromptPage }) => ({
      default: PromptPage,
    })),
  [overviewPath]: () =>
    import("../pages/ResourcesPage").then(({ ResourcesPage }) => ({
      default: ResourcesPage,
    })),
} as const satisfies Partial<Record<string, PageLoader>>;

export function prefetchRoutePage(href: string) {
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return;
  const pathname = normalizePath(url.pathname);
  const load = Object.entries(routePageLoaders).find(
    ([path]) => path === pathname,
  )?.[1];
  if (load) void load().catch(() => {});
}

export function prefetchRoutePages() {
  for (const load of Object.values(routePageLoaders))
    void load().catch(() => {});
}
