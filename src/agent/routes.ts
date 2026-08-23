import { routes, routePaths, type RoutePath } from "../domain/route.ts";

export type HtmlRoutePath = RoutePath;
export type HtmlRoute = {
	path: HtmlRoutePath;
	title: string;
	summary: string;
	priority: string;
};

export const LASTMOD = "2026-08-17";

export const HTML_ROUTES: readonly HtmlRoute[] = routePaths.map((path) => ({
	path,
	title: routes[path].title,
	summary: routes[path].summary,
	priority: routes[path].priority.toFixed(1),
}));
