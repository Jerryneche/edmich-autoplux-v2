-- AlterTable - Add all missing User columns
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "username" TEXT,
ADD COLUMN IF NOT EXISTS "verificationCode" TEXT,
ADD COLUMN IF NOT EXISTS "verificationExpiry" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "resetToken" TEXT,
ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isGoogleAuth" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "User_verificationCode_key" ON "User"("verificationCode");
CREATE UNIQUE INDEX IF NOT EXISTS "User_resetToken_key" ON "User"("resetToken");
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");
