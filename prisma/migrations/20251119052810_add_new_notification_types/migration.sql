/*
  Warnings:

  - Added the required column `address` to the `LogisticsProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `LogisticsProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseNumber` to the `LogisticsProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `LogisticsProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `LogisticsProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleNumber` to the `LogisticsProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleType` to the `LogisticsProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `MechanicProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessName` to the `MechanicProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `MechanicProfile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `experience` on the `MechanicProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'BOOKING', 'PRODUCT', 'SYSTEM', 'PAYMENT', 'REVIEW', 'PRODUCT_CREATED', 'LOW_INVENTORY', 'ORDER_STATUS_UPDATED');

-- AlterTable
ALTER TABLE "LogisticsProfile" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "completedDeliveries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "licenseNumber" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "vehicleNumber" TEXT NOT NULL,
ADD COLUMN     "vehicleType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MechanicProfile" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "businessName" TEXT NOT NULL,
ADD COLUMN     "completedJobs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "specialization" TEXT[],
DROP COLUMN "experience",
ADD COLUMN     "experience" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "trackingId" SET DEFAULT ('EDM-' || gen_random_uuid());

-- CreateTable
CREATE TABLE "MechanicBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleMake" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehicleYear" TEXT NOT NULL,
    "plateNumber" TEXT,
    "serviceType" TEXT NOT NULL,
    "customService" TEXT,
    "estimatedPrice" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "phone" TEXT NOT NULL,
    "additionalNotes" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "mechanicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MechanicBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogisticsBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "deliverySpeed" TEXT NOT NULL,
    "packageDescription" TEXT NOT NULL,
    "packageValue" DOUBLE PRECISION,
    "estimatedPrice" DOUBLE PRECISION NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupCity" TEXT NOT NULL,
    "pickupState" TEXT,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryCity" TEXT NOT NULL,
    "deliveryState" TEXT,
    "phone" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "specialInstructions" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "driverId" TEXT,
    "trackingNumber" TEXT,
    "currentLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogisticsBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LogisticsBooking_trackingNumber_key" ON "LogisticsBooking"("trackingNumber");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "MechanicBooking" ADD CONSTRAINT "MechanicBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MechanicBooking" ADD CONSTRAINT "MechanicBooking_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "MechanicProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticsBooking" ADD CONSTRAINT "LogisticsBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticsBooking" ADD CONSTRAINT "LogisticsBooking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "LogisticsProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
