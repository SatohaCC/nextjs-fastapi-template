import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const items = [
  { value: "general", label: "一般" },
  { value: "development", label: "開発" },
  { value: "archived", label: "アーカイブ", disabled: true },
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
        label="カテゴリ"
        placeholder="選択してください"
        description="記録用の辞書を切り替えます。"
        items={items}
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "カテゴリ" });
    expect(trigger).toHaveAccessibleDescription("記録用の辞書を切り替えます。");
    expect(trigger).toHaveTextContent("選択してください");

    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "開発" }));

    expect(onValueChange).toHaveBeenCalledWith("development", expect.anything());
    expect(trigger).toHaveTextContent("開発");
  });

  it("無効な選択肢や無効化されたセレクトは選択できない", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    const { rerender } = render(
      <Select
        label="カテゴリ"
        defaultValue="general"
        items={items}
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "カテゴリ" });
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "アーカイブ" }));
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(
      <Select
        label="カテゴリ"
        defaultValue="general"
        items={items}
        disabled
        errorMessage="変更できません。"
      />,
    );
    const disabledTrigger = screen.getByRole("combobox", { name: "カテゴリ" });
    expect(disabledTrigger).toBeDisabled();
    expect(disabledTrigger).toHaveAttribute("aria-invalid", "true");
  });
});
