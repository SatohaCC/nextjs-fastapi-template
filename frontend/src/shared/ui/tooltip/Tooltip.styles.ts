import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../styles/tokens.stylex";

export const tooltipStyles = stylex.create({
  content: {
    zIndex: 60,
    margin: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    maxWidth: "min(calc(100vw - 1.5rem), 18rem)",
    paddingBlock: "0.375rem",
    paddingInline: "0.625rem",
    borderRadius: tokens.cornerExtraSmall,
    backgroundColor: tokens.inverseSurface,
    color: tokens.inverseOnSurface,
    boxShadow: tokens.shadow1,
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 500,
    overflowWrap: "anywhere",
    transitionProperty: "opacity, transform",
    transitionDuration: tokens.motionDuration,
    transitionTimingFunction: tokens.motionEasing,
  },
  shortcut: {
    opacity: 0.85,
    fontFamily: "monospace",
    fontSize: "0.6875rem",
    flexShrink: 0,
  },
});
