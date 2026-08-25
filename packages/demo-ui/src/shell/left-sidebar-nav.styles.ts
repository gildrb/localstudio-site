import * as stylex from "@stylexjs/stylex";
import { constants, tokens } from "../styles/tokens.stylex.ts";

export const styles = stylex.create({
  span29: {
    fontSize: constants.fsMd,
    whiteSpace: "nowrap",
  },
  link: {
    display: "flex",
    height: constants.sidebarRowHeight,
    flexShrink: 0,
    alignItems: "center",
    rowGap: "calc(0.25rem * 2)",
    columnGap: "calc(0.25rem * 2)",
    borderTopLeftRadius: constants.sidebarRowRadius,
    borderTopRightRadius: constants.sidebarRowRadius,
    borderBottomRightRadius: constants.sidebarRowRadius,
    borderBottomLeftRadius: constants.sidebarRowRadius,
    paddingLeft: "calc(0.25rem * 2)",
    paddingRight: "calc(0.25rem * 2)",
  },
  active: {
    backgroundColor: tokens.active,
    color: tokens.fg,
  },
  idle: {
    color: {
      default: tokens.fg85,
      ":hover": tokens.fg,
    },
    backgroundColor: {
      default: "transparent",
      ":hover": tokens.hover,
    },
  },
  icon: {
    height: "calc(0.25rem * 4)",
    width: "calc(0.25rem * 4)",
    flexShrink: 0,
  },
  iconActive: {
    opacity: "90%",
  },
  iconIdle: {
    opacity: "70%",
  },
  lucideScale: {
    display: "block",
    verticalAlign: "middle",
    scale: constants.iconScale,
    transformOrigin: "center",
  },
});
