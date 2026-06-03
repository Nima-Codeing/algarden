/*
  Warnings:

  - Added the required column `angle` to the `PlantNode` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MutationType" AS ENUM ('OCTAHEDGON', 'RADIAL');

-- AlterTable
ALTER TABLE "PlantNode" ADD COLUMN     "angle" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "canSpawn" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mutationBlueprint" JSONB,
ADD COLUMN     "mutationProgress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mutationType" "MutationType";

-- CreateTable
CREATE TABLE "PlantEdge" (
    "id" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "fromId" UUID NOT NULL,
    "toId" UUID NOT NULL,
    "createAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantEdge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlantEdge" ADD CONSTRAINT "PlantEdge_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantEdge" ADD CONSTRAINT "PlantEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "PlantNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantEdge" ADD CONSTRAINT "PlantEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "PlantNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
