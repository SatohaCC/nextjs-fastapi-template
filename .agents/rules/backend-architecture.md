# Backend 設計ルール

`backend/app/` はシンプルなレイヤード構成（`routers` / `schemas` / `services` / `clients` / `core`）を採用し、外部 SDK の隔離と単体テストのしやすさを維持する。

## 1. ディレクトリと責務

- `app/main.py`: FastAPI アプリの生成・ミドルウェア・ルーター登録のみ。
- `app/core/`: 環境変数・設定（`config.py`）などの共通基盤。各モジュールで直接 `os.getenv` を散らさない。
- `app/routers/`: HTTP / WebSocket エンドポイント定義。入力検証と `services/` 呼び出しのみを行い、業務ロジックを書かない。
- `app/schemas/`: Pydantic の入出力モデル（API 契約）。
- `app/services/`: ビジネスロジック・ユースケース。FastAPI（`Request` / `HTTPException` 等）に依存しない。
- `app/clients/`: 音声・LLM・外部 API などの外部 SDK アダプタを閉じ込める層。`services/` から直接外部 SDK を import しない。

## 2. 依存方向

- `routers` → `services` / `schemas`
- `services` → `clients` / `schemas` / `core`
- `clients` → `core`（`routers` や `services` へ逆依存しない）

## 3. 検証

変更後は以下を実行して通過を確認する。

- `pnpm check`（Ruff lint / format check + mypy）
- `pnpm test`（pytest）
