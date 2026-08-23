"use client";

import Link from "../shims/next-link";
import { type MouseEvent } from "react";
import type { IconComponent } from "./left-sidebar-nav-model";


export function ProjectsNavPlaceholder() {
  return (
    <div className="px-2 py-1 text-[length:var(--fs-md)] text-(--dim)">Loading projects...</div>
  );
}

export function NavItemMobile({
  href,
  label,
  Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  Icon: IconComponent;
  active: boolean;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      className={`flex h-11 items-center gap-3 rounded-lg px-3 text-[15px] transition-colors ${
        active ? "bg-(--active) font-medium text-(--fg)" : "text-(--fg)/80 active:bg-(--hover)"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.6} />
      <span>{label}</span>
    </Link>
  );
}

export function NavItemDesktop({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: IconComponent;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      title={label}
      className={`group flex h-[var(--sidebar-row-height)] shrink-0 items-center gap-2 rounded-[var(--sidebar-row-radius)] px-2 transition-colors ${
        active ? "bg-(--active) text-(--fg)" : "text-(--fg)/85 hover:bg-(--hover) hover:text-(--fg)"
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${active ? "opacity-90" : "opacity-70"}`}
        strokeWidth={1.6}
      />
      <span className="text-[length:var(--fs-md)] whitespace-nowrap">{label}</span>
    </Link>
  );
}
