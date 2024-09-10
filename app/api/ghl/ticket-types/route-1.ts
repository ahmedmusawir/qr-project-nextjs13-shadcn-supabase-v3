import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generateTicketTypesJson } from "@/utils/qrapp/helpers";

/**
 * API: /api/ghl/ticket-type
 *
 * This API route is responsible for generating the ticket types JSON file.
 * It takes product IDs and location ID from the request body and saves the resulting
 * ticket types to `public/ticket_types.json` on the server.
 *
 * Graceful error handling is included for missing or malformed request bodies.
 * Method: POST
 * Required Body Parameters: productIds (array of product IDs), locationId (GHL location ID).
 */

export async function POST(req: NextRequest) {
  try {
    // Use req.json() to parse the request body directly into JSON format
    const body = await req.json();
    const { productIds, locationId } = body;

    // Validate that productIds and locationId are provided
    if (!productIds || !locationId) {
      return NextResponse.json(
        { error: "Missing productIds or locationId" },
        { status: 400 }
      );
    }

    console.log("PRODUCT IDS", productIds);

    // Generate the ticket types JSON
    const ticketTypesArray = await generateTicketTypesJson(
      productIds,
      locationId
    );

    // Define the file path for saving the JSON file
    const jsonFilePath = path.join(
      process.cwd(),
      "public",
      "ticket_types.json"
    );

    // Write the file using fs on the server-side
    fs.writeFileSync(jsonFilePath, JSON.stringify(ticketTypesArray, null, 2));

    // Respond with success
    return NextResponse.json(
      { message: "Ticket types JSON generated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating ticket types JSON:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
