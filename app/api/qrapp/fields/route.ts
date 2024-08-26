import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `https://services.leadconnectorhq.com/locations/4rKuULHASyQ99nwdL1XH/customFields`,
      {
        headers: {
          Authorization: "Bearer pit-a0cb4c90-dcd4-45e1-b811-8a01c30e5014",
          Version: "2021-07-28",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch custom fields: ${response.statusText}`);
    }

    const customRawFields = await response.json();
    const customFields = customRawFields.customFields;

    return NextResponse.json(customFields);
  } catch (error: any) {
    console.error("[/api/qrapp/fields] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
