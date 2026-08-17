export const routePaths = [
	"/",
	"/product",
	"/mobile",
	"/docs",
	"/prompt",
	"/agents",
	"/download/macos",
	"/resources",
	"/machine",
] as const;

export type RoutePath = (typeof routePaths)[number];

export function isRoutePath(pathname: string): pathname is RoutePath {
	return routePaths.some((route) => route === pathname);
}
