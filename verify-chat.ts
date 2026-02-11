import { prisma } from "@/lib/prisma";

async function verifyWorkingChat() {
  console.log("\n✓ Verifying the chat that WORKED:\n");

  // Buyer
  const buyer = await prisma.user.findUnique({
    where: { id: "cmkq0ix6c0000l50mgmjs6vwz" },
    select: { id: true, name: true, email: true, role: true },
  });

  // Supplier (the one I created)
  const supplier = await prisma.user.findUnique({
    where: { id: "cmlff5jid0002lb0mt0kako4e" },
    select: { id: true, name: true, email: true, role: true },
  });

  // Product
  const product = await prisma.product.findUnique({
    where: { id: "cmkp71wda0001ic0mlucj9zam" },
    select: { id: true, name: true, supplierId: true },
  });

  console.log("Buyer (Real):");
  console.log(`  ✅ ${buyer?.id} - ${buyer?.name} (${buyer?.role})`);
  
  console.log("\nSupplier (Real - Manual Signup):");
  console.log(`  ✅ ${supplier?.id} - ${supplier?.name} (${supplier?.role})`);
  
  console.log("\nProduct:");
  console.log(`  ✅ ${product?.id} - ${product?.name}`);
  console.log(`  Supplier ID: ${product?.supplierId}`);

  console.log("\n" + "=".repeat(60));

  // Now check the problematic supplier
  console.log("\n✗ Checking the supplier with ROLE MISMATCH:\n");

  const problematicSupplier = await prisma.user.findUnique({
    where: { id: "cmkp5dhhb0001ic0mf47jyck2" },
    select: { id: true, name: true, email: true, role: true },
  });

  if (problematicSupplier) {
    console.log(`Found: ${problematicSupplier.id}`);
    console.log(`Name: ${problematicSupplier.name}`);
    console.log(`Email: ${problematicSupplier.email}`);
    console.log(`Current Role in DB: ${problematicSupplier.role} ❌ (Should be SUPPLIER)`);
  } else {
    console.log("❌ User not found");
  }

  await prisma.$disconnect();
}

verifyWorkingChat();
