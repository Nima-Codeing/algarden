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

## Commit 粒度の原則

### 大原則

1 commit = **意味的にまとまる最小単位の変更**。
ファイル数や行数ではなく「意味」で区切る。

### 判定基準

以下のいずれかに該当する場合、粒度が不適切である可能性が高い。

**粒度が大きすぎるサイン:**
- 1 commit を `git revert` すると、戻したくない変更まで戻ってしまう
- commit に含まれる変更が、1 文で説明できない
- commit message に「and」「かつ」「ついでに」が入る

**粒度が小さすぎるサイン:**
- 1つの機能追加を取り消すのに、複数 commit の revert が必要
- 単一のクラス追加を Controller / Service / Module で別 commit に分割している
- ファイル単位で機械的に分割されている

> 1 つの意味的変更が複数ファイルにまたがるのは正常。
例えば「新しいエンドポイントの追加」は Controller / Service / DTO / Module に同時変更が必要になる。
**ファイル数ではなく「意味」で判断する**。

### 良い例

実際の commit から：

```
feat(api/auth): add @CurrentUser() decorator
refactor(api/seed): replace @Req() with @CurrentUser()
fix(api/seed): align GET /seeds endpoint with spec
```

各 commit が単一の目的を持ち、独立して revert 可能。

### 悪い例

```
feat(api/seed): add seed endpoint and fix auth bug
→ 「and」が入っている。2 つの目的が混在
→ 改善: 2 commit に分割する
```

```
feat(api/seed): add SeedController
feat(api/seed): add SeedService
feat(api/seed): add SeedModule
   → 過剰分割。1 つの「Seed モジュール追加」を 3 commit に分けている
   → 改善: feat(api/seed): scaffold Seed module でまとめる
```

### Commit 順序

意味的な依存関係がある変更を 1 PR にまとめる場合、依存関係に沿った順序で commit を積むことを推奨する。

```
1. feat(api/auth): add @CurrentUser() decorator             ← 依存される側
2. refactor(api/seed): replace @Req() with @CurrentUser()   ← 依存する側
```

これにより、各 commit 時点でビルド可能な状態が維持され、cherry-pick / revert が容易になる。

---

## Commit message の書き方

### フォーマット

```
<type>(<scope>): <subject>
```

空行を挟んで本文（任意）：



```
<type>(<scope>): <subject>

<body>
```

### type

| type | 用途 |
|------|------|
| `feat` | 新機能の追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `refactor` | 動作を変えないコードの改善 |
| `test` | テストの追加・修正 |
| `chore` | ビルド・設定・依存関係など |

### scope

ディレクトリ構造に対応させる。

| scope | 対象 |
|-------|------|
| `api` | `apps/api` 配下（Prisma含む） |
| `web` | `apps/web` 配下（ビジュアライズ含む） |
| `shared` | `packages/shared` 配下 |
| `infra` | CI/CD・Docker・デプロイ設定 |
| `contributing` | 本ドキュメント・テンプレート類 |

### subject

- 英語・現在形・命令形で書く（`add`、`fix`、`update` など）
- 先頭を大文字にしない
- 末尾にピリオドをつけない
- 50文字以内を目安にする

### body（任意）

- なぜこの変更をしたかを書く（what ではなく why）
- `git log` で文脈が追えることを目的とする

### 例

```
feat(api/auth): add @CurrentUser() decorator

req.user への直接アクセスを避け、デコレータで明示的に
ユーザー情報を取得できるようにする。
Passport の request オブジェクト依存を1箇所に集約する目的。
```

```
refactor(web): extract GardenCanvas into standalone component
```

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