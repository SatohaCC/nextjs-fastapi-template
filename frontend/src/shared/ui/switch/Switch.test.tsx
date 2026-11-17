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
        label="自動音声認識"
        description="発話を検出して文字起こしします。"
        onCheckedChange={onCheckedChange}
      />,
    );

    const control = screen.getByRole("switch", { name: "自動音声認識" });
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(control).toHaveAccessibleDescription("発話を検出して文字起こしします。");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());

    await user.click(screen.getByText("自動音声認識"));
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
