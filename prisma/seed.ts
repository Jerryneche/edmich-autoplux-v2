// prisma/seed.ts// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function main() {
  // --- Create Test Users ---
  const user1 = await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: {},
    create: {
      email: "buyer@example.com",
      name: "Test Buyer",
      role: "BUYER",
      onboardingStatus: "COMPLETED",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "mechanic@example.com" },
    update: {},
    create: {
      email: "mechanic@example.com",
      name: "Test Mechanic",
      role: "MECHANIC",
      onboardingStatus: "COMPLETED",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "logistics@example.com" },
    update: {},
    create: {
      email: "logistics@example.com",
      name: "Test Logistics",
      role: "LOGISTICS",
      onboardingStatus: "COMPLETED",
    },
  });

  // --- Suppliers ---
  await prisma.supplier.createMany({
    data: [
      {
        name: "John Doe",
        email: "supplier1@example.com",
        company: "Auto Parts Ltd",
        product: "Brake Pads",
        price: "₦15,000",
        description: "High-quality brake pads for Toyota models",
        approved: true,
      },
      {
        name: "Jane Smith",
        email: "supplier2@example.com",
        company: "Quality Motors",
        product: "Engine Oil",
        price: "₦8,500",
        description: "Premium synthetic oil for all vehicles",
        approved: false,
      },
    ],
  });

  // --- Bookings ---
  await prisma.booking.createMany({
    data: [
      {
        name: "Michael Johnson",
        email: "mike@example.com",
        phone: "08012345678",
        carModel: "Toyota Corolla",
        service: "Brake repair",
        appointmentDate: new Date("2025-11-01T10:00:00Z"),
        notes: "Customer requests OEM parts only",
        userId: user1.id,
      },
    ],
  });

  // --- Logistics Requests ---
  await prisma.logisticsRequest.createMany({
    data: [
      {
        name: "David Brown",
        email: "david@example.com",
        phone: "08123456789",
        pickup: "Lagos",
        dropoff: "Abuja",
        vehicle: "Truck",
        deliveryDate: new Date("2025-11-05T09:00:00Z"),
        notes: "Fragile parts, handle with care",
        userId: user3.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error("Seeding failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
