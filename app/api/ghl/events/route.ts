// app/api/ghl/events/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchGhlEvents } from "@/services/ghlServices";

export async function GET() {
  try {
    const supabase = createClient();
    const events = await fetchGhlEvents();

    for (const event of events) {
      await supabase.from("ghl_events").upsert({
        event_id: event.id,
        appointment_status: event.appointmentStatus,
        calendar_id: event.calendarId,
        contact_id: event.contactId,
        date_added: event.dateAdded,
        date_updated: event.dateUpdated,
        end_time: event.endTime,
        location_id: event.locationId,
        start_time: event.startTime,
        title: event.title,
      });
    }

    // return NextResponse.json({ message: "Events synced successfully" });
    return NextResponse.json({
      message: "Events synced successfully",
      events,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
