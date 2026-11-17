import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  const getAnimations = Element.prototype.getAnimations;
  beforeAll(() => {
    // jsdomにないWeb Animations APIを、アニメーションなしのブラウザとして補う。
    Element.prototype.getAnimations = () => [];
  });
  afterAll(() => {
    Element.prototype.getAnimations = getAnimations;
  });
  it("クリックとSpaceキーでチェック状態を切り替え、説明文と関連付ける", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Checkbox
        label="録音データの保存に同意する"
        description="診察記録の作成に利用します。"
        onCheckedChange={onCheckedChange}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "録音データの保存に同意する" });
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(checkbox).toHaveAccessibleDescription("診察記録の作成に利用します。");

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());

    checkbox.focus();
    await user.keyboard(" ");
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("不確定状態とエラー状態・無効状態を正しく表現する", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Checkbox label="すべて選択" defaultChecked="indeterminate" />);

    const checkbox = screen.getByRole("checkbox", { name: "すべて選択" });
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "true");

    rerender(<Checkbox label="同意" errorMessage="必須項目です。" disabled />);
    const disabledCheckbox = screen.getByRole("checkbox", { name: "同意" });
    expect(disabledCheckbox).toBeDisabled();
    expect(disabledCheckbox).toHaveAttribute("aria-invalid", "true");
  });
});
