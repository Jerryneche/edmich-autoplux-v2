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
    await prisma.logisticsProfile.create({
      data: {
        userId: session.user.id,
        companyName: body.companyName,
        vehicleTypes: body.vehicleTypes,
        coverageAreas: body.coverageAreas,
      },
    });

    // UPDATE ONBOARDING STATUS
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStatus: "COMPLETED" },
    });

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
