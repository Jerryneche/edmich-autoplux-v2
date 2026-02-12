-- Create LogisticsReview table (was missing from migration 133000)
CREATE TABLE IF NOT EXISTS "LogisticsReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logisticsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogisticsReview_logisticsId_fkey" FOREIGN KEY ("logisticsId") REFERENCES "LogisticsProfile" ("id") ON DELETE CASCADE,
    CONSTRAINT "LogisticsReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "LogisticsReview_logisticsId_idx" ON "LogisticsReview"("logisticsId");
CREATE INDEX IF NOT EXISTS "LogisticsReview_userId_idx" ON "LogisticsReview"("userId");

-- Ensure ShippingAddress exists (was missing from migration 133000)
CREATE TABLE IF NOT EXISTS "ShippingAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL UNIQUE,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShippingAddress_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ShippingAddress_orderId_key" ON "ShippingAddress"("orderId");

-- Ensure MechanicNotification exists (was missing from migration 133000)
CREATE TABLE IF NOT EXISTS "MechanicNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mechanicId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MechanicNotification_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "MechanicProfile" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "MechanicNotification_mechanicId_idx" ON "MechanicNotification"("mechanicId");
