"use client";

import * as stylex from "@stylexjs/stylex";
import { Field, FieldError, FieldLabel, useFieldControl } from "@ui-sdk/react/field";
import { type TextareaOptions, Textarea as UiTextarea } from "@ui-sdk/react/textarea";
import type { ReactNode } from "react";
import { mergeControlDescribedBy, useStandaloneField } from "../internal/useStandaloneField";
import { textareaStyles as s } from "./Textarea.styles";

export type TextareaVariant = "outlined" | "filled";

export interface TextareaProps {
  label?: string;
  variant?: TextareaVariant;
  description?: string;
  errorMessage?: string;
  invalid?: boolean;
  rows?: number;
  autoResize?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: TextareaOptions["onValueChange"];
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  maxLength?: number;
  submitShortcut?: TextareaOptions["submitShortcut"];
  onSubmit?: TextareaOptions["onSubmit"];
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  style?: stylex.StyleXStyles;
}

interface TextareaControlBoxProps {
  id?: string;
  variant: TextareaVariant;
  isInvalid?: boolean;
  disabled?: boolean;
  style?: stylex.StyleXStyles;
  children: ReactNode;
}

function TextareaControlBox({
  id,
  variant,
  isInvalid,
  disabled,
  style,
  children,
}: TextareaControlBoxProps) {
  const field = useFieldControl({ id });
  const fieldAttrs = field?.props({ id }) as Record<string, unknown> | undefined;
  const resolvedInvalid =
    isInvalid === false ? false : Boolean(isInvalid || fieldAttrs?.["data-invalid"] !== undefined);
  const resolvedDisabled = Boolean(
    disabled || field?.disabled || fieldAttrs?.["data-disabled"] !== undefined,
  );

  return (
    <div
      data-slot="textarea-box"
      data-invalid={resolvedInvalid ? "" : undefined}
      data-disabled={resolvedDisabled ? "" : undefined}
      {...stylex.props(
        s.controlBox,
        variant === "outlined" ? s.outlined : s.filled,
        resolvedInvalid && (variant === "outlined" ? s.outlinedInvalid : s.filledInvalid),
        resolvedDisabled && (variant === "outlined" ? s.outlinedDisabled : s.filledDisabled),
        style,
      )}
    >
      {children}
    </div>
  );
}

/** Material Design 3 準拠の複数行テキスト入力フィールド。 */
export function Textarea({
  label,
  variant = "outlined",
  description,
  errorMessage,
  invalid,
  rows = 3,
  autoResize = false,
  name,
  id,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  disabled,
  readOnly = false,
  required = false,
  maxLength,
  submitShortcut,
  onSubmit,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  style,
}: TextareaProps) {
  const {
    descId,
    errorId,
    isInvalid,
    showError,
    hasFieldLayout,
    isInsideOuterFieldOnly,
    passStyleToControl,
    extraDescribedBy,
  } = useStandaloneField({
    label,
    description,
    errorMessage,
    invalid,
    ariaDescribedBy,
  });

  const controlBox = (
    <TextareaControlBox
      id={id}
      variant={variant}
      isInvalid={isInvalid}
      disabled={disabled}
      style={passStyleToControl ? style : undefined}
    >
      <UiTextarea
        id={id}
        {...(isInsideOuterFieldOnly && name ? { name } : {})}
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
        onSubmit={onSubmit}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={isInsideOuterFieldOnly ? (isInvalid ?? ariaInvalid) : ariaInvalid}
        className={(state) =>
          stylex.props(s.input, autoResize && s.inputAutoResize, state.disabled && s.inputDisabled)
            .className
        }
        render={
          extraDescribedBy
            ? (controlProps) => (
                <textarea
                  {...controlProps}
                  aria-describedby={mergeControlDescribedBy(
                    controlProps["aria-describedby"],
                    extraDescribedBy,
                  )}
                />
              )
            : undefined
        }
      />
    </TextareaControlBox>
  );

  if (isInsideOuterFieldOnly) {
    return controlBox;
  }

  return (
    <Field
      name={name}
      disabled={disabled}
      invalid={isInvalid}
      {...stylex.props(s.root, hasFieldLayout && style)}
    >
      {label && (
        <FieldLabel
          className={(state) =>
            stylex.props(
              s.label,
              state.invalid && s.labelInvalid,
              state.disabled && s.labelDisabled,
            ).className
          }
        >
          {label}
          {required && (
            <span aria-hidden="true" {...stylex.props(s.requiredMark)}>
              *
            </span>
          )}
        </FieldLabel>
      )}
      {controlBox}
      {description && (
        <p
          id={descId}
          data-slot="field-description"
          {...stylex.props(s.supporting, disabled && s.supportingDisabled)}
        >
          {description}
        </p>
      )}
      {showError ? (
        <div id={errorId} data-slot="field-error" {...stylex.props(s.error)}>
          {errorMessage}
        </div>
      ) : (
        <FieldError className={stylex.props(s.error).className} />
      )}
    </Field>
  );
}
