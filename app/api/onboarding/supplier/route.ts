import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    // Create supplier profile
    await prisma.supplierProfile.create({
      data: {
        userId: session.user.id,
        businessName: body.businessName,
        businessAddress: body.businessAddress,
        city: body.city,
        state: body.state,
        description: body.description || null,
        cacNumber: body.cacNumber || null,
        bankName: body.bankName || null,
        accountNumber: body.accountNumber || null,
        accountName: body.accountName || null,
      },
    });

    // UPDATE USER ONBOARDING STATUS
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStatus: "COMPLETED" },
    });

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
