import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resolveMigration() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log("⏭️  DATABASE_URL not set, skipping migration resolution");
      process.exit(0);
    }

    console.log("🔄 Checking for failed migrations...");

    // Delete the failed migration entry
    const deleted = await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations" 
      WHERE finished_at IS NULL 
        AND rolled_back_at IS NULL
    `;

    if (deleted > 0) {
      console.log(`✅ Resolved ${deleted} failed migration(s)`);
    } else {
      console.log("✅ No failed migrations to resolve");
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.log("⚠️  Could not resolve migrations:", error.message);
    await prisma.$disconnect();
    // Exit gracefully even if this fails
    process.exit(0);
  }
}

resolveMigration();
