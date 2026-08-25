"use client";
import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./left-sidebar-nav.styles.ts";

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
      {...stylex.props(demoStyles.reset, styles.link, active ? styles.active : styles.idle)}
    >
      <Icon
        {...stylex.props(demoStyles.reset, styles.icon, active ? styles.iconActive : styles.iconIdle)}
        strokeWidth={1.6}
      />
      <span {...stylex.props(demoStyles.reset, styles.span29)}>{label}</span>
    </a>
  );
}
