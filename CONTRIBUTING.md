# Contributing Guide

## コミットメッセージ規約（Conventional Commits）

形式：<プレフィックス>(<スコープ>): <修正内容>

### プレフィックス

| プレフィックス | 用途 |
|---|---|
| `feat:` | 新機能 |
| `fix:` | バグ修正 |
| `docs:` | ドキュメントのみの変更 |
| `refactor:` | 機能変更を伴わないコード整理 |
| `test:` | テストの追加・修正 |
| `chore:` | ビルド・設定ファイルの変更 |

### スコープ

- api = バックエンド（apps/api）
- web = フロントエンド（apps/web）

```
feat(api/todo): add JWT guard to TodoController
chore(api/auth): scaffold SeedModule, Service, Controller
```

## NestJS 命名規則

### クラス名

PascalCase。ロール（役割）を suffix として付与する。

| ロール | 例 |
|---|---|
| Controller | `SeedController`, `GardenController` |
| Service | `SeedService`, `GardenService` |
| Module | `SeedModule`, `GardenModule` |
| DTO | `CreateSeedDto`, `UpdateSeedDto` |
| Strategy | `JwtStrategy` |
| Guard | `JwtAuthGuard` |
| Type / Interface | `RequestUser`, `JwtPayload` |

### URL

小文字・kebab-case・複数形を基本とする。

```
GET  /seeds
GET  /seeds/active
POST /seeds/:id/plant
GET  /gardens/active
POST /gardens/reset
GET  /plant-nodes
```

- リソース名は複数形（`seeds`, `plant-nodes`）
- 複合語は kebab-case（`plant-nodes`, not `plantnodes`）
- アクション系エンドポイントはリソース配下に動詞を置く（`/seeds/:id/plant`）

### ファイル名

`<domain>.<role>.ts` の形式（kebab-case）。

```
seed.controller.ts
seed.service.ts
seed.module.ts
create-seed.dto.ts
jwt.strategy.ts
request-user.types.ts
```

- DTO は `create-seed.dto.ts` のように操作名を prefix に付ける
- 型定義は `*.type.ts`

### フォルダ名

kebab-case・機能ドメイン単位でフォルダを切る。

```
src/
├── auth/
├── garden/
├── seed/
├── todo/
├── plant/
└── prisma/
```

1 ドメイン = 1 フォルダ。フォルダ内に controller / service / module / dto / types をまとめる。

## ブランチ命名規則

形式：<Conventional Commits.プレフィックス>/<修正内容>

```
feat/seed-api
fix/cors-cookie
docs/update-project-documentation
refactor/rename-apps-dirs
```

## issue / PR

issueタイトル：英語
PR本文：日本語
closes #○ でissue自動クローズ