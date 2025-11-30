import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      amount,
      orderId,
      paymentMethod,
      currency = "NGN",
    } = await request.json();

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        orderId,
        amount: parseFloat(amount),
        currency,
        method: paymentMethod,
        status: "pending",
      },
    });

    // Initialize payment with gateway based on method
    let paymentResponse;

    switch (paymentMethod) {
      case "card":
      case "bank_transfer":
        // Paystack integration
        paymentResponse = await initializePaystack({
          email: session.user.email!,
          amount: amount * 100, // Convert to kobo
          reference: payment.id,
          callback_url: `${process.env.NEXTAUTH_URL}/payment/verify`,
        });
        break;

      case "mobile_money":
        // Flutterwave integration
        paymentResponse = await initializeFlutterwave({
          email: session.user.email!,
          amount,
          reference: payment.id,
        });
        break;

      case "ussd":
        paymentResponse = {
          ussd_code: "*737*50*" + amount + "#",
          bank_code: "737",
        };
        break;

      case "cash":
        // No gateway needed
        paymentResponse = {
          message: "Cash payment - deliver to complete",
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid payment method" },
          { status: 400 }
        );
    }

    // Update payment with gateway response
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayReference: paymentResponse.reference || payment.id,
        gatewayResponse: JSON.stringify(paymentResponse),
      },
    });

    return NextResponse.json({
      success: true,
      payment,
      gatewayData: paymentResponse,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}

// Helper functions
async function initializePaystack(data: any) {
  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();
  if (!result.status) {
    throw new Error(result.message);
  }

  return {
    authorization_url: result.data.authorization_url,
    access_code: result.data.access_code,
    reference: result.data.reference,
  };
}

async function initializeFlutterwave(data: any) {
  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      currency: "NGN",
      redirect_url: `${process.env.NEXTAUTH_URL}/payment/verify`,
    }),
  });

  const result = await response.json();
  if (result.status !== "success") {
    throw new Error(result.message);
  }

  return {
    payment_link: result.data.link,
    reference: result.data.tx_ref,
  };
}
