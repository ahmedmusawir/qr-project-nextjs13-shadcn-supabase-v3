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
    // Parse the incoming request body
    const body = await req.json();
    const { productIds, locationId } = body;

    // Validate that productIds and locationId are provided
    if (!productIds || !locationId) {
      return NextResponse.json(
        { error: "Missing productIds or locationId" },
        { status: 400 }
      );
    }

    // Generate the ticket types JSON
    const ticketTypesArray = await generateTicketTypesJson(
      productIds,
      locationId
    );

    // Ensure that the array is not undefined or empty
    if (!ticketTypesArray || ticketTypesArray.length === 0) {
      return NextResponse.json(
        { error: "No ticket types generated" },
        { status: 500 }
      );
    }

    // Define the file path for saving the JSON file
    const jsonFilePath = path.join(
      process.cwd(),
      "public",
      "ticket_types.json"
    );

    // Convert the array to a JSON string, and ensure it's a valid string
    const ticketTypesJson = JSON.stringify(ticketTypesArray, null, 2);
    if (!ticketTypesJson) {
      throw new Error("Failed to serialize ticket types to JSON");
    }

    // Write the JSON string to a file using fs
    fs.writeFileSync(jsonFilePath, ticketTypesJson);

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
