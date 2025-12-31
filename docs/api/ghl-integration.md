# GoHighLevel (GHL) Integration API

This document describes all API endpoints that integrate with the GoHighLevel (GHL) CRM system, including order synchronization, event management, contact operations, and pricing data.

---

## Overview

The GHL Integration API provides a bridge between the QR Project V3 and GoHighLevel CRM, enabling:

- **Order Synchronization** - Fetch and sync order data from GHL
- **Event Management** - Retrieve product/event data
- **Contact Operations** - Access customer contact information
- **Price Management** - Fetch pricing details for products
- **Manual Sync** - Trigger complete database sync with real-time progress

All GHL routes are located under `/app/api/ghl/`.

### GHL API Base URL

```
https://services.leadconnectorhq.com
```

### Authentication

All GHL API requests require an access token:

```typescript
headers: {
  "Authorization": `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
  "Version": "2021-07-28"
}
```

---

## Environment Variables

```bash
# .env.local
GHL_ACCESS_TOKEN=your-ghl-access-token
NEXT_PUBLIC_GHL_LOCATION_ID=your-location-id
```

---

## Endpoints

### 1. Get Events (Products)

**Endpoint:** `GET /api/ghl/events`

**Description:** Fetches all active product/event IDs from GHL for the configured location.

**File Location:** `app/api/ghl/events/route.ts:53`

**Request:** No body required

**Response (200 OK):**
```json
{
  "productIds": [
    "product_id_1",
    "product_id_2",
    "product_id_3"
  ]
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Missing required environment variable: locationId"
}
```

**Implementation:**
```typescript
// app/api/ghl/events/route.ts
import { NextRequest, NextResponse } from "next/server";

async function fetchProductIds(locationId: string) {
  const apiUrl = `https://services.leadconnectorhq.com/products/?locationId=${locationId}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
      Version: "2021-07-28",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching product data: ${response.statusText}`);
  }

  const data = await response.json();
  return data.products.map((product: { _id: string }) => product._id);
}

export async function GET(req: NextRequest) {
  try {
    const locationId = process.env.NEXT_PUBLIC_GHL_LOCATION_ID;

    if (!locationId) {
      return NextResponse.json(
        { error: "Missing required environment variable: locationId" },
        { status: 400 }
      );
    }

    const productIds = await fetchProductIds(locationId);

    return NextResponse.json({ productIds }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching product IDs:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Usage:**
```typescript
// Fetch event IDs for filtering orders
const response = await fetch("/api/ghl/events");
const { productIds } = await response.json();
```

---

### 2. Filter Orders by Valid Products

**Endpoint:** `POST /api/ghl/orders`

**Description:** Filters all GHL orders to identify which orders contain valid (active) products. Saves the valid order IDs to a JSON file for sync optimization.

**File Location:** `app/api/ghl/orders/route.ts:52`

**Request:** No body required

**Response (200 OK):**
```json
{
  "message": "Valid order list generated successfully"
}
```

**Process Flow:**
```
1. Fetch product IDs from /api/ghl/events
    ↓
2. Fetch all order IDs from GHL
    ↓
3. For each order, check if product is valid
    ↓
4. Save valid order IDs to public/valid_order_list.json
    ↓
5. Return success response
```

**Implementation:**
```typescript
// app/api/ghl/orders/route.ts
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  fetchGhlOrderList,
  fetchGhlOrderDetails,
} from "@/services/ghlServices";

export async function POST(req: NextRequest) {
  try {
    const locationId = process.env.NEXT_PUBLIC_GHL_LOCATION_ID;

    // Step 1: Fetch product IDs
    const productResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ghl/events`
    );
    const { productIds } = await productResponse.json();

    if (!productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: "No valid products found" },
        { status: 400 }
      );
    }

    // Step 2: Fetch all order IDs
    const orderIds = await fetchGhlOrderList();

    // Step 3: Filter orders by product availability
    const validOrderIds = [];
    for (const orderId of orderIds) {
      const orderDetails = await fetchGhlOrderDetails(orderId);

      if (orderDetails?.items && orderDetails.items.length > 0) {
        const productId = orderDetails.items[0]?.product?._id;
        if (productIds.includes(productId)) {
          validOrderIds.push(orderId);
        }
      }
    }

    // Step 4: Save to JSON file
    const jsonFilePath = path.join(
      process.cwd(),
      "public",
      "valid_order_list.json"
    );

    fs.writeFileSync(jsonFilePath, JSON.stringify(validOrderIds, null, 2));

    return NextResponse.json(
      { message: "Valid order list generated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating valid order list:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Generated File:**
```json
// public/valid_order_list.json
[
  "order_id_1",
  "order_id_2",
  "order_id_3"
]
```

---

### 3. Manual Sync Orders and Tickets

**Endpoint:** `GET /api/ghl/orders/sync`

**Description:** Triggers a complete manual synchronization of all orders and tickets from GHL to Supabase, with real-time progress updates via Socket.IO.

**File Location:** `app/api/ghl/orders/sync/route.ts:11`

**Request:** No body required

**Response (200 OK):**
```json
{
  "message": "Orders and tickets synced successfully"
}
```

**Real-Time Progress Events (Socket.IO):**

**Event 1: Initial Status**
```json
{
  "syncInProgress": true,
  "startTime": "2025-12-31T10:00:00.000Z",
  "endTime": null,
  "totalOrders": 150,
  "syncedOrders": 0,
  "status": "Syncing",
  "delay_in_sec": 0
}
```

**Event 2: Progress Updates**
```json
{
  "syncInProgress": true,
  "totalOrders": 150,
  "syncedOrders": 75,
  "totalTickets": 300,
  "status": "Syncing Orders"
}
```

**Event 3: Final Status**
```json
{
  "syncInProgress": false,
  "startTime": "2025-12-31T10:00:00.000Z",
  "endTime": "2025-12-31T10:05:00.000Z",
  "totalOrders": 150,
  "syncedOrders": 150,
  "status": "Delay",
  "delay_in_sec": 30
}
```

**Implementation:**
```typescript
// app/api/ghl/orders/sync/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { syncOrders } from "./syncOrders";
import { syncTickets } from "./syncTickets";
import { createCustomLogger } from "@/utils/logging/logger";

export async function GET() {
  const logger = createCustomLogger("ghl-order-sync", "sync");
  const io = globalThis.io; // Socket.IO instance

  try {
    const supabase = createClient();
    const startTimeMs = Date.now();
    let totalOrdersSynced = 0;
    let totalTicketsAdded = 0;

    // Fetch total orders
    const validOrderListPath = path.join(
      process.cwd(),
      "public",
      "valid_order_list.json"
    );
    const validOrderIds = JSON.parse(
      fs.readFileSync(validOrderListPath, "utf-8")
    );
    const totalOrders = validOrderIds.length;

    // Emit initial status
    const initialStatus = {
      syncInProgress: true,
      startTime: new Date().toISOString(),
      endTime: null,
      totalOrders: totalOrders,
      syncedOrders: 0,
      status: "Syncing",
      delay_in_sec: 0,
    };
    if (io) {
      io.emit("sync_status", initialStatus);
    }

    // Sync orders
    const { ticketQuantitiesArray } = await syncOrders(supabase, logger, io);
    totalOrdersSynced = ticketQuantitiesArray.length;

    // Sync tickets
    for (let i = 0; i < totalOrdersSynced; i++) {
      const { orderId, quantities } = ticketQuantitiesArray[i];
      const ticketsAdded = await syncTickets(
        orderId,
        quantities,
        supabase,
        logger,
        io
      );
      totalTicketsAdded += ticketsAdded;

      // Emit progress
      if (io) {
        io.emit("sync_progress", {
          syncInProgress: true,
          totalOrders: totalOrders,
          syncedOrders: i + 1,
          totalTickets: totalTicketsAdded,
          status: "Syncing Orders",
        });
      }
    }

    // Emit final status
    const finalStatus = {
      syncInProgress: false,
      startTime: initialStatus.startTime,
      endTime: new Date().toISOString(),
      totalOrders: totalOrders,
      syncedOrders: totalOrders,
      status: "Delay",
      delay_in_sec: 30,
    };

    if (io) {
      io.emit("sync_status", finalStatus);
      io.emit("sync_complete", { message: "Sync Process Complete!" });
    }

    const totalTimeMs = Date.now() - startTimeMs;
    logger.info(`SYNC SUCCESSFUL! Orders: ${totalOrdersSynced}, Tickets: ${totalTicketsAdded}, Time: ${totalTimeMs}ms`);

    return NextResponse.json({
      message: "Orders and tickets synced successfully",
    });
  } catch (error: any) {
    logger.error(`[Error during sync: ${error.message}]`);

    if (io) {
      io.emit("sync_status", {
        syncInProgress: false,
        status: "Error",
      });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Frontend Integration:**
```typescript
// Listen to sync progress on client
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function SyncPage() {
  useEffect(() => {
    const socket = io();

    socket.on("sync_status", (status) => {
      console.log("Sync status:", status);
    });

    socket.on("sync_progress", (progress) => {
      console.log("Sync progress:", progress);
    });

    socket.on("sync_complete", (data) => {
      console.log("Sync complete:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const triggerSync = async () => {
    await fetch("/api/ghl/orders/sync");
  };

  return <button onClick={triggerSync}>Start Sync</button>;
}
```

---

### 4. Get Single Order Details

**Endpoint:** `GET /api/ghl/orders/[id]`

**Description:** Fetches detailed order information from GHL and syncs it to Supabase.

**File Location:** `app/api/ghl/orders/[id]/route.ts`

**URL Parameter:**
- `id` - GHL Order ID

**Example:**
```
GET /api/ghl/orders/order_abc123
```

**Response (200 OK):**
```json
{
  "order": {
    "order_id": "order_abc123",
    "total_paid": 150.00,
    "payment_status": "paid",
    "contact_firstname": "John",
    "contact_lastname": "Doe",
    "contact_email": "john@example.com",
    "event_name": "Summer Concert 2025",
    "event_ticket_qty": 3,
    "ticket_quantities": {
      "VIP": 1,
      "Regular": 2
    }
  }
}
```

---

### 5. Get Contacts

**Endpoint:** `GET /api/ghl/contacts`

**Description:** Retrieves all contacts from GHL for the configured location.

**File Location:** `app/api/ghl/contacts/route.ts`

**Response (200 OK):**
```json
{
  "contacts": [
    {
      "id": "contact_1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  ]
}
```

---

### 6. Get Single Contact

**Endpoint:** `GET /api/ghl/contacts/[id]`

**Description:** Retrieves a single contact by ID from GHL.

**File Location:** `app/api/ghl/contacts/[id]/route.ts`

**URL Parameter:**
- `id` - GHL Contact ID

**Example:**
```
GET /api/ghl/contacts/contact_abc123
```

---

### 7. Get Price Information

**Endpoint:** `GET /api/ghl/price`

**Description:** Fetches pricing information for all products.

**File Location:** `app/api/ghl/price/route.ts`

**Response (200 OK):**
```json
{
  "prices": [
    {
      "product_id": "product_1",
      "price": 50.00,
      "currency": "USD"
    }
  ]
}
```

---

### 8. Get Single Product Price

**Endpoint:** `GET /api/ghl/price/[id]`

**Description:** Fetches price for a specific product.

**File Location:** `app/api/ghl/price/[id]/route.ts`

**URL Parameter:**
- `id` - Product ID

---

### 9. Get Ticket Types

**Endpoint:** `GET /api/ghl/ticket-types`

**Description:** Retrieves all available ticket types for events.

**File Location:** `app/api/ghl/ticket-types/route.ts`

**Response (200 OK):**
```json
{
  "ticketTypes": [
    {
      "type": "VIP",
      "price": 100.00
    },
    {
      "type": "Regular",
      "price": 50.00
    }
  ]
}
```

---

## GHL Service Layer

The GHL integration uses a dedicated service layer for API calls:

```typescript
// services/ghlServices.ts
const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_TOKEN = process.env.GHL_ACCESS_TOKEN;
const LOCATION_ID = process.env.NEXT_PUBLIC_GHL_LOCATION_ID;

export async function fetchGhlOrderList(): Promise<string[]> {
  const response = await fetch(
    `${GHL_BASE_URL}/orders/?locationId=${LOCATION_ID}`,
    {
      headers: {
        Authorization: `Bearer ${GHL_TOKEN}`,
        Version: "2021-07-28",
      },
    }
  );

  const data = await response.json();
  return data.orders.map((order: any) => order._id);
}

export async function fetchGhlOrderDetails(orderId: string) {
  const response = await fetch(
    `${GHL_BASE_URL}/orders/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${GHL_TOKEN}`,
        Version: "2021-07-28",
      },
    }
  );

  return response.json();
}
```

---

## Data Flow

```
GHL API
  ↓
/api/ghl/orders/sync (Trigger)
  ↓
fetchGhlOrderList() → Get all order IDs
  ↓
fetchGhlOrderDetails() → Get order details
  ↓
syncOrders() → Upsert to ghl_qr_orders
  ↓
syncTickets() → Generate tickets in ghl_qr_tickets
  ↓
Socket.IO → Emit progress to clients
  ↓
Supabase Database (Updated)
```

---

## Error Handling

### Common Errors

| Error | Status | Cause |
|-------|--------|-------|
| `Missing required environment variable: locationId` | 400 | GHL_LOCATION_ID not set |
| `Error fetching product data` | 500 | GHL API connection failed |
| `No valid products found` | 400 | No active products in GHL |
| `Unauthorized` | 401 | Invalid GHL access token |

---

## Testing

### Test GHL Connection

```bash
curl -X GET http://localhost:4001/api/ghl/events
```

### Trigger Manual Sync

```bash
curl -X GET http://localhost:4001/api/ghl/orders/sync
```

---

## Related Documentation

- [Webhook Integration](/docs/api/webhook-integration.md) - GHL webhook processing
- [Data Flow](/docs/architecture/data-flow.md) - Complete sync architecture
- [Data Synchronization](/docs/features/data-synchronization.md) - Sync strategies

---

**Last Updated:** December 31, 2025
