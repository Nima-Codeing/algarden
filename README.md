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

| 領域 | 技術 |
|------|------|
| フロントエンド | Vite, React, TypeScript|
| ルーティング | React Router |
| 状態管理 | Zustand |
| スタイリング | Tailwind CSS |
| アニメーション / 描画 | SVG, Framer Motion（導入予定） |
| バックエンド | NestJS, TypeScript |
| 認証 | JWT (Passport) + HttpOnly Cookie |
| ORM | Prisma 7 |
| DB | PostgreSQL（開発: Docker / 本番: Supabase） |
| モノレポ | Turborepo |
| インフラ | Vercel (フロント), Railway (バック) |

## 技術選定の理由（抜粋）

### Vite + React
このアプリの主な機能は、ノードネットワークが動いて育つアニメーションです。ログイン後に使うアプリなので検索エンジン対策（SEO）は不要で、Next.js のような SSR フレームワークの強みが活きません。それよりもゲーミフィケーションの観点から、画面の動きの滑らかさを優先したかったため、軽量な Vite + React を選びました。将来、庭をシェアする機能などで SEO が必要になったら Next.js への移行を検討します。

### Turborepo
フロントエンドとバックエンドで、データの「型」を共通で使いたかったため、両方を1つのリポジトリにまとめる Turborepo を採用しました。型を1か所（packages/shared）にまとめておくことで、「バックの API が返すデータの形」と「フロントが受け取る形」がズレるのを防げます。片方を直したらもう片方も直す必要がある、という抜け漏れをビルド時に気づける状態を作っています。

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
