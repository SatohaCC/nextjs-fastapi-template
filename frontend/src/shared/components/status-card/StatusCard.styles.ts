import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../styles/tokens.stylex";

export const statusCardStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    borderRadius: tokens.radiusControl,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: tokens.border,
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: tokens.fg,
  },
});
