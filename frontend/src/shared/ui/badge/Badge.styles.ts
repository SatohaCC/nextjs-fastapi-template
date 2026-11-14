import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../styles/tokens.stylex";

export const badgeStyles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: tokens.radiusControl,
    paddingBlock: "0.125rem",
    paddingInline: "0.625rem",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  neutral: {
    backgroundColor: tokens.bg,
    color: tokens.muted,
  },
  success: {
    backgroundColor: tokens.okBg,
    color: tokens.ok,
  },
  danger: {
    backgroundColor: tokens.errBg,
    color: tokens.err,
  },
});
