"use client";

import * as stylex from "@stylexjs/stylex";
import { Field, FieldDescription, FieldError, FieldLabel } from "@ui-sdk/react/field";
import {
  Radio,
  type RadioGroupOptions,
  RadioIndicator,
  RadioGroup as UiRadioGroup,
} from "@ui-sdk/react/radio";
import { radioGroupStyles as s } from "./RadioGroup.styles";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  items: readonly RadioOption[];
  label?: string;
  description?: string;
  errorMessage?: string;
  invalid?: boolean;
  orientation?: "vertical" | "horizontal";
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: RadioGroupOptions<string>["onValueChange"];
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  loop?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  style?: stylex.StyleXStyles;
}

/** Material Design 3 準拠のラジオボタングループ（単一選択）。 */
export function RadioGroup({
  items,
  label,
  description,
  errorMessage,
  invalid,
  orientation = "vertical",
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  readOnly = false,
  required = false,
  name,
  loop = true,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  style,
}: RadioGroupProps) {
  const isInvalid = invalid ?? (errorMessage ? true : undefined);

  const group = (
    <UiRadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      loop={loop}
      aria-label={!label ? ariaLabel : undefined}
      aria-labelledby={!label ? ariaLabelledBy : undefined}
      {...stylex.props(
        s.list,
        orientation === "horizontal" && s.listHorizontal,
        !(label || description || errorMessage) && style,
      )}
    >
      {items.map((item) => {
        const itemDisabled = disabled || Boolean(item.disabled);
        return (
          <Field
            key={item.value}
            disabled={itemDisabled}
            invalid={isInvalid}
            {...stylex.props(s.itemField)}
          >
            <Radio
              value={item.value}
              disabled={item.disabled}
              className={(state) =>
                stylex.props(
                  s.control,
                  state.checked && s.controlChecked,
                  isInvalid && s.controlInvalid,
                  state.disabled && s.controlDisabled,
                ).className
              }
            >
              {(state) => (
                <span
                  {...stylex.props(
                    s.ring,
                    state.checked && s.ringChecked,
                    isInvalid && s.ringInvalid,
                    state.disabled && s.ringDisabled,
                  )}
                >
                  <RadioIndicator
                    className={(indicatorState) =>
                      stylex.props(
                        s.dot,
                        isInvalid && s.dotInvalid,
                        indicatorState.disabled && s.dotDisabled,
                      ).className
                    }
                  />
                </span>
              )}
            </Radio>
            <div {...stylex.props(s.textGroup)}>
              <FieldLabel
                className={(state) =>
                  stylex.props(s.itemLabel, state.disabled && s.itemLabelDisabled).className
                }
              >
                {item.label}
              </FieldLabel>
              {item.description && (
                <FieldDescription
                  className={(state) =>
                    stylex.props(s.itemDescription, state.disabled && s.itemDescriptionDisabled)
                      .className
                  }
                >
                  {item.description}
                </FieldDescription>
              )}
            </div>
          </Field>
        );
      })}
    </UiRadioGroup>
  );

  if (!label && !(description || errorMessage)) {
    return group;
  }

  return (
    <Field name={name} disabled={disabled} invalid={isInvalid} {...stylex.props(s.root, style)}>
      {label && (
        <FieldLabel
          className={(state) =>
            stylex.props(
              s.groupLabel,
              state.invalid && s.groupLabelInvalid,
              state.disabled && s.groupLabelDisabled,
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
      {description && (
        <FieldDescription
          className={(state) =>
            stylex.props(s.supporting, state.disabled && s.supportingDisabled).className
          }
        >
          {description}
        </FieldDescription>
      )}
      {group}
      {errorMessage ? (
        <FieldError className={stylex.props(s.error).className}>{errorMessage}</FieldError>
      ) : (
        <FieldError className={stylex.props(s.error).className} />
      )}
    </Field>
  );
}
