// Import necessary modules and functions
import { NextRequest, NextResponse } from "next/server";
import { extractWebhookData } from "./dataExtraction";

// Handle the POST request
export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body
    const webhookData = await req.json();

    // Call the data extraction function
    const extractedData = extractWebhookData(webhookData);

    // Log the extracted data (for testing purposes)
    console.log("Extracted Data:", extractedData);

    // Respond with the extracted data
    return NextResponse.json(
      {
        message: "Data extracted successfully",
        extractedData,
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
