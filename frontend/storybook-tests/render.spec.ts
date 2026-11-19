import { expect, type Locator, test } from "@playwright/test";
import { measureContrast } from "./contrast";

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
      const firstChild = root.locator(":scope > *").first();
      await expect(firstChild).toBeVisible();
      await expect(firstChild).toHaveAttribute("class", /\S+/);
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

test("DialogはLTR・RTLの狭い画面でも中央に収まる", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const dir of ["ltr", "rtl"] as const) {
    for (const width of [320, 390] as const) {
      await page.setViewportSize({ width, height: 640 });
      await page.goto("/iframe.html?id=shared-ui-dialog--basic&viewMode=story");
      await page.evaluate((direction) => {
        document.documentElement.dir = direction;
      }, dir);

      const trigger = page.getByRole("button", { name: "編集を終了" });
      await trigger.click();

      const dialog = page.getByRole("dialog", { name: "編集を終了しますか？" });
      await expect(dialog).toBeVisible();

      const { left, right } = await dialog.evaluate((el) => {
        const bounds = el.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right };
      });
      expect(left).toBeGreaterThanOrEqual(0);
      expect(right).toBeLessThanOrEqual(width);
      expect(Math.abs(left - (width - right))).toBeLessThanOrEqual(2);
    }
  }
});

test("DialogはTabを両方向に循環させ、Escapeでトリガーに戻る", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 640 });

  for (const direction of ["ltr", "rtl"] as const) {
    await test.step(direction, async () => {
      await page.goto("/iframe.html?id=shared-ui-dialog--basic&viewMode=story");
      await page.evaluate((dir) => {
        document.documentElement.dir = dir;
      }, direction);
      const trigger = page.getByRole("button", { name: "編集を終了", exact: true });
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "編集を終了しますか？" });
      const close = dialog.getByRole("button", { name: "閉じる", exact: true });
      const cancel = dialog.getByRole("button", { name: "キャンセル" });
      const confirm = dialog.getByRole("button", { name: "終了して保存" });
      await expect(close).toBeFocused();

      for (const target of [cancel, confirm, close]) {
        await page.keyboard.press("Tab");
        await expect(target).toBeFocused();
      }

      for (const target of [confirm, cancel, close]) {
        await page.keyboard.press("Shift+Tab");
        await expect(target).toBeFocused();
      }

      await page.keyboard.press("Escape");

      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    });
  }
});

test("Dialogは200%文字拡大時も確定ボタンで閉じられる", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto("/iframe.html?id=shared-ui-dialog--scrollable-body&viewMode=story");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "32px";
  });
  const dialog = page.getByRole("dialog", { name: "利用規約の確認" });
  await expect(dialog).toBeVisible();
  const confirmButton = dialog.getByRole("button", { name: "終了して保存" });

  await confirmButton.click();

  await expect(dialog).toBeHidden();
});

function measureSwitchThumb(control: Locator) {
  return control.evaluate((track) => {
    const thumb = track.querySelector('[data-slot="switch-thumb"]');
    if (!thumb) throw new Error("Switch のつまみが見つかりません");
    const trackBox = track.getBoundingClientRect();
    const thumbBox = thumb.getBoundingClientRect();
    const leftGap = thumbBox.left - trackBox.left;
    const rightGap = trackBox.right - thumbBox.right;

    return {
      inlineStart: getComputedStyle(track).direction === "rtl" ? rightGap : leftGap,
      left: leftGap,
      right: rightGap,
      top: thumbBox.top - trackBox.top,
      bottom: trackBox.bottom - thumbBox.bottom,
    };
  });
}

test("SwitchがLTR・RTLで鏡像配置され、全状態でつまみがトラック内に収まる", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 640 });

  for (const story of ["off", "on", "disabled-off", "disabled-on"] as const) {
    const offsets: number[] = [];

    for (const dir of ["ltr", "rtl"] as const) {
      await page.goto(`/iframe.html?id=shared-ui-switch--${story}&viewMode=story`);
      await page.evaluate((direction) => {
        document.documentElement.dir = direction;
      }, dir);

      const sw = page.getByRole("switch", { name: "自動保存" });
      const thumb = sw.locator('[data-slot="switch-thumb"]');
      await expect(sw).toHaveAttribute("aria-checked", String(story.endsWith("on")));
      await expect(thumb).toBeVisible();
      await expect(thumb).toHaveCSS("transition-duration", "0s");

      const position = await measureSwitchThumb(sw);

      // 境界線2pxの内側に収まっていることを確認する。
      expect(
        Math.min(position.left, position.right, position.top, position.bottom),
      ).toBeGreaterThanOrEqual(2);
      offsets.push(position.inlineStart);
    }

    const [ltrOffset, rtlOffset] = offsets;
    expect(Math.abs(ltrOffset - rtlOffset)).toBeLessThanOrEqual(1);
  }
});

test("SwitchのつまみはSpaceキーとラベル操作でLTR・RTLの両方向に移動する", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 640 });

  for (const direction of ["ltr", "rtl"] as const) {
    await test.step(direction, async () => {
      await page.goto("/iframe.html?id=shared-ui-switch--off&viewMode=story");
      await page.evaluate((dir) => {
        document.documentElement.dir = dir;
      }, direction);
      const control = page.getByRole("switch", { name: "自動保存" });
      await expect(control).toHaveAttribute("aria-checked", "false");
      const uncheckedOffset = (await measureSwitchThumb(control)).inlineStart;

      await control.press("Space");

      await expect(control).toHaveAttribute("aria-checked", "true");
      expect((await measureSwitchThumb(control)).inlineStart).toBeGreaterThan(uncheckedOffset);

      await page.getByText("自動保存", { exact: true }).click();

      await expect(control).toHaveAttribute("aria-checked", "false");
      const restoredOffset = (await measureSwitchThumb(control)).inlineStart;
      expect(Math.abs(restoredOffset - uncheckedOffset)).toBeLessThanOrEqual(1);
    });
  }
});

test("動的StyleXオーバーライドが対象部位の幅に反映される", async ({ page }) => {
  await page.goto("/iframe.html?id=shared-ui-checkbox--dynamic-width-standalone&viewMode=story");
  const standaloneCb = page.getByRole("checkbox", { name: "幅指定チェックボックス" });
  await expect(standaloneCb).toHaveCSS("width", "280px");

  await page.goto("/iframe.html?id=shared-ui-checkbox--dynamic-width-field&viewMode=story");
  await expect(page.locator('[data-slot="field"]')).toHaveCSS("width", "280px");

  await page.goto("/iframe.html?id=shared-ui-switch--dynamic-width-standalone&viewMode=story");
  const standaloneSw = page.getByRole("switch", { name: "幅指定スイッチ" });
  await expect(standaloneSw).toHaveCSS("width", "104px");

  await page.goto("/iframe.html?id=shared-ui-switch--dynamic-width-field&viewMode=story");
  await expect(page.locator('[data-slot="field"]')).toHaveCSS("width", "280px");

  await page.goto("/iframe.html?id=shared-ui-dialog--dynamic-width&viewMode=story");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveCSS("width", "300px");
});

test("CSSレイヤーでは通常宣言のresetがui-sdkより優先され、hiddenは非表示になる", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=shared-ui-dialog--dynamic-width&viewMode=story");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.dataset.testid = "layer-order-probe";
    probe.dataset.slot = "layer-order-probe";
    probe.hidden = true;
    document.body.append(probe);
  });

  // 先にresetを書き、アプリ側のレイヤー順がない場合に期待値を満たさないようにする。
  await page.addStyleTag({
    content: `
      @layer reset { [data-testid="layer-order-probe"] { color: rgb(0, 128, 0); display: block; } }
      @layer ui-sdk { [data-testid="layer-order-probe"] { color: rgb(255, 0, 0); } }
    `,
  });

  const probe = page.getByTestId("layer-order-probe");
  await expect(probe).toHaveCSS("color", "rgb(0, 128, 0)");
  await expect(probe).toHaveCSS("display", "none");
});

test("Switchのつまみとトラックを明暗テーマの通常・ホバー状態で見分けられる", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });

    for (const story of ["off", "on"] as const) {
      await test.step(`${colorScheme} / ${story}`, async () => {
        await page.goto(`/iframe.html?id=shared-ui-switch--${story}&viewMode=story`);
        await page.mouse.move(0, 0);
        const control = page.getByRole("switch", { name: "自動保存" });
        await expect(control.locator('[data-slot="switch-thumb"]')).toBeVisible();
        const normalContrast = await control.evaluate(measureContrast, "switch-thumb" as const);

        await control.hover();

        const hoveredContrast = await control.evaluate(measureContrast, "switch-thumb" as const);
        expect(normalContrast, "通常状態のコントラスト").toBeGreaterThanOrEqual(3);
        expect(hoveredContrast, "ホバー状態のコントラスト").toBeGreaterThanOrEqual(3);
      });
    }
  }
});

test("ButtonとBadgeの文字は明暗テーマで背景と十分に区別できる", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/iframe.html?id=shared-ui-button--variants&viewMode=story");

    for (const name of ["Elevated", "Filled", "Tonal", "Outlined", "Text"]) {
      await test.step(`${colorScheme} / Button ${name}`, async () => {
        await page.mouse.move(0, 0);
        const button = page.getByRole("button", { name, exact: true }).first();
        await expect(button).toBeVisible();
        const normalContrast = await button.evaluate(measureContrast, "text" as const);

        await button.hover();

        const hoveredContrast = await button.evaluate(measureContrast, "text" as const);
        expect(normalContrast, "通常状態のコントラスト").toBeGreaterThanOrEqual(4.5);
        expect(hoveredContrast, "ホバー状態のコントラスト").toBeGreaterThanOrEqual(4.5);
      });
    }

    for (const tone of ["neutral", "success", "danger"] as const) {
      await test.step(`${colorScheme} / Badge ${tone}`, async () => {
        await page.goto(`/iframe.html?id=shared-ui-badge--${tone}&viewMode=story`);
        const badge = page.locator("#storybook-root span");
        await expect(badge).toBeVisible();

        const contrast = await badge.evaluate(measureContrast, "text" as const);

        expect(contrast).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

test("フォーム部品は明暗テーマの200%文字拡大時も横にはみ出さない", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });

    for (const storyId of [
      "shared-ui-textfield--with-affix",
      "shared-ui-select--outlined",
      "shared-ui-radiogroup--basic",
      "shared-ui-checkbox--checked",
    ]) {
      await test.step(`${colorScheme} / ${storyId}`, async () => {
        await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
        await expect(page.locator("#storybook-root > *").first()).toBeVisible();

        await page.evaluate(() => {
          document.documentElement.style.fontSize = "32px";
        });

        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
      });
    }
  }
});
