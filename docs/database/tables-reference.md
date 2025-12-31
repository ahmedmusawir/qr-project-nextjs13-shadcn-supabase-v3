# Database Tables Reference

This document provides detailed column-by-column reference for all database tables in the QR Project V3.

---

## Overview

Complete reference for all 4 database tables with column descriptions, data types, constraints, and example values.

---

## Table: ghl_qr_orders

Master table for order information synchronized from GoHighLevel.

### Table Information

- **Primary Key:** `order_id`
- **Foreign Keys:** None
- **Indexes:** 4 (location_id, contact_id, event_id, date_added)
- **Estimated Row Count:** Varies (production: 100-1000+)

### Column Reference

| Column | Type | Nullable | Default | Description | Example Value |
|--------|------|----------|---------|-------------|---------------|
| `order_id` | TEXT | NO | - | **Primary Key.** Unique order ID from GHL | `"667da9c4a71ce7eb850a2e2c"` |
| `location_id` | TEXT | YES | NULL | GHL location ID where order was placed | `"4rKuULHASyQ99nwdL1XH"` |
| `total_paid` | NUMERIC | YES | NULL | Total amount paid for order | `250.00` |
| `payment_status` | TEXT | YES | NULL | Payment status from GHL | `"paid"`, `"pending"`, `"failed"` |
| `payment_currency` | TEXT | YES | NULL | Currency code for payment | `"USD"`, `"CAD"`, `"EUR"` |
| `order_status` | TEXT | YES | NULL | Overall order status | `"confirmed"`, `"processing"`, `"completed"` |
| `contact_id` | TEXT | YES | NULL | GHL contact ID who placed order | `"abc123contact"` |
| `contact_firstname` | TEXT | YES | NULL | Contact's first name | `"John"` |
| `contact_lastname` | TEXT | YES | NULL | Contact's last name | `"Doe"` |
| `contact_email` | TEXT | YES | NULL | Contact's email address | `"john.doe@example.com"` |
| `contact_phone` | TEXT | YES | NULL | Contact's phone number | `"+1234567890"` |
| `date_added` | TIMESTAMPTZ | YES | NULL | When order was created in GHL | `"2024-06-28T10:30:00Z"` |
| `event_id` | TEXT | YES | NULL | Product/Event ID from GHL | `"prod_abc123"` |
| `event_name` | TEXT | YES | NULL | Name of the event/product | `"Summer Music Festival 2024"` |
| `event_image` | TEXT | YES | NULL | URL to event image | `"https://res.cloudinary.com/..."` |
| `event_ticket_price` | NUMERIC | YES | NULL | Base ticket price | `50.00` |
| `event_ticket_currency` | TEXT | YES | NULL | Currency for ticket price | `"USD"` |
| `event_available_qty` | INTEGER | YES | NULL | Available tickets for event | `500` |
| `event_ticket_qty` | INTEGER | YES | NULL | Total quantity of tickets in this order | `3` |
| `event_ticket_type` | TEXT | YES | NULL | Legacy single ticket type field | `"VIP"` (deprecated, use ticket_quantities) |
| `qr_code_image` | TEXT | YES | NULL | Base64-encoded QR code data URL | `"data:image/png;base64,iVBORw0KGgo..."` |
| `ticket_quantities` | JSONB | YES | NULL | Dynamic ticket quantities by type | `{"VIP": 2, "Regular": 1}` |
| `inserted_at` | TIMESTAMPTZ | NO | NOW() | When record was inserted into our DB | `"2024-06-28T10:35:00Z"` |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | When record was last updated | `"2024-06-28T11:00:00Z"` |

### Column Details

#### order_id (Primary Key)

**Purpose:** Unique identifier for the order from GHL

**Format:** 24-character hexadecimal string

**Example:**
```sql
order_id = '667da9c4a71ce7eb850a2e2c'
```

**Usage:**
```typescript
// Fetch order by ID
const { data } = await supabase
  .from('ghl_qr_orders')
  .select('*')
  .eq('order_id', orderId)
  .single();
```

#### ticket_quantities (JSONB)

**Purpose:** Stores dynamic ticket type quantities

**Format:** JSON object with ticket type as key, quantity as value

**Example Values:**
```json
{
  "VIP": 2,
  "Regular": 5,
  "Early Bird": 1
}
```

**Querying:**
```sql
-- Check if order has VIP tickets
SELECT * FROM ghl_qr_orders
WHERE ticket_quantities ? 'VIP';

-- Get VIP ticket count
SELECT
  order_id,
  (ticket_quantities->>'VIP')::int as vip_count
FROM ghl_qr_orders
WHERE ticket_quantities ? 'VIP';

-- Get all ticket types for an order
SELECT
  order_id,
  jsonb_object_keys(ticket_quantities) as ticket_type
FROM ghl_qr_orders
WHERE order_id = 'ORDER_ID';
```

**TypeScript Interface:**
```typescript
interface Order {
  order_id: string;
  ticket_quantities: {
    [ticketType: string]: number;
  };
}
```

#### qr_code_image

**Purpose:** Stores QR code as base64 data URL

**Format:** `data:image/png;base64,{base64_string}`

**Size:** ~5-10 KB per QR code

**Example:**
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

**Generation:** See `utils/qrapp/helpers.ts:1`

**Usage:**
```typescript
// Display QR code
<img src={order.qr_code_image} alt="Order QR Code" />
```

---

## Table: ghl_qr_tickets

Individual ticket records for each order.

### Table Information

- **Primary Key:** `ticket_id`
- **Foreign Keys:** `order_id` → `ghl_qr_orders(order_id)`
- **Indexes:** 2 (order_id, status)
- **Estimated Row Count:** 5-10x orders (varies by ticket quantity)

### Column Reference

| Column | Type | Nullable | Default | Description | Example Value |
|--------|------|----------|---------|-------------|---------------|
| `ticket_id` | SERIAL | NO | AUTO | **Primary Key.** Auto-incrementing ticket ID | `1`, `2`, `3`, etc. |
| `order_id` | TEXT | NO | - | **Foreign Key.** Links to ghl_qr_orders | `"667da9c4a71ce7eb850a2e2c"` |
| `ticket_type` | TEXT | NO | - | Type of ticket (VIP, Regular, etc.) | `"VIP"`, `"Regular"`, `"Early Bird"` |
| `status` | TEXT | NO | `'live'` | Current ticket status | `"live"`, `"used"`, `"cancelled"` |

### Column Details

#### ticket_id (Primary Key)

**Purpose:** Unique auto-incrementing identifier

**Type:** SERIAL (auto-increment)

**Usage:**
```typescript
// Update single ticket status
await supabase
  .from('ghl_qr_tickets')
  .update({ status: 'used' })
  .eq('ticket_id', ticketId);
```

#### order_id (Foreign Key)

**Purpose:** Links ticket to parent order

**Constraint:** ON DELETE CASCADE (ticket deleted when order deleted)

**Usage:**
```typescript
// Get all tickets for an order
const { data: tickets } = await supabase
  .from('ghl_qr_tickets')
  .select('*')
  .eq('order_id', orderId);
```

#### status

**Purpose:** Tracks ticket validation status for access control

**Allowed Values:**
- `"live"` - Active ticket, not yet used
- `"used"` - Ticket has been validated/scanned
- `"cancelled"` - Ticket has been cancelled

**State Transitions:**
```
live → used       (normal flow: ticket scanned at event)
live → cancelled  (ticket invalidated)
used → live       (admin reverses validation)
cancelled → live  (admin reinstates ticket)
```

**Usage:**
```typescript
// Update all tickets for an order
await supabase
  .from('ghl_qr_tickets')
  .update({ status: 'used' })
  .eq('order_id', orderId);

// Count tickets by status
const { count } = await supabase
  .from('ghl_qr_tickets')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'live');
```

---

## Table: ghl_qr_users

User management table mirroring Supabase Auth.

### Table Information

- **Primary Key:** `id` (UUID)
- **Foreign Keys:** None (mirrors Supabase Auth users)
- **Indexes:** 1 (email)
- **Estimated Row Count:** Small (10-100 users)

### Column Reference

| Column | Type | Nullable | Default | Description | Example Value |
|--------|------|----------|---------|-------------|---------------|
| `id` | UUID | NO | - | **Primary Key.** Matches Supabase Auth user ID | `"550e8400-e29b-41d4-a716-446655440000"` |
| `name` | TEXT | YES | NULL | Full name of user | `"John Doe"` |
| `email` | TEXT | YES | NULL | Email address (unique) | `"john.doe@example.com"` |
| `type` | TEXT | YES | NULL | User type/role | `"Admin"`, `"Super Admin"` |
| `created_at` | TIMESTAMPTZ | NO | NOW() | When user was created | `"2024-06-28T10:00:00Z"` |

### Column Details

#### id (Primary Key, UUID)

**Purpose:** Matches Supabase Auth user ID

**Why UUID:** Supabase Auth uses UUIDs for user IDs

**Sync:** This ID must match the user ID in Supabase Auth

**Usage:**
```typescript
// Create user (must use same ID as Supabase Auth)
const { data: authUser } = await supabase.auth.admin.createUser({
  email,
  password,
  user_metadata: { name, is_qr_admin: 1 },
});

// Insert into ghl_qr_users with same ID
await supabase.from('ghl_qr_users').insert({
  id: authUser.user.id, // Same UUID
  name,
  email,
  type: 'Admin',
});
```

#### email (Unique)

**Purpose:** User's email address

**Constraint:** UNIQUE - no duplicate emails

**Index:** Used for fast lookups

**Usage:**
```typescript
// Find user by email
const { data } = await supabase
  .from('ghl_qr_users')
  .select('*')
  .eq('email', 'user@example.com')
  .single();
```

#### type

**Purpose:** Display-friendly user role

**Values:**
- `"Admin"` - Regular admin user
- `"Super Admin"` - SuperAdmin user

**Note:** Actual role permissions stored in Supabase Auth user_metadata

**Usage:**
```typescript
// List users by type
const { data: admins } = await supabase
  .from('ghl_qr_users')
  .select('*')
  .eq('type', 'Admin');
```

---

## Table: ghl_qr_fields

Mapping between GHL products and custom fields for QR code injection.

### Table Information

- **Primary Key:** `id`
- **Foreign Keys:** None
- **Indexes:** None (small table)
- **Estimated Row Count:** Small (5-50 products)

### Column Reference

| Column | Type | Nullable | Default | Description | Example Value |
|--------|------|----------|---------|-------------|---------------|
| `id` | SERIAL | NO | AUTO | **Primary Key.** Auto-incrementing ID | `1`, `2`, `3`, etc. |
| `product_id` | TEXT | YES | NULL | GHL product/event ID (unique) | `"prod_abc123"` |
| `field_id` | TEXT | YES | NULL | GHL custom field ID for this product | `"field_xyz789"` |
| `field_name` | TEXT | YES | NULL | Human-readable field name | `"QR Code"`, `"Ticket QR"` |
| `created_at` | TIMESTAMPTZ | NO | NOW() | When mapping was created | `"2024-06-28T09:00:00Z"` |

### Column Details

#### product_id (Unique)

**Purpose:** Links to GHL product/event

**Constraint:** UNIQUE - one mapping per product

**Usage in Webhook:**
```typescript
// Get field mapping for product
const { data: fieldData } = await supabase
  .from('ghl_qr_fields')
  .select('field_id')
  .eq('product_id', productId)
  .single();

// Update GHL contact with QR code in correct field
await updateGHLContact(contactId, {
  customFields: [
    {
      id: fieldData.field_id,
      value: qrCodeImage,
    },
  ],
});
```

#### field_id

**Purpose:** GHL custom field ID to receive QR code

**Format:** GHL-generated field ID string

**How to Get:** Retrieved from GHL custom fields API

**Usage:** See `api/ghl/webhook-qr/updateGHLField.ts:1`

---

## TypeScript Interfaces

### Complete Type Definitions

```typescript
// types/index.ts

export interface Order {
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
  ticket_quantities: {
    [ticketType: string]: number;
  } | null;
  inserted_at: string;
  updated_at: string;
}

export interface Ticket {
  ticket_id: number;
  order_id: string;
  ticket_type: string;
  status: 'live' | 'used' | 'cancelled';
}

export interface User {
  id: string; // UUID
  name: string | null;
  email: string | null;
  type: string | null;
  created_at: string;
}

export interface CustomField {
  id: number;
  product_id: string | null;
  field_id: string | null;
  field_name: string | null;
  created_at: string;
}
```

---

## Query Examples

### Orders Queries

```sql
-- Get all orders for an event
SELECT * FROM ghl_qr_orders
WHERE event_id = 'EVENT_ID'
ORDER BY date_added DESC;

-- Get orders with pagination
SELECT * FROM ghl_qr_orders
ORDER BY date_added DESC
LIMIT 20 OFFSET 0;

-- Get total revenue by event
SELECT
  event_id,
  event_name,
  SUM(total_paid) as total_revenue,
  COUNT(*) as order_count
FROM ghl_qr_orders
WHERE payment_status = 'paid'
GROUP BY event_id, event_name;

-- Search orders by contact
SELECT * FROM ghl_qr_orders
WHERE contact_email ILIKE '%john%'
   OR contact_firstname ILIKE '%john%';
```

### Tickets Queries

```sql
-- Get all tickets for an order
SELECT * FROM ghl_qr_tickets
WHERE order_id = 'ORDER_ID';

-- Count tickets by type for an event
SELECT
  t.ticket_type,
  COUNT(*) as count,
  SUM(CASE WHEN t.status = 'live' THEN 1 ELSE 0 END) as live_count,
  SUM(CASE WHEN t.status = 'used' THEN 1 ELSE 0 END) as used_count
FROM ghl_qr_tickets t
JOIN ghl_qr_orders o ON t.order_id = o.order_id
WHERE o.event_id = 'EVENT_ID'
GROUP BY t.ticket_type;

-- Find unused tickets for an order
SELECT * FROM ghl_qr_tickets
WHERE order_id = 'ORDER_ID'
  AND status = 'live';
```

### Users Queries

```sql
-- Get all admins
SELECT * FROM ghl_qr_users
WHERE type = 'Admin';

-- Find user by email
SELECT * FROM ghl_qr_users
WHERE email = 'user@example.com';

-- Count users by type
SELECT type, COUNT(*) as count
FROM ghl_qr_users
GROUP BY type;
```

### Field Mappings Queries

```sql
-- Get field mapping for product
SELECT * FROM ghl_qr_fields
WHERE product_id = 'PRODUCT_ID';

-- List all field mappings
SELECT * FROM ghl_qr_fields
ORDER BY created_at DESC;
```

---

## Data Validation

### Required Fields

**ghl_qr_orders:**
- `order_id` (PRIMARY KEY)
- `inserted_at`, `updated_at` (auto-generated)

**ghl_qr_tickets:**
- `ticket_id` (AUTO-INCREMENT)
- `order_id` (FOREIGN KEY)
- `ticket_type`
- `status` (has default 'live')

**ghl_qr_users:**
- `id` (PRIMARY KEY)
- `created_at` (auto-generated)

**ghl_qr_fields:**
- `id` (AUTO-INCREMENT)
- `created_at` (auto-generated)

### Common Validation Rules

```typescript
// Order validation
const isValidOrder = (order: Order) => {
  return (
    order.order_id &&
    order.order_id.length === 24 && // GHL order ID format
    order.contact_email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.contact_email)
  );
};

// Ticket status validation
const validStatuses = ['live', 'used', 'cancelled'];
const isValidStatus = (status: string) => {
  return validStatuses.includes(status);
};

// User email validation
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

---

## Quick Reference

### Table Row Counts (Estimated)

| Table | Typical Count | Max Expected |
|-------|--------------|--------------|
| ghl_qr_orders | 100-1000 | 100,000+ |
| ghl_qr_tickets | 500-5000 | 500,000+ |
| ghl_qr_users | 5-50 | 1000 |
| ghl_qr_fields | 5-20 | 100 |

### Storage Estimates

| Table | Per Row | 1000 Rows | 10,000 Rows |
|-------|---------|-----------|-------------|
| ghl_qr_orders | ~2 KB | 2 MB | 20 MB |
| ghl_qr_tickets | ~100 bytes | 100 KB | 1 MB |
| ghl_qr_users | ~200 bytes | 200 KB | 2 MB |
| ghl_qr_fields | ~150 bytes | 150 KB | 1.5 MB |

---

## Related Documentation

- [Database Schema](/docs/database/schema.md) - Complete schema with SQL
- [Data Relationships](/docs/database/data-relationships.md) - Foreign keys and joins
- [Data Flow](/docs/architecture/data-flow.md) - How data enters the database
- [API Endpoints](/docs/api/qr-app-endpoints.md) - How to query the database via API

---

**Last Updated:** December 31, 2025
