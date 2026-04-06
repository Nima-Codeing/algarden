-- CreateEnum
CREATE TYPE "TodoScore" AS ENUM ('S', 'A', 'B', 'C', 'D');

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "score" "TodoScore";
