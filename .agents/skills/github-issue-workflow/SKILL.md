---
name: github-issue-workflow
description: dev-workflow で開発着手時の Issue を用意するときや、GitHub Issue の起票・下書き・分割を直接依頼されたときに使う。作業単位を確認し、分割する場合は GitHub で親子関係を登録・確認する。
---

# GitHub Issue の起票

## サブ Issue に切り出す基準

- **開発作業の着手**では、同じ変更で完結する実装・テスト・文書更新を一つの Issue で追う。個別に完了判定・レビューできる作業単位が複数あるときは、全体を追う Issue の下に作業単位ごとのサブ Issue を作る。調査を独立させる場合は、PR でレビューする成果物を先に決める。
- **起票や分割だけの依頼**では、依頼された単位で追跡する。個別にレビュー・完了判定できる成果物や先行作業がある場合に分ける。たとえば API 契約の確定と、それに依存する画面実装は、別々の完了条件を持つサブ Issue にできる。

## 起票内容

- 対象リポジトリと、指定された Issue がある場合はその親子関係を確認し、関連する既存 Issue と重複しないか調べる。同じ成果物の Issue があれば再利用を検討する。すでに別の親に属する場合、付け替えは明示されたときに行う。
- 依頼の目的に合うテンプレートを使う。
  - [バグ報告](../../../.github/ISSUE_TEMPLATE/bug_report.yml) は、再現手順、期待する動作、実際の動作を記録する。
  - [機能追加・改善要望](../../../.github/ISSUE_TEMPLATE/feature_request.yml) は、依頼全体の課題、実現したいこと、対象範囲、受入条件、根拠、未決事項を記録する。
  - [作業タスク](../../../.github/ISSUE_TEMPLATE/work_item.yml) は、個別にレビューする作業の範囲、成果物、完了条件と検証方法、必要な依存関係を記録する。サブ Issue に分ける場合は、対応する親 Issue や合意済みの要求を参照する。
- 下書きや分割案の依頼なら、タイトルと本文を提示し、分割する場合は親子関係の案も示す。GitHub への書き込みは、開発作業の Issue の起票・更新と必要な紐付け、または直接依頼された範囲に限る。

## GitHub での登録と確認

1. 対象の Issue があれば再利用し、新規なら起票する。既存のサブ Issue が対象なら、その親子関係を確認する。CLI では `gh issue create --repo <owner/repo> --title <title> --body-file <file>` を使える。該当テンプレートに既定ラベルがあれば適用する。作成・再利用した Issue の URL を控える。
2. 作業を分割する場合は、必要なサブ Issue を作成または再利用し、GitHub の Sub-issues 機能で親に紐付ける。CLI を使う場合は子の REST API の数値 `id` を取得し、親の Issue 番号を使って登録する。

   ```text
   gh api repos/<owner>/<repo>/issues/<child-number> --jq .id
   gh api --method POST repos/<owner>/<repo>/issues/<parent-number>/sub_issues -F sub_issue_id=<child-id>
   gh api --paginate repos/<owner>/<repo>/issues/<parent-number>/sub_issues --jq '.[].html_url'
   ```

3. 分割した場合は親の Sub-issues 一覧で各子の URL を確認する。作成や紐付けが途中で失敗した場合は、作成済み Issue と紐付けの状態を確認してから未完了の操作だけを再試行する。対象 Issue の URL を報告し、サブ Issue や未完了の操作があればそれらも示す。

[GitHub の Sub-issues REST API](https://docs.github.com/en/rest/issues/sub-issues)
