"use client";

import * as stylex from "@stylexjs/stylex";
import { Button as UiButton } from "@ui-sdk/react/button";
import type { ComponentProps } from "react";
import { buttonStyles } from "./Button.styles";

export type ButtonVariant = "filled" | "tonal" | "outlined" | "text" | "elevated";

export interface ButtonProps extends Omit<ComponentProps<typeof UiButton>, "className" | "style"> {
  variant?: ButtonVariant | "primary" | "secondary";
  size?: "sm" | "md";
  style?: stylex.StyleXStyles;
}

export function Button({
  variant = "filled",
  size = "md",
  style,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const resolved =
    variant === "primary" ? "filled" : variant === "secondary" ? "outlined" : variant;
  return (
    <UiButton
      type={type}
      disabled={disabled}
      {...stylex.props(
        buttonStyles.base,
        buttonStyles[resolved],
        buttonStyles[size],
        disabled && buttonStyles.disabled,
        disabled &&
          ["filled", "tonal", "elevated"].includes(resolved) &&
          buttonStyles.disabledContainer,
        disabled && resolved === "outlined" && buttonStyles.disabledOutline,
        style,
      )}
      {...props}
    />
  );
}
