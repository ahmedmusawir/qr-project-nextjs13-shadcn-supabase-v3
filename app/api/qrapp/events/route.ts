import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10); // Default to page 1
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10); // Default to 10 items per page

  const offset = (page - 1) * pageSize;

  try {
    const response = await fetch(
      `https://services.leadconnectorhq.com/products/?locationId=4rKuULHASyQ99nwdL1XH`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
          Version: "2021-07-28",
          Accept: "application/json",
        },
        cache: "no-store", // Disables caching
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const eventsRawData = await response.json();
    const eventsData = await eventsRawData.products;

    // console.log("Received events data:", eventsData);

    // Since eventsData is already an array, no need for extra processing
    const totalItems = eventsData.length;
    const paginatedEvents = eventsData.slice(offset, offset + pageSize);

    const totalPages = Math.ceil(totalItems / pageSize);

    return NextResponse.json({
      events: paginatedEvents,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
    });
  } catch (error: any) {
    console.error("[/api/events] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
