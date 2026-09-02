/*
  Warnings:

  - You are about to drop the column `angle` on the `PlantNode` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `PlantNode` table. All the data in the column will be lost.
  - Added the required column `x` to the `PlantNode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `y` to the `PlantNode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlantNode" DROP COLUMN "angle",
DROP COLUMN "length",
ADD COLUMN     "x" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "y" DOUBLE PRECISION NOT NULL;
