#!/usr/bin/env node

/**
 * This script marks all SupplierProfile, LogisticsProfile, and MechanicProfile
 * records as verified=true and approved=true
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  
  for (const file of envFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (key && value) {
            process.env[key.trim()] = value;
          }
        }
      });
      break;
    }
  }
}

loadEnv();

if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  console.error('❌ DATABASE_URL or DIRECT_URL not found in environment variables');
  console.error('Please ensure .env or .env.local file exists with DATABASE_URL or DIRECT_URL');
  process.exit(1);
}

async function approveAllProfiles() {
  console.log('🔄 Approving all profiles...');

  try {
    const prisma = new PrismaClient();
    
    // Update SupplierProfiles
    const supplierResult = await prisma.supplierProfile.updateMany({
      data: {
        verified: true,
        approved: true,
      },
    });
    console.log(`✅ Updated ${supplierResult.count} SupplierProfile(s)`);

    // Update LogisticsProfiles
    const logisticsResult = await prisma.logisticsProfile.updateMany({
      data: {
        verified: true,
        approved: true,
      },
    });
    console.log(`✅ Updated ${logisticsResult.count} LogisticsProfile(s)`);

    // Update MechanicProfiles
    const mechanicResult = await prisma.mechanicProfile.updateMany({
      data: {
        verified: true,
        approved: true,
      },
    });
    console.log(`✅ Updated ${mechanicResult.count} MechanicProfile(s)`);

    const total = supplierResult.count + logisticsResult.count + mechanicResult.count;
    console.log(`\n✅ Successfully approved ${total} profile(s) total`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to approve profiles:', error.message);
    process.exit(1);
  }
}

approveAllProfiles();
