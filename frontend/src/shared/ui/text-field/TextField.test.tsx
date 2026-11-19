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
        label="表示名"
        description="画面に表示する名前を入力してください。"
        placeholder="山田 花子"
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByRole("textbox", { name: "表示名" });
    expect(input).toHaveAccessibleDescription("画面に表示する名前を入力してください。");

    await user.click(screen.getByText("表示名"));
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

  it("invalid={false}ではerrorMessageを抑止し、フォーム必須検証と送信値を維持する", async () => {
    const user = userEvent.setup();
    let submitted: FormDataEntryValue | null = "unset";

    const { rerender } = render(
      <TextField
        label="表示名"
        description="画面に表示します。"
        invalid={false}
        errorMessage="表示されないエラー"
      />,
    );

    const input = screen.getByRole("textbox", { name: "表示名" });
    expect(screen.queryByText("表示されないエラー")).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("画面に表示します。");

    rerender(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = new FormData(event.currentTarget).get("displayName");
        }}
      >
        <TextField label="表示名" name="displayName" required />
        <button type="submit">送信</button>
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "送信" }));
    const formInput = screen.getByRole("textbox", { name: "表示名" });
    expect(formInput).toHaveAttribute("aria-invalid", "true");
    expect(submitted).toBe("unset");

    await user.type(formInput, "佐藤");
    await user.click(screen.getByRole("button", { name: "送信" }));
    expect(formInput).not.toHaveAttribute("aria-invalid", "true");
    expect(submitted).toBe("佐藤");
  });
});
