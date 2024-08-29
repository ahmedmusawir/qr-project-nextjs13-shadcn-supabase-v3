// Import necessary modules and functions
import { NextRequest, NextResponse } from "next/server";
import { extractWebhookData } from "./dataExtraction";
import { generateQRCode } from "@/utils/qrapp/helpers";
import { updateGHLField } from "./updateGHLField";

// Handle the POST request
export async function POST(req: NextRequest) {
  try {
    // Step 1: Parse the incoming request body and extract data
    const webhookData = await req.json();
    const extractedData = extractWebhookData(webhookData);

    // Check if extractedData is null or missing any required fields
    if (
      !extractedData ||
      !extractedData.contact_id ||
      !extractedData.product_id ||
      !extractedData.order_id
    ) {
      throw new Error("Missing required data from webhook.");
    }

    // Log the extracted data (for testing purposes)
    console.log("Extracted Data:", extractedData);

    // Step 2: Generate the QR code URL and image
    const qrCodeURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${extractedData.order_id}`;
    const qrCodeImage = await generateQRCode(qrCodeURL);

    // console.log("Generated QR code URL:", qrCodeURL);
    // console.log("Generated QR code image:", qrCodeImage);

    // Step 3: Update the GHL contact with the generated QR code
    const updateResult = await updateGHLField(
      extractedData.contact_id,
      extractedData.product_id,
      qrCodeImage
    );

    // Step 4: Return a success response if everything goes well
    return NextResponse.json(
      {
        message: "QR code generated and GHL contact updated successfully.",
        qrCodeURL,
        qrCodeImage,
        updateResult,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Handle any errors and respond with an error message
    console.error(
      "Error processing webhook data & updating GHL contact:",
      error.message
    );
    return NextResponse.json(
      {
        error: `Failed to process webhook data & update GHL contact: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
