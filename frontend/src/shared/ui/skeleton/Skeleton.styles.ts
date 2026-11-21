import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../styles/tokens.stylex";

const pulse = stylex.keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.45 },
});

export const skeletonStyles = stylex.create({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    width: "100%",
    minWidth: 0,
  },
  base: {
    display: "block",
    backgroundColor: tokens.surfaceContainerHighest,
    animationName: pulse,
    animationDuration: {
      default: "1.4s",
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
  text: {
    width: "100%",
    height: "1rem",
    borderRadius: tokens.cornerExtraSmall,
  },
  rectangular: {
    width: "100%",
    height: "5rem",
    borderRadius: tokens.cornerMedium,
  },
  circular: {
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: tokens.cornerFull,
  },
  lastLine: {
    width: "75%",
  },
  withWidth: (width: string) => ({ width }),
  withHeight: (height: string) => ({ height }),
});
