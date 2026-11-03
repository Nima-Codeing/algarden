# web

ALGARDEN のフロントエンドです。Todo リストと庭を表示する React の SPA です。

- React 19 / Vite 8 / React Router 7 / TanStack Query 5 / Tailwind CSS 4
- 本番は Vercel で配信しています。

## ローカルでの起動

先に [api](../api/README.md) を起動してから、`apps/web` で次を実行します。環境変数は使っていません。

```bash
npm run dev
```

`http://localhost:5173` で開きます。

リポジトリのルートで `npm run dev` を実行すると、web と api を同時に起動できます。

## API との通信

API へのリクエストは、すべて `/api` で始まるパスに送ります（`src/api/client.ts`）。転送の仕組みは環境によって変わり、どちらも先頭の `/api` を外して api に渡します。そのため、ブラウザから見ると web と同じオリジンへのリクエストになります。

| 環境     | 仕組み                              | 転送先                  |
| -------- | ----------------------------------- | ----------------------- |
| ローカル | Vite の proxy（`vite.config.ts`）   | `http://localhost:3000` |
| 本番     | Vercel の rewrites（`vercel.json`） | api のデプロイ先        |

API の型は `packages/shared`（`@algarden/shared`）を api と共有しています。

## ディレクトリ構成

| パス                | 内容                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| `src/pages`         | ページ（サインイン・サインアップ・ホーム）                           |
| `src/feature`       | 機能ごとの API 呼び出し・コンポーネント・スキーマ（auth・todo・garden） |
| `src/api`           | fetch のラッパー、TanStack Query の設定                              |
| `src/routes`        | 未サインインなら `/signin` に戻すルート（`ProtectedRoute`）          |
| `src/layouts`       | 共通レイアウト                                                       |
| `src/components/ui` | 汎用の UI 部品（atoms・molecules・organisms）                        |
| `src/common`        | 定数・ユーティリティ                                                 |

## スクリプト

| コマンド            | 内容                 |
| ------------------- | -------------------- |
| `npm run dev`       | 開発サーバーの起動   |
| `npm run build`     | 型チェックとビルド   |
| `npm run lint`      | ESLint               |
| `npm run typecheck` | 型チェック           |
| `npm run preview`   | ビルド結果の確認     |
