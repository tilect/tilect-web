"use server";

import {
  tshirtFormSchema,
  type TShirtFormData,
} from "@/src/components/tshirt/schema";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

type SubmitResponse = {
  success: boolean;
  message?: string;
};

/**
 * Server action — validates form data and adds a row to Google Sheets.
 * Requires GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID
 * environment variables.
 */
export async function submitTShirtOrder(
  data: TShirtFormData,
): Promise<SubmitResponse> {
  try {
    // Server-side validation
    const result = tshirtFormSchema.safeParse(data);
    if (!result.success) {
      return { success: false, message: "Invalid form data." };
    }

    const GOOGLE_SERVICE_ACCOUNT_EMAIL =
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (
      !GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !GOOGLE_PRIVATE_KEY ||
      !GOOGLE_SHEET_ID
    ) {
      console.error(
        "Missing required environment variables for Google Sheets integration",
      );
      return {
        success: false,
        message: "Server configuration error. Please contact support.",
      };
    }

    // Authenticate with Google Sheets API
    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      fullName: result.data.fullName,
      email: result.data.email,
      phone: result.data.phone,
      size: result.data.size,
      type: result.data.type,
      paid: result.data.paid ? "Yes" : "No",
      termsAccepted: result.data.termsAccepted ? "Yes" : "No",
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: "Registration submitted successfully." };
  } catch (error) {
    console.error("Error submitting t-shirt order:", error);
    return {
      success: false,
      message: "Failed to submit registration. Please try again later.",
    };
  }
}
