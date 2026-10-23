# ALGARDEN

Todoを完了すると、アルゴリズムに従ってノードネットワークを形成していくWebアプリです。<br>
現在スマホ対応はしていないため、PCにてご確認ください。

<img src="docs/images/algarden.png" alt="育ったデモの庭" width="800">

左の黒い背景が「庭」、右が「Todoリスト」です。<br>
Todo を1つ完了するたびに、庭に「ノードネットワーク」が形成されます。

## デモ

**https://algarden.vercel.app** にアクセスし、次のアカウントでサインインが可能です（登録は不要です）。

- メール：`demo@example.com`
- パスワード：`Demo.1234`

<br>

> [!NOTE]
>
> - 全員で同じアカウントを使います。タイマーが動いたままの Todo があると、新しい Todo を開始できません。<br>
> - そのときは、その Todo のチェックボックスにチェックを入れて完了してください。<br>
> - 庭は毎月1日 9:00（日本時間）に新しくなります。自動で育て直すため、その後の数十分は庭が空か、育っている途中な可能性があります。

<br>

## 開発の背景

普段からチェックリストやTodoアプリをよく使っていますが、完了したタスクは一覧から消えるだけで何も残らず、物足りなさを感じていました。<br>
ゲーミフィケーションを取り入れたTodoアプリもいくつかありますが、自分にはあまりしっくりきませんでした。<br>
そこで、もともと面白さや美しさを感じていたアルゴリズムを使って、自分で作ることにしました。<br>
このアプリでは、Todo を完了するたびに庭のノードネットワークが育ち、積み重ねが目に見える形で残ります。目標時間に近い時間で終えるほど多くのノードが生えるので、作業時間を見積もる練習にもなります。

### コンセプト

**宇宙 × 植物（盆栽）**

最初は「Todo を完了すると植物が育つ」というアイデアだけでした。作っていくうちに、ノードが枝分かれしながら広がっていく形が、星をつないだ星座にも、時間をかけて形を整えていく盆栽にも見えてきました。そこから、植物を軸に宇宙の要素を取り入れた「宇宙 × 植物（盆栽）」というコンセプトに広がりました。<br>
今できているのは、Todo の完了に合わせてノードネットワークが育つ仕組みまでです。宇宙らしい見た目や動きは、[今後の展望](#今後の展望)で順に形にしていきます。

## 技術スタック

| Category          | Technology Stack                                                                      |
| ----------------- | ------------------------------------------------------------------------------------- |
| Frontend          | TypeScript 5, React 19, Vite 8, React Router 7, TanStack Query 5, Tailwind CSS 4, Zod 4 |
| Backend           | TypeScript 5, NestJS 11, Prisma 7, Passport (JWT), argon2, class-validator, d3-force 2  |
| Database          | PostgreSQL 16                                                                         |
| Infrastructure    | Vercel (web / api), Neon                                                              |
| CI/CD             | GitHub Actions, Vercel (Git integration)                                              |
| Testing           | Jest 30                                                                               |
| Tools             | Insomnia (API), draw.io (diagrams)                                                    |
| Environment setup | Docker (PostgreSQL), Node.js 24, Turborepo 2, npm workspaces                          |
| Linter / Formatter| ESLint, Prettier                                                                      |

## アーキテクチャ

<img src="docs/images/architecture.drawio.png" alt="ブラウザ → Vercel（web）→ rewrites → Vercel Functions（api）→ Neon の構成図" width="800">

## 機能

- サインアップ
- サインイン
- Todoリスト
  - 作成・編集・削除
  - 目標時間の設定
  - スコア判定
  - タイマー（同時稼働は1つまで）
- 庭
  - 庭の月次リセット
  - ノードネットワークを画面に収める自動フィット
- ノードネットワーク
  - ノード配置の計算
  - ノードの 成長・延焼 アルゴリズム

<br>

| タスク完了後、ノードが成長している画面 |
| :--- |
| <img src="docs/images/grow-plant.gif" alt="Todo を完了するとノードが生える様子" width="800"> |
## ER 図

ノードネットワークは、点の表（PlantNode）と線の表（PlantEdge）に分けて保存しています。親子のつながりは、PlantNode の parentId にも持たせています。

<details>


<summary>ER 図を開く（主なカラムのみ。すべての定義は <a href="apps/api/prisma/schema.prisma">schema.prisma</a>）</summary>

```mermaid
erDiagram
    User ||--o{ Garden : "owns"
    User ||--o{ Todo : "owns"
    Garden ||--o{ Todo : "contains"
    Garden ||--o{ Seed : "contains"
    Garden ||--o{ Plant : "contains"
    Seed ||--o| Plant : "grows into"
    Plant ||--|{ PlantNode : "has"
    Plant ||--o{ PlantEdge : "has"
    Todo |o--o{ PlantNode : "grows"
    PlantNode |o--o{ PlantNode : "parent of"
    PlantNode ||--o{ PlantEdge : "from"
    PlantNode ||--o{ PlantEdge : "to"

    User {
        uuid id PK
        varchar name
        varchar email UK
        varchar password "argon2 のハッシュ"
    }
    Garden {
        uuid id PK
        uuid userId FK
        timestamptz startedAt
        timestamptz endAt "userId と組で一意"
    }
    Todo {
        uuid id PK
        uuid userId FK
        uuid gardenId FK
        varchar title
        boolean isCompleted
        int targetDuration "目標時間（秒）・null 可"
        TodoScore score "S〜D・null 可"
        timestamptz startedAt "null 可"
        timestamptz completedAt "null 可"
    }
    Seed {
        uuid id PK
        uuid gardenId FK
        float x
        float y
        SeedType seedType
        boolean isPlanted
    }
    Plant {
        uuid id PK
        uuid gardenId FK
        uuid seedId FK, UK
        int nodeCount
        GrowthStage growthStage
    }
    PlantNode {
        uuid id PK
        uuid plantId FK
        uuid parentId FK "根のノードは null"
        uuid todoId FK "根のノードは null"
        float x
        float y
        float hue
        float size
        int depth
    }
    PlantEdge {
        uuid id PK
        uuid plantId FK
        uuid fromId FK
        uuid toId FK
        EdgeType edgeType "SKELETON：親子 / SPREAD：近くのノード"
    }
```

</details>

## 今後の展望

**見た目と操作**

- 新しいノードが親から伸びるアニメーション
- 庭の成長を最初から再生する「アルゴリズムView」
- 庭のパン・ズーム
- スマホ・タブレット対応（レスポンシブなレイアウト、ピンチ・ドラッグでの操作）
- ノードネットワークの3D化

**新しい遊び方**

- 隕石：まれにノードが降ってきて、庭に単独で残ったり、既存のノードネットワークとつながったりする
  - 隕石が「第二の種」になり、その先が別のアルゴリズムで育つ、といった展開も検討中
- 接ぎ木：離れたノード同士を、自分の手で線でつなぐ・切る
- ショップ：Todoの達成で貯めたポイントで、種やアイテムを手に入れる
- 1つの庭に複数の種を植え、ノードネットワークをいくつも育てる
- ほかのアルゴリズムを足し、期間の始めに選べるようにする

**品質と運用**

- 配置の計算を新しいノードの周りに絞り、ノードが増えても速く保つ
- 実際のDBを使ったe2eテストと、画面のテスト
- インフラをGCPまたはAWSへ移す

ほかの予定は [Milestone「MVP後」](https://github.com/Nima-Codeing/algarden/milestone/20) にまとめています。
