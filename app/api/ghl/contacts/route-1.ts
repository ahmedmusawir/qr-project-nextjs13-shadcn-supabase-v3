// app/api/ghl/contacts/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchGhlContacts } from "@/services/ghlServices";

export async function GET() {
  try {
    const supabase = createClient();
    const contacts = await fetchGhlContacts();

    console.log("[/api/ghl/contacts/] Contacts:", contacts);

    // for (const contact of contacts) {
    //   await supabase.from("ghl_contacts").upsert({
    //     ghl_id: contact.id,
    //     location_id: contact.locationId,
    //     contact_name: contact.contactName,
    //     first_name: contact.firstName,
    //     last_name: contact.lastName,
    //     company_name: contact.companyName,
    //     email: contact.email,
    //     phone: contact.phone,
    //     address: contact.address1,
    //     inserted_at: contact.dateAdded,
    //     updated_at: contact.dateUpdated,
    //   });
    // }

    return NextResponse.json({ message: "Contacts synced successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
