import { site } from "./site.ts";

function brandedTitle(label: string): string {
	return `${label} - ${site.products.localStudio.name}`;
}

export const routes = {
	"/": {
		title: brandedTitle("Intelligence should be owned"),
		heading: "Intelligence should be owned",
		summary: "Homepage: Local Studio + KittyLitter product surface.",
		markdown: "/index.md",
		footerLabel: null,
		priority: 1,
		machineLabel: "home",
	},
	"/product": {
		title: brandedTitle("Product"),
		heading: "One place to run local AI",
		summary: "Control, serve, and work: controller, runtimes, Workbench.",
		markdown: "/product.md",
		footerLabel: null,
		priority: 0.9,
		machineLabel: "product",
	},
	"/docs": {
		title: brandedTitle("Documentation"),
		heading: "Get Local Studio running",
		summary: "Install, runtimes, agent runtime, remote/LAN, validation.",
		markdown: "/docs.md",
		footerLabel: "Docs",
		priority: 0.8,
		machineLabel: "docs",
	},
	"/setup": {
		title: brandedTitle("Setup"),
		heading: "Give this to any coding model",
		summary: "Portable setup prompt for a coding model on the target machine.",
		markdown: "/setup.md",
		footerLabel: "Setup",
		priority: 0.7,
		machineLabel: "setup",
	},
	"/download": {
		title: brandedTitle("Download for macOS"),
		heading: "Download for macOS",
		summary: "Signed Apple Silicon DMG from GitHub Releases.",
		markdown: "/download.md",
		footerLabel: "Download",
		priority: 0.8,
		machineLabel: "download",
	},
	"/overview": {
		title: brandedTitle("Overview"),
		heading: "Everything around Local Studio",
		summary: "Docs, setup, download, KittyLitter, GitHub, brand.",
		markdown: "/overview.md",
		footerLabel: "Overview",
		priority: 0.6,
		machineLabel: "overview",
	},
	"/machine": {
		title: brandedTitle("Machines"),
		heading: "Machines",
		summary:
			"Dense machine-readable index of company, products, and discovery.",
		markdown: "/machine.md",
		footerLabel: "Machines",
		priority: 0.9,
		machineLabel: "machine",
	},
} as const;

export type RoutePath = keyof typeof routes;
export type RouteSpec = (typeof routes)[RoutePath];

export const routePaths = [
	"/",
	"/product",
	"/docs",
	"/setup",
	"/download",
	"/overview",
	"/machine",
] as const satisfies readonly RoutePath[];

export function isRoutePath(pathname: string): pathname is RoutePath {
	return Object.hasOwn(routes, pathname);
}

export function isMachineRoute(pathname: string): pathname is "/machine" {
	return pathname === "/machine";
}

export const homePath = "/" satisfies RoutePath;
export const productPath = "/product" satisfies RoutePath;
export const machinePath = "/machine" satisfies RoutePath;
export const downloadPath = "/download" satisfies RoutePath;
export const setupPath = "/setup" satisfies RoutePath;
export const docsPath = "/docs" satisfies RoutePath;
export const overviewPath = "/overview" satisfies RoutePath;
export function isHeroImageRoute(pathname: string): boolean {
	return pathname === "/product";
}

export function routeTitle(path: RoutePath): string {
	return routes[path].title;
}

export function markdownPathFor(pathname: string): string {
	if (pathname === "/") return routes["/"].markdown;
	if (isRoutePath(pathname)) return routes[pathname].markdown;
	return pathname;
}

export const documents = {
	"/mobile.md": "markdown-only",
	"/agents.md": "markdown-only",
	"/services.md": "markdown-only",
	"/people.md": "markdown-only",
	"/showcase.md": "markdown-only",
	"/faq.md": "markdown-only",
} as const;

export const redirects = {
	"/mobile": "/#mobile",
	"/agents": "/setup",
} as const;

export type RedirectPath = keyof typeof redirects;

export function redirectFor(pathname: string): string | null {
	if (pathname === "/mobile" || pathname === "/agents") {
		return redirects[pathname];
	}
	return null;
}

export function footerRoutes(): readonly { path: RoutePath; label: string }[] {
	return (
		[
			["/machine", routes["/machine"].footerLabel],
			["/overview", routes["/overview"].footerLabel],
			["/docs", routes["/docs"].footerLabel],
			["/setup", routes["/setup"].footerLabel],
			["/download", routes["/download"].footerLabel],
		] as const
	).flatMap(([path, label]) => (label ? [{ path, label }] : []));
}

export function resourceNav(): readonly { href: RoutePath; label: string }[] {
	return [
		{ href: overviewPath, label: "Overview" },
		{ href: docsPath, label: "Documentation" },
		{ href: setupPath, label: "Setup" },
	];
}

export type ProductNavItem = {
	readonly label: string;
	readonly href: string;
	readonly external?: true;
};

export function productNav(): readonly ProductNavItem[] {
	return [
		{ label: site.products.localAi.name, href: site.products.localAi.url, external: true },
		{ label: site.products.localStudio.name, href: downloadPath },
		{ label: site.products.kittyLitter.name, href: site.products.kittyLitter.url, external: true },
	];
}

export function notFoundSuggestions(): readonly {
	href: RoutePath;
	label: string;
}[] {
	return [
		{ href: "/", label: "Overview" },
		{ href: "/product", label: "Product" },
		{ href: "/docs", label: "Docs" },
		{ href: "/setup", label: "Setup prompt" },
		{ href: "/download", label: "Download" },
	];
}

export function htmlMatcher(): readonly string[] {
	return routePaths;
}

export function markdownPages(): ReadonlyMap<string, string> {
	const entries: [string, string][] = routePaths.map((path) => [
		path,
		routes[path].markdown,
	]);
	for (const path of Object.keys(documents)) {
		entries.push([path.replace(/\.md$/, ""), path]);
	}
	return new Map(entries);
}

export function normalizePath(pathname: string): string {
	if (pathname !== "/" && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}
	return pathname;
}

export type LinkDecision =
	| { readonly kind: "external" }
	| { readonly kind: "push"; readonly next: string }
	| { readonly kind: "hash"; readonly hash: string }
	| { readonly kind: "top" };

export function decideSameOriginNavigation(
	href: string,
	currentOrigin: string,
	currentPath: string,
): LinkDecision {
	let target: URL;
	try {
		target = new URL(href, currentOrigin + currentPath);
	} catch {
		return { kind: "external" };
	}
	const current = new URL(currentPath, currentOrigin);
	if (target.origin !== current.origin) return { kind: "external" };
	const next = `${target.pathname}${target.search}${target.hash}`;
	const here = `${current.pathname}${current.search}${current.hash}`;
	if (next !== here) return { kind: "push", next };
	if (target.hash) return { kind: "hash", hash: target.hash };
	return { kind: "top" };
}

export function hashAnchor(hash: string): string {
	return hash.split("=")[0] ?? hash;
}

export function downloadLabel(): string {
	return routes[downloadPath].heading;
}

export function notFoundTitle(): string {
	return brandedTitle("Page not found");
}
