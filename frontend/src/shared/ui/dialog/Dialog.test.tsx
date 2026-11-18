import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Dialog, DialogCloseButton } from "./Dialog";

describe("Dialog", () => {
  const getAnimations = Element.prototype.getAnimations;
  let popoverStyle: HTMLStyleElement | null = null;
  beforeAll(() => {
    // jsdomにないWeb Animations APIとPopover表示スタイルをテスト環境向けに補う。
    Element.prototype.getAnimations = () => [];
    popoverStyle = document.createElement("style");
    popoverStyle.textContent = "[popover][data-open] { display: block !important; }";
    document.head.append(popoverStyle);
  });
  afterAll(() => {
    Element.prototype.getAnimations = getAnimations;
    popoverStyle?.remove();
  });
  it("トリガーで開き、閉じる操作とEscapeで閉じてトリガーへフォーカスを戻す", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog
        title="編集内容の確認"
        description="この編集を終了します。"
        triggerLabel="セッション終了"
        closeLabel="閉じる"
        onOpenChange={onOpenChange}
        actions={
          <>
            <DialogCloseButton variant="text">キャンセル</DialogCloseButton>
            <DialogCloseButton variant="filled">終了する</DialogCloseButton>
          </>
        }
      >
        <p>保存後に一覧へ戻ります。</p>
      </Dialog>,
    );

    const trigger = screen.getByRole("button", { name: "セッション終了" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "編集内容の確認" });
    expect(dialog).toBeVisible();
    expect(dialog).toHaveAccessibleDescription("この編集を終了します。");
    expect(screen.getByText("保存後に一覧へ戻ります。")).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("アイコン閉じるボタンでも閉じることができる", async () => {
    const user = userEvent.setup();

    render(<Dialog title="詳細設定" triggerLabel="開く" closeLabel="ダイアログを閉じる" />);

    await user.click(screen.getByRole("button", { name: "開く" }));
    expect(screen.getByRole("dialog", { name: "詳細設定" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "ダイアログを閉じる" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
