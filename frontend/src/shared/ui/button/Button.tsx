"use client";

import * as stylex from "@stylexjs/stylex";
import { Button as UiButton } from "@ui-sdk/react/button";
import type { ComponentProps } from "react";
import { buttonStyles } from "./Button.styles";

export interface ButtonProps extends Omit<ComponentProps<typeof UiButton>, "className" | "style"> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  style?: stylex.StyleXStyles;
}

export function Button({
  variant = "primary",
  size = "md",
  style,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <UiButton
      type={type}
      {...stylex.props(buttonStyles.base, buttonStyles[variant], buttonStyles[size], style)}
      {...props}
    />
  );
}
