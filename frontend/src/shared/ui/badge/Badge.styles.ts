import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../styles/tokens.stylex";

export const badgeStyles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    borderRadius: tokens.cornerSmall,
    paddingBlock: "0.375rem",
    paddingInline: "0.75rem",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 500,
    overflowWrap: "anywhere",
    maxWidth: "100%",
  },
  neutral: { backgroundColor: tokens.surfaceContainerHighest, color: tokens.onSurfaceVariant },
  success: { backgroundColor: tokens.successContainer, color: tokens.onSuccessContainer },
  danger: { backgroundColor: tokens.errorContainer, color: tokens.onErrorContainer },
});
