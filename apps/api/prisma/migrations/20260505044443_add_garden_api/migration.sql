/*
  Warnings:

  - The values [DFS] on the enum `SeedType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SeedType_new" AS ENUM ('TENDRIL');
ALTER TABLE "Seed" ALTER COLUMN "seedType" TYPE "SeedType_new" USING ("seedType"::text::"SeedType_new");
ALTER TYPE "SeedType" RENAME TO "SeedType_old";
ALTER TYPE "SeedType_new" RENAME TO "SeedType";
DROP TYPE "public"."SeedType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Seed" ALTER COLUMN "px" DROP NOT NULL,
ALTER COLUMN "py" DROP NOT NULL,
ALTER COLUMN "seedType" SET DEFAULT 'TENDRIL';
