-- CreateEnum
CREATE TYPE "TradeInStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REDEEMED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'SUPPLIER', 'MECHANIC', 'LOGISTICS');

-- CreateTable
CREATE TABLE "trade_ins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldPart" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "estimatedValue" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "status" "TradeInStatus" NOT NULL DEFAULT 'PENDING',
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "trade_ins_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trade_ins" ADD CONSTRAINT "trade_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
