import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { TasksWorkspace } from "@/features/tasks/TasksWorkspace";
import { fetchInitialTasks } from "@/features/tasks/tasksServer";
import { tasksPageStyles as s } from "./page.styles";

export const metadata: Metadata = {
  title: "タスク管理 | Next.js + FastAPI",
  description:
    "Next.js と FastAPI（SQLite 永続化）を連携したタスク管理のフルスタック CRUD リファレンスページです。",
};

export const dynamic = "force-dynamic";

/** タスク一覧・絞り込み・作成・編集・削除を行うフルスタック CRUD ページ。 */
export default async function TasksPage() {
  const initialTasks = await fetchInitialTasks(await headers());

  return (
    <div {...stylex.props(s.page)}>
      <header {...stylex.props(s.header)}>
        <Link href="/" {...stylex.props(s.brand)}>
          <span aria-hidden="true" {...stylex.props(s.mark)}>
            &gt;_
          </span>
          Next.js + FastAPI Template
        </Link>
        <nav aria-label="ページ遷移" {...stylex.props(s.nav)}>
          <Link href="/" {...stylex.props(s.link)}>
            トップページ
          </Link>
          <Link href="/tasks" aria-current="page" {...stylex.props(s.link, s.activeLink)}>
            タスク管理
          </Link>
        </nav>
      </header>

      <main>
        <div {...stylex.props(s.hero)}>
          <p {...stylex.props(s.eyebrow)}>FULL-STACK CRUD / SQLITE</p>
          <h1 id="tasks-page-title" {...stylex.props(s.title)}>
            タスク管理
          </h1>
          <p {...stylex.props(s.description)}>
            Next.js App Router のサーバー初期取得と React Query、FastAPI + SQLite 永続化、共有 UI
            コンポーネントを組み合わせた CRUD リファレンス実装です。
          </p>
        </div>

        <TasksWorkspace initialTasks={initialTasks} />
      </main>

      <footer {...stylex.props(s.footer)}>
        <span>Next.js + FastAPI Template</span>
        <Link href="/" {...stylex.props(s.link)}>
          トップページへ戻る
        </Link>
      </footer>
    </div>
  );
}
