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

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...');

  let prisma;
  try {
    prisma = new PrismaClient({
      log: [], // Disable logging to avoid noise
    });
    
    // Drop all tables in public schema with CASCADE
    // PostgreSQL automatically recreates the public schema
    console.log('  → Dropping public schema...');
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
    
    console.log('  → Recreating public schema...');
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS public`;
    
    console.log('✅ Database cleaned - schema reset');
    
    // Ensure connection is closed before exiting
    await prisma.$disconnect();
    
    // Small delay to ensure everything is flushed
    await new Promise(resolve => setTimeout(resolve, 100));
    
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
