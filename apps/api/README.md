# api

ALGARDEN のバックエンドです。認証・Todo・庭（ノードネットワーク）の API を提供します。

- NestJS 11 / Prisma 7 / PostgreSQL 16
- 本番は Vercel Functions で動かし、DB は Neon を使っています。

## ローカルでの起動

リポジトリのルートで実行します。

1. 依存関係を入れる。

   ```bash
   npm install
   ```

2. PostgreSQL を起動する。

   ```bash
   docker compose up -d
   ```

`apps/api` で実行します。

3. `.env.sample` をコピーして `.env` を作る

   ```bash
   cp .env.sample .env
   ```

4. マイグレーションとシードを実行する

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. 起動する（`http://localhost:3000`）

   ```bash
   npm run start:dev
   ```

リポジトリのルートで `npm run dev` を実行すると、web と api を同時に起動できます。

### 環境変数

| 変数           | 内容                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL の接続先。Docker の場合は `postgresql://algarden:algarden@localhost:5433/algarden` |
| `JWT_SECRET`   | JWT の署名に使う秘密鍵                                                                        |
| `PORT`         | 待ち受けるポート（省略時は `3000`）                                                           |

### Prisma seed で作られるアカウント

| メール         | パスワード | 内容                       |
| -------------- | ---------- | -------------------------- |
| `dev@al.com`   | `Dev.9999` | 開発用                     |
| `large@al.com` | `Dev.9999` | ノードの多い庭が入っている |

## エンドポイント

`/auth/me`・`/todos`・`/gardens` には、サインインで発行される Cookie（`token`）が必要です。

| メソッド | パス                         | 内容                               |
| -------- | ---------------------------- | ---------------------------------- |
| POST     | `/auth/signup`               | サインアップ                       |
| POST     | `/auth/signin`               | サインイン（Cookie を発行）        |
| POST     | `/auth/signout`              | サインアウト（Cookie を削除）      |
| GET      | `/auth/me`                   | サインイン中のユーザーを返す       |
| GET      | `/todos`                     | Todo の一覧                        |
| POST     | `/todos`                     | Todo の作成                        |
| PUT      | `/todos/:id/title`           | タイトルの変更                     |
| PUT      | `/todos/:id/target-duration` | 目標時間の変更                     |
| DELETE   | `/todos/:id`                 | Todo の削除                        |
| PATCH    | `/todos/:id/start`           | タイマーの開始                     |
| PATCH    | `/todos/:id/complete`        | Todo の完了（庭にノードが生える）  |
| GET      | `/gardens`                   | 使用中の庭（ノードとエッジ）を返す |

## ディレクトリ構成

| パス         | 内容                                 |
| ------------ | ------------------------------------ |
| `src/auth`   | サインアップ・サインイン・JWT の検証 |
| `src/todo`   | Todo の操作、完了時のスコア計算      |
| `src/garden` | 庭の取得                             |
| `src/plant`  | ノードの生成と座標計算               |
| `src/prisma` | PrismaService                        |
| `prisma/`    | スキーマ・マイグレーション・シード   |
| `scripts/`   | 運用・計測用のスクリプト             |
| `test/`      | e2e テストと、`.env.test` を読み込む設定 |

## スクリプト

| コマンド                              | 内容                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm test`                            | 単体テスト（Jest）                                                                                                 |
| `npm run lint`                        | ESLint                                                                                                             |
| `npm run typecheck`                   | 型チェック                                                                                                         |
| `npx tsx scripts/maintenance-demo.ts` | デモアカウントの庭を育て直す。GitHub Actions から毎月1日に実行（`BASE_URL`・`DEMO_EMAIL`・`DEMO_PASSWORD` が必要） |
| `npx tsx scripts/bench-calc-coord.ts` | ノードが 300 個と 1000 個のときの座標計算の時間を測る                                                              |
| `npm run test:e2e`                    | e2e テスト（Jest）。テスト用 DB に接続する。準備は「e2e テスト」を参照                                             |

## e2e テスト

API にリクエストを送り、実際の PostgreSQL まで通して確かめます。接続先は開発用とは別のテスト用 DB（`algarden_test`）で、`.env.test` から読み込みます。

### 準備（初回だけ）

PostgreSQL を起動しておきます（「ローカルでの起動」の 2）。

1. テスト用 DB を作る

   ```bash
   docker exec algarden-db createdb -U algarden algarden_test
   ```

2. テスト用 DB にマイグレーションを適用する（`apps/api` で実行）

   ```bash
   DATABASE_URL=postgresql://algarden:algarden@localhost:5433/algarden_test npx prisma migrate deploy
   ```

マイグレーションを追加したときは、2 をもう一度実行します。

### 実行

`apps/api` で実行します。

```bash
npm run test:e2e
```

- テストごとに、テスト用 DB の全テーブルを空にします。
- 接続先の DB 名が `_test` で終わらない場合は、テストを始める前に止まります。開発用 DB のデータを消さないためです。
- `.env.test` はコミットされます。`.env` や本番の値は入れないでください。
