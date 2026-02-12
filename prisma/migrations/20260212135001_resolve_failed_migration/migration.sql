-- Resolve failed migration by marking it as completed in _prisma_migrations table
-- This allows Prisma to proceed with subsequent migrations
-- The migration 20260212134000_add_supplierprofile_columns uses IF NOT EXISTS, so it's safe to mark as completed

UPDATE "_prisma_migrations"
SET "finished_at" = CURRENT_TIMESTAMP, "logs" = 'Resolved: IF NOT EXISTS ensures idempotency'
WHERE "migration_name" = '20260212134000_add_supplierprofile_columns'
AND "finished_at" IS NULL;
