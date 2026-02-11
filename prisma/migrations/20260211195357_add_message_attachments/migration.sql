-- AlterTable
ALTER TABLE "Message" ADD COLUMN "attachments" JSONB NOT NULL DEFAULT '[]',
ALTER TABLE "Message" ALTER COLUMN "content" DROP NOT NULL;
