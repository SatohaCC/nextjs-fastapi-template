import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("ラベル・説明文と入力欄を関連付け、入力変更を通知する", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <TextField
        label="患者氏名"
        description="診察券の表記どおりに入力してください。"
        placeholder="山田 花子"
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByRole("textbox", { name: "患者氏名" });
    expect(input).toHaveAccessibleDescription("診察券の表記どおりに入力してください。");

    await user.click(screen.getByText("患者氏名"));
    expect(input).toHaveFocus();

    await user.type(input, "佐藤");
    expect(input).toHaveValue("佐藤");
    expect(onValueChange).toHaveBeenLastCalledWith("佐藤", expect.anything());
  });

  it("エラーメッセージ指定時はaria-invalidとエラー文言を表示する", () => {
    render(
      <TextField
        label="メールアドレス"
        defaultValue="invalid"
        errorMessage="形式が正しくありません。"
      />,
    );

    const input = screen.getByRole("textbox", { name: "メールアドレス" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("形式が正しくありません。");
  });

  it("無効状態のときは入力できず、複数行モードではtextareaとして描画される", () => {
    const { rerender } = render(<TextField label="無効項目" disabled defaultValue="固定" />);
    expect(screen.getByRole("textbox", { name: "無効項目" })).toBeDisabled();

    rerender(<TextField label="メモ" multiline rows={4} />);
    const textarea = screen.getByRole("textbox", { name: "メモ" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("rows", "4");
  });
});
