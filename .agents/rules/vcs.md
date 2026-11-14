# バージョン管理（Jujutsu / jj）ルール

- このリポジトリは **Jujutsu (`jj`)**（Git 共存 `--colocate` モード）で管理する。
- 状態確認・履歴操作には `git` ではなく `jj`（`jj status`, `jj log`, `jj new`, `jj describe`, `jj commit`, `jj bookmark` 等）を使う。
- 馴染みのないオプションを使う前は `jj <subcommand> --help` で確認する。

## 作業開始と変更の確認

- 作業前に `jj status`、`jj diff --summary`、必要な範囲の `jj log` で現在の変更・親・bookmarkを確認する。既存のユーザー変更を保持し、依頼した作業の範囲を区別する。
- `jj` は多くのコマンドで作業ツリーを自動スナップショットする。スナップショットは、変更を完成させたり外部へ公開したりする許可とは区別する。保存済み状態だけを確認するときは `--ignore-working-copy` を使えるが、最新ファイルの検証には使わない。
- Gitのステージングを作業単位にしない。`git add` / `git commit` / `git checkout` / `git reset` 等で履歴や作業ツリーを並行して操作せず、`jj` の変更・revision・bookmarkで扱う。
- 既存の検査スクリプトが使うGitの読み取りコマンドや、Gitフックのローカル設定は許容する。GitのインデックスをJujutsuのコミット対象とみなさない。
- `jj` が利用できない場合は、その事実を伝える。履歴操作を勝手にGitへ切り替えず、コード編集や履歴操作に依存しない検証は進めてよい。

## コミットと変更の分離

- コミットを依頼されたときは `jj diff` で対象を確認し、依頼外の変更を混ぜない。変更が混在している場合は、現在のCLIのヘルプを確認してfilesetや `jj split` 等で分離する。無条件にすべての変更を確定しない。
- 検証後に `jj commit -m "<メッセージ>"` 等、目的に合う操作を選ぶ。`jj describe` は現在の変更の説明を更新し、`jj new` は新しい変更を作る操作として区別する。
- コミットメッセージは **Conventional Commitsの形式で、説明を日本語** にする。例: `chore: 初期テンプレートを整備`。
- 作業用bookmarkが必要なら、既存の運用を確認し、新規名は原則 `codex/` を接頭辞にする。Gitのbranchと同様に自動で移動すると仮定せず、`jj bookmark list` で対象revisionを確認する。
- `jj abandon` / `jj restore` / `jj undo` / `jj op restore` / 広範なrebase等を、既存変更の消去やエラーの隠蔽に使わない。影響するrevisionと作業ツリーを確認し、依頼の範囲内で行う。

## 検査と不要ファイルの除外

- `jj` の操作では Git フック（`pre-commit` / `pre-push`）が自動実行されないため、必要に応じて `pnpm check` や関連テストで検証する（最終的な検証は CI でも行う）。
- `.venv`、キャッシュ、実行ログ、ローカルの絶対パスを含めない。追跡済みの不要ファイルは `jj file untrack <対象>` で追跡を外す。
- 最終差分・競合・説明・bookmark を確認し、実行した検証と未実行の検証を区別して報告する。

## リモート操作

- リモート操作は `jj git fetch` / `jj git push` を使い、push はユーザーから明示的に依頼・承認された場合のみ行う。
- push 前に `pnpm check`、送信する bookmark / revision、履歴にローカルパスや競合が残っていないかを確認する。
- `jj git push --remote <remote> --bookmark <bookmark>` のように対象を明示し、`--all` を既定にしない。
