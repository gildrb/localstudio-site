export type RoutePath =
	| "/"
	| "/product"
	| "/mobile"
	| "/docs"
	| "/prompt"
	| "/agents"
	| "/download/macos";

const routes = new Set<RoutePath>([
	"/",
	"/product",
	"/mobile",
	"/docs",
	"/prompt",
	"/agents",
	"/download/macos",
]);

export function normalizePath(pathname: string) {
	if (pathname !== "/" && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}
	return pathname;
}

export function scrollToHash(hash: string) {
	let target: Element | null;
	try {
		target = document.querySelector(hash);
	} catch {
		return;
	}
	target?.scrollIntoView();
}

export function isRoutePath(pathname: string): pathname is RoutePath {
	return routes.has(pathname as RoutePath);
}
