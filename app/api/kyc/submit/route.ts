// app/api/kyc/submit/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mock upload function – replace with real Cloudinary/AWS later
async function uploadKYCDocuments(files: {
  idFrontImage?: File | null;
  idBackImage?: File | null;
  selfieImage?: File | null;
  businessCertImage?: File | null;
}) {
  // In real app: upload to S3/Cloudinary and return secure URLs
  return {
    idFront: files.idFrontImage
      ? `/uploads/kyc/${Date.now()}-id-front.jpg`
      : null,
    idBack: files.idBackImage ? `/uploads/kyc/${Date.now()}-id-back.jpg` : null,
    selfie: files.selfieImage ? `/uploads/kyc/${Date.now()}-selfie.jpg` : null,
    businessCert: files.businessCertImage
      ? `/uploads/kyc/${Date.now()}-business.jpg`
      : null,
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const idType = formData.get("idType") as string;
    const idNumber = formData.get("idNumber") as string;
    const businessName = (formData.get("businessName") as string) || null;
    const businessRegNumber =
      (formData.get("businessRegNumber") as string) || null;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;

    const idFrontImage = formData.get("idFrontImage") as File | null;
    const idBackImage = formData.get("idBackImage") as File | null;
    const selfieImage = formData.get("selfieImage") as File | null;
    const businessCertImage = formData.get("businessCertImage") as File | null;

    // Basic validation
    if (!idType || !idNumber || !address || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!idFrontImage || !idBackImage || !selfieImage) {
      return NextResponse.json(
        { error: "ID front, back, and selfie are required" },
        { status: 400 }
      );
    }

    // Upload images
    const uploaded = await uploadKYCDocuments({
      idFrontImage,
      idBackImage,
      selfieImage,
      businessCertImage: businessCertImage || undefined,
    });

    // Create KYC record
    const kyc = await prisma.kYC.create({
      data: {
        userId: session.user.id,
        idType,
        idNumber,
        businessName,
        businessRegNumber: businessRegNumber || undefined,
        address,
        city,
        state,
        idFrontUrl: uploaded.idFront!,
        idBackUrl: uploaded.idBack!,
        selfieUrl: uploaded.selfie!,
        businessCertUrl: uploaded.businessCert || undefined,
        status: "pending",
        submittedAt: new Date(),
      },
    });

    // Optional: Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "New KYC Submission",
          message: `${
            session.user.name || "A user"
          } submitted KYC documents for review`,
          type: "SYSTEM" as const, // ← Valid NotificationType
          link: `/admin/kyc/${kyc.id}`,
        })),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "KYC submitted successfully. Review in progress.",
        kyc: {
          id: kyc.id,
          status: kyc.status,
          submittedAt: kyc.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("KYC submission error:", error);
    return NextResponse.json(
      { error: "KYC submission failed", details: error.message },
      { status: 500 }
    );
  }
}
