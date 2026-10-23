# AlGarden

> 探索アルゴリズムの実行過程を、SVG で育つ「庭」として可視化する Web アプリケーション

<img src="docs/images/algarden.png" alt="育ったデモの庭" width="800">

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

Turborepo によるモノレポ構成で、フロントエンドとバックエンドを単一リポジトリ内で管理している。

```
algarden/                  # Turborepo モノレポ
├── apps/
│   ├── web/               # Vite + React フロントエンド → Vercel
│   └── api/               # NestJS バックエンド → Railway
├── packages/              # 共有パッケージ（型定義など）
└── turbo.json
```

リクエストの流れは以下の通り。フロントとバックが別ドメインに配置されるため、認証は Cookie + CORS のクロスドメイン構成で成立させている。

```
[ Browser ]
    │  HttpOnly Cookie (JWT) / credentials: true / SameSite=Lax
    ▼
[ Vercel: React SPA ] ──── API リクエスト (CORS) ────▶ [ Railway: NestJS ]
                                                          │
                                                          ▼  Prisma 7
                                                     [ PostgreSQL ]
```

## ローカルでの起動方法

後々追記

## ライセンス

このプロジェクトは [MIT License](./LICENSE) の下で公開されている。
