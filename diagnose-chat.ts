import { prisma } from "@/lib/prisma";

async function diagnoseChat() {
  const supplierId = "cmlff5jid0002lb0mt0kako4e";
  const productId = "cmlffdj1k0006lb0m4zp1yxnt";

  console.log("\n🔍 Diagnosing chat error...\n");

  try {
    // 1. Check if SupplierProfile exists
    console.log("1️⃣ Checking SupplierProfile...");
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { id: supplierId },
      select: { id: true, userId: true, businessName: true },
    });

    if (!supplierProfile) {
      console.log("❌ SupplierProfile NOT FOUND");
      return;
    }

    console.log("✅ SupplierProfile found:");
    console.log(`   ID: ${supplierProfile.id}`);
    console.log(`   UserId: ${supplierProfile.userId}`);
    console.log(`   Business: ${supplierProfile.businessName}\n`);

    // 2. Check if User exists
    console.log("2️⃣ Checking User...");
    const user = await prisma.user.findUnique({
      where: { id: supplierProfile.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      console.log("❌ User NOT FOUND for userId:", supplierProfile.userId);
      return;
    }

    console.log("✅ User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}\n`);

    // 3. Check Product
    console.log("3️⃣ Checking Product...");
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, supplierId: true },
    });

    if (!product) {
      console.log("❌ Product NOT FOUND");
      return;
    }

    console.log("✅ Product found:");
    console.log(`   ID: ${product.id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   SupplierId: ${product.supplierId}\n`);

    // 4. Try to create a test conversation
    console.log("4️⃣ Testing conversation creation...");
    const testUserId = "cmkq0ix6c0000l50mgmjs6vwz"; // Buyer

    try {
      const testConversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: testUserId },
              { userId: supplierProfile.userId },
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      console.log("✅ Test conversation created successfully:");
      console.log(`   ID: ${testConversation.id}`);
      console.log(`   Participants: ${testConversation.participants.length}\n`);

      // Clean up test conversation
      await prisma.conversation.delete({
        where: { id: testConversation.id },
      });
      console.log("✅ Test conversation deleted\n");
    } catch (convError: any) {
      console.log("❌ Conversation creation failed:");
      console.log(`   Error: ${convError.message}`);
      console.log(`   Code: ${convError.code}\n`);
    }

    console.log("✨ Diagnosis complete!\n");
  } catch (error) {
    console.error("Diagnostic error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseChat();
