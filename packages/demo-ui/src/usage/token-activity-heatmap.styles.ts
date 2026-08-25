import * as stylex from "@stylexjs/stylex";
import { constants, tokens } from "../styles/tokens.stylex.ts";

export const styles = stylex.create({
  div130: {
    display: { default: null, "::-webkit-scrollbar": "none" },
    scrollbarWidth: "none",
    overflowX: "auto",
    paddingBottom: "0.25rem",
  },
  div131: {
    minWidth: "47rem",
  },
  div132: {
    marginBottom: "calc(0.25rem * 2)",
    display: "grid",
    gridTemplateColumns: "repeat(53,minmax(0,1fr))",
    rowGap: "3px",
    columnGap: "3px",
  },
  span134: {
    fontSize: constants.fs2xs,
    color: tokens.uiMuted,
  },
  div178: {
    marginTop: "calc(0.25rem * 3)",
    display: "flex",
    minHeight: "calc(0.25rem * 5)",
    alignItems: "center",
    justifyContent: "space-between",
    rowGap: "calc(0.25rem * 5)",
    columnGap: "calc(0.25rem * 5)",
    fontSize: constants.fs2xs,
    color: tokens.uiMuted,
  },
  span179: {
    color: tokens.fg85,
  },
  div182: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    rowGap: "calc(0.25rem * 1.5)",
    columnGap: "calc(0.25rem * 1.5)",
  },
  heatmap: {
    borderTopLeftRadius: "2px",
    borderTopRightRadius: "2px",
    borderBottomRightRadius: "2px",
    borderBottomLeftRadius: "2px",
    outlineStyle: "none",
    color: tokens.link,
  },
  dailyGrid: {
    display: "grid",
    gridAutoFlow: "column",
    gridTemplateColumns: "repeat(53,minmax(0,1fr))",
    gridTemplateRows: "repeat(7, minmax(0, 1fr))",
    rowGap: "3px",
    columnGap: "3px",
  },
  weeklyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(53,minmax(0,1fr))",
    rowGap: "3px",
    columnGap: "3px",
  },
  cell: {
    aspectRatio: "1 / 1",
    minHeight: "calc(0.25rem * 2.5)",
    borderTopLeftRadius: "2px",
    borderTopRightRadius: "2px",
    borderBottomRightRadius: "2px",
    borderBottomLeftRadius: "2px",
    transitionProperty: "transform,box-shadow",
    scale: {
      default: null,
      ":hover": 1.25,
    },
    boxShadow: {
      default: null,
      ":hover": "0 0 0 1px currentColor",
    },
  },
  selectedCell: {
    boxShadow: "0 0 0 1px currentColor",
    color: tokens.link,
  },
  level0: {
    backgroundColor: tokens.uiSurface2,
  },
  level1: {
    backgroundColor: tokens.blue20,
  },
  level2: {
    backgroundColor: tokens.blue38,
  },
  level3: {
    backgroundColor: tokens.blue62,
  },
  level4: {
    backgroundColor: tokens.blue90,
  },
  legendCell: {
    height: "calc(0.25rem * 2.5)",
    width: "calc(0.25rem * 2.5)",
    borderTopLeftRadius: "2px",
    borderTopRightRadius: "2px",
    borderBottomRightRadius: "2px",
    borderBottomLeftRadius: "2px",
  },
});
