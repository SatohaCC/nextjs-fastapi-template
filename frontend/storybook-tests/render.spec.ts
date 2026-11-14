import { expect, test } from "@playwright/test";

test("すべてのストーリーを描画でき、StyleXのスタイルが適用される", async ({ page, request }) => {
  const response = await request.get("/index.json");
  expect(response.ok()).toBeTruthy();
  const index = (await response.json()) as {
    entries: Record<string, { id: string; type: string }>;
  };
  const stories = Object.values(index.entries).filter((entry) => entry.type === "story");
  expect(stories.length).toBeGreaterThan(0);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (const story of stories) {
    await test.step(story.id, async () => {
      await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`);
      const root = page.locator("#storybook-root");
      await expect(root).toBeVisible();
      await expect(root).not.toBeEmpty();
      await expect(root.locator(":scope > *").first()).toHaveAttribute("class", /\S+/);
      await expect(page.locator("body")).not.toContainText("Unexpected 'stylex.");
      expect(errors).toEqual([]);
    });
  }

  await page.goto("/iframe.html?id=shared-ui-badge--success&viewMode=story");
  await expect(page.locator("#storybook-root span")).toHaveCSS("display", "inline-flex");
});

test("ボタン比較に全バリアント・サイズ・無効状態があり、キーボードフォーカスを表示する", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=shared-ui-button--variants&viewMode=story");
  const table = page.getByRole("table", { name: "ボタンのバリアントと状態の比較" });
  await expect(table).toBeVisible();
  for (const name of ["Elevated", "Filled", "Tonal", "Outlined", "Text"]) {
    await expect(table.getByRole("button", { name, exact: true })).toHaveCount(3);
    await expect(table.getByRole("button", { name, exact: true }).last()).toBeDisabled();
  }
  await page.keyboard.press("Tab");
  const button = table.getByRole("button", { name: "Filled", exact: true }).first();
  await button.focus();
  await expect(button).toHaveCSS("outline-style", "solid");
  await expect(button).toBeEnabled();
});
