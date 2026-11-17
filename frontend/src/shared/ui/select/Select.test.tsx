import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const items = [
  { value: "general", label: "総合診療科" },
  { value: "cardiology", label: "循環器内科" },
  { value: "pediatrics", label: "小児科", disabled: true },
];

describe("Select", () => {
  const getAnimations = Element.prototype.getAnimations;
  const scrollIntoView = Element.prototype.scrollIntoView;
  let popoverStyle: HTMLStyleElement | null = null;
  beforeAll(() => {
    // jsdomにないWeb Animations API・scrollIntoView・Popover表示スタイルを補う。
    Element.prototype.getAnimations = () => [];
    Element.prototype.scrollIntoView = () => {};
    popoverStyle = document.createElement("style");
    popoverStyle.textContent = "[popover][data-open] { display: block !important; }";
    document.head.append(popoverStyle);
  });
  afterAll(() => {
    Element.prototype.getAnimations = getAnimations;
    Element.prototype.scrollIntoView = scrollIntoView;
    popoverStyle?.remove();
  });
  it("トリガーを開いて選択肢を選び、onValueChangeを呼び出す", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Select
        label="診療科"
        placeholder="選択してください"
        description="記録用の辞書を切り替えます。"
        items={items}
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "診療科" });
    expect(trigger).toHaveAccessibleDescription("記録用の辞書を切り替えます。");
    expect(trigger).toHaveTextContent("選択してください");

    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "循環器内科" }));

    expect(onValueChange).toHaveBeenCalledWith("cardiology", expect.anything());
    expect(trigger).toHaveTextContent("循環器内科");
  });

  it("無効な選択肢や無効化されたセレクトは選択できない", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    const { rerender } = render(
      <Select label="診療科" defaultValue="general" items={items} onValueChange={onValueChange} />,
    );

    const trigger = screen.getByRole("combobox", { name: "診療科" });
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "小児科" }));
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(
      <Select
        label="診療科"
        defaultValue="general"
        items={items}
        disabled
        errorMessage="変更できません。"
      />,
    );
    const disabledTrigger = screen.getByRole("combobox", { name: "診療科" });
    expect(disabledTrigger).toBeDisabled();
    expect(disabledTrigger).toHaveAttribute("aria-invalid", "true");
  });
});
