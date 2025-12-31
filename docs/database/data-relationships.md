# Data Relationships

This document describes the relationships between database tables, foreign keys, join patterns, and data integrity rules in the QR Project V3.

---

## Overview

The QR Project V3 database has **1 primary foreign key relationship** and several **logical relationships** without explicit foreign keys.

---

## Entity Relationship Diagram

```
┌──────────────────────────────────────┐
│         ghl_qr_orders                │
│  (Master Order Data)                 │
├──────────────────────────────────────┤
│  PK: order_id (TEXT)                 │
│      location_id                     │
│      contact_id                      │
│      event_id                        │
│      total_paid                      │
│      payment_status                  │
│      contact_firstname               │
│      contact_lastname                │
│      contact_email                   │
│      event_name                      │
│      qr_code_image                   │
│      ticket_quantities (JSONB)       │
│      ...                             │
└────────┬─────────────────────────────┘
         │
         │ 1:N (One-to-Many)
         │ FK: order_id
         │ ON DELETE CASCADE
         ▼
┌──────────────────────────────────────┐
│        ghl_qr_tickets                │
│  (Individual Tickets)                │
├──────────────────────────────────────┤
│  PK: ticket_id (SERIAL)              │
│  FK: order_id → orders.order_id      │
│      ticket_type                     │
│      status ('live', 'used', etc.)   │
└──────────────────────────────────────┘


┌──────────────────────────────────────┐
│        ghl_qr_users                  │
│  (User Management)                   │
├──────────────────────────────────────┤
│  PK: id (UUID)                       │
│      name                            │
│      email (UNIQUE)                  │
│      type                            │
│      created_at                      │
└──────────────────────────────────────┘
         ↑
         │ Logical Relationship
         │ (No FK, mirrored from Supabase Auth)
         │
┌──────────────────────────────────────┐
│      Supabase Auth Users             │
│  (External - Supabase Managed)       │
├──────────────────────────────────────┤
│  id (UUID)                           │
│  email                               │
│  user_metadata:                      │
│    - is_qr_admin                     │
│    - is_qr_superadmin                │
│    - is_qr_member                    │
│    - name                            │
└──────────────────────────────────────┘


┌──────────────────────────────────────┐
│        ghl_qr_fields                 │
│  (Product → Field Mappings)          │
├──────────────────────────────────────┤
│  PK: id (SERIAL)                     │
│      product_id (UNIQUE)             │
│      field_id                        │
│      field_name                      │
│      created_at                      │
└──────────────────────────────────────┘
         ↑
         │ Logical Relationship
         │ (Links to GHL product via product_id)
         │
┌──────────────────────────────────────┐
│      GHL Products/Events             │
│  (External - GHL API)                │
├──────────────────────────────────────┤
│  _id (product_id)                    │
│  name                                │
│  prices[]                            │
│  customFields[]                      │
└──────────────────────────────────────┘
```

---

## Relationships

### 1. Orders → Tickets (One-to-Many)

**Type:** One-to-Many with Foreign Key Constraint

**Relationship:**
- One `ghl_qr_orders` record can have multiple `ghl_qr_tickets` records
- Each `ghl_qr_tickets` record belongs to exactly one `ghl_qr_orders` record

**Foreign Key:**
```sql
FOREIGN KEY (order_id)
  REFERENCES ghl_qr_orders(order_id)
  ON DELETE CASCADE
```

**Cascade Behavior:**
- When an order is deleted, all associated tickets are automatically deleted
- Maintains referential integrity
- Prevents orphaned ticket records

**Example:**
```sql
-- Order with ID "ORDER_123" has 3 tickets:

ghl_qr_orders:
  order_id: "ORDER_123"
  event_ticket_qty: 3

ghl_qr_tickets:
  ticket_id: 1, order_id: "ORDER_123", ticket_type: "VIP", status: "live"
  ticket_id: 2, order_id: "ORDER_123", ticket_type: "VIP", status: "live"
  ticket_id: 3, order_id: "ORDER_123", ticket_type: "Regular", status: "live"

-- Delete order → all 3 tickets automatically deleted
DELETE FROM ghl_qr_orders WHERE order_id = 'ORDER_123';
-- Cascades to delete tickets 1, 2, 3
```

**TypeScript Usage:**
```typescript
// Fetch order with tickets
interface OrderWithTickets extends Order {
  tickets: Ticket[];
}

const fetchOrderWithTickets = async (orderId: string): Promise<OrderWithTickets> => {
  // Fetch order
  const { data: order } = await supabase
    .from('ghl_qr_orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  // Fetch tickets
  const { data: tickets } = await supabase
    .from('ghl_qr_tickets')
    .select('*')
    .eq('order_id', orderId);

  return { ...order, tickets };
};
```

**Join Query:**
```sql
-- Get order with all tickets (PostgreSQL)
SELECT
  o.*,
  json_agg(
    json_build_object(
      'ticket_id', t.ticket_id,
      'ticket_type', t.ticket_type,
      'status', t.status
    )
  ) as tickets
FROM ghl_qr_orders o
LEFT JOIN ghl_qr_tickets t ON t.order_id = o.order_id
WHERE o.order_id = 'ORDER_123'
GROUP BY o.order_id;
```

---

### 2. Supabase Auth Users → ghl_qr_users (One-to-One Logical)

**Type:** One-to-One Logical Relationship (No Foreign Key)

**Relationship:**
- Each user in Supabase Auth should have a corresponding record in `ghl_qr_users`
- Same UUID used as primary key in both
- No explicit foreign key constraint

**Why No Foreign Key:**
- Supabase Auth users table is managed by Supabase (not directly accessible)
- Cannot create foreign key to external managed table
- Enforced at application level

**Synchronization:**
```typescript
// When creating a user
const createUser = async (email: string, password: string, name: string) => {
  // 1. Create in Supabase Auth
  const { data: authData } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      name,
      is_qr_admin: 1,
      is_qr_superadmin: 0,
      is_qr_member: 0,
    },
  });

  const userId = authData.user.id; // UUID

  // 2. Create in ghl_qr_users with SAME ID
  await supabase.from('ghl_qr_users').insert({
    id: userId, // Same UUID
    name,
    email,
    type: 'Admin',
  });
};

// When deleting a user
const deleteUser = async (userId: string) => {
  // 1. Delete from ghl_qr_users
  await supabase.from('ghl_qr_users').delete().eq('id', userId);

  // 2. Delete from Supabase Auth
  await supabase.auth.admin.deleteUser(userId);
};
```

**Data Integrity:**
```typescript
// Verify sync between Auth and ghl_qr_users
const verifySyncedUsers = async () => {
  // Get all Supabase Auth users
  const { data: authUsers } = await supabase.auth.admin.listUsers();

  // Get all ghl_qr_users
  const { data: dbUsers } = await supabase.from('ghl_qr_users').select('id');

  const authIds = new Set(authUsers.users.map((u) => u.id));
  const dbIds = new Set(dbUsers.map((u) => u.id));

  // Find mismatches
  const missingInDb = authUsers.users.filter((u) => !dbIds.has(u.id));
  const orphanedInDb = dbUsers.filter((u) => !authIds.has(u.id));

  return { missingInDb, orphanedInDb };
};
```

---

### 3. GHL Products → ghl_qr_fields (One-to-One Logical)

**Type:** One-to-One Logical Relationship (No Foreign Key)

**Relationship:**
- Each GHL product/event can have one field mapping in `ghl_qr_fields`
- Links GHL product ID to GHL custom field ID
- No foreign key (GHL is external API)

**Purpose:**
- Determines which GHL custom field receives the QR code for each product
- Used during webhook processing

**Example:**
```sql
-- Product "prod_123" is mapped to field "field_abc"
INSERT INTO ghl_qr_fields (product_id, field_id, field_name)
VALUES ('prod_123', 'field_abc', 'QR Code');

-- When webhook receives order for product "prod_123":
-- 1. Lookup field mapping
SELECT field_id FROM ghl_qr_fields WHERE product_id = 'prod_123';
-- Returns: "field_abc"

-- 2. Update GHL contact's custom field "field_abc" with QR code
```

**TypeScript Usage:**
```typescript
// Get field mapping for product
const getFieldMappingForProduct = async (productId: string) => {
  const { data } = await supabase
    .from('ghl_qr_fields')
    .select('field_id, field_name')
    .eq('product_id', productId)
    .single();

  return data;
};

// Used in webhook processing
const processWebhook = async (webhookData: any) => {
  const { product_id, contact_id, order_id } = extractWebhookData(webhookData);

  // Get field mapping
  const fieldMapping = await getFieldMappingForProduct(product_id);

  if (!fieldMapping) {
    throw new Error(`No field mapping found for product ${product_id}`);
  }

  // Generate QR code
  const qrCodeImage = await generateQRCode(order_id);

  // Update GHL contact
  await updateGHLContact(contact_id, {
    customFields: [
      {
        id: fieldMapping.field_id,
        value: qrCodeImage,
      },
    ],
  });
};
```

---

## Common Join Patterns

### Order with Tickets

```sql
-- Left join (includes orders without tickets)
SELECT
  o.order_id,
  o.event_name,
  o.contact_email,
  t.ticket_id,
  t.ticket_type,
  t.status
FROM ghl_qr_orders o
LEFT JOIN ghl_qr_tickets t ON t.order_id = o.order_id
WHERE o.event_id = 'EVENT_123'
ORDER BY o.date_added DESC;
```

**Supabase Client:**
```typescript
// Note: Supabase doesn't support true joins, so we fetch separately
const { data: order } = await supabase
  .from('ghl_qr_orders')
  .select('*')
  .eq('order_id', orderId)
  .single();

const { data: tickets } = await supabase
  .from('ghl_qr_tickets')
  .select('*')
  .eq('order_id', orderId);

const orderWithTickets = { ...order, tickets };
```

### Ticket Aggregation by Order

```sql
-- Count tickets by status for each order
SELECT
  o.order_id,
  o.event_name,
  COUNT(t.ticket_id) as total_tickets,
  SUM(CASE WHEN t.status = 'live' THEN 1 ELSE 0 END) as live_tickets,
  SUM(CASE WHEN t.status = 'used' THEN 1 ELSE 0 END) as used_tickets,
  SUM(CASE WHEN t.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_tickets
FROM ghl_qr_orders o
LEFT JOIN ghl_qr_tickets t ON t.order_id = o.order_id
WHERE o.event_id = 'EVENT_123'
GROUP BY o.order_id, o.event_name;
```

### Event Summary

```sql
-- Get event summary with order and ticket counts
SELECT
  o.event_id,
  o.event_name,
  COUNT(DISTINCT o.order_id) as order_count,
  SUM(o.event_ticket_qty) as total_tickets_sold,
  SUM(o.total_paid) as total_revenue,
  COUNT(t.ticket_id) FILTER (WHERE t.status = 'live') as available_tickets,
  COUNT(t.ticket_id) FILTER (WHERE t.status = 'used') as used_tickets
FROM ghl_qr_orders o
LEFT JOIN ghl_qr_tickets t ON t.order_id = o.order_id
WHERE o.event_id = 'EVENT_123'
GROUP BY o.event_id, o.event_name;
```

---

## Data Integrity Rules

### 1. Orphan Prevention

**Rule:** No tickets without parent order

**Enforcement:** Foreign key with ON DELETE CASCADE

**Verification:**
```sql
-- Find orphaned tickets (should return 0 rows)
SELECT t.*
FROM ghl_qr_tickets t
LEFT JOIN ghl_qr_orders o ON t.order_id = o.order_id
WHERE o.order_id IS NULL;
```

### 2. User Synchronization

**Rule:** Every ghl_qr_users record should have corresponding Supabase Auth user

**Enforcement:** Application-level (no database constraint)

**Verification:**
```typescript
// Check for orphaned users in ghl_qr_users
const checkOrphanedUsers = async () => {
  const { data: dbUsers } = await supabase.from('ghl_qr_users').select('id, email');

  const orphaned = [];

  for (const dbUser of dbUsers) {
    const { data: authUser } = await supabase.auth.admin.getUserById(dbUser.id);
    if (!authUser) {
      orphaned.push(dbUser);
    }
  }

  return orphaned;
};
```

### 3. Ticket Quantity Consistency

**Rule:** Number of tickets in ghl_qr_tickets should match order's event_ticket_qty

**Enforcement:** Application-level during sync

**Verification:**
```sql
-- Find orders with mismatched ticket counts
SELECT
  o.order_id,
  o.event_ticket_qty as expected_tickets,
  COUNT(t.ticket_id) as actual_tickets
FROM ghl_qr_orders o
LEFT JOIN ghl_qr_tickets t ON t.order_id = o.order_id
GROUP BY o.order_id, o.event_ticket_qty
HAVING COUNT(t.ticket_id) != o.event_ticket_qty;
```

**Fix Mismatches:**
```typescript
// Reconcile ticket count for an order
const reconcileTickets = async (orderId: string) => {
  // Get order
  const { data: order } = await supabase
    .from('ghl_qr_orders')
    .select('event_ticket_qty, ticket_quantities')
    .eq('order_id', orderId)
    .single();

  // Get existing tickets
  const { data: existingTickets } = await supabase
    .from('ghl_qr_tickets')
    .select('*')
    .eq('order_id', orderId);

  // Calculate needed tickets by type
  const ticketQuantities = order.ticket_quantities;
  const existingByType: Record<string, number> = {};

  for (const ticket of existingTickets) {
    existingByType[ticket.ticket_type] = (existingByType[ticket.ticket_type] || 0) + 1;
  }

  // Insert missing tickets
  for (const [ticketType, neededQty] of Object.entries(ticketQuantities)) {
    const existingQty = existingByType[ticketType] || 0;
    const missingQty = neededQty - existingQty;

    if (missingQty > 0) {
      const ticketsToInsert = Array.from({ length: missingQty }, () => ({
        order_id: orderId,
        ticket_type: ticketType,
        status: 'live',
      }));

      await supabase.from('ghl_qr_tickets').insert(ticketsToInsert);
    }
  }
};
```

---

## Transaction Patterns

### Atomic Order Creation

```typescript
// Create order and tickets atomically
const createOrderWithTickets = async (orderData: Order, ticketTypes: Record<string, number>) => {
  // Supabase doesn't support multi-table transactions via client
  // Use separate operations with error handling

  try {
    // 1. Insert order
    const { data: order, error: orderError } = await supabase
      .from('ghl_qr_orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert tickets
    const tickets = [];
    for (const [ticketType, qty] of Object.entries(ticketTypes)) {
      for (let i = 0; i < qty; i++) {
        tickets.push({
          order_id: order.order_id,
          ticket_type: ticketType,
          status: 'live',
        });
      }
    }

    const { error: ticketsError } = await supabase
      .from('ghl_qr_tickets')
      .insert(tickets);

    if (ticketsError) {
      // Rollback: delete order
      await supabase.from('ghl_qr_orders').delete().eq('order_id', order.order_id);
      throw ticketsError;
    }

    return order;
  } catch (error) {
    console.error('Failed to create order with tickets:', error);
    throw error;
  }
};
```

### Bulk Ticket Status Update

```typescript
// Update all tickets for an order
const updateAllTicketsForOrder = async (orderId: string, status: 'live' | 'used' | 'cancelled') => {
  const { error } = await supabase
    .from('ghl_qr_tickets')
    .update({ status })
    .eq('order_id', orderId);

  if (error) throw error;
};
```

---

## Query Optimization

### Use Indexes

```sql
-- Indexed queries (fast)
SELECT * FROM ghl_qr_orders WHERE order_id = 'ORDER_123';  -- Primary key
SELECT * FROM ghl_qr_orders WHERE event_id = 'EVENT_123';  -- Indexed
SELECT * FROM ghl_qr_tickets WHERE order_id = 'ORDER_123'; -- Indexed
SELECT * FROM ghl_qr_tickets WHERE status = 'live';        -- Indexed

-- Non-indexed queries (slower on large datasets)
SELECT * FROM ghl_qr_orders WHERE contact_firstname = 'John'; -- Not indexed
SELECT * FROM ghl_qr_orders WHERE qr_code_image LIKE '%abc%'; -- Not indexed
```

### Avoid N+1 Queries

```typescript
// ❌ Bad: N+1 query problem
const orders = await fetchOrders();
for (const order of orders) {
  const tickets = await fetchTickets(order.order_id); // N queries!
  order.tickets = tickets;
}

// ✅ Good: Batch fetch
const orders = await fetchOrders();
const orderIds = orders.map((o) => o.order_id);

const { data: allTickets } = await supabase
  .from('ghl_qr_tickets')
  .select('*')
  .in('order_id', orderIds); // 1 query!

// Group tickets by order_id
const ticketsByOrder = allTickets.reduce((acc, ticket) => {
  if (!acc[ticket.order_id]) acc[ticket.order_id] = [];
  acc[ticket.order_id].push(ticket);
  return acc;
}, {});

// Attach tickets to orders
orders.forEach((order) => {
  order.tickets = ticketsByOrder[order.order_id] || [];
});
```

---

## Quick Reference

### Relationships Summary

| From Table | To Table | Type | Constraint | Cascade |
|-----------|----------|------|------------|---------|
| ghl_qr_tickets | ghl_qr_orders | Many-to-One | FK: order_id | DELETE CASCADE |
| ghl_qr_users | Supabase Auth | One-to-One | None (logical) | Manual sync |
| ghl_qr_fields | GHL Products | One-to-One | None (logical) | N/A |

### Common Queries

```sql
-- Order with tickets
SELECT o.*, t.* FROM ghl_qr_orders o
LEFT JOIN ghl_qr_tickets t ON t.order_id = o.order_id
WHERE o.order_id = ?;

-- Event summary
SELECT event_id, COUNT(*) as orders, SUM(total_paid) as revenue
FROM ghl_qr_orders
GROUP BY event_id;

-- Ticket status counts
SELECT status, COUNT(*) FROM ghl_qr_tickets
WHERE order_id = ?
GROUP BY status;
```

---

## Related Documentation

- [Database Schema](/docs/database/schema.md) - Complete schema definition
- [Tables Reference](/docs/database/tables-reference.md) - Column-by-column reference
- [Data Flow](/docs/architecture/data-flow.md) - How data moves through the system
- [API Endpoints](/docs/api/qr-app-endpoints.md) - API access to database

---

**Last Updated:** December 31, 2025
