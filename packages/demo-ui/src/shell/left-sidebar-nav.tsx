"use client";

import type { IconComponent } from "./left-sidebar-nav-model";


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
    <a
      href={href}
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
    </a>
  );
}
