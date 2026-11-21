import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../styles/tokens.stylex";

export const switchStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    width: "100%",
    minWidth: 0,
  },
  standaloneRoot: {
    display: "inline-flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  field: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    width: "100%",
    minWidth: 0,
  },
  standaloneField: {
    display: "inline-flex",
    alignItems: "center",
  },
  textGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    minWidth: 0,
  },
  label: {
    fontSize: "0.9375rem",
    lineHeight: "1.375rem",
    fontWeight: 500,
    color: tokens.onSurface,
    cursor: "pointer",
  },
  labelDisabled: {
    color: tokens.disabledContent,
    cursor: "not-allowed",
  },
  description: {
    fontSize: "0.8125rem",
    lineHeight: "1.25rem",
    color: tokens.onSurfaceVariant,
  },
  descriptionDisabled: {
    color: tokens.disabledContent,
  },
  track: {
    appearance: "none",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    width: "3.25rem",
    height: "2rem",
    padding: 0,
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: tokens.cornerFull,
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `3px solid ${tokens.primary}` },
    outlineOffset: 3,
    transitionProperty: "background-color, border-color",
    transitionDuration: tokens.motionDuration,
    transitionTimingFunction: tokens.motionEasing,
  },
  trackUnchecked: {
    backgroundColor: tokens.surfaceContainerHighest,
    borderColor: tokens.outline,
    color: tokens.onSurface,
    backgroundImage: {
      default: "none",
      ":focus-visible": tokens.stateFocus,
      "@media (hover: hover)": { ":hover": tokens.stateHover },
      ":active": tokens.statePress,
    },
  },
  trackChecked: {
    backgroundColor: tokens.primary,
    borderColor: tokens.primary,
    color: tokens.onPrimary,
    backgroundImage: {
      default: "none",
      ":focus-visible": tokens.stateFocus,
      "@media (hover: hover)": { ":hover": tokens.stateHover },
      ":active": tokens.statePress,
    },
  },
  trackDisabledUnchecked: {
    backgroundColor: tokens.disabledContainer,
    borderColor: tokens.disabledContent,
    cursor: "not-allowed",
    backgroundImage: {
      default: "none",
      ":focus-visible": "none",
      "@media (hover: hover)": { ":hover": "none" },
      ":active": "none",
    },
  },
  trackDisabledChecked: {
    backgroundColor: tokens.disabledContainer,
    borderColor: "transparent",
    cursor: "not-allowed",
    backgroundImage: {
      default: "none",
      ":focus-visible": "none",
      "@media (hover: hover)": { ":hover": "none" },
      ":active": "none",
    },
  },
  thumb: {
    position: "absolute",
    insetBlock: 0,
    marginBlock: "auto",
    insetInlineStart: "0.125rem",
    width: "1.5rem",
    height: "1.5rem",
    display: "block",
    borderRadius: tokens.cornerFull,
    transformOrigin: "center",
    transitionProperty: "transform, background-color",
    transitionDuration: tokens.motionDuration,
    transitionTimingFunction: tokens.motionEasing,
  },
  thumbUnchecked: {
    transform: "translateX(0) scale(0.6667)",
    backgroundColor: {
      default: tokens.outline,
      [stylex.when.ancestor(":hover")]: tokens.onSurfaceVariant,
      [stylex.when.ancestor(":focus-visible")]: tokens.onSurfaceVariant,
      [stylex.when.ancestor(":active")]: tokens.onSurfaceVariant,
    },
  },
  thumbChecked: {
    transform: {
      default: "translateX(1.25rem) scale(1)",
      ":dir(rtl)": "translateX(-1.25rem) scale(1)",
    },
    backgroundColor: tokens.onPrimary,
  },
  thumbDisabledUnchecked: {
    backgroundColor: tokens.disabledContent,
  },
  thumbDisabledChecked: {
    backgroundColor: tokens.surface,
  },
  error: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    color: tokens.error,
  },
});
