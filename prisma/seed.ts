// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

async function main() {
    // === ADMIN USER ===
    const admin = await prisma.user.upsert({
      where: { email: "admin@edmich.com" },
      update: {},
      create: {
        email: "admin@edmich.com",
        name: "Platform Admin",
        role: "ADMIN",
        onboardingStatus: "COMPLETED",
        // Add any other required fields here
      },
    });
  console.log("Seeding Edmich Autoplux — FULL PLATFORM DATA...");

  // === 1. USERS ===
  const buyer1 = await prisma.user.upsert({
    where: { email: "buyer1@example.com" },
    update: {},
    create: {
      email: "buyer1@example.com",
      name: "Chinedu Okeke",
      role: "BUYER",
      onboardingStatus: "COMPLETED",
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: "buyer2@example.com" },
    update: {},
    create: {
      email: "buyer2@example.com",
      name: "Aisha Yusuf",
      role: "BUYER",
      onboardingStatus: "COMPLETED",
    },
  });

  const mechanic = await prisma.user.upsert({
    where: { email: "mechanic@example.com" },
    update: {},
    create: {
      email: "mechanic@example.com",
      name: "Tunde AutoFix",
      role: "MECHANIC",
      onboardingStatus: "COMPLETED",
    },
  });

  const logistics = await prisma.user.upsert({
    where: { email: "logistics@example.com" },
    update: {},
    create: {
      email: "logistics@example.com",
      name: "Swift Haul NG",
      role: "LOGISTICS",
      onboardingStatus: "COMPLETED",
    },
  });

  const supplierUser = await prisma.user.upsert({
    where: { email: "supplier@example.com" },
    update: {},
    create: {
      email: "supplier@example.com",
      name: "Auto Parts Ltd",
      role: "SUPPLIER",
      onboardingStatus: "COMPLETED",
    },
  });

  // === 2. SUPPLIER PROFILE ===
  const supplierProfile = await prisma.supplierProfile.upsert({
    where: { userId: supplierUser.id },
    update: {},
    create: {
      userId: supplierUser.id,
      businessName: "Auto Parts Ltd",
      businessAddress: "Plot 45, Oba Akran Ave, Ikeja",
      city: "Lagos",
      state: "Lagos",
      description:
        "Leading distributor of OEM & aftermarket auto parts in Nigeria",
      verified: true,
      cacNumber: "RC987654",
      bankName: "Zenith Bank",
      accountNumber: "1012345678",
      accountName: "Auto Parts Ltd",
    },
  });

  // === 3. PRODUCTS ===
  const products = [
    {
      name: "Wiper Blades (Pair)",
      price: 6500.0,
      stock: 120,
      category: "Accessories",
      image: "/wiper.jpg",
    },
    {
      name: "Spark Plugs (Set of 4)",
      price: 18000.0,
      stock: 80,
      category: "Engine",
      image: "/spark.jpg",
    },
    {
      name: "5W-30 Synthetic Oil (4L)",
      price: 28500.0,
      stock: 200,
      category: "Lubricants",
      image: "/oil.jpg",
    },
    {
      name: "Front Brake Pads (Toyota)",
      price: 15000.0,
      stock: 90,
      category: "Brakes",
      image: "/brake.jpg",
    },
    {
      name: "Air Filter (Honda Civic)",
      price: 8500.0,
      stock: 110,
      category: "Filters",
      image: "/filter.jpg",
    },
    {
      name: "Car Battery 65Ah",
      price: 75000.0,
      stock: 40,
      category: "Electrical",
      image: "/battery.jpg",
    },
    {
      name: "Bridgestone Tire 195/65R15",
      price: 68000.0,
      stock: 60,
      category: "Tires",
      image: "/tire.jpg",
    },
    {
      name: "Headlight Bulb H4 (Pair)",
      price: 12000.0,
      stock: 150,
      category: "Lighting",
      image: "/bulb.jpg",
    },
    {
      name: "Timing Belt Kit",
      price: 42000.0,
      stock: 35,
      category: "Engine",
      image: "/belt.jpg",
    },
    {
      name: "Shock Absorber (Rear)",
      price: 38000.0,
      stock: 70,
      category: "Suspension",
      image: "/shock.jpg",
    },
    {
      name: "Wiper Blades (Pair)",
      price: 6500,
      stock: 120,
      category: "Accessories",
      image: "/wiper.jpg",
    },
    {
      name: "Spark Plugs (Set of 4)",
      price: 18000,
      stock: 80,
      category: "Engine",
      image: "/spark.jpg",
    },
    {
      name: "5W-30 Synthetic Oil (4L)",
      price: 28500,
      stock: 200,
      category: "Lubricants",
      image: "/oil.jpg",
    },
    {
      name: "Front Brake Pads (Toyota)",
      price: 15000,
      stock: 90,
      category: "Brakes",
      image: "/brake.jpg",
    },
    {
      name: "Air Filter (Honda Civic)",
      price: 8500,
      stock: 110,
      category: "Filters",
      image: "/filter.jpg",
    },
    {
      name: "Car Battery 65Ah",
      price: 75000,
      stock: 40,
      category: "Electrical",
      image: "/battery.jpg",
    },
    {
      name: "Bridgestone Tire 195/65R15",
      price: 68000,
      stock: 60,
      category: "Tires",
      image: "/tire.jpg",
    },
    {
      name: "Headlight Bulb H4 (Pair)",
      price: 12000,
      stock: 150,
      category: "Lighting",
      image: "/bulb.jpg",
    },
    {
      name: "Timing Belt Kit",
      price: 42000,
      stock: 35,
      category: "Engine",
      image: "/belt.jpg",
    },
    {
      name: "Shock Absorber (Rear)",
      price: 38000,
      stock: 70,
      category: "Suspension",
      image: "/shock.jpg",
    },
    // ... ADD 40 MORE (see below)
    {
      name: "Engine Oil Filter",
      price: 4500,
      stock: 180,
      category: "Filters",
      image: "/oilfilter.jpg",
    },
    {
      name: "Fuel Pump (Toyota)",
      price: 85000,
      stock: 25,
      category: "Engine",
      image: "/fuelpump.jpg",
    },
    {
      name: "Radiator Fan",
      price: 55000,
      stock: 45,
      category: "Cooling",
      image: "/fan.jpg",
    },
    {
      name: "Alternator 90A",
      price: 125000,
      stock: 30,
      category: "Electrical",
      image: "/alternator.jpg",
    },
    {
      name: "Clutch Kit (Manual)",
      price: 95000,
      stock: 20,
      category: "Transmission",
      image: "/clutch.jpg",
    },
    {
      name: "Side Mirror (Powered)",
      price: 22000,
      stock: 65,
      category: "Accessories",
      image: "/mirror.jpg",
    },
    {
      name: "AC Compressor",
      price: 180000,
      stock: 15,
      category: "Cooling",
      image: "/compressor.jpg",
    },
    {
      name: "Brake Disc (Front)",
      price: 28000,
      stock: 55,
      category: "Brakes",
      image: "/disc.jpg",
    },
    {
      name: "Fog Light LED",
      price: 15000,
      stock: 90,
      category: "Lighting",
      image: "/fog.jpg",
    },
    {
      name: "Suspension Spring",
      price: 32000,
      stock: 60,
      category: "Suspension",
      image: "/spring.jpg",
    },
  ];

  await prisma.product.createMany({
    data: products.map((p) => ({
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category,
      image: p.image,
      description: `Premium ${p.name.toLowerCase()} for Nigerian roads.`,
      supplierId: supplierProfile.id,
    })),
    skipDuplicates: true,
  });

  // === 4. ORDERS (20) — FIXED: `i` in scope ===
  const orderItems = await prisma.product.findMany({ take: 10 });

  const orders = Array.from({ length: 20 }, (_, i) => ({
    id: `order_${String(i + 1).padStart(3, "0")}`,
    userId: i % 2 === 0 ? buyer1.id : buyer2.id,
    status: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"][
      Math.floor(Math.random() * 4)
    ],
    paymentMethod: "CARD",
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }));

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const items = orderItems
      .slice(0, Math.floor(Math.random() * 3) + 1)
      .map((item) => ({
        productId: item.id,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: item.price,
      }));

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await prisma.order.create({
      data: {
        userId: order.userId,
        status: order.status,
        total,
        paymentMethod: order.paymentMethod,
        trackingId: `EDM-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`,
        deliveryNotes: "Handle with care",
        shippingAddress: {
          create: {
            fullName: `Customer ${i + 1}`,
            email: `cust${i + 1}@example.com`,
            phone: `080${String(1000000 + i).padStart(7, "0")}`,
            address: `${100 + i} Auto Street`,
            city: "Lagos",
            state: "Lagos",
            zipCode: "100001",
          },
        },
        items: { create: items },
      },
    });
  }

  // === 5. BOOKINGS (15) ===
  const bookingDates = [
    "2025-11-12T09:00:00Z",
    "2025-11-13T14:00:00Z",
    "2025-11-15T11:30:00Z",
    "2025-11-16T10:00:00Z",
    "2025-11-18T16:00:00Z",
    "2025-11-20T13:00:00Z",
  ];

  await prisma.booking.createMany({
    data: Array.from({ length: 15 }, (_, i) => ({
      name: `Customer ${i + 1}`,
      email: `cust${i + 1}@example.com`,
      phone: `080${String(1000000 + i).padStart(7, "0")}`,
      carModel: [
        "Toyota Camry",
        "Honda Accord",
        "Mercedes C300",
        "Ford Ranger",
      ][i % 4],
      service: ["Oil Change", "Brake Repair", "AC Service", "Engine Tune-up"][
        i % 4
      ],
      appointmentDate: new Date(bookingDates[i % bookingDates.length]),
      notes: i % 3 === 0 ? "Urgent — car not starting" : "Routine maintenance",
      userId: mechanic.id,
    })),
    skipDuplicates: true,
  });

  // === 6. LOGISTICS REQUESTS (10) ===
  const pickupLocations = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"];
  const dropoffLocations = ["Enugu", "Calabar", "Benin", "Owerri", "Jos"];

  await prisma.logisticsRequest.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      name: `Logistics Client ${i + 1}`,
      email: `log${i + 1}@example.com`,
      phone: `081${String(2000000 + i).padStart(7, "0")}`,
      pickup: pickupLocations[i % pickupLocations.length],
      dropoff: dropoffLocations[i % dropoffLocations.length],
      vehicle: ["Van", "Truck", "Trailer", "Pickup"][i % 4],
      deliveryDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
      notes:
        i % 2 === 0 ? "Fragile: Glass windshields" : "Heavy: Engine blocks",
      userId: logistics.id,
    })),
    skipDuplicates: true,
  });

  console.log("EDMICH AUTOPLUX FULLY SEEDED!");
  console.log(
    `Users: 5 | Products: ${products.length} | Orders: 20 | Bookings: 15 | Logistics: 10`
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .catch((e) => {
      console.error("Seeding failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
