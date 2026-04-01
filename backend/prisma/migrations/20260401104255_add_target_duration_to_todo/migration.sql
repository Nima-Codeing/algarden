/*
  Warnings:

  - Added the required column `updatedAt` to the `Plant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plant" ADD COLUMN     "updatedAt" TIMESTAMPTZ(0) NOT NULL;

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "startedAt" TIMESTAMPTZ(0),
ADD COLUMN     "targetDuration" INTEGER;
