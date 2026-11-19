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

test("DialogがLTR・RTLの幅320px/390pxで中央に収まり、Tab循環と200%拡大でも操作できる", async ({
  page,
}) => {
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

      const box = await dialog.boundingBox();
      expect(box).not.toBeNull();
      if (!box) throw new Error("Dialog bounding box is null");
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(Math.abs(box.x - (width - (box.x + box.width)))).toBeLessThanOrEqual(2);

      // Tab / Shift+Tab でフォーカスがダイアログ内に循環することを確認する。
      const focusableCount = await dialog.evaluate(
        (el) => el.querySelectorAll<HTMLElement>("button, [href], input, select, textarea").length,
      );
      expect(focusableCount).toBeGreaterThanOrEqual(3);
      for (let i = 0; i < focusableCount + 1; i += 1) {
        await page.keyboard.press("Tab");
        expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
      }
      await page.keyboard.press("Shift+Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  }

  // 200%文字拡大時でも長文スクロール領域とアクションボタンに到達できることを確認する。
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto("/iframe.html?id=shared-ui-dialog--scrollable-body&viewMode=story");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "32px";
  });
  const dialog = page.getByRole("dialog", { name: "利用規約の確認" });
  await expect(dialog).toBeVisible();
  const confirmButton = dialog.getByRole("button", { name: "終了して保存" });
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();
  await expect(dialog).toBeHidden();
});

test("SwitchがLTR・RTLで鏡像配置され、全状態でつまみがトラック内に収まる", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 640 });

  for (const story of ["off", "on", "disabled-off", "disabled-on"] as const) {
    const rects: Record<"ltr" | "rtl", { track: DOMRect; thumb: DOMRect }> = {} as Record<
      "ltr" | "rtl",
      { track: DOMRect; thumb: DOMRect }
    >;

    for (const dir of ["ltr", "rtl"] as const) {
      await page.goto(`/iframe.html?id=shared-ui-switch--${story}&viewMode=story`);
      await page.evaluate((direction) => {
        document.documentElement.dir = direction;
      }, dir);

      const sw = page.getByRole("switch", { name: "自動保存" });
      const thumb = sw.locator('[data-slot="switch-thumb"]');
      await expect(thumb).toHaveCSS("transition-duration", "0s");

      const trackBox = await sw.boundingBox();
      const thumbBox = await thumb.boundingBox();
      expect(trackBox).not.toBeNull();
      expect(thumbBox).not.toBeNull();
      if (!trackBox || !thumbBox) throw new Error("Switch bounding box is null");

      // 境界線2pxの内側に収まっていることを確認する。
      expect(thumbBox.x).toBeGreaterThanOrEqual(trackBox.x + 2);
      expect(thumbBox.x + thumbBox.width).toBeLessThanOrEqual(trackBox.x + trackBox.width - 2);
      expect(thumbBox.y).toBeGreaterThanOrEqual(trackBox.y + 2);
      expect(thumbBox.y + thumbBox.height).toBeLessThanOrEqual(trackBox.y + trackBox.height - 2);

      rects[dir] = {
        track: trackBox as unknown as DOMRect,
        thumb: thumbBox as unknown as DOMRect,
      };
    }

    const ltrStartGap = rects.ltr.thumb.x - rects.ltr.track.x;
    const rtlStartGap =
      rects.rtl.track.x + rects.rtl.track.width - (rects.rtl.thumb.x + rects.rtl.thumb.width);
    expect(Math.abs(ltrStartGap - rtlStartGap)).toBeLessThanOrEqual(1);
  }

  // Spaceキーとラベルクリックで切り替わることを確認する。
  await page.goto("/iframe.html?id=shared-ui-switch--off&viewMode=story");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const sw = page.getByRole("switch", { name: "自動保存" });
  await sw.focus();
  await page.keyboard.press("Space");
  await expect(sw).toHaveAttribute("aria-checked", "true");
  await page.getByText("自動保存").click();
  await expect(sw).toHaveAttribute("aria-checked", "false");
});

test("動的StyleXオーバーライドとCSSレイヤー順序がブラウザ計算値に反映される", async ({ page }) => {
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

  const hasLayers = await page.evaluate(() => {
    const texts: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule.cssText.includes("@layer")) {
            texts.push(rule.cssText);
          }
        }
      } catch {
        // 外部シートは無視する。
      }
    }
    return texts.some((text) => text.includes("ui-sdk"));
  });
  expect(hasLayers).toBe(true);
});

test("明暗テーマで操作状態を含む実測コントラストと200%文字拡大レイアウトを満たす", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("2d canvas context unavailable");

    const parseCssColor = (css: string): [number, number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      return [data[0], data[1], data[2], data[3] / 255];
    };

    const composite = (
      fg: [number, number, number, number],
      bg: [number, number, number],
    ): [number, number, number] => {
      const a = fg[3];
      return [
        Math.round(fg[0] * a + bg[0] * (1 - a)),
        Math.round(fg[1] * a + bg[1] * (1 - a)),
        Math.round(fg[2] * a + bg[2] * (1 - a)),
      ];
    };

    const luminance = ([r, g, b]: [number, number, number]) => {
      const [R, G, B] = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };

    const ratio = (c1: [number, number, number], c2: [number, number, number]) => {
      const l1 = luminance(c1);
      const l2 = luminance(c2);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    const resolveEffectiveBg = (el: Element): [number, number, number] => {
      const chain: Element[] = [];
      let cur: Element | null = el;
      while (cur) {
        chain.unshift(cur);
        cur = cur.parentElement;
      }
      let acc: [number, number, number] = [255, 255, 255];
      for (const node of chain) {
        const style = getComputedStyle(node);
        const bg = parseCssColor(style.backgroundColor);
        if (bg[3] > 0) {
          acc = composite(bg, acc);
        }
        const img = style.backgroundImage;
        if (img?.startsWith("linear-gradient(")) {
          const inner = img.slice("linear-gradient(".length, -1);
          const firstStop = inner.split(/,(?![^(]*\))/)[0]?.trim();
          if (firstStop) {
            const stopColor = parseCssColor(firstStop);
            if (stopColor[3] > 0) {
              acc = composite(stopColor, acc);
            }
          }
        }
      }
      return acc;
    };

    (window as unknown as Record<string, unknown>).__contrastHelper = {
      measureTextContrast: (el: Element) => {
        const bg = resolveEffectiveBg(el);
        const fg = composite(parseCssColor(getComputedStyle(el).color), bg);
        return ratio(fg, bg);
      },
      measureThumbContrast: (track: Element) => {
        const thumb = track.querySelector('[data-slot="switch-thumb"]');
        if (!thumb) throw new Error("switch-thumb not found");
        const trackBg = resolveEffectiveBg(track);
        const thumbBg = composite(parseCssColor(getComputedStyle(thumb).backgroundColor), trackBg);
        return ratio(thumbBg, trackBg);
      },
    };
  });

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 640 });

    // Switch: 通常・hoverのコントラスト比（>= 3.0）
    for (const story of ["off", "on"] as const) {
      await page.goto(`/iframe.html?id=shared-ui-switch--${story}&viewMode=story`);
      const sw = page.getByRole("switch", { name: "自動保存" });
      await sw.hover();
      const contrast = await sw.evaluate((el) => {
        const helper = (
          window as unknown as {
            __contrastHelper: { measureThumbContrast: (node: Element) => number };
          }
        ).__contrastHelper;
        return helper.measureThumbContrast(el);
      });
      expect(contrast, `Switch ${story} hover (${colorScheme})`).toBeGreaterThanOrEqual(3);
    }

    // Button バリアント表: 通常テキスト (>= 4.5)
    await page.goto("/iframe.html?id=shared-ui-button--variants&viewMode=story");
    for (const name of ["Elevated", "Filled", "Tonal", "Outlined", "Text"]) {
      const btn = page.getByRole("button", { name, exact: true }).first();
      await btn.hover();
      const contrast = await btn.evaluate((el) => {
        const helper = (
          window as unknown as {
            __contrastHelper: { measureTextContrast: (node: Element) => number };
          }
        ).__contrastHelper;
        return helper.measureTextContrast(el);
      });
      expect(contrast, `Button ${name} hover (${colorScheme})`).toBeGreaterThanOrEqual(4.5);
    }

    // Badge 各トーン: 通常テキスト (>= 4.5)
    for (const tone of ["neutral", "success", "danger"] as const) {
      await page.goto(`/iframe.html?id=shared-ui-badge--${tone}&viewMode=story`);
      const contrast = await page.locator("#storybook-root span").evaluate((el) => {
        const helper = (
          window as unknown as {
            __contrastHelper: { measureTextContrast: (node: Element) => number };
          }
        ).__contrastHelper;
        return helper.measureTextContrast(el);
      });
      expect(contrast, `Badge ${tone} (${colorScheme})`).toBeGreaterThanOrEqual(4.5);
    }

    // 200%文字拡大時でも長文フォームが横溢れしないことを確認する。
    for (const storyId of [
      "shared-ui-textfield--with-affix",
      "shared-ui-select--outlined",
      "shared-ui-radiogroup--basic",
      "shared-ui-checkbox--checked",
    ]) {
      await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "32px";
      });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `200% zoom overflow in ${storyId} (${colorScheme})`,
      ).toBe(true);
    }
  }
});
