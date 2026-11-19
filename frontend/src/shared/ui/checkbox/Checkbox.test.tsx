import * as stylex from "@stylexjs/stylex";
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
        label="変更内容を保存する"
        description="後から変更内容を確認できます。"
        onCheckedChange={onCheckedChange}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "変更内容を保存する" });
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(checkbox).toHaveAccessibleDescription("後から変更内容を確認できます。");

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

it("aria-label で名前を指定したチェックボックスに説明文とエラー文を関連付ける", () => {
  render(<Checkbox aria-label="Consent" description="Purpose" errorMessage="Required" />);
  const control = screen.getByRole("checkbox", { name: "Consent" });
  expect(control).toHaveAccessibleDescription("Purpose Required");
  expect(control).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByText("Required")).toBeVisible();
});

it("表示ラベルがない場合も検証状態の変化で選択・フォーカスと説明の関連付けを保持する", async () => {
  function renderRow(invalid: boolean, errorMessage?: string) {
    return (
      <>
        <span id="row-description">選択すると一覧に追加します。</span>
        <Checkbox
          aria-label="行を選択"
          aria-describedby="row-description"
          invalid={invalid}
          errorMessage={errorMessage}
        />
      </>
    );
  }

  const user = userEvent.setup();
  const { rerender } = render(renderRow(false));
  const checkbox = screen.getByRole("checkbox", { name: "行を選択" });
  checkbox.focus();
  await user.keyboard(" ");
  expect(checkbox).toHaveAttribute("aria-checked", "true");

  rerender(renderRow(true));
  expect(checkbox).toHaveFocus();
  expect(checkbox).toHaveAttribute("aria-invalid", "true");

  rerender(renderRow(true, "この行は選択できません。"));
  expect(checkbox).toHaveFocus();
  expect(checkbox).toHaveAttribute("aria-checked", "true");
  expect(checkbox).toHaveAccessibleDescription(
    "選択すると一覧に追加します。 この行は選択できません。",
  );
  expect(screen.getByText("この行は選択できません。")).toBeVisible();

  rerender(renderRow(false));
  expect(checkbox).toHaveFocus();
  expect(checkbox).not.toHaveAttribute("aria-invalid", "true");
  expect(checkbox).toHaveAccessibleDescription("選択すると一覧に追加します。");
  expect(screen.queryByText("この行は選択できません。")).not.toBeInTheDocument();
});

const overrides = stylex.create({ width: (width: number) => ({ width }) });

it("forwards the inline variables of a dynamic StyleX override", () => {
  render(<Checkbox aria-label="Selection" style={overrides.width(271)} />);
  expect(
    screen.getByRole("checkbox", { name: "Selection", hidden: true }).getAttribute("style"),
  ).toMatch(/--[\w-]+:\s*271px/);
});
