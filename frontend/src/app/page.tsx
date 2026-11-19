import * as stylex from "@stylexjs/stylex";
import { HealthStatusContainer } from "@/features/health/HealthStatusContainer";
import { pageStyles as s } from "./page.styles";

const layers = [
  { name: "Next.js", path: "frontend/src/app/", description: "画面とルーティングを実装する。" },
  {
    name: "FastAPI",
    path: "backend/app/",
    description: "APIとアプリケーションロジックを実装する。",
  },
  {
    name: "共有 UI",
    path: "frontend/src/shared/ui/",
    description: "Material Design 3 の部品を再利用する。",
  },
];

export default function HomePage() {
  return (
    <main id="top" {...stylex.props(s.page)}>
      <header {...stylex.props(s.header)}>
        <a href="#top" {...stylex.props(s.brand)}>
          <span aria-hidden="true" {...stylex.props(s.mark)}>
            &gt;_
          </span>
          Next.js + FastAPI Template
        </a>
        <nav aria-label="ページ内ナビゲーション" {...stylex.props(s.nav)}>
          <a href="#connection" {...stylex.props(s.link)}>
            接続状態
          </a>
          <a href="#structure" {...stylex.props(s.link)}>
            構成
          </a>
        </nav>
      </header>

      <section aria-labelledby="home-title" {...stylex.props(s.hero)}>
        <div {...stylex.props(s.intro)}>
          <p {...stylex.props(s.eyebrow)}>NEXT.JS / FASTAPI</p>
          <h1 id="home-title" {...stylex.props(s.title)}>
            サンプルページ
          </h1>
          <p {...stylex.props(s.description)}>
            Next.jsの画面からFastAPIに接続するサンプルです。起動手順とプロジェクト構成を確認できます。
          </p>
          <a href="#connection" {...stylex.props(s.action)}>
            APIの接続を確認 <span aria-hidden="true">↓</span>
          </a>
        </div>

        <section aria-labelledby="setup-title" {...stylex.props(s.terminal)}>
          <div {...stylex.props(s.terminalHeader)}>
            <span aria-hidden="true" {...stylex.props(s.terminalIcon)}>
              &gt;_
            </span>
            <h2 id="setup-title">ローカルで起動</h2>
          </div>
          <p {...stylex.props(s.setupText)}>リポジトリのルートで実行します。</p>
          <pre {...stylex.props(s.commands)}>
            <code>{"pnpm install --frozen-lockfile\npnpm dev"}</code>
          </pre>
          <dl {...stylex.props(s.endpoints)}>
            <div {...stylex.props(s.endpoint)}>
              <dt>画面</dt>
              <dd>
                <code>localhost:3000</code>
              </dd>
            </div>
            <div {...stylex.props(s.endpoint)}>
              <dt>ヘルス API</dt>
              <dd>
                <code>/api/health</code>
              </dd>
            </div>
          </dl>
        </section>
      </section>

      <section id="connection" aria-labelledby="connection-title" {...stylex.props(s.connection)}>
        <div>
          <h2 id="connection-title" {...stylex.props(s.sectionTitle)}>
            接続状態
          </h2>
          <p {...stylex.props(s.support)}>ブラウザからFastAPIへの応答を確認します。</p>
        </div>
        <HealthStatusContainer />
      </section>

      <section id="structure" aria-labelledby="structure-title" {...stylex.props(s.structure)}>
        <h2 id="structure-title" {...stylex.props(s.sectionTitle)}>
          プロジェクト構成
        </h2>
        <ul {...stylex.props(s.layers)}>
          {layers.map(({ name, path, description }) => (
            <li key={path} {...stylex.props(s.layer)}>
              <h3 {...stylex.props(s.layerTitle)}>{name}</h3>
              <code {...stylex.props(s.path)}>{path}</code>
              <p {...stylex.props(s.support)}>{description}</p>
            </li>
          ))}
        </ul>
      </section>
      <footer {...stylex.props(s.footer)}>
        <span>Next.js + FastAPI Template</span>
        <a href="#top" {...stylex.props(s.link)}>
          ページ上部へ ↑
        </a>
      </footer>
    </main>
  );
}
