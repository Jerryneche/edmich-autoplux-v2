-- CreateEnum for existing types if not exists
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SUPPLIER', 'MECHANIC', 'LOGISTICS', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'CONFIRMED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "LogisticsStatus" AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'OUT_FOR_DELIVERY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'BOOKING', 'LOGISTICS', 'SYSTEM', 'ACCOUNT', 'PRODUCT', 'PAYMENT', 'REVIEW', 'PRODUCT_CREATED', 'LOW_INVENTORY', 'ORDER_STATUS_UPDATED', 'DELIVERY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TradeInStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REDEEMED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create missing tables if they don't exist

-- ContactSubmission
CREATE TABLE IF NOT EXISTS "ContactSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "repliedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "ContactSubmission_status_idx" ON "ContactSubmission"("status");
CREATE INDEX IF NOT EXISTS "ContactSubmission_category_idx" ON "ContactSubmission"("category");
CREATE INDEX IF NOT EXISTS "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt");
CREATE INDEX IF NOT EXISTS "ContactSubmission_email_idx" ON "ContactSubmission"("email");

-- UserAddress
CREATE TABLE IF NOT EXISTS "UserAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "UserAddress_userId_idx" ON "UserAddress"("userId");
CREATE INDEX IF NOT EXISTS "UserAddress_userId_isDefault_idx" ON "UserAddress"("userId", "isDefault");

-- OrderServiceLink
CREATE TABLE IF NOT EXISTS "OrderServiceLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "mechanicBookingId" TEXT,
    "logisticsBookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrderServiceLink_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE,
    CONSTRAINT "OrderServiceLink_mechanicBookingId_fkey" FOREIGN KEY ("mechanicBookingId") REFERENCES "MechanicBooking" ("id") ON DELETE SET NULL,
    CONSTRAINT "OrderServiceLink_logisticsBookingId_fkey" FOREIGN KEY ("logisticsBookingId") REFERENCES "LogisticsBooking" ("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "OrderServiceLink_mechanicBookingId_key" ON "OrderServiceLink"("mechanicBookingId");
CREATE UNIQUE INDEX IF NOT EXISTS "OrderServiceLink_logisticsBookingId_key" ON "OrderServiceLink"("logisticsBookingId");
CREATE INDEX IF NOT EXISTS "OrderServiceLink_orderId_idx" ON "OrderServiceLink"("orderId");

-- Review
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- TradeIn
CREATE TABLE IF NOT EXISTS "TradeIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "condition" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT[],
    "partNumber" TEXT,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "vehicleYear" INTEGER,
    "askingPrice" DOUBLE PRECISION,
    "preferredMethod" TEXT NOT NULL DEFAULT 'CREDIT',
    "supplierId" TEXT,
    "offerAmount" DOUBLE PRECISION,
    "offerNote" TEXT,
    "offerDate" TIMESTAMP(3),
    "responseNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TradeIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "TradeIn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile" ("id")
);

CREATE INDEX IF NOT EXISTS "TradeIn_userId_idx" ON "TradeIn"("userId");
CREATE INDEX IF NOT EXISTS "TradeIn_supplierId_idx" ON "TradeIn"("supplierId");
CREATE INDEX IF NOT EXISTS "TradeIn_status_idx" ON "TradeIn"("status");
CREATE INDEX IF NOT EXISTS "TradeIn_category_idx" ON "TradeIn"("category");

-- TradeInInterest
CREATE TABLE IF NOT EXISTS "TradeInInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeInId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TradeInInterest_tradeInId_fkey" FOREIGN KEY ("tradeInId") REFERENCES "TradeIn" ("id") ON DELETE CASCADE,
    CONSTRAINT "TradeInInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TradeInInterest_tradeInId_userId_key" ON "TradeInInterest"("tradeInId", "userId");
CREATE INDEX IF NOT EXISTS "TradeInInterest_tradeInId_idx" ON "TradeInInterest"("tradeInId");
CREATE INDEX IF NOT EXISTS "TradeInInterest_userId_idx" ON "TradeInInterest"("userId");

-- TradeInOffer
CREATE TABLE IF NOT EXISTS "TradeInOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeInId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "supplierId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TradeInOffer_tradeInId_fkey" FOREIGN KEY ("tradeInId") REFERENCES "TradeIn" ("id") ON DELETE CASCADE,
    CONSTRAINT "TradeInOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "TradeInOffer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile" ("id"),
    CONSTRAINT "TradeInOffer_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "TradeInOffer_tradeInId_userId_key" ON "TradeInOffer"("tradeInId", "userId");
CREATE INDEX IF NOT EXISTS "TradeInOffer_tradeInId_idx" ON "TradeInOffer"("tradeInId");
CREATE INDEX IF NOT EXISTS "TradeInOffer_userId_idx" ON "TradeInOffer"("userId");
CREATE INDEX IF NOT EXISTS "TradeInOffer_supplierId_idx" ON "TradeInOffer"("supplierId");
CREATE INDEX IF NOT EXISTS "TradeInOffer_status_idx" ON "TradeInOffer"("status");

-- TradeInOfferRevision
CREATE TABLE IF NOT EXISTS "TradeInOfferRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TradeInOfferRevision_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "TradeInOffer" ("id") ON DELETE CASCADE,
    CONSTRAINT "TradeInOfferRevision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "TradeInOfferRevision_offerId_idx" ON "TradeInOfferRevision"("offerId");
CREATE INDEX IF NOT EXISTS "TradeInOfferRevision_userId_idx" ON "TradeInOfferRevision"("userId");
CREATE INDEX IF NOT EXISTS "TradeInOfferRevision_createdAt_idx" ON "TradeInOfferRevision"("createdAt");

-- Conversation
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ConversationParticipant
CREATE TABLE IF NOT EXISTS "ConversationParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE,
    CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");
CREATE INDEX IF NOT EXISTS "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- Message
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId");

-- MechanicReview
CREATE TABLE IF NOT EXISTS "MechanicReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mechanicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MechanicReview_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "MechanicProfile" ("id") ON DELETE CASCADE,
    CONSTRAINT "MechanicReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "MechanicReview_mechanicId_idx" ON "MechanicReview"("mechanicId");
CREATE INDEX IF NOT EXISTS "MechanicReview_userId_idx" ON "MechanicReview"("userId");

-- Payment
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "gatewayReference" TEXT,
    "gatewayResponse" JSONB,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_gatewayReference_key" ON "Payment"("gatewayReference");
CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX IF NOT EXISTS "Payment_orderId_idx" ON "Payment"("orderId");

-- PaymentMethod
CREATE TABLE IF NOT EXISTS "PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "last4" TEXT,
    "expiryMonth" TEXT,
    "expiryYear" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "token" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");

-- KYC
CREATE TABLE IF NOT EXISTS "KYC" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "idType" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "businessName" TEXT,
    "businessRegNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "idFrontUrl" TEXT,
    "idBackUrl" TEXT,
    "selfieUrl" TEXT,
    "businessCertUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "KYC_userId_idx" ON "KYC"("userId");
CREATE INDEX IF NOT EXISTS "KYC_status_idx" ON "KYC"("status");

-- Wallet
CREATE TABLE IF NOT EXISTS "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_userId_key" ON "Wallet"("userId");

-- WalletTransaction
CREATE TABLE IF NOT EXISTS "WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE,
    CONSTRAINT "WalletTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "WalletTransaction_walletId_idx" ON "WalletTransaction"("walletId");
CREATE INDEX IF NOT EXISTS "WalletTransaction_orderId_idx" ON "WalletTransaction"("orderId");

-- Withdrawal
CREATE TABLE IF NOT EXISTS "Withdrawal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "reference" TEXT,
    CONSTRAINT "Withdrawal_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Withdrawal_walletId_idx" ON "Withdrawal"("walletId");

-- OrderTracking
CREATE TABLE IF NOT EXISTS "OrderTracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "driverId" TEXT,
    "deliveryLat" DOUBLE PRECISION,
    "deliveryLng" DOUBLE PRECISION,
    "currentLat" DOUBLE PRECISION,
    "currentLng" DOUBLE PRECISION,
    "lastLocationUpdate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "estimatedArrival" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrderTracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE,
    CONSTRAINT "OrderTracking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User" ("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "OrderTracking_orderId_key" ON "OrderTracking"("orderId");
CREATE INDEX IF NOT EXISTS "OrderTracking_orderId_idx" ON "OrderTracking"("orderId");
CREATE INDEX IF NOT EXISTS "OrderTracking_driverId_idx" ON "OrderTracking"("driverId");

-- TrackingUpdate
CREATE TABLE IF NOT EXISTS "TrackingUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrackingUpdate_trackingId_fkey" FOREIGN KEY ("trackingId") REFERENCES "OrderTracking" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "TrackingUpdate_trackingId_idx" ON "TrackingUpdate"("trackingId");
CREATE INDEX IF NOT EXISTS "TrackingUpdate_timestamp_idx" ON "TrackingUpdate"("timestamp");
