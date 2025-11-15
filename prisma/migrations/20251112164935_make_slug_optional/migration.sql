-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "trackingId" SET DEFAULT ('EDM-' || gen_random_uuid());

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "slug" DROP NOT NULL;
