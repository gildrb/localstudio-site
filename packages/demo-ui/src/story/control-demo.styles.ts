import * as stylex from "@stylexjs/stylex";
import { constants, tokens } from "../styles/tokens.stylex.ts";

export const styles = stylex.create({
  div32: {
    minHeight: "0px",
    width: {
      default: "820px",
      "@media (width < 48rem)": "680px",
    },
    overflowX: "hidden",
    overflowY: "hidden",
    paddingLeft: {
      default: "calc(0.25rem * 8)",
      "@media (width < 48rem)": "calc(0.25rem * 6)",
    },
    paddingRight: {
      default: "calc(0.25rem * 8)",
      "@media (width < 48rem)": "calc(0.25rem * 6)",
    },
    paddingTop: {
      default: "calc(0.25rem * 7)",
      "@media (width < 48rem)": "calc(0.25rem * 5)",
    },
    paddingBottom: {
      default: "calc(0.25rem * 7)",
      "@media (width < 48rem)": "calc(0.25rem * 5)",
    },
  },
  h333: {
    fontSize: constants.fsXl,
    fontWeight: 500,
  },
  p34: {
    marginTop: "0.25rem",
    fontSize: constants.fsSm,
    color: tokens.dim,
  },
  p37: {
    marginTop: "calc(0.25rem * 8)",
    fontSize: "3.5rem",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "-0.055em",
  },
  dl40: {
    marginTop: "calc(0.25rem * 8)",
    display: "flex",
    rowGap: "calc(0.25rem * 10)",
    columnGap: "calc(0.25rem * 10)",
  },
  section45: {
    marginTop: "calc(0.25rem * 10)",
  },
  h446: {
    marginBottom: "calc(0.25rem * 4)",
    fontSize: constants.fsMd,
    fontWeight: 500,
  },
  div58: {
    textAlign: "left",
  },
  dd59: {
    fontSize: constants.fsLg,
    fontWeight: 500,
  },
  dt62: {
    marginTop: "calc(0.25rem * 0.5)",
    fontSize: constants.fsXs,
    color: tokens.uiMuted,
  },
});
