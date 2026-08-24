import type { ComponentType } from "react";
import {
	Activity,
	Boxes,
	Clock,
	ServerCog,
	TrendingUp,
} from "../ui/icon-registry";

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
