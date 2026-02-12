-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "productImage" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "itemImage" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "supplierId" TEXT;
