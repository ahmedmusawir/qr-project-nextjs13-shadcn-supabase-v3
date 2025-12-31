# Ticket Validation

This document describes the ticket validation system in QR Project V3, including QR code scanning, ticket status management, bulk validation, and the validation workflow.

---

## Overview

The Ticket Validation feature enables admins to scan QR codes and validate tickets at event entry points. The system supports individual ticket validation, bulk validation, and ticket status reset functionality.

### Key Features

- **QR Code Scanning** - Scan QR codes to access order details
- **Ticket Status Management** - Update ticket status (live/validated/cancelled)
- **Bulk Validation** - Validate all tickets for an order at once
- **Status Reset** - Reset validated tickets back to live
- **Real-time Updates** - Instant UI updates after validation
- **Visual Indicators** - Color-coded badges for ticket status

---

## Validation Workflow

```
Admin Scans QR Code
    ↓
Redirects to /orders/{order_id}
    ↓
Fetch Order Details from Supabase
    ↓
Fetch Tickets for Order
    ↓
Display Ticket Table with Status
    ↓
Admin Validates Ticket(s)
    ↓
Update Ticket Status in Database
    ↓
UI Updates with New Status
```

---

## Ticket Status Values

| Status | Description | Color Badge |
|--------|-------------|-------------|
| `live` | Ticket is active and unused | Green |
| `validated` | Ticket has been scanned and validated | Red |
| `cancelled` | Ticket has been cancelled | Gray |

### Database Schema

```sql
-- ghl_qr_tickets table
CREATE TABLE ghl_qr_tickets (
  ticket_id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  ticket_type TEXT NOT NULL,
  status TEXT DEFAULT 'live',  -- 'live', 'validated', 'cancelled'
  CONSTRAINT fk_order
    FOREIGN KEY (order_id)
    REFERENCES ghl_qr_orders(order_id)
    ON DELETE CASCADE
);
```

---

## Order Validation Page

**Page Location:** `app/(admin)/orders/[id]/page.tsx`

**Component Location:** `app/(admin)/orders/[id]/SingleOrderPageContent.tsx`

### Page Structure

```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchOrderById } from "@/services/orderServices";
import { fetchTicketsByOrderId } from "@/services/ticketServices";
import { Order } from "@/types/orders";
import { Ticket } from "@/types/tickets";
import TicketTable from "@/components/admin/single-order-page/TicketTable";
import OrderInfoBlock from "@/components/admin/single-order-page/OrderInfoBlock";
import OrderInfoHeader from "@/components/admin/single-order-page/OrderInfoHeader";

const SingleOrderPageContent = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isTicketsLoading, setisTicketsLoading] = useState(false);

  useEffect(() => {
    const getOrderAndTickets = async () => {
      try {
        const fetchedOrder = await fetchOrderById(id);
        setOrder(fetchedOrder);

        setisTicketsLoading(true);
        const fetchedTickets = await fetchTicketsByOrderId(id);
        setTickets(fetchedTickets);
        setisTicketsLoading(false);
      } catch (error) {
        console.error("Error fetching order or tickets:", error);
      }
    };

    getOrderAndTickets();
  }, [id]);

  if (!order || !tickets) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <OrderInfoHeader order={order} />
      <OrderInfoBlock order={order} />

      <div className="mt-16">
        <h3 className="font-extrabold text-3xl text-center">Tickets List</h3>
        {isTicketsLoading && <div>Loading tickets...</div>}
        <TicketTable tickets={tickets} order={order} />
      </div>
    </>
  );
};

export default SingleOrderPageContent;
```

---

## Ticket Table Component

**File Location:** `components/admin/single-order-page/TicketTable.tsx`

### Component Features

- **Individual Validation** - Validate single tickets
- **Bulk Validation** - Validate all tickets at once
- **Status Reset** - Reset tickets back to "live"
- **Confirmation Modal** - Confirm bulk validation
- **Status Badges** - Visual indicators for each status

### Implementation

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { Ticket } from "@/types/tickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  updateTicketStatusById,
  updateTicketsStatusByOrderId,
} from "@/services/ticketServices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order } from "@/types/orders";

const TicketTable = ({ tickets, order }: { tickets: Ticket[]; order: Order }) => {
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, string>>({});
  const [isModalOpen, setModalOpen] = useState(false);

  // Initialize ticket statuses
  useEffect(() => {
    if (tickets) {
      const initialStatuses = tickets.reduce((acc, ticket) => {
        acc[ticket.ticket_id] = ticket.status;
        return acc;
      }, {} as Record<string, string>);

      setTicketStatuses(initialStatuses);
    }
  }, [tickets]);

  // Validate single ticket
  const handleValidateTicket = async (ticket_id: string) => {
    try {
      await updateTicketStatusById(ticket_id, "validated");
      setTicketStatuses((prev) => ({ ...prev, [ticket_id]: "validated" }));
    } catch (error) {
      console.error("Error validating ticket:", error);
    }
  };

  // Validate all tickets
  const handleValidateAllTickets = async (order_id: string) => {
    try {
      await updateTicketsStatusByOrderId(order_id, "validated");
      setTicketStatuses((prev) => {
        const newStatuses = { ...prev };
        tickets?.forEach((ticket) => {
          newStatuses[ticket.ticket_id] = "validated";
        });
        return newStatuses;
      });
      setModalOpen(false);
    } catch (error) {
      console.error("Error validating all tickets:", error);
    }
  };

  // Reset single ticket
  const handleResetTicket = async (ticket_id: string) => {
    try {
      await updateTicketStatusById(ticket_id, "live");
      setTicketStatuses((prev) => ({ ...prev, [ticket_id]: "live" }));
    } catch (error) {
      console.error("Error resetting ticket:", error);
    }
  };

  return (
    <div className="mt-5">
      {/* Bulk Validation Button */}
      <Button
        onClick={() => setModalOpen(true)}
        className="mb-5"
        variant="destructive"
      >
        Validate All Tickets
      </Button>

      {/* Ticket Table */}
      <table>
        <thead>
          <tr>
            <th>Ticket Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.ticket_id}>
              <td>{ticket.ticket_type}</td>
              <td>
                <Badge
                  variant={
                    ticketStatuses[ticket.ticket_id] === "live"
                      ? "default"
                      : "destructive"
                  }
                >
                  {ticketStatuses[ticket.ticket_id]}
                </Badge>
              </td>
              <td>
                {ticketStatuses[ticket.ticket_id] === "live" ? (
                  <Button
                    onClick={() => handleValidateTicket(ticket.ticket_id.toString())}
                    size="sm"
                  >
                    Validate
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleResetTicket(ticket.ticket_id.toString())}
                    size="sm"
                    variant="secondary"
                  >
                    Reset
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-white p-5">
          <DialogHeader>
            <h3 className="text-lg font-bold text-center">
              Confirm Bulk Validation
            </h3>
            <p className="text-center">
              You are about to validate all tickets for this order. Are you sure?
            </p>
          </DialogHeader>
          <DialogTitle>
            <h1 className="text-red-500 text-center">Are you sure?</h1>
          </DialogTitle>
          <DialogFooter className="flex-row justify-center items-center space-x-3">
            <Button
              onClick={() => setModalOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleValidateAllTickets(order.order_id)}
              variant="destructive"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketTable;
```

---

## Ticket Services

**File Location:** `services/ticketServices.ts`

### Fetch Tickets by Order

```typescript
export async function fetchTicketsByOrderId(orderId: string): Promise<Ticket[]> {
  const response = await fetch(`/api/qrapp/tickets/${orderId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch tickets");
  }

  const { tickets } = await response.json();
  return tickets;
}
```

### Update Single Ticket Status

```typescript
export async function updateTicketStatusById(
  ticketId: string,
  status: "live" | "validated" | "cancelled"
): Promise<void> {
  const response = await fetch(`/api/qrapp/tickets/status/${ticketId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update ticket status");
  }
}
```

### Update All Tickets for Order

```typescript
export async function updateTicketsStatusByOrderId(
  orderId: string,
  status: "live" | "validated" | "cancelled"
): Promise<void> {
  const response = await fetch("/api/qrapp/tickets/status", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order_id: orderId, status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update tickets status");
  }
}
```

---

## API Endpoints

### 1. Get Tickets by Order

**Endpoint:** `GET /api/qrapp/tickets/[orderId]`

**Response:**
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
      "status": "validated"
    }
  ]
}
```

---

### 2. Update All Tickets for Order

**Endpoint:** `PUT /api/qrapp/tickets/status`

**File Location:** `app/api/qrapp/tickets/status/route.ts:8`

**Request:**
```json
{
  "order_id": "order_abc123",
  "status": "validated"
}
```

**Implementation:**
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(req: Request) {
  const { order_id, status } = await req.json();
  const supabase = createClient();

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

**Response:**
```json
{
  "message": "All tickets updated successfully"
}
```

---

### 3. Update Single Ticket Status

**Endpoint:** `PUT /api/qrapp/tickets/status/[id]`

**Request:**
```json
{
  "status": "validated"
}
```

**Response:**
```json
{
  "message": "Ticket status updated successfully"
}
```

---

## Validation Flow Example

### Scenario: Event Entry Validation

1. **Customer Arrives at Event**
   - Shows QR code (physical or digital)

2. **Admin Scans QR Code**
   - QR code contains: `https://domain.com/orders/order_abc123`
   - Browser navigates to order detail page

3. **Order Details Displayed**
   - Customer name, event, total tickets
   - Table of all tickets with status

4. **Admin Validates Tickets**
   - Option 1: Click "Validate" for each ticket individually
   - Option 2: Click "Validate All Tickets" button

5. **Confirmation** (for bulk validation)
   - Modal appears: "Are you sure?"
   - Admin confirms

6. **Database Update**
   - All tickets updated to "validated" status
   - UI immediately reflects changes

7. **Entry Granted**
   - Customer enters event
   - Tickets can no longer be reused

---

## Ticket Status Queries

### Count Tickets by Status

```sql
SELECT
  status,
  COUNT(*) as count
FROM ghl_qr_tickets
GROUP BY status;
```

**Result:**
```
status     | count
-----------|------
live       | 120
validated  | 30
cancelled  | 5
```

### Find Validated Tickets for Event

```sql
SELECT t.ticket_id, t.order_id, t.ticket_type, t.status, o.event_name
FROM ghl_qr_tickets t
JOIN ghl_qr_orders o ON t.order_id = o.order_id
WHERE t.status = 'validated'
AND o.event_id = 'event_abc123';
```

---

## Reset Tickets

### Reset All Tickets for Testing

```sql
-- Reset all tickets to "live"
UPDATE ghl_qr_tickets
SET status = 'live'
WHERE order_id = 'order_abc123';
```

### API Call

```typescript
const resetAllTickets = async (orderId: string) => {
  const response = await fetch("/api/qrapp/tickets/status", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id: orderId,
      status: "live",
    }),
  });

  if (response.ok) {
    console.log("All tickets reset to live");
  }
};
```

---

## Security Considerations

### Protected Routes

The order validation pages are protected with admin-only access:

```typescript
// middleware.ts or layout HOC
if (!user || user.user_metadata.is_qr_admin !== 1) {
  redirect("/auth");
}
```

### Audit Logging

Consider implementing audit logs for validation actions:

```sql
-- Example audit table
CREATE TABLE ticket_audit_log (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER,
  action TEXT,  -- 'validated', 'reset', 'cancelled'
  performed_by UUID,  -- Admin user ID
  performed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Error Handling

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to fetch tickets` | Invalid order ID | Verify QR code URL |
| `Failed to update ticket status` | Database error | Check Supabase connection |
| `Order not found` | Order doesn't exist | Sync orders from GHL |
| `Tickets already validated` | Duplicate scan | Show warning, don't update |

---

## Related Documentation

- [Event Ticketing](/docs/features/event-ticketing.md) - Ticket generation
- [QR Code Generation](/docs/features/qr-code-generation.md) - QR code creation
- [Data Flow](/docs/architecture/data-flow.md) - Validation architecture
- [QR App Endpoints](/docs/api/qr-app-endpoints.md) - Ticket API endpoints

---

**Last Updated:** December 31, 2025
