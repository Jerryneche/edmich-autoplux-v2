-- AddMissingSupplierProfileColumns
-- Adds 12 missing optional columns to SupplierProfile table
-- These columns were defined in schema.prisma but not created in database
-- Reason: Previous migrations only created base columns for SupplierProfile

ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "facebook" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "twitter" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "tiktok" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "businessHours" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "tagline" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "coverImage" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "logo" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN IF NOT EXISTS "keywords" TEXT[];
