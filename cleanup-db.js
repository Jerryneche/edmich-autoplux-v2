#!/usr/bin/env node

/**
 * This script cleans up the database by dropping all tables and constraints
 * This ensures prisma db push starts with a completely clean slate
 */

import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  console.log('ℹ️  DATABASE_URL or DIRECT_URL not found in environment variables');
  console.log('Skipping database cleanup - prisma db push will handle schema sync');
  process.exit(0); // Exit gracefully so build continues
}

// Allow skipping cleanup with SKIP_DB_CLEANUP env variable
if (process.env.SKIP_DB_CLEANUP === 'true') {
  console.log('ℹ️  SKIP_DB_CLEANUP is set - skipping database cleanup');
  process.exit(0);
}

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...');

  let prisma;
  try {
    prisma = new PrismaClient({
      log: [], // Disable logging to avoid noise
    });
    
    // Drop all tables in public schema with CASCADE
    console.log('  → Dropping public schema with all objects...');
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
    
    // Wait longer to ensure schema drop is complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('  → Recreating public schema...');
    await prisma.$executeRaw`CREATE SCHEMA public`;
    
    // Wait for schema recreation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Database cleaned - schema fully reset');
    
    // Ensure connection is closed before exiting
    await prisma.$disconnect();
    
    // Final delay before letting next process run
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    process.exit(0);
  } catch (error) {
    console.log(`⚠️  Cleanup skipped: ${error.message}`);
    if (prisma) {
      await prisma.$disconnect();
    }
    // Exit with 0 so deploy continues (prisma db push will handle sync)
    process.exit(0);
  }
}

cleanupDatabase();
