"use client";

import * as stylex from "@stylexjs/stylex";
import {
  DialogBackdrop,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Dialog as UiDialog,
  type DialogProps as UiDialogProps,
} from "@ui-sdk/react/dialog";
import type { ComponentProps, ReactNode } from "react";
import { ButtonBase, type ButtonVariant } from "../button/Button";
import { dialogStyles as s } from "./Dialog.styles";

export interface DialogProps extends Omit<UiDialogProps, "children"> {
  title: string;
  description?: string;
  triggerLabel?: string;
  triggerVariant?: ButtonVariant;
  closeLabel?: string;
  actions?: ReactNode;
  initialFocus?: DialogContentProps["initialFocus"];
  finalFocus?: DialogContentProps["finalFocus"];
  children?: ReactNode;
  style?: stylex.StyleXStyles;
}

/** Material Design 3 準拠のダイアログ。 */
export function Dialog({
  title,
  description,
  triggerLabel,
  triggerVariant = "filled",
  closeLabel,
  actions,
  initialFocus,
  finalFocus,
  children,
  style,
  ...props
}: DialogProps) {
  return (
    <UiDialog {...props}>
      {triggerLabel && (
        <DialogTrigger render={<ButtonBase variant={triggerVariant} />}>
          {triggerLabel}
        </DialogTrigger>
      )}
      <DialogBackdrop className={stylex.props(s.backdrop).className} />
      <DialogContent
        initialFocus={initialFocus}
        finalFocus={finalFocus}
        {...stylex.props(s.content, style)}
      >
        <div {...stylex.props(s.header)}>
          <div {...stylex.props(s.headerText)}>
            <DialogTitle className={stylex.props(s.title).className}>{title}</DialogTitle>
            {description && (
              <DialogDescription className={stylex.props(s.description).className}>
                {description}
              </DialogDescription>
            )}
          </div>
          {closeLabel && (
            <DialogClose
              aria-label={closeLabel}
              className={stylex.props(s.closeIconButton).className}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                {...stylex.props(s.closeIcon)}
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </DialogClose>
          )}
        </div>
        {children && <div {...stylex.props(s.body)}>{children}</div>}
        {actions && <div {...stylex.props(s.actions)}>{actions}</div>}
      </DialogContent>
    </UiDialog>
  );
}

export interface DialogCloseButtonProps
  extends Omit<ComponentProps<typeof DialogClose>, "className" | "style" | "render"> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  style?: stylex.StyleXStyles;
}

/** ダイアログを閉じる操作に使う M3 ボタン。 */
export function DialogCloseButton({
  variant = "text",
  size = "md",
  disabled = false,
  style,
  children,
  ...props
}: DialogCloseButtonProps) {
  return (
    <DialogClose
      disabled={disabled}
      render={<ButtonBase variant={variant} size={size} overrideStyle={style} />}
      {...props}
    >
      {children}
    </DialogClose>
  );
}
