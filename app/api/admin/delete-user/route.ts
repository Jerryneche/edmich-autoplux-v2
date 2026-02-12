// app/api/admin/delete-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }

    const { userId } = await req.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting other admins
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete admin users" },
        { status: 403 },
      );
    }

    console.log(`[ADMIN] Deleting user: ${user.email}`);

    // Delete in transaction for safety
    await prisma.$transaction(async (tx) => {
      const uid = user.id;

      // Delete all related records
      await tx.session.deleteMany({ where: { userId: uid } });
      await tx.account.deleteMany({ where: { userId: uid } });
      await tx.userAddress.deleteMany({ where: { userId: uid } });
      await tx.notification.deleteMany({ where: { userId: uid } });
      await tx.review.deleteMany({ where: { userId: uid } });
      await tx.mechanicReview.deleteMany({ where: { userId: uid } });
      await tx.logisticsReview.deleteMany({ where: { userId: uid } });
      await tx.booking.deleteMany({ where: { userId: uid } });
      await tx.mechanicBooking.deleteMany({ where: { userId: uid } });
      await tx.logisticsBooking.deleteMany({ where: { userId: uid } });
      await tx.logisticsRequest.deleteMany({ where: { userId: uid } });
      await tx.tradeIn.deleteMany({ where: { userId: uid } });
      await tx.vehicle.deleteMany({ where: { userId: uid } });
      await tx.conversationParticipant.deleteMany({ where: { userId: uid } });
      await tx.message.deleteMany({ where: { senderId: uid } });
      await tx.paymentMethod.deleteMany({ where: { userId: uid } });
      await tx.payment.deleteMany({ where: { userId: uid } });
      await tx.kYC.deleteMany({ where: { userId: uid } });

      // Delete wallet
      const wallet = await tx.wallet.findUnique({ where: { userId: uid } });
      if (wallet) {
        await tx.walletTransaction.deleteMany({
          where: { walletId: wallet.id },
        });
        await tx.withdrawal.deleteMany({ where: { walletId: wallet.id } });
        await tx.wallet.delete({ where: { id: wallet.id } });
      }

      // Delete profiles
      const mechanicProfile = await tx.mechanicProfile.findUnique({
        where: { userId: uid },
      });
      if (mechanicProfile) {
        await tx.mechanicNotification.deleteMany({
          where: { mechanicId: mechanicProfile.id },
        });
        await tx.mechanicProfile.delete({ where: { userId: uid } });
      }

      const logisticsProfile = await tx.logisticsProfile.findUnique({
        where: { userId: uid },
      });
      if (logisticsProfile) {
        await tx.logisticsProfile.delete({ where: { userId: uid } });
      }

      const supplierProfile = await tx.supplierProfile.findUnique({
        where: { userId: uid },
      });
      if (supplierProfile) {
        const products = await tx.product.findMany({
          where: { supplierId: supplierProfile.id },
        });
        for (const product of products) {
          await tx.orderItem.deleteMany({ where: { productId: product.id } });
        }
        await tx.product.deleteMany({
          where: { supplierId: supplierProfile.id },
        });
        await tx.supplierProfile.delete({ where: { userId: uid } });
      }

      // Delete orders
      const userOrders = await tx.order.findMany({ where: { userId: uid } });
      for (const order of userOrders) {
        await tx.orderServiceLink.deleteMany({ where: { orderId: order.id } });
        await tx.shippingAddress.deleteMany({ where: { orderId: order.id } });
        const tracking = await tx.orderTracking.findUnique({
          where: { orderId: order.id },
        });
        if (tracking) {
          await tx.orderTracking.delete({ where: { orderId: order.id } });
        }
      }
      await tx.order.deleteMany({ where: { userId: uid } });

      // Finally delete user
      await tx.user.delete({ where: { id: uid } });
    });

    console.log(`[ADMIN] Successfully deleted user: ${user.email}`);

    return NextResponse.json(
      {
        message: "User deleted successfully",
        email: user.email,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[ADMIN] Delete user error:", error.message);
    return NextResponse.json(
      { error: "Failed to delete user. Please try again." },
      { status: 500 },
    );
  }
}
