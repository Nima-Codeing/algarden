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


## ローカルでの起動方法

後々追記

## ライセンス

このプロジェクトは [MIT License](./LICENSE) の下で公開されている。
