import type { ComponentType } from "react";
import {
	Activity,
	Boxes,
	Clock,
	ServerCog,
	TrendingUp,
} from "../../ui/icon-registry";

export type IconComponent = ComponentType<{
	className?: string;
	strokeWidth?: number;
}>;

export const tabs = [
	{ href: "/", label: "Status", icon: Activity },
	{ href: "/models", label: "Models", icon: Boxes },
	{ href: "/agent/automations", label: "Automations", icon: Clock },
	{ href: "/configure", label: "Configure", icon: ServerCog },
	{ href: "/usage", label: "Usage", icon: TrendingUp },
];

export function mobilePageTitle(pathname: string): string {
	if (pathname.startsWith("/agent/automations")) return "Automations";
	if (pathname.startsWith("/agent")) return "Tasks";
	if (pathname.startsWith("/logs")) return "Logs";
	const tab = tabs.find((entry) => isRouteActive(pathname, entry.href));
	return tab?.label ?? "Local Studio";
}

export function isRouteActive(pathname: string, href: string): boolean {
	if (href === "/") return pathname === "/";
	if (href === "/agent") {
		return (
			pathname.startsWith("/agent") &&
			!pathname.startsWith("/agent/automations")
		);
	}
	if (href === "/settings") return pathname.startsWith("/settings");
	return pathname.startsWith(href);
}

export function routeHidesAppSidebar(pathname: string): boolean {
	return pathname.startsWith("/setup") || pathname.startsWith("/quick");
}
