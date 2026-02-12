-- Add missing optional fields to tables to match schema.prisma completely
-- NOTE: Marketing fields for MechanicProfile, LogisticsProfile, and SupplierProfile
-- are already added in migrations 20260212134000 and 20260212134001
-- This migration adds only the remaining unique fields

-- Product: Add SEO and additional fields
ALTER TABLE "Product" 
ADD COLUMN IF NOT EXISTS "metaTitle" TEXT,
ADD COLUMN IF NOT EXISTS "metaDescription" TEXT,
ADD COLUMN IF NOT EXISTS "keywords" TEXT[];

-- LogisticsReview: Add missing updatedAt field
ALTER TABLE "LogisticsReview"
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- LogisticsBooking: Add missing timestamps if not present
ALTER TABLE "LogisticsBooking"
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- MechanicBooking: Ensure timestamps
ALTER TABLE "MechanicBooking"
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- SupplierProfile: Already has all fields from 20260212134000, skip duplicates

-- Vehicle: Ensure all fields
ALTER TABLE "Vehicle"
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Order: Ensure timestamps (should already exist but adding for safety)
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ShippingAddress: Ensure timestamps
ALTER TABLE "ShippingAddress"
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Booking: Ensure timestamps (should already exist but adding for safety)
ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- LogisticsRequest: Ensure timestamps (should already exist but adding for safety)
ALTER TABLE "LogisticsRequest"
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
