import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { RadioGroup } from "./RadioGroup";

const items = [
  { value: "realtime", label: "リアルタイム", description: "逐次反映します。" },
  { value: "batch", label: "一括要約", description: "終了後に作成します。" },
  { value: "archive", label: "保存のみ", disabled: true },
];

describe("RadioGroup", () => {
  const getAnimations = Element.prototype.getAnimations;
  beforeAll(() => {
    // jsdomにないWeb Animations APIを、アニメーションなしのブラウザとして補う。
    Element.prototype.getAnimations = () => [];
  });
  afterAll(() => {
    Element.prototype.getAnimations = getAnimations;
  });

  it("クリックと矢印キーで選択を切り替え、無効項目をスキップする", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <RadioGroup
        label="処理モード"
        description="記録方法を選びます。"
        items={items}
        defaultValue="realtime"
        onValueChange={onValueChange}
      />,
    );

    const group = screen.getByRole("radiogroup", { name: "処理モード" });
    expect(group).toHaveAccessibleDescription("記録方法を選びます。");

    const realtime = screen.getByRole("radio", { name: "リアルタイム" });
    const batch = screen.getByRole("radio", { name: "一括要約" });
    const archive = screen.getByRole("radio", { name: "保存のみ" });

    expect(realtime).toHaveAttribute("aria-checked", "true");
    expect(realtime).toHaveAccessibleDescription("逐次反映します。");
    expect(archive).toBeDisabled();

    await user.click(batch);
    expect(batch).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledWith("batch", expect.anything());

    batch.focus();
    await user.keyboard("{ArrowDown}");
    expect(realtime).toHaveAttribute("aria-checked", "true");
  });

  it("エラー状態とグループ無効状態を正しく表現する", () => {
    const { rerender } = render(
      <RadioGroup label="モード" items={items} errorMessage="いずれかを選択してください。" />,
    );

    expect(screen.getByText("いずれかを選択してください。")).toBeVisible();
    expect(screen.getByRole("radio", { name: "リアルタイム" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    rerender(<RadioGroup label="モード" items={items} disabled defaultValue="realtime" />);
    expect(screen.getByRole("radio", { name: "リアルタイム" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "一括要約" })).toBeDisabled();
  });
});

it("preserves feedback with an accessible name supplied by aria-label", () => {
  render(
    <RadioGroup aria-label="Mode" description="Method" errorMessage="Choose one" items={items} />,
  );
  const control = screen.getByRole("radiogroup", { name: "Mode" });
  expect(control).toHaveAccessibleDescription(/Method/);
  expect(screen.getByText("Choose one")).toBeVisible();
});
