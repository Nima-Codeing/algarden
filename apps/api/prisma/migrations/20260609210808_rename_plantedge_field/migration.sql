/*
  Warnings:

  - The values [OCTAHEDGON] on the enum `MutationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createAt` on the `PlantEdge` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MutationType_new" AS ENUM ('OCTAHEDRON', 'RADIAL');
ALTER TABLE "PlantNode" ALTER COLUMN "mutationType" TYPE "MutationType_new" USING ("mutationType"::text::"MutationType_new");
ALTER TYPE "MutationType" RENAME TO "MutationType_old";
ALTER TYPE "MutationType_new" RENAME TO "MutationType";
DROP TYPE "public"."MutationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "PlantEdge" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;
