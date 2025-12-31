# Admin Portal UI

This document describes the Admin Portal user interface, including pages, components, layouts, and UI patterns specific to Admin and Member roles.

---

## Overview

The Admin Portal provides event management, order tracking, and ticket validation functionality for users with **Admin** or **Member** roles.

### Key Features

- Event list and management
- Order list with search and filtering
- Ticket validation and status management
- User profile management
- Protected routes with RBAC
- Responsive design for mobile and desktop

### Access Control

- **Route Group**: `(admin)`
- **Allowed Roles**: Admin, Member
- **Protection**: HOC at layout level (`withRoleCheck`)
- **Redirect**: Unauthorized users redirected to `/admin-login`

---

## Admin Portal Pages

### 1. Events List Page

**Route**: `/events`
**File**: `app/(admin)/events/page.tsx`

![Admin Events List](../images/admin-events-list-page.png)

#### UI Structure

```typescript
export default async function EventsPage() {
  const events = await fetchEvents();

  return (
    <div className="p-2 sm:p-10">
      {/* Page Header */}
      <div className="border-b-4 border-red-500 mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-center py-4">
          Events List
        </h1>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
```

#### EventCard Component

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface EventCardProps {
  event: {
    event_name: string;
    event_ticket_qty: number;
    total_paid: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.event_name}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {event.event_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-slate-600">
              <span className="font-semibold">Tickets Sold:</span>{" "}
              {event.event_ticket_qty}
            </p>
            <p className="text-slate-600">
              <span className="font-semibold">Revenue:</span> $
              {event.total_paid.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

---

### 2. Orders List Page

**Route**: `/orders`
**File**: `app/(admin)/orders/page.tsx`

![Admin Orders List](../images/admin-order-list-page.png)

#### UI Structure

```typescript
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) =>
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2 sm:p-10">
      {/* Page Header */}
      <div className="border-b-4 border-red-500 mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-center py-4">
          Orders List
        </h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <Input
          type="text"
          placeholder="Search by Order ID or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Orders Table */}
      <Table>
        <TableHeader className="border-b-4 border-red-500">
          <TableRow>
            <TableHead className="font-bold text-sm sm:text-xl">Order ID</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Event</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Email</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Tickets</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Total</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.order_id} className="hover:bg-slate-50">
              <TableCell>
                <Link
                  href={`/orders/${order.order_id}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {order.order_id}
                </Link>
              </TableCell>
              <TableCell>{order.event_name}</TableCell>
              <TableCell>{order.contact_email}</TableCell>
              <TableCell>{order.event_ticket_qty}</TableCell>
              <TableCell>${order.total_paid.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  className={
                    order.payment_status === "paid"
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-white"
                  }
                >
                  {order.payment_status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### 3. Single Order Page

**Route**: `/orders/[orderId]`
**File**: `app/(admin)/orders/[orderId]/page.tsx`

#### UI Structure

```typescript
import OrderDetails from "@/components/admin/single-order-page/OrderDetails";
import TicketTable from "@/components/admin/single-order-page/TicketTable";
import BackButton from "@/components/common/BackButton";

export default async function SingleOrderPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;

  return (
    <div className="p-2 sm:p-10">
      {/* Page Header with Back Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold">Order Details</h1>
        <BackButton text="Back to Orders" />
      </div>

      {/* Order Information */}
      <OrderDetails orderId={orderId} />

      {/* Ticket Validation Table */}
      <div className="mt-8">
        <TicketTable orderId={orderId} />
      </div>
    </div>
  );
}
```

#### OrderDetails Component

**File**: `components/admin/single-order-page/OrderDetails.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/common/Spinner";

export default function OrderDetails({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    const response = await fetch(`/api/qrapp/orders/${orderId}`);
    const { order } = await response.json();
    setOrder(order);
    setLoading(false);
  };

  if (loading) return <Spinner />;
  if (!order) return <p>Order not found</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex justify-between items-center">
          <span>{order.event_name}</span>
          <Badge className={order.payment_status === "paid" ? "bg-green-500" : "bg-yellow-500"}>
            {order.payment_status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Order ID</p>
            <p className="font-semibold">{order.order_id}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Contact Email</p>
            <p className="font-semibold">{order.contact_email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Tickets</p>
            <p className="font-semibold">{order.event_ticket_qty}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Paid</p>
            <p className="font-semibold">${order.total_paid.toFixed(2)}</p>
          </div>
        </div>

        {/* Ticket Quantities Breakdown */}
        <div>
          <p className="text-sm text-slate-500 mb-2">Ticket Breakdown</p>
          <div className="space-y-1">
            {Object.entries(order.ticket_quantities).map(([type, qty]) => (
              <p key={type} className="text-sm">
                <span className="font-medium">{type}:</span> {qty as number}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 4. Tickets List Page

**Route**: `/tickets-list`
**File**: `app/(admin)/tickets-list/page.tsx`

![Admin Tickets List](../images/admin-tickets-list-page.png)

#### UI Structure

```typescript
"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function TicketsListPage() {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const response = await fetch("/api/qrapp/tickets");
    const { tickets } = await response.json();
    setTickets(tickets);
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.order_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2 sm:p-10">
      {/* Page Header */}
      <div className="border-b-4 border-red-500 mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-center py-4">
          All Tickets
        </h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <Input
          type="text"
          placeholder="Search by Ticket ID or Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tickets Table */}
      <Table>
        <TableHeader className="border-b-4 border-red-500">
          <TableRow>
            <TableHead className="font-bold text-sm sm:text-xl">Ticket ID</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Order ID</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Type</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Status</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Validated At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickets.map((ticket) => (
            <TableRow key={ticket.ticket_id} className="hover:bg-slate-50">
              <TableCell className="font-medium">{ticket.ticket_id}</TableCell>
              <TableCell>{ticket.order_id}</TableCell>
              <TableCell>{ticket.ticket_type}</TableCell>
              <TableCell>
                <Badge
                  className={
                    ticket.status === "live"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }
                >
                  {ticket.status}
                </Badge>
              </TableCell>
              <TableCell>
                {ticket.validated_at
                  ? new Date(ticket.validated_at).toLocaleString()
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### 5. User Profile Page

**Route**: `/user-profile`
**File**: `app/(admin)/user-profile/page.tsx`

![Admin User Profile](../images/admin-user-profile.png)

#### UI Structure

```typescript
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
  const { user, roles, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/admin-login");
  };

  return (
    <div className="p-2 sm:p-10">
      {/* Page Header */}
      <div className="border-b-4 border-red-500 mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-center py-4">
          User Profile
        </h1>
      </div>

      {/* Profile Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-semibold text-lg">{user?.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">User ID</p>
              <p className="font-medium">{user?.id}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-2">Roles</p>
              <div className="flex gap-2">
                {roles.is_qr_superadmin === 1 && (
                  <Badge className="bg-purple-500 text-white">SuperAdmin</Badge>
                )}
                {roles.is_qr_admin === 1 && (
                  <Badge className="bg-blue-500 text-white">Admin</Badge>
                )}
                {roles.is_qr_member === 1 && (
                  <Badge className="bg-green-500 text-white">Member</Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Account Created</p>
              <p className="font-medium">
                {user?.created_at && new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Admin Components

### TicketTable Component

**File**: `components/admin/single-order-page/TicketTable.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";

export default function TicketTable({ orderId }: { orderId: string }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [orderId]);

  const fetchTickets = async () => {
    const response = await fetch(`/api/qrapp/tickets?orderId=${orderId}`);
    const { tickets } = await response.json();
    setTickets(tickets);
  };

  const handleValidateSelected = async () => {
    await fetch("/api/qrapp/tickets/validate-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketIds: selectedTickets }),
    });

    setIsDialogOpen(false);
    setSelectedTickets([]);
    fetchTickets();
  };

  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  return (
    <div>
      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <div className="mb-4 flex justify-between items-center bg-slate-100 p-4 rounded">
          <p className="font-semibold">
            {selectedTickets.length} ticket(s) selected
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            Validate Selected
          </Button>
        </div>
      )}

      {/* Tickets Table */}
      <Table className="mb-8">
        <TableHeader className="border-b-4 border-red-500">
          <TableRow>
            <TableHead className="font-bold text-sm sm:text-xl">Select</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Ticket ID</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Type</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Status</TableHead>
            <TableHead className="font-bold text-sm sm:text-xl">Validated At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.ticket_id} className="hover:bg-slate-50">
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedTickets.includes(ticket.ticket_id)}
                  onChange={() => toggleTicketSelection(ticket.ticket_id)}
                  disabled={ticket.status === "validated"}
                />
              </TableCell>
              <TableCell className="font-medium">{ticket.ticket_id}</TableCell>
              <TableCell>{ticket.ticket_type}</TableCell>
              <TableCell>
                <Badge
                  className={
                    ticket.status === "live"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }
                >
                  {ticket.status}
                </Badge>
              </TableCell>
              <TableCell>
                {ticket.validated_at
                  ? new Date(ticket.validated_at).toLocaleString()
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <h3 className="text-lg font-bold">Confirm Validation</h3>
          </DialogHeader>
          <DialogTitle>
            <h1 className="text-red-500">
              Are you sure you want to validate {selectedTickets.length} ticket(s)?
            </h1>
          </DialogTitle>
          <DialogFooter className="space-x-3">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleValidateSelected}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## Layout and Protection

### Admin Layout

**File**: `app/(admin)/layout.tsx`

```typescript
import { withRoleCheck } from "@/hoc/withRoleCheck";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation can be added here */}
      <main>{children}</main>
    </div>
  );
}

export default withRoleCheck(AdminLayout, {
  allowedRoles: ["is_qr_admin", "is_qr_member"],
  redirectTo: "/admin-login",
});
```

---

## UI Patterns

### Page Header Pattern

```typescript
<div className="border-b-4 border-red-500 mb-8">
  <h1 className="text-2xl sm:text-4xl font-extrabold text-center py-4">
    Page Title
  </h1>
</div>
```

### Search Bar Pattern

```typescript
<div className="mb-6 max-w-md">
  <Input
    type="text"
    placeholder="Search..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full"
  />
</div>
```

### Table Header Pattern

```typescript
<TableHeader className="border-b-4 border-red-500">
  <TableRow>
    <TableHead className="font-bold text-sm sm:text-xl">Column Name</TableHead>
  </TableRow>
</TableHeader>
```

### Status Badge Pattern

```typescript
<Badge
  className={
    status === "active"
      ? "bg-green-500 text-white"
      : "bg-red-500 text-white"
  }
>
  {status}
</Badge>
```

---

## Responsive Design

### Mobile-First Approach

```typescript
// Responsive padding
<div className="p-2 sm:p-10">

// Responsive text
<h1 className="text-2xl sm:text-4xl font-extrabold">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive table headers
<TableHead className="font-bold text-sm sm:text-xl">
```

---

## Related Documentation

- [Component Library](/docs/ui-components/component-library.md) - Shadcn components
- [Design System](/docs/ui-components/design-system.md) - Colors, typography, spacing
- [Authentication](/docs/architecture/authentication.md) - RBAC and route protection
- [Admin Workflows](/docs/user-flows/admin-workflows.md) - Admin user flows

---

**Last Updated:** December 31, 2025
