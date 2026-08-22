export const routePaths = [
	"/",
	"/product",
	"/docs",
	"/setup",
	"/download",
	"/overview",
	"/machine",
] as const;

export type RoutePath = (typeof routePaths)[number];

export function isRoutePath(pathname: string): pathname is RoutePath {
	return routePaths.some((route) => route === pathname);
}
