const API_BASE_URL = process.env.NEXT_PUBLIC_GHL_API_BASE_URL;
const GHL_ACCESS_TOKEN = process.env.GHL_ACCESS_TOKEN;

// Fetching all GHL orders
export const fetchGhlOrderList = async () => {
  const GHL_ACCESS_TOKEN = process.env.GHL_ACCESS_TOKEN;

  const response = await fetch(
    "https://services.leadconnectorhq.com/payments/orders?altId=4rKuULHASyQ99nwdL1XH&altType=location",
    {
      headers: {
        Authorization: `Bearer ${GHL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching order list: " + response.statusText);
  }

  const raw_data = await response.json();
  console.log("ORDER DATA: ", raw_data.data);
  const data = raw_data.data;

  return data.map((order: any) => order._id); // return only the order IDs
};

// Fetching Single Order Details from GHL v2 by ID
export const fetchGhlOrderDetails = async (orderId: string) => {
  const GHL_ACCESS_TOKEN = process.env.GHL_ACCESS_TOKEN;

  const response = await fetch(
    `https://services.leadconnectorhq.com/payments/orders/${orderId}?altId=4rKuULHASyQ99nwdL1XH&altType=location`,
    {
      headers: {
        Authorization: `Bearer ${GHL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching order details: " + response.statusText);
  }

  return await response.json();
};

// Fetching all GHL Contacts
export const fetchGhlContacts = async () => {
  console.log(
    "GHL URL: ",
    `${API_BASE_URL}/contacts/?locationId=${process.env.NEXT_PUBLIC_GHL_LOCATION_ID}`
  );

  console.log("[ghlServices] ACCESS_TOKEN:", GHL_ACCESS_TOKEN);

  const response = await fetch(
    `${API_BASE_URL}/contacts/?locationId=${process.env.NEXT_PUBLIC_GHL_LOCATION_ID}`,
    {
      headers: {
        Authorization: `Bearer ${GHL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
    }
  );

  console.log("[ghlServices] Response Status:", response.status);

  if (!response.ok) {
    throw new Error(`Error fetching contacts: ${response.statusText}`);
  }

  const data = await response.json();
  return data.contacts; // Adjust according to the actual API response structure
};

// Fetching GHL Appointments from MooseCal Calendar for the month of August 2024
export const fetchGhlEvents = async () => {
  const startTime = 1722470400000; // Example start time in milliseconds (1 Aug 2024)
  const endTime = 1725148799999; // Example end time in milliseconds (31 Aug 2024)
  const calendarId = "LtoA6eEnqtWbvggtrsVv"; // Example calendar ID

  const response = await fetch(
    `${API_BASE_URL}/calendars/events?locationId=${process.env.NEXT_PUBLIC_GHL_LOCATION_ID}&startTime=${startTime}&endTime=${endTime}&calendarId=${calendarId}`,
    {
      headers: {
        Authorization: `Bearer ${GHL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching events: ${response.statusText}`);
  }

  const data = await response.json();
  return data.events; // Adjust according to the actual API response structure
};
