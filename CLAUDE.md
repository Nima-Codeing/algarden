## Project Overview
### アーキテクチャ
SPA（Vite + React + React Router）

### 技術スタック
- フロントエンド: React + TypeScript + Vite
- 状態管理: Zustand
- グラフ描画: SVG + Framer Motion
- バックエンド: NestJS + TypeScript
- 認証: JWT（NestJS Passport）
- ORM: Prisma
- DB（開発）: PostgreSQL on Docker
- DB（本番）: Supabase
- デプロイ（フロント）: Vercel
- デプロイ（バック）: Railway

## Guidelines
- 最新の設計詳細は `docs/design/` 配下のファイルを参照すること
- コンポーネント作成時は `docs/design/ui_spec.md` の命名規則に従うこと