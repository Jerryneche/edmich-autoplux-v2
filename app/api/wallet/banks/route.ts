import { NextRequest, NextResponse } from "next/server";
import {
  resolveAccountNumber,
  suggestBanks,
  getAllBanks,
  validateAccountNumber,
} from "@/lib/bank-verification";

/**
 * GET /api/wallet/banks - Get all banks
 * POST /api/wallet/banks/resolve - Resolve account number to get bank info and account name
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    if (action === "resolve") {
      // Resolve account number
      const accountNumber = searchParams.get("accountNumber");
      const bankCode = searchParams.get("bankCode");

      if (!accountNumber) {
        return NextResponse.json(
          { error: "Account number is required" },
          { status: 400 }
        );
      }

      if (!validateAccountNumber(accountNumber)) {
        return NextResponse.json(
          {
            error: "Invalid account number format (must be 10-12 digits)",
          },
          { status: 400 }
        );
      }

      console.log("[BANK RESOLVE] Resolving account:", {
        accountNumber: accountNumber.slice(0, 4) + "****",
        bankCode,
      });

      const result = await resolveAccountNumber(accountNumber, bankCode || undefined);

      if (result.success) {
        return NextResponse.json({
          accountName: result.accountName,
          bank: result.bank,
        });
      } else {
        return NextResponse.json(
          {
            error: result.error,
          },
          { status: 400 }
        );
      }
    }

    if (action === "suggest") {
      // Suggest banks based on account number
      const accountNumber = searchParams.get("accountNumber");

      if (!accountNumber) {
        return NextResponse.json(
          { error: "Account number is required" },
          { status: 400 }
        );
      }

      if (!validateAccountNumber(accountNumber)) {
        return NextResponse.json(
          {
            error: "Invalid account number format (must be 10-12 digits)",
          },
          { status: 400 }
        );
      }

      const suggestions = await suggestBanks(accountNumber);
      return NextResponse.json({
        banks: suggestions,
      });
    }

    // Default: Get all banks
    const banks = getAllBanks();
    return NextResponse.json({
      banks,
    });
  } catch (error: any) {
    console.error("[BANK RESOLVE API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bank resolution" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountNumber, bankCode, action } = body;

    if (action === "resolve") {
      if (!accountNumber || !bankCode) {
        return NextResponse.json(
          { error: "Account number and bank code are required" },
          { status: 400 }
        );
      }

      if (!validateAccountNumber(accountNumber)) {
        return NextResponse.json(
          {
            error: "Invalid account number format (must be 10-12 digits)",
          },
          { status: 400 }
        );
      }

      console.log("[BANK RESOLVE] POST: Resolving account:", {
        accountNumber: accountNumber.slice(0, 4) + "****",
        bankCode,
      });

      const result = await resolveAccountNumber(accountNumber, bankCode);

      if (result.success) {
        return NextResponse.json({
          accountName: result.accountName,
          bank: result.bank,
        });
      } else {
        return NextResponse.json(
          {
            error: result.error,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[BANK RESOLVE API] POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bank resolution" },
      { status: 500 }
    );
  }
}
