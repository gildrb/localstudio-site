import { Activity, Boxes, Clock, ServerCog, TrendingUp } from "../ui/icon-registry";
import type { ReactNode } from "react";

// Any component rendering an SVG icon; styled through className and stroke width.
export type IconComponent = (props: {
	className?: string | undefined;
	strokeWidth?: number | undefined;
}) => ReactNode;

export const tabs = [
	{ href: "/", label: "Status", icon: Activity },
	{ href: "/models", label: "Models", icon: Boxes },
	{ href: "/agent/automations", label: "Automations", icon: Clock },
	{ href: "/configure", label: "Configure", icon: ServerCog },
	{ href: "/usage", label: "Usage", icon: TrendingUp },
];

export function isRouteActive(pathname: string, href: string): boolean {
	if (href === "/") return pathname === "/";
	if (href === "/agent") {
		return pathname.startsWith("/agent") && !pathname.startsWith("/agent/automations");
	}
	if (href === "/settings") return pathname.startsWith("/settings");
	return pathname.startsWith(href);
}
