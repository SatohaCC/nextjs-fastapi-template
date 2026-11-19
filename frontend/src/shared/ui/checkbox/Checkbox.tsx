"use client";

import * as stylex from "@stylexjs/stylex";
import { CheckboxIndicator, Checkbox as UiCheckbox } from "@ui-sdk/react/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@ui-sdk/react/field";
import { type ComponentProps, useId } from "react";
import { checkboxStyles as s } from "./Checkbox.styles";

export interface CheckboxProps
  extends Omit<ComponentProps<typeof UiCheckbox>, "className" | "style" | "children" | "render"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  invalid?: boolean;
  style?: stylex.StyleXStyles;
}

/** Material Design 3 準拠のチェックボックス（選択・未選択・不確定に対応）。 */
export function Checkbox({
  label,
  description,
  errorMessage,
  invalid,
  disabled = false,
  style,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: CheckboxProps) {
  const isInvalid = invalid ?? (errorMessage ? true : undefined);
  const hasField = Boolean(label || description);
  const errorId = useId();
  const standaloneError = !hasField && errorMessage;
  const standaloneDescription = standaloneError
    ? [describedBy, errorId].filter(Boolean).join(" ")
    : describedBy;

  const control = (
    <UiCheckbox
      disabled={disabled}
      aria-describedby={standaloneDescription}
      aria-invalid={hasField ? ariaInvalid : (isInvalid ?? ariaInvalid)}
      style={stylex.props(!hasField && style).style}
      className={(state) => {
        const active = state.checked || state.indeterminate;
        return stylex.props(
          s.control,
          active && s.controlChecked,
          isInvalid && s.controlInvalid,
          state.disabled && s.controlDisabled,
          !hasField && style,
        ).className;
      }}
      {...props}
    >
      {(state) => {
        const active = state.checked || state.indeterminate;
        return (
          <span
            {...stylex.props(
              s.box,
              active && s.boxChecked,
              isInvalid && (active ? s.boxInvalidChecked : s.boxInvalid),
              state.disabled && (active ? s.boxDisabledChecked : s.boxDisabledUnchecked),
            )}
          >
            <CheckboxIndicator className={stylex.props(s.indicator).className}>
              {(indicatorState) =>
                indicatorState.indeterminate ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    aria-hidden="true"
                    {...stylex.props(s.icon)}
                  >
                    <path d="M5 12h14" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    {...stylex.props(s.icon)}
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )
              }
            </CheckboxIndicator>
          </span>
        );
      }}
    </UiCheckbox>
  );

  if (!hasField) {
    return (
      <>
        {control}
        {standaloneError && (
          <div id={errorId} {...stylex.props(s.error)}>
            {standaloneError}
          </div>
        )}
      </>
    );
  }

  return (
    <Field disabled={disabled} invalid={isInvalid} {...stylex.props(s.root, style)}>
      <div {...stylex.props(s.row)}>
        {control}
        <div {...stylex.props(s.textGroup)}>
          {label && (
            <FieldLabel
              className={(state) =>
                stylex.props(s.label, state.disabled && s.labelDisabled).className
              }
            >
              {label}
            </FieldLabel>
          )}
          {description && (
            <FieldDescription
              className={(state) =>
                stylex.props(s.description, state.disabled && s.descriptionDisabled).className
              }
            >
              {description}
            </FieldDescription>
          )}
        </div>
      </div>
      <FieldError className={stylex.props(s.error).className}>{errorMessage}</FieldError>
    </Field>
  );
}
