import { prisma } from "@/lib/prisma";

async function testChatConversation() {
  try {
    console.log("🧪 Starting chat conversation test...");

    // Get first two users from database
    const users = await prisma.user.findMany({
      take: 2,
    });

    if (users.length < 2) {
      console.error("❌ Need at least 2 users in database for testing");
      console.log("Found users:", users.length);
      return;
    }

    const user1 = users[0];
    const user2 = users[1];

    console.log(`ℹ️ User 1: ${user1.id} (${user1.email})`);
    console.log(`ℹ️ User 2: ${user2.id} (${user2.email})`);

    // Step 1: Check if conversation already exists
    console.log("\n📋 Checking for existing conversation...");
    const existingConv = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user1.id } } },
          { participants: { some: { userId: user2.id } } },
        ],
      },
      include: {
        participants: true,
      },
    });

    if (existingConv) {
      console.log(`ℹ️ Existing conversation found: ${existingConv.id}`);
    } else {
      console.log("ℹ️ No existing conversation - testing creation...");

      // Step 2: Try to create conversation
      console.log("\n🔨 Creating conversation...");
      const newConv = await prisma.conversation.create({
        data: {
          participants: {
            createMany: {
              data: [
                { userId: user1.id },
                { userId: user2.id },
              ],
            },
          },
        },
        include: {
          participants: {
            include: {
              user: { select: { id: true, email: true } },
            },
          },
        },
      });

      console.log(`✅ Conversation created: ${newConv.id}`);
      console.log(`✅ Participants: ${newConv.participants.length}`);
    }

    // Step 3: Try to create a message
    const conv = existingConv || (await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user1.id } } },
          { participants: { some: { userId: user2.id } } },
        ],
      },
    }));

    console.log("\n✉️ Creating message...");
    const message = await prisma.message.create({
      data: {
        conversationId: conv!.id,
        senderId: user1.id,
        content: "Test message from automated script",
      },
      include: {
        sender: { select: { id: true, email: true } },
      },
    });

    console.log(`✅ Message created: ${message.id}`);
    console.log(`✅ Content: "${message.content}"`);

    console.log("\n🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testChatConversation();
