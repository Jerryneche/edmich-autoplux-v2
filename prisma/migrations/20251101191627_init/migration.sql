/*
  Warnings:

  - Made the column `mechanicId` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `LogisticsRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `LogisticsRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "mechanicId" SET NOT NULL,
ALTER COLUMN "mechanicId" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "userId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LogisticsRequest" ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "userId" DROP DEFAULT;
