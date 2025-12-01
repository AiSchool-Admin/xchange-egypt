-- AlterTable: Make category_id optional in items table
ALTER TABLE "items" ALTER COLUMN "category_id" DROP NOT NULL;
