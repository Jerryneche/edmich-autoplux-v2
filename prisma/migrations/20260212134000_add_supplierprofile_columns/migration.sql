-- AddMissingSupplierProfileColumns
-- Adds 12 missing optional columns to SupplierProfile table
-- These columns were defined in schema.prisma but not created in database
-- Reason: Previous migrations only created base columns for SupplierProfile

ALTER TABLE "SupplierProfile" ADD COLUMN "website" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "instagram" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "facebook" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "twitter" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "whatsapp" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "tiktok" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "businessHours" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "tagline" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "logo" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "keywords" TEXT[];
