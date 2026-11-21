---
name: github-issue-workflow
description: dev-workflow で開発着手時の親 Issue・サブ Issue を用意するときや、GitHub Issue の起票・下書き・分割を直接依頼されたときに使う。起票時は既存 Issue を確認し、必要な親子関係を登録・確認する。
---

# GitHub Issue の起票

## サブ Issue に切り出す基準

- **開発作業の着手**では、親 Issue の下にサブ Issue を1件以上用意する。個別に完了判定・レビューできる成果物ごとに分け、同じ変更で完結する実装・テスト・文書更新は同じサブ Issue にまとめる。調査を独立させる場合は、PR でレビューする成果物を先に決める。
- **起票や分割だけの依頼**では、依頼された単位で追跡する。個別にレビュー・完了判定できる成果物や先行作業がある場合に分ける。たとえば API 契約の確定と、それに依存する画面実装は、別々の完了条件を持つサブ Issue にできる。

## 起票内容

- 対象リポジトリと指定された親 Issue を確認し、関連する既存 Issue と重複しないか調べる。同じ成果物の Issue があれば再利用を検討する。すでに別の親に属する場合、付け替えは明示されたときに行う。
- [バグ報告](../../../.github/ISSUE_TEMPLATE/bug_report.yml) または [機能追加・改善要望](../../../.github/ISSUE_TEMPLATE/feature_request.yml) のテンプレートに沿って書く。親 Issue には背景、対象範囲、全体の完了条件を置く。サブ Issue にはその Issue の作業範囲、個別の完了条件、必要な依存関係を記す。
- 下書きや分割案の依頼なら、タイトルと本文、親子関係の案を提示する。GitHub への書き込みは、開発作業の親子 Issue の起票・紐付け、または直接依頼された起票・紐付けの範囲に限る。

## GitHub での登録と確認

1. 既存のサブ Issue が作業対象なら、その親と使うサブ Issue を確認する。既存の親 Issue やまだ親子関係を持たない対象 Issue があれば親として再利用し、新規なら親を先に起票する。単独起票だけの依頼では、起票と URL の確認で完了する。CLI では `gh issue create --repo <owner/repo> --title <title> --body-file <file>` を使える。該当テンプレートに既定ラベルがあれば適用する。作成した Issue の URL を控える。
2. 必要なサブ Issue を作成または再利用し、GitHub の Sub-issues 機能で親に紐付ける。CLI を使う場合は子の REST API の数値 `id` を取得し、親の Issue 番号を使って登録する。

   ```text
   gh api repos/<owner>/<repo>/issues/<child-number> --jq .id
   gh api --method POST repos/<owner>/<repo>/issues/<parent-number>/sub_issues -F sub_issue_id=<child-id>
   gh api --paginate repos/<owner>/<repo>/issues/<parent-number>/sub_issues --jq '.[].html_url'
   ```

3. 親の Sub-issues 一覧で各子の URL を確認する。作成や紐付けが途中で失敗した場合は、作成済み Issue と紐付けの状態を確認してから未完了の操作だけを再試行する。親と子の URL、未完了の操作があればその内容を報告する。

[GitHub の Sub-issues REST API](https://docs.github.com/en/rest/issues/sub-issues)
