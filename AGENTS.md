# プロジェクトの作業ルール

このリポジトリで作業するときは、対象に応じて以下の規約を読む。

- コメント・docstring: [.agents/rules/coding-style.md](.agents/rules/coding-style.md)
- Backend: [.agents/rules/backend-architecture.md](.agents/rules/backend-architecture.md)
- Frontendの共有UI: [.agents/rules/frontend-shared-ui.md](.agents/rules/frontend-shared-ui.md)

`frontend/` を変更する場合は、その配下の `AGENTS.md` も読む。プロジェクト固有のSkillは `.agents/skills/` にある。

## 開発作業

- このリポジトリへの変更を伴う開発作業は、着手時に [dev-workflow Skill](.agents/skills/dev-workflow/SKILL.md) を読み、入口として使う。
- 親 Issue で依頼全体を追い、実装・検証・PR はサブ Issue ごとに行う。小さな変更でも親 Issue の下にサブ Issue を1件用意する。すでに対象のサブ Issue がある場合は再利用する。
- 開発依頼には、このリポジトリでの親・サブ Issue の起票と紐付け、サブ Issue ごとの PR 作成を含む。

## Git・コミット

- 作業前に `git status`・`git diff` で既存のユーザー変更を確認し、依頼された作業範囲と区別する。`git checkout --` / `git reset --hard` / `git clean` 等で既存変更を消去したりエラーを隠蔽したりしない。
- `git push` はユーザーから明示的に依頼・承認された場合のみ実行する。push 前に `pnpm check` と対象ブランチを確認し、`git push <remote> <branch>` のように対象を明示する。
- コミット実行前、またはコミットメッセージの作成・修正（案のみを含む）を行う前に、必ず [git-commit Skill](.agents/skills/git-commit/SKILL.md) を読み、適用する。メッセージは **Conventional Commits 1.0.0 形式で、説明を日本語** にする。
