#!/usr/bin/env node

/**
 * This script resolves failed migrations by deleting their failed records from database
 * and allowing Prisma to retry. This is necessary when migrations fail but their SQL
 * uses IF NOT EXISTS (safe to retry).
 */

import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  console.error('❌ DATABASE_URL or DIRECT_URL not found in environment variables');
  console.log('This script must be run in Vercel or with DATABASE_URL set');
  process.exit(1);
}

async function resolveFailedMigrations() {
  console.log('✅ DATABASE_URL found');
  console.log('Resolving failed migrations...');

  try {
    const prisma = new PrismaClient();
    
    // Delete any failed migration records from _prisma_migrations
    const deleted = await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations" 
      WHERE "finished_at" IS NULL
      AND "migration_name" IN (
        '20260212134000_add_supplierprofile_columns',
        '20260212134001_add_marketing_fields_to_profiles',
        '20260212135000_complete_schema_parity'
      );
    `;
    
    if (deleted > 0) {
      console.log(`✅ Deleted ${deleted} failed migration record(s)`);
    } else {
      console.log('✅ No failed migrations to resolve');
    }
    console.log('Migrations will be retried on next deploy...');
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to delete migration records:', error.message);
    console.log('Continuing with prisma migrate deploy');
    process.exit(0); // Exit with 0 so deploy continues
  }
}

resolveFailedMigrations();
