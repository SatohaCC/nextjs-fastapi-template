import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../styles/tokens.stylex";

export const checkboxStyles = stylex.create({
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
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
  },
  standaloneRow: {
    display: "inline-flex",
    alignItems: "flex-start",
  },
  control: {
    appearance: "none",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "2.5rem",
    height: "2.5rem",
    margin: "-0.375rem",
    padding: 0,
    borderWidth: 0,
    borderRadius: tokens.cornerFull,
    backgroundColor: "transparent",
    color: tokens.onSurfaceVariant,
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `3px solid ${tokens.primary}` },
    outlineOffset: -2,
    backgroundImage: {
      default: "none",
      ":focus-visible": tokens.stateFocus,
      "@media (hover: hover)": { ":hover": tokens.stateHover },
      ":active": tokens.statePress,
    },
  },
  controlChecked: {
    color: tokens.primary,
  },
  controlInvalid: {
    color: tokens.error,
  },
  controlDisabled: {
    cursor: "not-allowed",
    backgroundImage: {
      default: "none",
      ":focus-visible": "none",
      "@media (hover: hover)": { ":hover": "none" },
      ":active": "none",
    },
  },
  box: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.125rem",
    height: "1.125rem",
    borderRadius: tokens.cornerExtraSmall,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: tokens.onSurfaceVariant,
    backgroundColor: "transparent",
    color: tokens.onPrimary,
    transitionProperty: "background-color, border-color",
    transitionDuration: tokens.motionDuration,
    transitionTimingFunction: tokens.motionEasing,
  },
  boxChecked: {
    backgroundColor: tokens.primary,
    borderColor: tokens.primary,
    color: tokens.onPrimary,
  },
  boxInvalid: {
    borderColor: tokens.error,
  },
  boxInvalidChecked: {
    backgroundColor: tokens.error,
    borderColor: tokens.error,
    color: tokens.onError,
  },
  boxDisabledUnchecked: {
    borderColor: tokens.disabledContent,
    backgroundColor: "transparent",
  },
  boxDisabledChecked: {
    borderColor: "transparent",
    backgroundColor: tokens.disabledContainer,
    color: tokens.surface,
  },
  indicator: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1rem",
    height: "1rem",
  },
  icon: {
    width: "0.875rem",
    height: "0.875rem",
  },
  textGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    minWidth: 0,
    paddingTop: "0.125rem",
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
  error: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    color: tokens.error,
    paddingInlineStart: "2.25rem",
  },
  errorStandalone: {
    paddingInlineStart: 0,
  },
});
