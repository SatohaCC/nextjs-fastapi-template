"use client";

import * as stylex from "@stylexjs/stylex";
import { Field, FieldDescription, FieldError, FieldLabel } from "@ui-sdk/react/field";
import { Input, type InputOptions } from "@ui-sdk/react/input";
import { Textarea, type TextareaOptions } from "@ui-sdk/react/textarea";
import type { ComponentProps, ReactNode } from "react";
import { textFieldStyles as s } from "./TextField.styles";

export type TextFieldVariant = "outlined" | "filled";

export interface TextFieldProps {
  label: string;
  variant?: TextFieldVariant;
  description?: string;
  errorMessage?: string;
  invalid?: boolean;
  multiline?: boolean;
  rows?: number;
  autoResize?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  name?: string;
  id?: string;
  type?: ComponentProps<"input">["type"];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: InputOptions["onValueChange"];
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
  inputMode?: ComponentProps<"input">["inputMode"];
  submitShortcut?: TextareaOptions["submitShortcut"];
  onTextareaSubmit?: TextareaOptions["onSubmit"];
  style?: stylex.StyleXStyles;
}

/** Material Design 3 準拠のテキスト入力フィールド（単一行・複数行）。 */
export function TextField({
  label,
  variant = "outlined",
  description,
  errorMessage,
  invalid,
  multiline = false,
  rows = 3,
  autoResize = false,
  leading,
  trailing,
  name,
  id,
  type = "text",
  placeholder,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  readOnly = false,
  required = false,
  maxLength,
  autoComplete,
  inputMode,
  submitShortcut,
  onTextareaSubmit,
  style,
}: TextFieldProps) {
  const isInvalid = invalid ?? (errorMessage ? true : undefined);

  return (
    <Field name={name} disabled={disabled} invalid={isInvalid} {...stylex.props(s.root, style)}>
      <FieldLabel
        className={(state) =>
          stylex.props(s.label, state.invalid && s.labelInvalid, state.disabled && s.labelDisabled)
            .className
        }
      >
        {label}
        {required && (
          <span aria-hidden="true" {...stylex.props(s.requiredMark)}>
            *
          </span>
        )}
      </FieldLabel>
      <div
        {...stylex.props(
          s.controlBox,
          multiline && s.controlBoxMultiline,
          variant === "outlined" ? s.outlined : s.filled,
          isInvalid && (variant === "outlined" ? s.outlinedInvalid : s.filledInvalid),
          disabled && (variant === "outlined" ? s.outlinedDisabled : s.filledDisabled),
        )}
      >
        {leading && (
          <span aria-hidden="true" {...stylex.props(s.affix, disabled && s.affixDisabled)}>
            {leading}
          </span>
        )}
        {multiline ? (
          <Textarea
            id={id}
            rows={rows}
            autoResize={autoResize}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            maxLength={maxLength}
            submitShortcut={submitShortcut}
            onSubmit={onTextareaSubmit}
            className={(state) =>
              stylex.props(s.input, s.textarea, state.disabled && s.inputDisabled).className
            }
          />
        ) : (
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            maxLength={maxLength}
            autoComplete={autoComplete}
            inputMode={inputMode}
            className={(state) =>
              stylex.props(s.input, state.disabled && s.inputDisabled).className
            }
          />
        )}
        {trailing && (
          <span aria-hidden="true" {...stylex.props(s.affix, disabled && s.affixDisabled)}>
            {trailing}
          </span>
        )}
      </div>
      {description && (
        <FieldDescription
          className={(state) =>
            stylex.props(s.supporting, state.disabled && s.supportingDisabled).className
          }
        >
          {description}
        </FieldDescription>
      )}
      {errorMessage ? (
        <FieldError className={stylex.props(s.error).className}>{errorMessage}</FieldError>
      ) : (
        <FieldError className={stylex.props(s.error).className} />
      )}
    </Field>
  );
}
