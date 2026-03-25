# Contributing Guide

## コミットメッセージ規約（Conventional Commits）

| プレフィックス | 用途 |
|---|---|
| `feat:` | 新機能 |
| `fix:` | バグ修正 |
| `docs:` | ドキュメントのみの変更 |
| `refactor:` | 機能変更を伴わないコード整理 |
| `test:` | テストの追加・修正 |
| `chore:` | ビルド・設定ファイルの変更 |

### 例
```
chore: initial project setup
feat(auth): implement JWT login endpoint
feat(todo): add POST /todos endpoint
fix(plant): correct DFS backtrack logic
refactor(garden): extract node growth into service
docs: add architecture diagram to README
```

## ブランチ命名規則
```
feature/todo-crud
fix/node-growth-bug
```