-- Add marketing/branding fields to LogisticsProfile (all optional)
ALTER TABLE "LogisticsProfile"
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "instagram" TEXT,
ADD COLUMN IF NOT EXISTS "facebook" TEXT,
ADD COLUMN IF NOT EXISTS "twitter" TEXT,
ADD COLUMN IF NOT EXISTS "whatsapp" TEXT,
ADD COLUMN IF NOT EXISTS "tiktok" TEXT,
ADD COLUMN IF NOT EXISTS "businessHours" TEXT,
ADD COLUMN IF NOT EXISTS "tagline" TEXT,
ADD COLUMN IF NOT EXISTS "coverImage" TEXT,
ADD COLUMN IF NOT EXISTS "logo" TEXT,
ADD COLUMN IF NOT EXISTS "metaDescription" TEXT,
ADD COLUMN IF NOT EXISTS "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add marketing/branding fields to MechanicProfile (all optional)
ALTER TABLE "MechanicProfile"
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "instagram" TEXT,
ADD COLUMN IF NOT EXISTS "facebook" TEXT,
ADD COLUMN IF NOT EXISTS "twitter" TEXT,
ADD COLUMN IF NOT EXISTS "whatsapp" TEXT,
ADD COLUMN IF NOT EXISTS "tiktok" TEXT,
ADD COLUMN IF NOT EXISTS "businessHours" TEXT,
ADD COLUMN IF NOT EXISTS "tagline" TEXT,
ADD COLUMN IF NOT EXISTS "coverImage" TEXT,
ADD COLUMN IF NOT EXISTS "logo" TEXT,
ADD COLUMN IF NOT EXISTS "metaDescription" TEXT,
ADD COLUMN IF NOT EXISTS "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Ensure Order.paymentStatus and Order.paidAt exist (if not already present)
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
