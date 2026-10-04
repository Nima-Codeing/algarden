/*
  Warnings:

  - You are about to drop the column `endedAt` on the `Garden` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Garden` table. All the data in the column will be lost.
  - You are about to drop the column `periodType` on the `Garden` table. All the data in the column will be lost.
  - You are about to drop the column `snapshotUrl` on the `Garden` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,endAt]` on the table `Garden` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endAt` to the `Garden` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Garden" DROP COLUMN "endedAt",
DROP COLUMN "isActive",
DROP COLUMN "periodType",
DROP COLUMN "snapshotUrl",
ADD COLUMN     "endAt" TIMESTAMPTZ(0) NOT NULL;

-- DropEnum
DROP TYPE "GardenPeriod";

-- CreateIndex
CREATE UNIQUE INDEX "Garden_userId_endAt_key" ON "Garden"("userId", "endAt");
