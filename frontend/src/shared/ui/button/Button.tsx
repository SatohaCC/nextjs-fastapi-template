"use client";

import * as stylex from "@stylexjs/stylex";
import { Button as UiButton } from "@ui-sdk/react/button";
import type { ComponentProps, CSSProperties } from "react";
import { buttonStyles } from "./Button.styles";

export type ButtonVariant = "filled" | "tonal" | "outlined" | "text" | "elevated";

export interface ButtonBaseProps extends Omit<ComponentProps<"button">, "style"> {
  variant?: ButtonVariant | "primary" | "secondary";
  size?: "sm" | "md";
  overrideStyle?: stylex.StyleXStyles;
  style?: CSSProperties;
}

/** Button の視覚表現のみを担う素の button 要素（ui-sdk パーツの render 用）。 */
export function ButtonBase({
  variant = "filled",
  size = "md",
  disabled,
  overrideStyle,
  className,
  style,
  type = "button",
  ...props
}: ButtonBaseProps) {
  const resolved =
    variant === "primary" ? "filled" : variant === "secondary" ? "outlined" : variant;
  const isDisabled = Boolean(
    disabled || (props["aria-disabled"] === "true" && props["aria-busy"] !== "true"),
  );
  const sx = stylex.props(
    buttonStyles.base,
    buttonStyles[resolved],
    buttonStyles[size],
    isDisabled && buttonStyles.disabled,
    isDisabled &&
      ["filled", "tonal", "elevated"].includes(resolved) &&
      buttonStyles.disabledContainer,
    isDisabled && resolved === "outlined" && buttonStyles.disabledOutline,
    overrideStyle,
  );

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={[sx.className, className].filter(Boolean).join(" ") || undefined}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
    />
  );
}

export interface ButtonProps
  extends Omit<ComponentProps<typeof UiButton>, "className" | "style" | "render"> {
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
  return (
    <UiButton
      type={type}
      disabled={disabled}
      render={<ButtonBase variant={variant} size={size} overrideStyle={style} />}
      {...props}
    />
  );
}
