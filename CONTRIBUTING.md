# Contributing Guide

## このドキュメントについて

### 想定読者

このドキュメントは、以下の読者を想定している。

1. **未来の自分** — 数ヶ月〜数年後にこのコードベースを再訪する自分
2. **コードレビュアー** — 採用選考時にこのリポジトリを評価する第三者

### 目的

- commit / PR / Issue の履歴から、各変更の意図と背景を正確に追えるようにする
- 開発者個人の判断基準を言語化し、再現性のある開発プロセスを確立する

### 適用範囲

本ドキュメントの規約は **[PR #XX](https://github.com/Nima-Codeing/algarden/issues/9) 以降** のすべての変更に適用される。
それ以前の commit / PR は当時の運用に従っており、本規約とは整合しない場合がある。

> 過去 commit の rebase は、リモート push 済み commit の hash 変更によるリスクを避けるため意図的に行わない。

---

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