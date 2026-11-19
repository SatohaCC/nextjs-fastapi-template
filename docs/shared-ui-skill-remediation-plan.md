# 共有 UI のスキル適合レビューと修正計画

確認日 2026-11-19。対象は PR #1 マージ後の `main`（`6d7144a`）。PR で追加した Checkbox、Dialog、RadioGroup、Select、Switch、TextField を中心に、共通の Button・Tabs・Badge・StatusCard、テーマ、StyleX の変換設定、Storybook とテストも確認した。この文書は修正着手前の計画書である。

## 判定

| 基準 | 適合している点 | 修正・検証が必要な点 |
| --- | --- | --- |
| ui-sdk | コンポーネント別の entry を使い、`Field`・各 primitive の parts・`render` を利用。既存の LTR キーボード操作、Dialog の Escape とフォーカス復帰、RTL での RadioGroup の矢印操作を確認した。 | 補足文やエラーの更新でコントロールが再マウントされる。RadioGroup のグループ側に無効状態が届かない経路がある。エージェントの操作契約を継続検証するテストと `ui-sdk` レイヤー宣言がない。 |
| Material Design 3 | 医療向けの明暗配色をセマンティックトークンで分離している。専用フォーカスリングと reduced motion があり、Switch の代表色のコントラストを確認した。 | Dialog と Switch の RTL 配置が崩れる。採用した仕様世代と色・形状・状態の対応表がなく、状態の組み合わせや文字拡大の合格根拠が不足している。 |
| StyleX | 本番コンポーネントの `stylex.create()` を `*.styles.ts` に分離。トークンは相対 import、`style` は `StyleXStyles`。Next.js の CSS 抽出と Storybook の描画が通過し、動的スタイルの CSS 変数も既存の単体テストで確認できる。 | Checkbox・Switch・RadioGroup では補足文の有無で `style` の適用先も変わる。動的な override のブラウザ計算値、状態の優先順位、CSS レイヤーの回帰テストを補う。 |

導入済みは `@ui-sdk/react` と `@ui-sdk/core` が `0.1.0-beta.2`、StyleX が `0.19.2`、Next.js が `16.4.6`。ui-sdk の契約は導入版の `docs/llms.txt`、Field・Radio・Switch・Select・Dialog 等のガイドと型を使用した。M3 の判定は既存の医療向けテーマを基準とし、従来 M3 の比較には公式 Material Web トークン版 `v0_192` を使用した。現行 M3 State layers ページは JavaScript 必須のため、数値は 11 月 15 日付のリポジトリ内の照合記録を参照した。 [ui-sdk スキル](../.agents/skills/ui-sdk/SKILL.md) · [M3 仕様照合記録](../.agents/skills/material-design-3/references/verification.md) · [Material Web の Switch トークン](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-switch.scss) · [StyleX スキル](../.agents/skills/stylex/SKILL.md)

## 1. 操作を妨げる回帰を修正する

### P1 · RTL で Dialog が画面外に出る

`insetInlineStart: 50%` と物理方向の `translate(-50%, -50%)` を組み合わせている。Storybook の `Dialog/Basic` を Chromium の幅 390 px で開くと、LTR の左右端は `16 / 374 px`、RTL は `-342 / 16 px` だった。Escape 後のトリガーへの復帰は両方向で機能した。 [Dialog.styles.ts](../frontend/src/shared/ui/dialog/Dialog.styles.ts#L11) · [WAI-ARIA Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

- **修正**　幅を決めたうえで左右の inset と自動マージンを使うなど、書字方向に依存しない中央配置へ変更する。モーダルの開閉・フォーカス管理は ui-sdk に任せる。
- **受入条件**　LTR・RTL の幅 320 px と 390 px で左右端がビューポート内に収まる。長文・大きな文字でも内容とアクションに到達できる。Tab／Shift+Tab の循環、Escape、トリガーへの復帰、指定した初期・最終フォーカスが機能する。

### P1 · 補足文やエラーを更新するとフォーカスと入力値が失われる

`aria-label` で名前を付けた RadioGroup で、非制御の初期値を `First`、操作後の選択を `Second` とし、`errorMessage` を追加して再描画すると `First` に戻り、フォーカスは `BODY` に移った。Checkbox と Switch でも、非制御の選択をオンにしてから `description` を追加すると DOM ノードが入れ替わり、オフへ戻った。各コンポーネントが表示用の props に応じて `Field` の有無を切り替えている。 [RadioGroup.tsx](../frontend/src/shared/ui/radio-group/RadioGroup.tsx#L147) · [Checkbox.tsx](../frontend/src/shared/ui/checkbox/Checkbox.tsx#L31) · [Switch.tsx](../frontend/src/shared/ui/switch/Switch.tsx#L17)

- **修正**　まず RadioGroup の検証情報を変更してもグループと各項目の DOM が維持される構造にする。次に Checkbox・Switch で補足文を出し入れしてもコントロールを維持する。外側の `Field` に組み込む用途、表示ラベルのクリック、フォーム送信、`style` の適用先を回帰テストで固定してから構造を選ぶ。
- **受入条件**　表示ラベル・`aria-label`・`aria-labelledby` の利用形態で、制御・非制御それぞれの値、フォーカス、利用者指定の `aria-describedby` が保たれる。RadioGroup は無効項目をキー操作でスキップする。Checkbox の既存の不確定表示と Switch の Space による切り替えも保つ。

### P2 · Switch のつまみが RTL でトラックから出る

配置の基準になる flex の始点は RTL で反転するが、`translateX()` は右向きのまま。Chromium で、RTL のつまみの右端がトラックをオフで 4 px、オンで 20 px 越えた。ライト・ダークで同じ結果だった。 [Switch.styles.ts](../frontend/src/shared/ui/switch/Switch.styles.ts#L107)

- **修正**　つまみの移動を論理方向へ対応させる。ベースの位置、つまみ幅、境界線を考慮し、左右それぞれの状態でトラック内に収める。
- **受入条件**　LTR・RTL でオン／オフの位置が鏡像になり、無効状態を含めてつまみがトラック内にある。Space とラベル操作に追従し、`prefers-reduced-motion: reduce` で遷移時間が `0s` になる。

## 2. 検証状態とアクセシブルな名前をそろえる

### P2 · 無効状態とエラー文の扱いが表示形態で変わる

表示ラベルとエラー文を持たない RadioGroup に `aria-label` と `invalid` を指定すると、個々の radio には `aria-invalid="true"` が付き、`radiogroup` には付かなかった。Checkbox の `invalid={false}` と `errorMessage` を併用すると、表示ラベル付きではエラー文が消え、単体表示では `aria-invalid="false"` のままエラー文が表示された。一方、既存の Invalid ストーリーでは Checkbox／RadioGroup／Select／TextField の `aria-describedby` がそれぞれ実在する説明とエラーへ解決された。 [RadioGroup.tsx](../frontend/src/shared/ui/radio-group/RadioGroup.tsx#L60) · [Checkbox.tsx](../frontend/src/shared/ui/checkbox/Checkbox.tsx#L30) · [Select.tsx](../frontend/src/shared/ui/select/Select.tsx#L164)

- **修正**　ui-sdk Field の `invalid` に合わせる。明示の `false` ではアプリから渡されたエラーの表示と参照を抑止し、`true` ではグループを含む操作対象に無効状態を伝える。省略時の `errorMessage` による推論と、ブラウザ側の required 等の制約検証を維持する。Checkbox・RadioGroup・Switch の表示ラベルなしの使い方を、外部 `Field` と ARIA での命名を含めて記載する。
- **受入条件**　表示ラベルあり／なし、`invalid` の指定なし／`true`／`false`、エラー文あり／なしについて、`aria-invalid`、表示、参照先、フォーカスを検証する。フォーム送信時の未入力、選択後の解除、親の `Field` の説明、`name` と送信値を確認する。Select の `FieldError match` は既存 Invalid ストーリーで関連付けに成功しており、テストで差を確認してから変更する。

### P2 · 名前から操作できることを回帰テストで保証する

既存のテストは DOM 操作と ARIA が中心で、アプリで使う bridge の接続点もない。テスト内で `createAgent()` を作った確認では、StatusCard の `Refresh Status` が名前付きで取得でき、`press` がコールバックを 1 回呼び出した。同じ確認がリポジトリのテストにはない。 [StatusCard.tsx](../frontend/src/shared/components/status-card/StatusCard.tsx#L36) · [エージェント向けテスト手順](../.agents/skills/ui-sdk/references/agent-ready.md#prove-it-with-a-test)

- **修正**　StatusCard と、実際に使う共有フォームの組み合わせを対象に、テスト内で `createAgent()` を作成する。フォームの入力と選択をコールバックまで追う。エージェント経由の失敗が確認できた操作から修正する。
- **受入条件**　対象の入力・切り替え・送信の名前と対応アクションが `snapshot()` に含まれ、`act()` で表示と利用側の状態が更新される。アプリでエージェント操作を提供する場合は、利用画面のクライアント境界で bridge を接続し、操作範囲を明示する。外部への WebMCP 公開は別途仕様を決める。

## 3. M3 の参照と StyleX の適用契約を記録する

### P2 · 採用した外観と検証条件を部品単位で追えるようにする

現行のテーマは `palette → tokens → *.styles.ts` で色を追える。一方、実際に採用した仕様と独自の調整値は一覧化されていない。例えば Switch の 52×32 px トラックと on/off のサイズは旧 Material Web と整合するが、オン状態の state layer は実装の `currentColor` が `onPrimary`、旧トークンは `primary`。色と state layer の形をどの仕様に合わせたかを先に明記する。 [tokens.stylex.ts](../frontend/src/shared/styles/tokens.stylex.ts#L52) · [Switch.styles.ts](../frontend/src/shared/ui/switch/Switch.styles.ts#L68) · [旧 Material Web の Switch トークン](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-switch.scss)

- **修正**　既存の医療向け配色を出発点に、Button の各 variant、Tabs、6 つの追加部品について、参照版・container／content／outline／state layer／focus／elevation と対応するロールを記録する。Storybook に不足する状態を足し、ブラウザで差を測ってからロールや数値を変更する。
- **受入条件**　明暗テーマで通常文字 4.5:1、大きな文字 3:1、識別に必要な非テキスト表示は隣接色と 3:1 を確認する。実際の合成後の色を使い、無効 UI 等の例外は理由を記録する。長い日本語、文字拡大 200%、狭幅、LTR／RTL、hover／focus-visible／press／disabled、reduced motion を対象部品に応じて確認する。 [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [文字サイズの変更](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)

参考として現行の Switch の通常状態では、Chromium で取得したつまみとトラックの色から、オフでライト 3.45:1／ダーク 3.76:1、オンでライト 6.36:1／ダーク 7.72:1 を得た。対象はつまみとトラックの組み合わせで、操作状態と全コンポーネントの測色は今後の検証に含める。

### P3 · CSS レイヤーと呼び出し元の `style` を検証する

共通の `globals.css` は `reset` と `@stylex` を宣言し、ui-sdk スキル指定の `ui-sdk` レイヤー宣言はない。現在 `web.css` を読み込んでいないため、これによる描画不具合は観測していない。Next.js は Babel と PostCSS の抽出、Storybook と Vitest は独自の Vite 変換経路を通る。 [globals.css](../frontend/src/app/globals.css#L1) · [PostCSS 設定](../frontend/postcss.config.mjs#L7) · [Vite の StyleX 変換](../frontend/config/stylexVitePlugin.ts#L4) · [StyleX の `props()`](https://stylexjs.com/docs/api/javascript/props/)

- **修正**　アプリと Storybook が共用する CSS の先頭で `ui-sdk` と `reset` の順序を明示し、既存の cascade を確認する。状態スタイルの修正では、導入版が公開する状態属性と StyleX の条件合成を利用する。動的な値の `className` と `style` は組で扱い、単体表示・Field 付き表示・Dialog 本体で override が届く部位を公開契約として記録する。
- **受入条件**　Storybook で代表的な動的幅の `getComputedStyle()` が指定値になり、通常スタイルと override の優先順位が保たれる。Checkbox・Switch の単体と Field 付き、および Dialog を検証対象にする。Next.js のビルドでも CSS が抽出され、実際に表示する共有 UI に適用される。Vitest 用の StyleX 定義はテスト fixture として扱い、スタイルファイル分離の判断は実行コードと区別する。

## 着手順と完了条件

1. **RTL と再マウント**　Dialog、RadioGroup、Switch と Checkbox の再現ケースを固定し、配置とフォーカス・値保持を修正する。Dialog／Switch のスタイル変更と、フォーム部品の構造変更を独立して検証できる単位にする。
2. **フォームとエージェントの契約**　エラーの振る舞いをそろえ、フォーム送信と `snapshot()`／`act()` のテストを追加する。
3. **外観とスタイル出力**　参照版・ロール対応・例外を記録し、確認できた外観の差を修正する。Storybook のブラウザテストに RTL、長文、ズーム、動的スタイルの計算値を追加する。
4. **統合確認**　`pnpm check`、`pnpm test`、`pnpm build`、`pnpm test:storybook` を実行する。Next.js の実画面を変えた場合は `pnpm test:e2e` も実行する。次のレビューで再現テスト、ブラウザ結果、採用した仕様版と未確認範囲を照合する。 [共有 UI 設計規約](../.agents/rules/frontend-shared-ui.md)

## 今回の検証記録

| 実行 | 結果 |
| --- | --- |
| `pnpm check`、`pnpm build` | 各終了コード `0`。静的ページ生成まで完了。 |
| `pnpm test` | 終了コード `0`。スクリプト 5 件、フロントエンド 28 件、バックエンド 1 件。 |
| `pnpm build-storybook`、`pnpm --filter frontend exec playwright test --config playwright.storybook.config.ts` | 各終了コード `0`。Chromium の既存ブラウザテスト 4 件を通過。 |
| 追加の Chromium 確認と一時的な Vitest 確認 | 再実行は終了コード `0`。表の不具合を DOM・位置・値から確認した。一時テストの初回は jsdom に `getAnimations` がなく終了コード `1`。既存テスト同様のスタブを置いて再実行した。 |

未確認範囲は実機スクリーンリーダー、他ブラウザ、SSR 後の hydration の部品別確認、200% の文字拡大、全状態のコントラスト、Next.js E2E。既存テストの通過に加え、ここで再現した RTL と値保持の不具合を受入条件に沿って検証する。

## 対応完了記録（2026-11-19）

本計画書の P1〜P3 を対応し、公開契約と実測結果を [shared-ui-design-contract.md](./shared-ui-design-contract.md) にまとめた。

| 項目 | 主な変更・確認内容 |
| --- | --- |
| P1 · Dialog RTL / 200%拡大 | `inset: 0; margin: auto; height: fit-content; overflowY: "auto"` へ変更し、Storybook Playwright で LTR/RTL（320px / 390px）、Tab/Shift+Tab 循環、Escape、200%拡大操作を確認。 |
| P1 · 再マウント防止 | `Checkbox`・`Switch`・`RadioGroup` で外部 `Field` 非利用時は常に内部 `Field` 構造を保ち、項目側の入れ子 `Field` を解消。`description` / `errorMessage` 更新時の値・フォーカス・外部 `aria-describedby` 保持を単体テストで固定。 |
| P2 · Switch RTL / hover 測色 | つまみ配置を `insetInlineStart` へ変更し、オフ時の hover/focus/active つまみ色を `onSurfaceVariant` へ調整。Chromium で LTR/RTL 鏡像配置と明暗コントラスト（≥ 3.0）を確認。 |
| P2 · 検証状態と名前操作 | `Select` の `FieldError match` を外して `invalid={false}` 抑止を統一。`TextField` の不要な `InputGroup` ラップと `Dialog` の二重ボタン登録を解消し、`StatusCard` と共有フォームの `createAgent()` 回帰テストを追加。 |
| P3 · CSS レイヤーと `style` 契約 | `globals.css` 先頭に `@layer ui-sdk, reset;` と非表示契約を追加。`Checkbox`・`Switch`・`Dialog` の動的 `style` オーバーライドのブラウザ `getComputedStyle()` を検証。 |
| 最終検証 | `pnpm check`（exit `0`）、`pnpm test`（exit `0`: scripts 5 / frontend 42 / backend 1）、`pnpm build`（exit `0`）、`pnpm test:storybook`（exit `0`: Playwright 8 件）を通過。実機スクリーンリーダー、Firefox/Safari、Next.js E2E（実画面変更なしのため対象外）は未実施。 |
