-- Add account name and bank name to Withdrawal
ALTER TABLE "Withdrawal" ADD COLUMN "bankName" TEXT,
ADD COLUMN "accountName" TEXT;
