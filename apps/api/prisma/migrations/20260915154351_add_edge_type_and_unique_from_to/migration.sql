/*
  Warnings:

  - A unique constraint covering the columns `[fromId,toId]` on the table `PlantEdge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `edgeType` to the `PlantEdge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('SKELETON', 'SPREAD');

-- AlterTable
ALTER TABLE "PlantEdge" ADD COLUMN     "edgeType" "EdgeType" NOT NULL;

-- CreateIndex
CREATE INDEX "PlantEdge_toId_idx" ON "PlantEdge"("toId");

-- CreateIndex
CREATE INDEX "PlantEdge_plantId_idx" ON "PlantEdge"("plantId");

-- CreateIndex
CREATE UNIQUE INDEX "PlantEdge_fromId_toId_key" ON "PlantEdge"("fromId", "toId");
