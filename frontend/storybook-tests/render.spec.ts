import { expect, test } from "@playwright/test";

test("タブは明暗テーマ・狭い幅でも選択でき、フォーカスと下線を表示する", async ({
  page,
}, testInfo) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 640 });
    for (const variant of ["primary", "secondary"]) {
      await page.goto(`/iframe.html?id=shared-ui-tabs--${variant}&viewMode=story`);
      const first = page.getByRole("tab", { name: "概要" });
      await expect(first).toHaveAttribute("aria-selected", "true");
      await expect(first).toHaveCSS("border-top-width", "0px");
      await expect(page.getByRole("tablist")).toHaveCSS("border-bottom-width", "1px");
      await first.focus();
      await expect(first).toHaveCSS("outline-style", "solid");
      await page.keyboard.press("ArrowRight");
      const second = page.getByRole("tab", { name: "詳細" });
      await expect(second).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tabpanel", { name: "詳細" })).toBeVisible();
      const indicator = variant === "primary" ? second.locator("span") : second;
      expect(await indicator.evaluate((el) => getComputedStyle(el, "::after").height)).toBe(
        variant === "primary" ? "3px" : "2px",
      );
      await page.screenshot({ path: testInfo.outputPath(`tabs-${variant}-${colorScheme}.png`) });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    }
    await page.goto("/iframe.html?id=shared-ui-tabs--scrollable&viewMode=story");
    const list = page.getByRole("tablist");
    expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});

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

test("TextField・Switch・Checkbox・Select・Dialogが明暗テーマと狭い幅で正しく動作しフォーカスを表示する", async ({
  page,
}, testInfo) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 640 });

    await page.goto("/iframe.html?id=shared-ui-textfield--invalid&viewMode=story");
    const input = page.getByRole("textbox", { name: /連絡先メールアドレス/ });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await input.focus();
    await expect(page.getByText("正しい形式のメールアドレスを入力してください。")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);

    await page.goto("/iframe.html?id=shared-ui-switch--off&viewMode=story");
    const switchEl = page.getByRole("switch", { name: "自動保存" });
    await switchEl.focus();
    await expect(switchEl).toHaveCSS("outline-style", "solid");
    await switchEl.click();
    await expect(switchEl).toHaveAttribute("aria-checked", "true");

    await page.goto("/iframe.html?id=shared-ui-checkbox--indeterminate&viewMode=story");
    const checkbox = page.getByRole("checkbox", { name: "すべての項目を選択" });
    await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    await checkbox.focus();
    await expect(checkbox).toHaveCSS("outline-style", "solid");
    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "true");

    await page.goto("/iframe.html?id=shared-ui-select--outlined&viewMode=story");
    const combobox = page.getByRole("combobox", { name: /カテゴリ/ });
    await combobox.focus();
    await expect(combobox).toHaveCSS("outline-style", "solid");
    await combobox.click();
    await page.getByRole("option", { name: "開発" }).click();
    await expect(combobox).toHaveText(/開発/);

    await page.goto("/iframe.html?id=shared-ui-dialog--basic&viewMode=story");
    const trigger = page.getByRole("button", { name: "編集を終了" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "編集を終了しますか？" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("border-top-width", "1px");
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`dialog-${colorScheme}.png`) });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.goto("/iframe.html?id=shared-ui-radiogroup--basic&viewMode=story");
    const radio = page.getByRole("radio", { name: /即時処理/ });
    await expect(radio).toHaveAttribute("aria-checked", "true");
    await expect(radio.locator("span").first()).toHaveCSS("transition-duration", "0s");
    await radio.focus();
    await expect(radio).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("radio", { name: /一括処理/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});
