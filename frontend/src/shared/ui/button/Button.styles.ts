import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../styles/tokens.stylex";

export const buttonStyles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.radiusControl,
    borderWidth: 1,
    borderStyle: "solid",
    fontWeight: 500,
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    opacity: {
      default: 1,
      ":hover": 0.9,
      ":disabled": 0.6,
    },
  },
  primary: {
    borderColor: "transparent",
    backgroundColor: tokens.accent,
    color: tokens.accentFg,
  },
  secondary: {
    borderColor: tokens.border,
    backgroundColor: tokens.surface,
    color: tokens.fg,
  },
  sm: {
    paddingBlock: "0.375rem",
    paddingInline: "0.75rem",
    fontSize: "0.75rem",
  },
  md: {
    paddingBlock: "0.5rem",
    paddingInline: "0.875rem",
    fontSize: "0.875rem",
  },
});
