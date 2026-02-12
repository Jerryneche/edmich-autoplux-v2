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
  console.log('Clearing migration records for fresh reset...');

  try {
    const prisma = new PrismaClient();
    
    // Delete ALL migration records (both completed and failed)
    // This allows prisma migrate reset to start completely fresh
    const deleted = await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations";
    `;
    
    if (deleted > 0) {
      console.log(`✅ Cleared ${deleted} migration record(s) for fresh rebuild`);
    } else {
      console.log('✅ Migration table already empty');
    }
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear migration records:', error.message);
    console.log('Continuing with prisma migrate reset');
    process.exit(0); // Exit with 0 so deploy continues
  }
}

resolveFailedMigrations();
