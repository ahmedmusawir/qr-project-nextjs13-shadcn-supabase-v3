/**
 * Endpoint: /api/ghl/webhook-qr
 *
 * This endpoint is triggered by a GHL (GoHighLevel) webhook whenever a new order is placed.
 * The process involves:
 *
 * 1. Extracting relevant data from the incoming webhook request (order ID, contact ID, product ID).
 * 2. Generating a QR code based on the order ID and returning a URL and image for the QR code.
 * 3. Updating the GHL contact with the generated QR code image.
 * 4. Asynchronously calling the `/api/ghl/orders/[id]` endpoint to fetch order details and sync them
 *    with the Supabase database, ensuring the latest order data is available for validation purposes.
 *
 * This ensures that both the QR code generation and the order synchronization happen in one streamlined process.
 * The order sync is triggered in the background to avoid delaying the response to the webhook.
 *
 * Returns a JSON response containing the QR code URL, QR code image, and confirmation of the GHL update.
 */

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
    const qrCodeURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${extractedData.order_id}`;
    const qrCodeImage = await generateQRCode(qrCodeURL);

    // console.log("Generated QR code URL:", qrCodeURL);
    // console.log("Generated QR code image:", qrCodeImage);

    // Step 3: Update the GHL contact with the generated QR code
    const updateResult = await updateGHLField(
      extractedData.contact_id,
      extractedData.product_id,
      qrCodeImage
    );

    // Step 4: Asynchronously sync the order data by calling the `/api/ghl/orders/[id]` endpoint
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ghl/orders/${extractedData.order_id}`,
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((orderSyncResult) => {
        console.log(
          `Order ${extractedData.order_id} synced successfully:`,
          orderSyncResult
        );
      })
      .catch((error) => {
        console.error(
          `Failed to sync order ${extractedData.order_id}:`,
          error.message
        );
      });

    // Step 5: Return a success response if everything goes well
    return NextResponse.json(
      {
        message:
          "QR code generated, GHL contact updated, and order sync triggered successfully.",
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
