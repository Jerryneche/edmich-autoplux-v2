#!/usr/bin/env node

/**
 * This script resolves the failed migration by deleting the failed record from database
 * and allowing Prisma to retry. This is necessary when a migration fails but its SQL
 * uses IF NOT EXISTS (safe to retry).
 */

import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  console.error('❌ DATABASE_URL or DIRECT_URL not found in environment variables');
  console.log('This script must be run in Vercel or with DATABASE_URL set');
  process.exit(1);
}

async function resolveFailedMigration() {
  console.log('✅ DATABASE_URL found');
  console.log('Resolving failed migration: 20260212134000_add_supplierprofile_columns');

  try {
    const prisma = new PrismaClient();
    
    // Delete the failed migration record from _prisma_migrations
    const deleted = await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations" 
      WHERE "migration_name" = '20260212134000_add_supplierprofile_columns' 
      AND "finished_at" IS NULL;
    `;
    
    console.log(`✅ Deleted ${deleted} failed migration record(s)`);
    console.log('Migration will be retried on next deploy...');
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to delete migration record:', error.message);
    console.log('Continuing with prisma migrate deploy (may fail if schema hasn\'t changed)');
    process.exit(0); // Exit with 0 so deploy continues
  }
}

resolveFailedMigration();
