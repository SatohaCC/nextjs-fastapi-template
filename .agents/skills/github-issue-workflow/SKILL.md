---
name: github-issue-workflow
description: GitHub Issue の起票・下書き作成や、既存 Issue のサブ Issue への分割を依頼されたときに使う。作業を分けて追跡する必要性を判断し、起票時は GitHub の親子関係を登録・確認する。
---

# GitHub Issue の起票

## サブ Issue に切り出す基準

個別に担当・レビュー・完了判定できる成果物があり、並行作業や段階的なリリース、先行調査などの進捗を別々に追う利点がある場合に切り出す。たとえば、API 契約の確定が後続の画面実装を左右するなら、それぞれの完了条件を持つサブ Issue にできる。

同じ変更で完結する実装・テスト・ドキュメント更新は、Issue 本文の完了条件やチェックリストにまとめる。小さな修正や単一の成果物なら Issue は 1 件でよい。依頼で親や分割単位が指定されている場合はその指定に従う。

## 起票内容

- 対象リポジトリと指定された親 Issue を確認し、関連する既存 Issue と重複しないか調べる。同じ成果物の Issue があれば再利用を検討する。すでに別の親に属する場合、付け替えは明示されたときに行う。
- `.github/ISSUE_TEMPLATE/` の該当テンプレートに沿って書く。親 Issue には背景、対象範囲、全体の完了条件を置く。サブ Issue にはその Issue の作業範囲、個別の完了条件、必要な依存関係を記す。
- 下書きや分割案の依頼なら、タイトルと本文、親子関係の案を提示する。GitHub に書き込むのは起票や紐付けを依頼された範囲に限る。

## GitHub での登録と確認

1. 既存の親が指定されていれば使用し、新規なら親を先に起票する。分割しない場合は起票と URL の確認で完了する。CLI では `gh issue create --repo <owner/repo> --title <title> --body-file <file>` を使える。該当テンプレートに既定ラベルがあれば適用する。作成した Issue の URL を控える。
2. 必要なサブ Issue を作成または再利用し、GitHub の Sub-issues 機能で親に紐付ける。CLI を使う場合は子の REST API の数値 `id` を取得し、親の Issue 番号を使って登録する。

   ```text
   gh api repos/<owner>/<repo>/issues/<child-number> --jq .id
   gh api --method POST repos/<owner>/<repo>/issues/<parent-number>/sub_issues -F sub_issue_id=<child-id>
   gh api --paginate repos/<owner>/<repo>/issues/<parent-number>/sub_issues --jq '.[].html_url'
   ```

3. 親の Sub-issues 一覧で各子の URL を確認する。作成や紐付けが途中で失敗した場合は、作成済み Issue と紐付けの状態を確認してから未完了の操作だけを再試行する。親と子の URL、未完了の操作があればその内容を報告する。

[GitHub の Sub-issues REST API](https://docs.github.com/en/rest/issues/sub-issues)
