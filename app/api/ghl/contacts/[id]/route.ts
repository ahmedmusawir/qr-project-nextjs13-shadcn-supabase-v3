import { NextRequest, NextResponse } from "next/server";

// For route testing from browser
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      message:
        "GET request successful For GHL Contact Update by ID w/ Custom Field ID",
    },
    { status: 200 }
  );
}

// This function handles the PUT request to update a contact's custom field
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const contactId = params.id;

  try {
    // Parse the incoming JSON body
    const { customFields } = await req.json();

    if (!contactId || !customFields || !Array.isArray(customFields)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Prepare the payload for the LeadConnector API
    const payload = {
      customFields,
    };

    // Make the PUT request to update the contact in LeadConnector (GHL)
    const response = await fetch(
      `https://services.leadconnectorhq.com/contacts/${contactId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
          Version: "2021-07-28",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.statusText}`);
    }

    // Respond with a success message
    return NextResponse.json(
      { message: "Contact updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating contact:", error.message);
    return NextResponse.json(
      { error: `Failed to update contact: ${error.message}` },
      { status: 500 }
    );
  }
}
