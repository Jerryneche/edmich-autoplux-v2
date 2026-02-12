/**
 * Bank verification utility using Flutterwave Bank Resolve API
 * Resolves: Account Number -> Bank Code, Bank Name, Account Holder Name
 */

interface BankResolveResponse {
  status: string;
  message: string;
  data?: {
    account_number: string;
    account_name: string;
  };
}

interface BankSuggestion {
  code: string;
  name: string;
  resolved: boolean;
  accountName?: string;
}

// Nigerian banks database with codes (as fallback if API unavailable)
const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "023", name: "Citibank" },
  { code: "050", name: "Ecobank" },
  { code: "214", name: "FCMB" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank" },
  { code: "058", name: "GTBank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "526", name: "Parallex Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC" },
  { code: "068", name: "Standard Chartered" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "032", name: "Union Bank" },
  { code: "033", name: "UBA" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "063", name: "Diamond Bank" },
  { code: "016", name: "Skye Bank" },
  { code: "004", name: "Wema Bank" },
];

/**
 * Resolve account number to get bank info and account holder name
 * Using Flutterwave Bank Resolution API
 */
export async function resolveAccountNumber(
  accountNumber: string,
  bankCode?: string
): Promise<{
  success: boolean;
  bank?: BankSuggestion;
  accountName?: string;
  error?: string;
}> {
  try {
    // Validate account number format
    if (!accountNumber || accountNumber.length < 10) {
      return {
        success: false,
        error: "Invalid account number format",
      };
    }

    // Sanitize account number
    const sanitized = accountNumber.replace(/\s/g, "");

    // Try Flutterwave API if available
    const flutterwaveKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (flutterwaveKey && bankCode) {
      try {
        const response = await fetch(
          "https://api.flutterwave.com/v3/accounts/resolve",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${flutterwaveKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              account_number: sanitized,
              account_bank: bankCode,
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as BankResolveResponse;

          if (data.status === "success" && data.data) {
            const bank = NIGERIAN_BANKS.find((b) => b.code === bankCode);
            return {
              success: true,
              bank: {
                code: bankCode,
                name: bank?.name || "Unknown Bank",
                resolved: true,
                accountName: data.data.account_name || undefined,
              },
              accountName: data.data.account_name,
            };
          }
        }
      } catch (error) {
        console.warn("[BANK RESOLVE] Flutterwave API failed, using fallback", error);
      }
    }

    // Fallback: If bank is provided, use local database
    if (bankCode) {
      const bank = NIGERIAN_BANKS.find((b) => b.code === bankCode);
      if (bank) {
        return {
          success: true,
          bank: {
            code: bankCode,
            name: bank.name,
            resolved: false, // Not verified with bank API
          },
        };
      }
    }

    return {
      success: false,
      error: "Could not resolve bank information",
    };
  } catch (error) {
    console.error("[BANK RESOLVE] Error:", error);
    return {
      success: false,
      error: "Failed to resolve account details",
    };
  }
}

/**
 * Suggest banks based on account number prefix/pattern
 * (Simplified - in production, use proper USSD or API)
 */
export async function suggestBanks(_accountNumber: string): Promise<BankSuggestion[]> {
  // For now, return all banks as suggestions
  // In production, you could use NIBSS or other services to narrow down
  return NIGERIAN_BANKS.map((bank) => ({
    code: bank.code,
    name: bank.name,
    resolved: false,
  }));
}

/**
 * Get all Nigerian banks
 */
export function getAllBanks(): BankSuggestion[] {
  return NIGERIAN_BANKS.map((bank) => ({
    code: bank.code,
    name: bank.name,
    resolved: false,
  }));
}

/**
 * Validate account number format (basic validation)
 */
export function validateAccountNumber(accountNumber: string): boolean {
  if (!accountNumber) return false;
  const sanitized = accountNumber.trim().replace(/\s/g, "");
  // Nigerian account numbers are typically 10-12 digits
  return /^\d{10,12}$/.test(sanitized);
}
