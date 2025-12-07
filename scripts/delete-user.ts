// scripts/delete-user.ts
// Run with: npx ts-node scripts/delete-user.ts <user-email>

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteUserSafely(email: string) {
  try {
    console.log(`\n🔍 Finding user: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return;
    }

    console.log(`\n📋 User Details:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);

    console.log(`\n⚠️  WARNING: This will delete ALL data for this user!`);
    console.log(`   Deleting in 3 seconds... (Press Ctrl+C to cancel)`);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log(`\n🗑️  Starting deletion process...`);

    // Delete in correct order (child tables first, then parent)
    const userId = user.id;

    // 1. Delete related records that have ON DELETE CASCADE
    console.log(`\n1️⃣  Deleting sessions...`);
    const sessions = await prisma.session.deleteMany({ where: { userId } });
    console.log(`   ✅ Deleted ${sessions.count} sessions`);

    console.log(`\n2️⃣  Deleting accounts (OAuth connections)...`);
    const accounts = await prisma.account.deleteMany({ where: { userId } });
    console.log(`   ✅ Deleted ${accounts.count} accounts`);

    console.log(`\n3️⃣  Deleting addresses...`);
    const addresses = await prisma.userAddress.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${addresses.count} addresses`);

    console.log(`\n4️⃣  Deleting notifications...`);
    const notifications = await prisma.notification.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${notifications.count} notifications`);

    console.log(`\n5️⃣  Deleting reviews...`);
    const reviews = await prisma.review.deleteMany({ where: { userId } });
    console.log(`   ✅ Deleted ${reviews.count} reviews`);

    console.log(`\n6️⃣  Deleting mechanic reviews...`);
    const mechanicReviews = await prisma.mechanicReview.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${mechanicReviews.count} mechanic reviews`);

    console.log(`\n7️⃣  Deleting logistics reviews...`);
    const logisticsReviews = await prisma.logisticsReview.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${logisticsReviews.count} logistics reviews`);

    console.log(`\n8️⃣  Deleting bookings...`);
    const bookings = await prisma.booking.deleteMany({ where: { userId } });
    console.log(`   ✅ Deleted ${bookings.count} bookings`);

    console.log(`\n9️⃣  Deleting mechanic bookings...`);
    const mechanicBookings = await prisma.mechanicBooking.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${mechanicBookings.count} mechanic bookings`);

    console.log(`\n🔟 Deleting logistics bookings...`);
    const logisticsBookings = await prisma.logisticsBooking.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${logisticsBookings.count} logistics bookings`);

    console.log(`\n1️⃣1️⃣  Deleting logistics requests...`);
    const logisticsRequests = await prisma.logisticsRequest.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${logisticsRequests.count} logistics requests`);

    console.log(`\n1️⃣2️⃣  Deleting trade-ins...`);
    const tradeIns = await prisma.tradeIn.deleteMany({ where: { userId } });
    console.log(`   ✅ Deleted ${tradeIns.count} trade-ins`);

    console.log(`\n1️⃣3️⃣  Deleting vehicles...`);
    const vehicles = await prisma.vehicle.deleteMany({ where: { userId } });
    console.log(`   ✅ Deleted ${vehicles.count} vehicles`);

    console.log(`\n1️⃣4️⃣  Deleting conversation participants...`);
    const convParticipants = await prisma.conversationParticipant.deleteMany({
      where: { userId },
    });
    console.log(
      `   ✅ Deleted ${convParticipants.count} conversation participants`
    );

    console.log(`\n1️⃣5️⃣  Deleting messages...`);
    const messages = await prisma.message.deleteMany({
      where: { senderId: userId },
    });
    console.log(`   ✅ Deleted ${messages.count} messages`);

    console.log(`\n1️⃣6️⃣  Deleting payment methods...`);
    const paymentMethods = await prisma.paymentMethod.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${paymentMethods.count} payment methods`);

    console.log(`\n1️⃣7️⃣  Deleting payments...`);
    const payments = await prisma.payment.deleteMany({ where: { userId } });
    console.log(`   ✅ Deleted ${payments.count} payments`);

    console.log(`\n1️⃣8️⃣  Deleting KYC records...`);
    const kycs = await prisma.kYC.deleteMany({ where: { userId } });
    console.log(`   ✅ Deleted ${kycs.count} KYC records`);

    console.log(`\n1️⃣9️⃣  Deleting wallet transactions...`);
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (wallet) {
      const walletTransactions = await prisma.walletTransaction.deleteMany({
        where: { walletId: wallet.id },
      });
      console.log(
        `   ✅ Deleted ${walletTransactions.count} wallet transactions`
      );

      const withdrawals = await prisma.withdrawal.deleteMany({
        where: { walletId: wallet.id },
      });
      console.log(`   ✅ Deleted ${withdrawals.count} withdrawals`);

      await prisma.wallet.delete({ where: { id: wallet.id } });
      console.log(`   ✅ Deleted wallet`);
    } else {
      console.log(`   ⏭️  No wallet found`);
    }

    console.log(`\n2️⃣0️⃣  Deleting order trackings (as driver)...`);
    const orderTrackings = await prisma.orderTracking.deleteMany({
      where: { driverId: userId },
    });
    console.log(`   ✅ Deleted ${orderTrackings.count} order trackings`);

    // Delete profile-specific records
    console.log(`\n2️⃣1️⃣  Deleting profile records...`);

    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId },
    });
    if (mechanicProfile) {
      await prisma.mechanicNotification.deleteMany({
        where: { mechanicId: mechanicProfile.id },
      });
      await prisma.mechanicProfile.delete({ where: { userId } });
      console.log(`   ✅ Deleted mechanic profile`);
    }

    const logisticsProfile = await prisma.logisticsProfile.findUnique({
      where: { userId },
    });
    if (logisticsProfile) {
      await prisma.logisticsProfile.delete({ where: { userId } });
      console.log(`   ✅ Deleted logistics profile`);
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId },
    });
    if (supplierProfile) {
      // Delete products first (they have orderItems that need to be handled)
      const products = await prisma.product.findMany({
        where: { supplierId: supplierProfile.id },
      });
      for (const product of products) {
        await prisma.orderItem.deleteMany({ where: { productId: product.id } });
      }
      await prisma.product.deleteMany({
        where: { supplierId: supplierProfile.id },
      });
      await prisma.supplierProfile.delete({ where: { userId } });
      console.log(
        `   ✅ Deleted supplier profile and ${products.length} products`
      );
    }

    // Delete orders AFTER all related items are deleted
    console.log(`\n2️⃣2️⃣  Deleting orders...`);
    const userOrders = await prisma.order.findMany({ where: { userId } });
    for (const order of userOrders) {
      // Delete order service links
      await prisma.orderServiceLink.deleteMany({
        where: { orderId: order.id },
      });
      // Delete shipping address
      await prisma.shippingAddress.deleteMany({ where: { orderId: order.id } });
      // Delete tracking updates
      const tracking = await prisma.orderTracking.findUnique({
        where: { orderId: order.id },
      });
      if (tracking) {
        await prisma.trackingUpdate.deleteMany({
          where: { trackingId: tracking.id },
        });
        await prisma.orderTracking.delete({ where: { orderId: order.id } });
      }
    }
    const orders = await prisma.order.deleteMany({ where: { userId } });
    console.log(`   ✅ Deleted ${orders.count} orders`);

    // Finally, delete the user
    console.log(`\n2️⃣3️⃣  Deleting user account...`);
    await prisma.user.delete({ where: { id: userId } });
    console.log(`   ✅ User account deleted`);

    console.log(`\n✅ Successfully deleted user: ${user.email}\n`);
  } catch (error) {
    console.error(`\n❌ Error deleting user:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line args
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: npx ts-node scripts/delete-user.ts user@example.com");
  process.exit(1);
}

deleteUserSafely(email)
  .then(() => {
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });
