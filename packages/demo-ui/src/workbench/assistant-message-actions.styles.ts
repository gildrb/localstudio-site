import * as stylex from "@stylexjs/stylex";
import { constants, tokens } from "../styles/tokens.stylex.ts";

export const styles = stylex.create({
  div22: {
    marginTop: "calc(0.25rem * 2)",
    display: "flex",
    alignItems: "center",
    rowGap: "0.25rem",
    columnGap: "0.25rem",
    color: tokens.dim65,
  },
  element27: {
    display: "inline-flex",
    height: "calc(0.25rem * 7)",
    width: "calc(0.25rem * 7)",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: "0.375rem",
    borderTopRightRadius: "0.375rem",
    borderBottomRightRadius: "0.375rem",
    borderBottomLeftRadius: "0.375rem",
    color: {
      default: tokens.hl2,
      ":hover": tokens.fg,
    },
    backgroundColor: {
      default: "transparent",
      ":hover": tokens.hover,
    },
    pointerEvents: {
      default: null,
      ":disabled": "none",
    },
    opacity: {
      default: null,
      ":disabled": "30%",
    },
  },
  copy30: {
    height: "calc(0.25rem * 4)",
    width: "calc(0.25rem * 4)",
  },
  lucideScale: {
    display: "block",
    verticalAlign: "middle",
    scale: constants.iconScale,
    transformOrigin: "center",
  },
});
