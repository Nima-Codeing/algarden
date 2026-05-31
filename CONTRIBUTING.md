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

## Commit 作成プロセス

### 基本フロー

1. 変更を実装する
2. `git add -p` で変更をハンク単位で確認しながらステージングする
3. `git commit` でメッセージを書いてコミットする
4. 必要に応じて `git rebase -i` で積み上げた commit を整理する

---

### git add -p によるハンク単位のステージング

`git add <ファイル>` でファイルをまとめてステージングするのではなく、
`git add -p` を使ってハンク（変更のかたまり）単位で取捨選択する。

```bash
git add -p
```

主なコマンド：

| キー | 動作 |
|------|------|
| `y` | このハンクをステージングする |
| `n` | このハンクをスキップする |
| `s` | ハンクをさらに分割する |
| `e` | ハンクを手動編集する |
| `q` | 終了する |

**目的：** 1 commit に含める変更を意図的に選択し、「Commit 粒度の原則」を実現する。

---

### git rebase -i による commit の整理

複数の commit を積んだあと、push 前に履歴を整理する。

```bash
git rebase -i HEAD~<対象commit数>
```

主な操作：

| コマンド | 動作 |
|----------|------|
| `pick` | そのまま残す（デフォルト） |
| `reword` | メッセージだけ修正する |
| `squash` | 直前の commit に統合する（メッセージを編集） |
| `fixup` | 直前の commit に統合する（メッセージは捨てる） |
| `drop` | この commit を削除する |

**使いどころ：**
- `squash` / `fixup`：作業中の「wip」や「fix typo」をまとめて1つの意味ある commit にする
- `reword`：push 前に commit message を修正する
- `drop`：不要な commit を履歴から除去する

> **警告：** rebase -i はリモートに push 済みの commit に対して使ってはならない。
> hash が変わるため、他のブランチや共同作業者の履歴と乖離する。
> 本リポジトリでは「push 前の整理」としてのみ使用すること。

---

### ワークフロー

```
実装（作業中はwipコミットOK）
  ↓
git add -p（ハンク単位でステージング）
  ↓
git commit（意味のある単位でコミット）
  ↓
（push前に）git rebase -i（履歴を整理）
  ↓
git push
```

---

## ブランチ運用

### ブランチ戦略

`main` ブランチを常にデプロイ可能な状態に保つ。
すべての変更は feature ブランチで行い、PR を通じて `main` にマージする。

### 命名規則

```
<type>/<scope>-<description>
```

- `type` は Commit message の type と同じ（`feat` / `fix` / `docs` / `refactor` / `test` / `chore`）
- `scope` はオプション。対象が明確な場合に付ける
- `description` はケバブケース・英語

**例：**

```
feat/api-plant-growth
feat/web-garden-canvas
fix/api-jwt-cookie
docs/contributing-guide
refactor/web-todo-list
```

### 運用ルール

- **Issue を先に立ててからブランチを切る**
- **1 Issue = 1 PR = 1 feature ブランチ**
- ブランチは PR マージ後に削除する
- `main` への直接 push は原則禁止

### ライフサイクル

```
1. Issue を立てる
2. Issue からブランチを切る（GitHub UI の "Create a branch" またはローカル）
3. 実装・commit を積む
4. PR を出す（closes #<Issue番号> を記載）
5. セルフレビュー → マージ
6. ブランチを削除する
```

---

## Issue 規約

### 基本ルール

- **1 Issue = 1 つの目的**（複数の作業を1つにまとめない）
- **1 Issue = 2〜10 commit** を目安にする
- Issue を先に立ててからブランチを切る

### ラベル

Issue 作成時に `type` と `scope` のラベルを必ず付ける。
- ラベル運用参照

### Milestone

Issue 作成時に対応する Week の Milestone を設定する。

### テンプレート

`.github/ISSUE_TEMPLATE/task.md` を使用する。
「概要」「背景・目的」「作業内容」「完了条件」「関連」の5項目を埋める。

### タイトル

```
<type>(<scope>): <概要>
```

Commit message の subject と同じフォーマットで書く。

**例：**

```
feat(api): implement plant growth algorithm
docs(contributing): add branch workflow section
fix(web): fix garden canvas pan/zoom on mobile
```

---

## PR 規約

### 基本ルール

- **1 PR = 1 Issue**
- PR description に `closes #<Issue番号>` を記載してマージ時に Issue を自動 close する
- マージ前に必ずセルフレビューを行う

### タイトル

Issue タイトルと同じフォーマットで書く。

```
<type>(<scope>): <description>
```

### description

`.github/pull_request_template.md` を使用する。
「概要」「変更内容」「テスト」「レビューポイント」「関連」の5項目を埋める。
`関連` には必ず `closes #<Issue番号>` を記載する。

### セルフレビューチェックリスト

マージ前に以下を確認する。

**コード品質：**
- [ ] 不要なコメント・console.log・デバッグコードが残っていない
- [ ] 型定義が適切である（`any` の乱用がない）
- [ ] 命名が CONTRIBUTING.md の規約に沿っている

**動作確認：**
- [ ] ローカルでビルドが通る
- [ ] 変更箇所の動作を手動で確認した
- [ ] 既存機能への影響がないことを確認した

**履歴：**
- [ ] commit 粒度が「Commit 粒度の原則」に沿っている
- [ ] commit message が規約に沿っている
- [ ] 不要な commit（wip・typo修正など）が `rebase -i` で整理されている

### マージ方法

**Squash merge は使わない。** commit 履歴をそのまま `main` に残す。

> Squash merge は個々の commit が失われるため、`git log` で変更の経緯を追えなくなる。
> commit 粒度を適切に保つことで、squash merge に頼らない履歴管理を実現する。

### マージ後

- feature ブランチを削除する
- 対応する Issue が自動 close されていることを確認する

---

## Milestone 運用

### 方針

Milestone は **Week 単位**で管理する。
各 Week の due date までに対応する Issue をクローズすることを目標とする。

### 命名規則

```
Week <番号>          # 通常週
Week <番号> (M1)     # Milestone達成週
```

M1 / M2 / M3 は開発上の重要マイルストーンを示す。

| マーカー | 意味 |
|----------|------|
| M1 | backend v1 完成 |
| M2 | コアループ貫通 |
| M3 | AlGarden v1 完成 |

### 運用ルール

- Issue 作成時に対応する Week の Milestone を設定する
- その週に着手・完了予定の Issue を該当 Milestone に紐付ける
- 週をまたぐ場合は Milestone を移動する（Issue を閉じずに Milestone だけ変更）
- PR は Milestone に紐付けない（Issue のみ）

---

## Labels 運用

### 体系

ラベルは `type` と `scope` の2系統で構成する。
デフォルトラベル（bug / enhancement など）は使用しない。

### type

| ラベル | 用途 |
|--------|------|
| `type:feat` | 新機能の追加 |
| `type:fix` | バグ修正 |
| `type:docs` | ドキュメントのみの変更 |
| `type:refactor` | 動作を変えないコードの改善 |
| `type:test` | テストの追加・修正 |
| `type:chore` | ビルド・設定・依存関係など |

### scope

| ラベル | 対象 |
|--------|------|
| `scope:api` | `apps/api` 配下（Prisma含む） |
| `scope:web` | `apps/web` 配下（ビジュアライズ含む） |
| `scope:shared` | `packages/shared` 配下 |
| `scope:infra` | CI/CD・Docker・デプロイ設定 |
| `scope:contributing` | 本ドキュメント・テンプレート類 |

### 運用ルール

- Issue 作成時に `type` と `scope` を **原則各1つ** 付ける
- PR にはラベルを付けない（Issue のみ）
- 新しいラベルは追加しない（体系を増やさない）

---