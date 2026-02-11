import { prisma } from "@/lib/prisma";

async function findSupplier() {
  // Get all users
  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });

  console.log(`\nTotal Users in Database: ${allUsers.length}\n`);

  // Check product's supplierId  
  const product = await prisma.product.findUnique({
    where: { id: "cmkp71wda0001ic0mlucj9zam" },
    select: { id: true, name: true, supplierId: true },
  });

  console.log(`Product: ${product?.name}`);
  console.log(`Product's supplierId: ${product?.supplierId}`);
  console.log(`This user exists? ${allUsers.find(u => u.id === product?.supplierId) ? "✅ YES" : "❌ NO"}\n`);

  // List all suppliers
  const suppliers = allUsers.filter(u => u.role === "SUPPLIER");
  console.log(`All SUPPLIER accounts (${suppliers.length}):`);
  suppliers.forEach(s => {
    console.log(`  • ${s.id} - ${s.name} (${s.email})`);
  });

  // List all BUYER users (might have CMK)
  const buyers = allUsers.filter(u => u.role === "BUYER");
  console.log(`\nAll BUYER accounts (${buyers.length}):`);
  buyers.forEach(b => {
    console.log(`  • ${b.id} - ${b.name} (${b.email})`);
    if (b.id.includes("cmkp") || b.name.includes("K")) {
      console.log(`    ⚠️ This one starts with 'cmkp'!`);
    }
  });

  await prisma.$disconnect();
}

findSupplier();
