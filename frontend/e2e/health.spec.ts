import { expect, test } from "@playwright/test";

test("トップページでバックエンドのヘルスステータスを表示・更新できる", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Realtime Voice" })).toBeVisible();
  await expect(page.getByText("Backend API")).toBeVisible();
  await expect(page.getByText("ok (realtime-voice-backend)")).toBeVisible();

  await page.getByRole("button", { name: "Refresh Status" }).click();
  await expect(page.getByText("ok (realtime-voice-backend)")).toBeVisible();
});
