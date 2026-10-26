# 0003. ORM を Prisma にする

- 状態：採用
- 決定日：2026-03-25

## 背景

api は PostgreSQL にデータを置き、NestJS（[0002](0002-nestjs.md)）から読み書きする。開発しながらスキーマを変えていく見込みだったので、型の誤りを実行する前に見つけられる ORM を使いたかった。ORM は使い比べてはおらず、調べた範囲で決めた。

## 決定

ORM は Prisma にする。

## 結果

- 【当初】：決めたときに見込んでいたこと
- 【年-月】：後から分かったこと（分かった時期）

### メリット

- 【当初】`select` で取った列だけが返り値の型に出るので、取っていない列を読むと型エラーになる。
- 【2026-09】この仕組みを使い、`select` の定数から `GetPayload` でレスポンスの型を作った。取ってくる列と返す型が、同じ定数で決まる（[plant.types.ts](../../apps/api/src/plant/types/plant.types.ts)）。

### デメリット

- 【2026-10】型は `schema.prisma` から作られるので、マイグレーションを作り忘れても型チェックとテストは通ってしまう。CI で、空の DB に `migrate deploy` してから `migrate diff --exit-code` で差分を調べるようにした（[#126](https://github.com/Nima-Codeing/algarden/issues/126)）。
