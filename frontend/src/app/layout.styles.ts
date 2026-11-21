import * as stylex from "@stylexjs/stylex";
import { tokens } from "../shared/styles/tokens.stylex";

export const layoutStyles = stylex.create({
  body: { backgroundColor: tokens.surface, color: tokens.onSurface },
  skipLink: {
    position: "fixed",
    top: { default: "-10rem", ":focus-visible": "1rem" },
    insetInlineStart: { default: "-10rem", ":focus-visible": "1rem" },
    zIndex: 100,
    paddingBlock: "0.625rem",
    paddingInline: "1rem",
    borderRadius: tokens.cornerMedium,
    backgroundColor: tokens.primary,
    color: tokens.onPrimary,
    fontSize: "0.875rem",
    fontWeight: 600,
    textDecoration: "none",
    outline: { default: "none", ":focus-visible": `3px solid ${tokens.onSurface}` },
    outlineOffset: "2px",
  },
});
