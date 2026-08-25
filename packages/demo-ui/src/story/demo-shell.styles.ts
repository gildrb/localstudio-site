import * as stylex from "@stylexjs/stylex";
import { tokens } from "../styles/tokens.stylex.ts";

export const styles = stylex.create({
  demo: {
  },
  demoViewport: {
  },
  demoApp: {
  },
  div42: {
    display: "flex",
    minHeight: "0px",
    minWidth: "0px",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    overflowX: "hidden",
    overflowY: "hidden",
    backgroundColor: tokens.agentBg,
  },
});
