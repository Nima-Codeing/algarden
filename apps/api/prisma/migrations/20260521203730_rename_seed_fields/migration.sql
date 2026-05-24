/*
  Warnings:

  - You are about to drop the column `px` on the `Seed` table. All the data in the column will be lost.
  - You are about to drop the column `py` on the `Seed` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Seed" DROP COLUMN "px",
DROP COLUMN "py",
ADD COLUMN     "x" DOUBLE PRECISION,
ADD COLUMN     "y" DOUBLE PRECISION;
