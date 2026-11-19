# バージョン管理（Git）ルール

- このリポジトリは **Git** で管理する（Jujutsu / `jj` は廃止済み）。
- 状態確認・履歴操作には標準の `git` コマンド（`git status`, `git diff`, `git log`, `git switch`, `git commit` 等）を使う。

## 作業開始と変更の確認

- 作業前に `git status`、`git diff`、`git log -n 10 --oneline` で現在の変更とブランチを確認する。既存のユーザー変更を保持し、依頼された作業の範囲を区別する。
- `git checkout --` / `git reset --hard` / `git clean` 等で既存変更を消去したりエラーを隠蔽したりしない。

## コミットと変更の分離

- コミット時は `git diff` / `git status` で対象を確認し、依頼外の変更や不要ファイルを混ぜない。
- コミットメッセージは **Conventional Commits の形式で、説明を日本語** にする。例: `feat(ui): 共有UIコンポーネントを追加`。
- 本文を付ける場合も日本語で、変更理由や必要な補足を書き、ローカルの絶対パスや秘密情報を含めない。

## 検査と不要ファイルの除外

- コミット前に `pnpm check:paths`・関連する lint / 型チェック / テストを実行して通過を確認する。
- `.venv`、キャッシュ、実行ログ、ローカルの絶対パスを含めない。

## リモート操作

- `git push` はユーザーから明示的に依頼・承認された場合のみ行う。
- push 前に `pnpm check` と対象ブランチを確認し、`git push <remote> <branch>` のように対象を明示する。
