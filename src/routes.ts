export const routePaths = [
	"/",
	"/product",
	"/mobile",
	"/docs",
	"/setup",
	"/agents",
	"/download",
	"/overview",
	"/machine",
] as const;

export type RoutePath = (typeof routePaths)[number];

export function isRoutePath(pathname: string): pathname is RoutePath {
	return routePaths.some((route) => route === pathname);
}
