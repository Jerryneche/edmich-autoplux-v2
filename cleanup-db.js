#!/usr/bin/env node

/**
 * This script cleans up the database by dropping all tables and constraints
 * This ensures prisma db push starts with a completely clean slate
 */

import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  console.error('❌ DATABASE_URL or DIRECT_URL not found in environment variables');
  console.log('This script must be run in Vercel or with DATABASE_URL set');
  process.exit(1);
}

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...');

  try {
    const prisma = new PrismaClient();
    
    // Drop all tables with cascade to remove constraints
    await prisma.$executeRaw`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
    `;
    
    console.log('✅ Database cleaned - all tables dropped');
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to cleanup database:', error.message);
    console.log('Continuing with prisma db push anyway');
    process.exit(0); // Exit with 0 so deploy continues
  }
}

cleanupDatabase();
