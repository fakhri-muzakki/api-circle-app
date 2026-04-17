-- DropIndex
DROP INDEX "users_full_name_trgm_idx";

-- DropIndex
DROP INDEX "users_username_trgm_idx";

-- AlterTable
ALTER TABLE "threads" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
