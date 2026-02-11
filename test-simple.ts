import { prisma } from "@/lib/prisma";

async function test() {
  try {
    const count = await prisma.user.count();
    console.log("Users count:", count);
    
    const user = await prisma.user.findFirst();
    if (user) {
      console.log("First user:", user.id, user.email);
    } else {
      console.log("No users found");
    }
  } catch (e: any) {
    console.error("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
