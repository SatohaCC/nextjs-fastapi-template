import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../styles/tokens.stylex";

const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

export const spinnerStyles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.625rem",
    color: tokens.onSurface,
  },
  circle: {
    display: "inline-block",
    flexShrink: 0,
    borderRadius: tokens.cornerFull,
    borderStyle: "solid",
    borderTopColor: tokens.primary,
    borderRightColor: tokens.outlineVariant,
    borderBottomColor: tokens.outlineVariant,
    borderLeftColor: tokens.outlineVariant,
    animationName: spin,
    animationDuration: {
      default: "900ms",
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  sm: {
    width: "1rem",
    height: "1rem",
    borderWidth: 2,
  },
  md: {
    width: "1.25rem",
    height: "1.25rem",
    borderWidth: 2,
  },
  lg: {
    width: "2rem",
    height: "2rem",
    borderWidth: 3,
  },
  label: {
    fontSize: "0.9375rem",
    lineHeight: "1.375rem",
    fontWeight: 500,
    color: tokens.onSurface,
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
});
