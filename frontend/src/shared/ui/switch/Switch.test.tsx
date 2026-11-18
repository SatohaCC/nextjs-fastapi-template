import * as stylex from "@stylexjs/stylex";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("クリックとラベル操作で状態を切り替え、aria-checkedを更新する", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Switch
        label="自動保存"
        description="変更内容を自動で保存します。"
        onCheckedChange={onCheckedChange}
      />,
    );

    const control = screen.getByRole("switch", { name: "自動保存" });
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(control).toHaveAccessibleDescription("変更内容を自動で保存します。");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());

    await user.click(screen.getByText("自動保存"));
    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("キーボードのSpaceで切り替わり、disabled時は操作できない", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    const { rerender } = render(<Switch aria-label="通知設定" onCheckedChange={onCheckedChange} />);

    const control = screen.getByRole("switch", { name: "通知設定" });
    control.focus();
    await user.keyboard(" ");
    expect(control).toHaveAttribute("aria-checked", "true");

    rerender(
      <Switch aria-label="通知設定" disabled defaultChecked onCheckedChange={onCheckedChange} />,
    );
    expect(screen.getByRole("switch", { name: "通知設定" })).toBeDisabled();
  });
});

it("preserves feedback with an accessible name supplied by aria-label", () => {
  render(<Switch aria-label="Audio" description="Recording mode" />);
  const control = screen.getByRole("switch", { name: "Audio" });
  expect(control).toHaveAccessibleDescription(/Recording mode/);
});

const overrides = stylex.create({ width: (width: number) => ({ width }) });

it("forwards the inline variables of a dynamic StyleX override", () => {
  render(<Switch aria-label="Autosave" style={overrides.width(271)} />);
  expect(
    screen.getByRole("switch", { name: "Autosave", hidden: true }).getAttribute("style"),
  ).toMatch(/--[\w-]+:\s*271px/);
});
