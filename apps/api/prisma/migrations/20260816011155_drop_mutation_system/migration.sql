/*
  Warnings:

  - You are about to drop the column `canSpawn` on the `PlantNode` table. All the data in the column will be lost.
  - You are about to drop the column `mutationBlueprint` on the `PlantNode` table. All the data in the column will be lost.
  - You are about to drop the column `mutationProgress` on the `PlantNode` table. All the data in the column will be lost.
  - You are about to drop the column `mutationType` on the `PlantNode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlantNode" DROP COLUMN "canSpawn",
DROP COLUMN "mutationBlueprint",
DROP COLUMN "mutationProgress",
DROP COLUMN "mutationType";

-- DropEnum
DROP TYPE "MutationType";
