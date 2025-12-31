# QR App API Endpoints

This document describes all internal API endpoints for the QR application, including order management, ticket operations, event data, and custom field management.

---

## Overview

The QR App API provides CRUD operations for managing orders, tickets, events, and system configurations stored in Supabase. All routes are located under `/app/api/qrapp/`.

### Base URL

```
http://localhost:4001/api/qrapp/
https://your-domain.com/api/qrapp/  (Production)
```

---

## Order Endpoints

### 1. Get Orders (Paginated)

**Endpoint:** `GET /api/qrapp/orders`

**Description:** Retrieves paginated list of paid orders from Supabase.

**File Location:** `app/api/qrapp/orders/route.ts:7`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `pageSize` | number | 10 | Items per page |

**Example:**
```
GET /api/qrapp/orders?page=1&pageSize=10
```

**Response (200 OK):**
```json
{
  "orders": [
    {
      "order_id": "order_abc123",
      "total_paid": 150.00,
      "payment_status": "paid",
      "contact_firstname": "John",
      "contact_lastname": "Doe",
      "date_added": "2025-12-31T10:00:00.000Z",
      "event_image": "https://...",
      "event_ticket_qty": 3,
      "event_name": "Summer Concert 2025"
    }
  ],
  "pagination": {
    "totalItems": 150,
    "totalPages": 15,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

**Implementation:**
```typescript
// app/api/qrapp/orders/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = createClient();

  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  // Calculate offset
  const offset = (page - 1) * pageSize;

  // Get total count
  const { count, error: countError } = await supabase
    .from("ghl_qr_orders")
    .select("*", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  // Fetch paginated data
  const { data: orders, error } = await supabase
    .from("ghl_qr_orders")
    .select(
      "order_id, total_paid, payment_status, contact_firstname, contact_lastname, date_added, event_image, event_ticket_qty, event_name"
    )
    .eq("payment_status", "paid")
    .order("order_id", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate total pages
  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return NextResponse.json({
    orders,
    pagination: {
      totalItems: count,
      totalPages,
      currentPage: page,
      pageSize,
    },
  });
}
```

**Frontend Usage:**
```typescript
const response = await fetch("/api/qrapp/orders?page=1&pageSize=10");
const { orders, pagination } = await response.json();
```

---

### 2. Get Single Order

**Endpoint:** `GET /api/qrapp/orders/[id]`

**Description:** Retrieves detailed information for a specific order.

**File Location:** `app/api/qrapp/orders/[id]/route.ts`

**URL Parameter:**
- `id` - Order ID

**Example:**
```
GET /api/qrapp/orders/order_abc123
```

**Response (200 OK):**
```json
{
  "order": {
    "order_id": "order_abc123",
    "location_id": "location_123",
    "total_paid": 150.00,
    "payment_status": "paid",
    "payment_currency": "USD",
    "order_status": "completed",
    "contact_id": "contact_xyz",
    "contact_firstname": "John",
    "contact_lastname": "Doe",
    "contact_email": "john@example.com",
    "contact_phone": "+1234567890",
    "date_added": "2025-12-31T10:00:00.000Z",
    "event_id": "event_123",
    "event_name": "Summer Concert 2025",
    "event_image": "https://...",
    "event_ticket_price": 50.00,
    "event_ticket_currency": "USD",
    "event_ticket_qty": 3,
    "event_ticket_type": "VIP",
    "qr_code_image": "data:image/png;base64,...",
    "ticket_quantities": {
      "VIP": 1,
      "Regular": 2
    },
    "inserted_at": "2025-12-31T10:05:00.000Z",
    "updated_at": "2025-12-31T10:05:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Order not found"
}
```

---

### 3. Get Total Orders Count

**Endpoint:** `GET /api/qrapp/orders/total-orders`

**Description:** Returns the total count of all orders in the database.

**File Location:** `app/api/qrapp/orders/total-orders/route.ts`

**Response (200 OK):**
```json
{
  "totalOrders": 150
}
```

**Implementation:**
```typescript
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("ghl_qr_orders")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ totalOrders: count }, { status: 200 });
}
```

---

## Ticket Endpoints

### 4. Get Tickets by Order

**Endpoint:** `GET /api/qrapp/tickets/[orderId]`

**Description:** Retrieves all tickets associated with a specific order.

**File Location:** `app/api/qrapp/tickets/[orderId]/route.ts`

**URL Parameter:**
- `orderId` - Order ID

**Example:**
```
GET /api/qrapp/tickets/order_abc123
```

**Response (200 OK):**
```json
{
  "tickets": [
    {
      "ticket_id": 1,
      "order_id": "order_abc123",
      "ticket_type": "VIP",
      "status": "live"
    },
    {
      "ticket_id": 2,
      "order_id": "order_abc123",
      "ticket_type": "Regular",
      "status": "live"
    }
  ]
}
```

---

### 5. Update Ticket Status (All Tickets for Order)

**Endpoint:** `PUT /api/qrapp/tickets/status`

**Description:** Updates the status of all tickets associated with an order.

**File Location:** `app/api/qrapp/tickets/status/route.ts:8`

**Request Body:**
```json
{
  "order_id": "order_abc123",
  "status": "used"
}
```

**Status Values:**
- `"live"` - Ticket is active and unused
- `"used"` - Ticket has been validated
- `"cancelled"` - Ticket has been cancelled

**Response (200 OK):**
```json
{
  "message": "All tickets updated successfully"
}
```

**Implementation:**
```typescript
// app/api/qrapp/tickets/status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(req: Request) {
  const { order_id, status } = await req.json();
  const supabase = createClient();

  console.log("ORDER ID:", order_id);
  console.log("ORDER STATUS:", status);

  try {
    const { error } = await supabase
      .from("ghl_qr_tickets")
      .update({ status })
      .eq("order_id", order_id);

    if (error) {
      return NextResponse.json(
        { message: "Failed to update tickets status", error },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "All tickets updated successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}
```

**Frontend Usage:**
```typescript
// Mark all tickets as "used" after validation
const response = await fetch("/api/qrapp/tickets/status", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    order_id: "order_abc123",
    status: "used",
  }),
});
```

---

### 6. Update Single Ticket Status

**Endpoint:** `PUT /api/qrapp/tickets/status/[id]`

**Description:** Updates the status of a single ticket by ticket ID.

**File Location:** `app/api/qrapp/tickets/status/[id]/route.ts`

**URL Parameter:**
- `id` - Ticket ID

**Request Body:**
```json
{
  "status": "used"
}
```

**Example:**
```
PUT /api/qrapp/tickets/status/123
```

**Response (200 OK):**
```json
{
  "message": "Ticket status updated successfully"
}
```

---

## Event Endpoints

### 7. Get All Events

**Endpoint:** `GET /api/qrapp/events`

**Description:** Retrieves all distinct events from the orders table.

**File Location:** `app/api/qrapp/events/route.ts`

**Response (200 OK):**
```json
{
  "events": [
    {
      "event_id": "event_123",
      "event_name": "Summer Concert 2025",
      "event_image": "https://...",
      "event_ticket_price": 50.00
    }
  ]
}
```

---

### 8. Get Single Event

**Endpoint:** `GET /api/qrapp/events/[id]`

**Description:** Retrieves details for a specific event.

**File Location:** `app/api/qrapp/events/[id]/route.ts`

**URL Parameter:**
- `id` - Event ID

**Example:**
```
GET /api/qrapp/events/event_123
```

---

## Custom Field Endpoints

### 9. Get All Custom Fields

**Endpoint:** `GET /api/qrapp/fields`

**Description:** Retrieves all product-to-field mappings from the `ghl_qr_fields` table.

**File Location:** `app/api/qrapp/fields/route.ts`

**Response (200 OK):**
```json
{
  "fields": [
    {
      "id": 1,
      "product_id": "product_abc123",
      "field_id": "field_xyz789",
      "field_name": "Event QR Code",
      "created_at": "2025-12-31T10:00:00.000Z"
    }
  ]
}
```

---

### 10. Get Active Fields

**Endpoint:** `GET /api/qrapp/active-fields`

**Description:** Retrieves only active custom field mappings.

**File Location:** `app/api/qrapp/active-fields/route.ts`

**Response (200 OK):**
```json
{
  "activeFields": [
    {
      "product_id": "product_abc123",
      "field_id": "field_xyz789",
      "field_name": "Event QR Code"
    }
  ]
}
```

---

### 11. Upsert Custom Field

**Endpoint:** `POST /api/qrapp/upsert-field`

**Description:** Creates or updates a product-to-field mapping.

**File Location:** `app/api/qrapp/upsert-field/route.ts`

**Request Body:**
```json
{
  "product_id": "product_abc123",
  "field_id": "field_xyz789",
  "field_name": "Event QR Code"
}
```

**Response (200 OK):**
```json
{
  "message": "Field mapping upserted successfully"
}
```

**Implementation:**
```typescript
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { product_id, field_id, field_name } = await req.json();
  const supabase = createClient();

  const { error } = await supabase
    .from("ghl_qr_fields")
    .upsert(
      { product_id, field_id, field_name },
      { onConflict: "product_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Field mapping upserted successfully",
  });
}
```

---

## Sync Endpoints

### 12. Get Sync Status

**Endpoint:** `GET /api/qrapp/sync-status`

**Description:** Retrieves the current synchronization status from the JSON file.

**File Location:** `app/api/qrapp/sync-status/route.ts`

**Response (200 OK):**
```json
{
  "syncInProgress": false,
  "startTime": "2025-12-31T10:00:00.000Z",
  "endTime": "2025-12-31T10:05:00.000Z",
  "totalOrders": 150,
  "syncedOrders": 150,
  "status": "Completed",
  "delay_in_sec": 0
}
```

**Implementation:**
```typescript
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "sync_status.json");

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const syncStatus = JSON.parse(fileContent);

    return NextResponse.json(syncStatus, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### 13. Test Sync

**Endpoint:** `GET /api/qrapp/test-sync`

**Description:** Triggers a test synchronization process.

**File Location:** `app/api/qrapp/test-sync/route.ts`

**Response (200 OK):**
```json
{
  "message": "Test sync completed successfully"
}
```

---

## Contact Endpoints

### 14. Get Contact by ID

**Endpoint:** `GET /api/qrapp/contacts/[id]`

**Description:** Retrieves contact information for a specific contact ID.

**File Location:** `app/api/qrapp/contacts/[id]/route.ts`

**URL Parameter:**
- `id` - Contact ID

**Example:**
```
GET /api/qrapp/contacts/contact_xyz789
```

**Response (200 OK):**
```json
{
  "contact": {
    "id": "contact_xyz789",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

---

## Utility Endpoints

### 15. Timer Endpoint

**Endpoint:** `GET /api/qrapp/timer`

**Description:** Returns current server time for sync timing calculations.

**File Location:** `app/api/qrapp/timer/route.ts`

**Response (200 OK):**
```json
{
  "currentTime": "2025-12-31T10:00:00.000Z",
  "timestamp": 1735639200000
}
```

---

## TypeScript Interfaces

### Order Interface

```typescript
interface Order {
  order_id: string;
  location_id: string | null;
  total_paid: number | null;
  payment_status: string | null;
  payment_currency: string | null;
  order_status: string | null;
  contact_id: string | null;
  contact_firstname: string | null;
  contact_lastname: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  date_added: string | null;
  event_id: string | null;
  event_name: string | null;
  event_image: string | null;
  event_ticket_price: number | null;
  event_ticket_currency: string | null;
  event_available_qty: number | null;
  event_ticket_qty: number | null;
  event_ticket_type: string | null;
  qr_code_image: string | null;
  ticket_quantities: Record<string, number> | null;
  inserted_at: string;
  updated_at: string;
}
```

### Ticket Interface

```typescript
interface Ticket {
  ticket_id: number;
  order_id: string;
  ticket_type: string;
  status: "live" | "used" | "cancelled";
}
```

### Pagination Interface

```typescript
interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
```

---

## Error Handling

### Common Errors

| Error Message | Status | Cause |
|--------------|--------|-------|
| `Order not found` | 404 | Invalid order ID |
| `Failed to update tickets status` | 500 | Database error |
| `Missing required fields` | 400 | Invalid request body |
| `Unauthorized` | 401 | Invalid session |

---

## Testing

### Get Orders

```bash
curl -X GET "http://localhost:4001/api/qrapp/orders?page=1&pageSize=10"
```

### Update Ticket Status

```bash
curl -X PUT http://localhost:4001/api/qrapp/tickets/status \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_abc123",
    "status": "used"
  }'
```

### Get Sync Status

```bash
curl -X GET http://localhost:4001/api/qrapp/sync-status
```

---

## Related Documentation

- [Database Schema](/docs/database/schema.md) - Complete database structure
- [Data Relationships](/docs/database/data-relationships.md) - Foreign keys and joins
- [Ticket Validation](/docs/features/ticket-validation.md) - Ticket validation flow
- [Event Ticketing](/docs/features/event-ticketing.md) - Event management

---

**Last Updated:** December 31, 2025
