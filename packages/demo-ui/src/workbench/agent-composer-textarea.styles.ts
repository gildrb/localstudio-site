import * as stylex from "@stylexjs/stylex";
import { tokens } from "../styles/tokens.stylex.ts";

export const styles = stylex.create({
  element37: {
    fieldSizing: "content",
    display: { default: null, "::-webkit-scrollbar": "none" },
    scrollbarWidth: "none",
    minHeight: "calc(0.25rem * 11)",
    maxHeight: "36vh",
    width: "100%",
    resize: "none",
    overflowY: "auto",
    backgroundColor: "transparent",
    paddingLeft: "calc(0.25rem * 4)",
    paddingRight: "calc(0.25rem * 4)",
    paddingBottom: "0px",
    paddingTop: "calc(0.25rem * 3.5)",
    fontSize: "16px",
    lineHeight: 1.5,
    letterSpacing: "0em",
    color: {
      default: tokens.fg82,
      "::placeholder": tokens.composerPlaceholder,
    },
    outlineWidth: { default: 0, ":focus": 0, ":focus-visible": 0 },
    outlineStyle: { default: "none", ":focus": "none", ":focus-visible": "none" },
    outlineColor: "transparent",
    outlineOffset: 0,
    boxShadow: { default: "none", ":focus": "none", ":focus-visible": "none" },
  },
});
