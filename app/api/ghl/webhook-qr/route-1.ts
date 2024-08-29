// Import necessary modules and functions
import { NextRequest, NextResponse } from "next/server";
import { extractWebhookData } from "./dataExtraction";
import { generateQRCode } from "@/utils/qrapp/helpers";
import { updateGHLField } from "./updateGHLField";

// Handle the POST request
export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body
    const webhookData = await req.json();

    // Call the data extraction function
    const extractedData = extractWebhookData(webhookData);

    // Log the extracted data (for testing purposes)
    // console.log("Extracted Data:", extractedData);

    // Generate QR Code URL based on the order_id
    const qrCodeURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${extractedData?.order_id}`;
    const qrCodeImage = await generateQRCode(qrCodeURL);

    console.log("Generated QR code URL:", qrCodeURL);
    console.log("Generated QR code image:", qrCodeImage);

    // Respond with the extracted data and QR code
    return NextResponse.json(
      {
        message: "Data extracted and QR code generated successfully",
        extractedData,
        qrCodeURL,
        qrCodeImage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Handle any errors and respond with an error message
    console.error("Error processing webhook data:", error.message);
    return NextResponse.json(
      { error: `Failed to process webhook data: ${error.message}` },
      { status: 500 }
    );
  }
}
