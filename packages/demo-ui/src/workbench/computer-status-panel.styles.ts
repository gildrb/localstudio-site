import * as stylex from "@stylexjs/stylex";
import { constants, tokens } from "../styles/tokens.stylex.ts";

export const styles = stylex.create({
  section11: {
    scrollbarWidth: "none",
    display: { default: "flex", "::-webkit-scrollbar": "none" },
    minHeight: "0px",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    flexDirection: "column",
    rowGap: "calc(0.25rem * 3)",
    columnGap: "calc(0.25rem * 3)",
    overflowX: "auto",
    overflowY: "auto",
    paddingTop: "calc(0.25rem * 4)",
    paddingRight: "calc(0.25rem * 4)",
    paddingBottom: "calc(0.25rem * 4)",
    paddingLeft: "calc(0.25rem * 4)",
    fontSize: constants.fsSm,
    color: tokens.fg80,
  },
  span13: {
    color: tokens.dim,
  },
  span14: {
    marginLeft: "calc(0.25rem * 2)",
  },
});
