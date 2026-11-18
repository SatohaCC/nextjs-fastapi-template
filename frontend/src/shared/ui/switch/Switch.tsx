"use client";

import * as stylex from "@stylexjs/stylex";
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field";
import { SwitchThumb, Switch as UiSwitch } from "@ui-sdk/react/switch";
import type { ComponentProps } from "react";
import { switchStyles as s } from "./Switch.styles";

export interface SwitchProps
  extends Omit<ComponentProps<typeof UiSwitch>, "className" | "style" | "children" | "render"> {
  label?: string;
  description?: string;
  style?: stylex.StyleXStyles;
}

/** Material Design 3 準拠のスイッチ（設定の即時オン・オフ切り替え）。 */
export function Switch({ label, description, disabled = false, style, ...props }: SwitchProps) {
  const hasField = Boolean(label || description);
  const control = (
    <UiSwitch
      disabled={disabled}
      style={stylex.props(!hasField && style).style}
      className={(state) =>
        stylex.props(
          s.track,
          state.checked ? s.trackChecked : s.trackUnchecked,
          state.disabled && (state.checked ? s.trackDisabledChecked : s.trackDisabledUnchecked),
          !hasField && style,
        ).className
      }
      {...props}
    >
      <SwitchThumb
        className={(state) =>
          stylex.props(
            s.thumb,
            state.checked ? s.thumbChecked : s.thumbUnchecked,
            state.disabled && (state.checked ? s.thumbDisabledChecked : s.thumbDisabledUnchecked),
          ).className
        }
      />
    </UiSwitch>
  );

  if (!hasField) {
    return control;
  }

  return (
    <Field disabled={disabled} {...stylex.props(s.field, style)}>
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
      {control}
    </Field>
  );
}
