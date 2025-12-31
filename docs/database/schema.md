# Database Schema

This document describes the complete database schema for the QR Project V3, including table structures, data types, constraints, and indexes.

---

## Overview

The QR Project V3 uses **Supabase PostgreSQL** as its database, consisting of 4 main tables:

1. **ghl_qr_orders** - Order data from GoHighLevel
2. **ghl_qr_tickets** - Individual tickets per order
3. **ghl_qr_users** - User management data
4. **ghl_qr_fields** - GHL custom field mappings

---

## Database Technology

- **Database:** PostgreSQL 15+
- **Hosting:** Supabase Cloud
- **Client:** @supabase/supabase-js 2.44.0
- **ORM:** None (Direct SQL + Supabase Client)

---

## Complete Schema

### 1. ghl_qr_orders

Primary table storing order information synchronized from GoHighLevel.

```sql
CREATE TABLE ghl_qr_orders (
  -- Primary Key
  order_id TEXT PRIMARY KEY,

  -- Location Info
  location_id TEXT,

  -- Payment Info
  total_paid NUMERIC,
  payment_status TEXT,
  payment_currency TEXT,
  order_status TEXT,

  -- Contact Info
  contact_id TEXT,
  contact_firstname TEXT,
  contact_lastname TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- Timestamps
  date_added TIMESTAMPTZ,
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Event/Product Info
  event_id TEXT,
  event_name TEXT,
  event_image TEXT,
  event_ticket_price NUMERIC,
  event_ticket_currency TEXT,
  event_available_qty INTEGER,
  event_ticket_qty INTEGER,
  event_ticket_type TEXT,

  -- QR Code
  qr_code_image TEXT,

  -- Dynamic Ticket Quantities (JSONB)
  ticket_quantities JSONB
);
```

**Indexes:**
```sql
CREATE INDEX idx_orders_location_id ON ghl_qr_orders(location_id);
CREATE INDEX idx_orders_contact_id ON ghl_qr_orders(contact_id);
CREATE INDEX idx_orders_event_id ON ghl_qr_orders(event_id);
CREATE INDEX idx_orders_date_added ON ghl_qr_orders(date_added DESC);
```

**Purpose:**
- Stores master order data from GHL
- One record per order
- Contains all order, contact, and event information
- QR code stored as base64 data URL
- Dynamic ticket quantities stored as JSONB for flexibility

---

### 2. ghl_qr_tickets

Individual ticket records associated with orders.

```sql
CREATE TABLE ghl_qr_tickets (
  -- Primary Key
  ticket_id SERIAL PRIMARY KEY,

  -- Foreign Key to Orders
  order_id TEXT NOT NULL,

  -- Ticket Info
  ticket_type TEXT NOT NULL,
  status TEXT DEFAULT 'live',

  -- Foreign Key Constraint
  CONSTRAINT fk_order
    FOREIGN KEY (order_id)
    REFERENCES ghl_qr_orders(order_id)
    ON DELETE CASCADE
);
```

**Indexes:**
```sql
CREATE INDEX idx_tickets_order_id ON ghl_qr_tickets(order_id);
CREATE INDEX idx_tickets_status ON ghl_qr_tickets(status);
```

**Purpose:**
- One record per individual ticket
- Multiple tickets per order (one-to-many relationship)
- Tracks ticket status for access control
- Cascade delete when order is deleted

**Status Values:**
- `'live'` - Ticket is active and unused
- `'used'` - Ticket has been validated/used
- `'cancelled'` - Ticket has been cancelled

---

### 3. ghl_qr_users

Custom user table mirroring Supabase Auth users.

```sql
CREATE TABLE ghl_qr_users (
  -- Primary Key (matches Supabase Auth user ID)
  id UUID PRIMARY KEY,

  -- User Info
  name TEXT,
  email TEXT UNIQUE,
  type TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:**
- Mirrors users from Supabase Auth
- Provides additional user data
- Used for user listing in SuperAdmin portal
- `type` field: 'Admin' or 'Super Admin'

**Note:** Primary user authentication data is in Supabase Auth. This table provides supplemental information.

---

### 4. ghl_qr_fields

Mapping between GHL products and custom fields for QR codes.

```sql
CREATE TABLE ghl_qr_fields (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Product Mapping
  product_id TEXT UNIQUE,

  -- Field Info
  field_id TEXT,
  field_name TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:**
- Maps GHL product/event IDs to custom field IDs
- Determines which GHL custom field receives the QR code
- One mapping per product
- Used during webhook processing to update correct field

---

## Data Types

### PostgreSQL Types Used

| Type | Description | Example Usage |
|------|-------------|---------------|
| **TEXT** | Variable-length string | `order_id`, `contact_email` |
| **NUMERIC** | Precise decimal | `total_paid`, `event_ticket_price` |
| **INTEGER** | Whole number | `event_available_qty`, `event_ticket_qty` |
| **TIMESTAMPTZ** | Timestamp with timezone | `date_added`, `inserted_at` |
| **JSONB** | Binary JSON (indexed) | `ticket_quantities` |
| **UUID** | Universally unique identifier | `id` (in ghl_qr_users) |
| **SERIAL** | Auto-incrementing integer | `ticket_id`, `id` |

### Why JSONB for ticket_quantities?

The `ticket_quantities` field uses JSONB to handle dynamic ticket types:

```json
{
  "VIP": 2,
  "Regular": 5,
  "Early Bird": 1
}
```

**Benefits:**
- Flexible schema (new ticket types don't require schema changes)
- Indexable (can query within JSONB)
- Efficient storage
- Easy to work with in JavaScript/TypeScript

**Example Query:**
```sql
-- Get orders with VIP tickets
SELECT * FROM ghl_qr_orders
WHERE ticket_quantities->>'VIP' IS NOT NULL;

-- Get VIP ticket count
SELECT order_id,
       (ticket_quantities->>'VIP')::int as vip_count
FROM ghl_qr_orders
WHERE ticket_quantities ? 'VIP';
```

---

## Constraints and Rules

### Primary Keys

| Table | Primary Key | Type |
|-------|------------|------|
| ghl_qr_orders | `order_id` | TEXT |
| ghl_qr_tickets | `ticket_id` | SERIAL |
| ghl_qr_users | `id` | UUID |
| ghl_qr_fields | `id` | SERIAL |

### Foreign Keys

```sql
-- ghl_qr_tickets references ghl_qr_orders
FOREIGN KEY (order_id)
  REFERENCES ghl_qr_orders(order_id)
  ON DELETE CASCADE
```

**Cascade Delete Behavior:**
- When an order is deleted, all associated tickets are automatically deleted
- Maintains referential integrity
- Prevents orphaned ticket records

### Unique Constraints

```sql
-- ghl_qr_users
UNIQUE (email)

-- ghl_qr_fields
UNIQUE (product_id)
```

### Default Values

```sql
-- Timestamps default to current time
inserted_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
created_at TIMESTAMPTZ DEFAULT NOW()

-- Ticket status defaults to 'live'
status TEXT DEFAULT 'live'
```

---

## Row Level Security (RLS)

### Enable RLS

```sql
-- Enable RLS on all tables
ALTER TABLE ghl_qr_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_qr_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_qr_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_qr_fields ENABLE ROW LEVEL SECURITY;
```

### Service Role Bypass

The application uses the Supabase service role key for server-side operations, which bypasses RLS policies. This is appropriate because:
- All database operations occur server-side (API routes)
- No direct client access to database
- Service role key is never exposed to browser

### Future RLS Policies

If implementing client-side database access, consider these policies:

```sql
-- Example: Users can only view their own orders
CREATE POLICY "Users view own orders"
ON ghl_qr_orders FOR SELECT
USING (auth.uid() = contact_id::uuid);

-- Example: Only admins can modify tickets
CREATE POLICY "Admins modify tickets"
ON ghl_qr_tickets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND (user_metadata->>'is_qr_admin')::int = 1
  )
);
```

---

## Indexes for Performance

### Current Indexes

```sql
-- ghl_qr_orders
CREATE INDEX idx_orders_location_id ON ghl_qr_orders(location_id);
CREATE INDEX idx_orders_contact_id ON ghl_qr_orders(contact_id);
CREATE INDEX idx_orders_event_id ON ghl_qr_orders(event_id);
CREATE INDEX idx_orders_date_added ON ghl_qr_orders(date_added DESC);

-- ghl_qr_tickets
CREATE INDEX idx_tickets_order_id ON ghl_qr_tickets(order_id);
CREATE INDEX idx_tickets_status ON ghl_qr_tickets(status);

-- ghl_qr_users
CREATE INDEX idx_users_email ON ghl_qr_users(email);
```

### Index Benefits

| Index | Query Type | Performance Gain |
|-------|-----------|------------------|
| `idx_orders_location_id` | `WHERE location_id = ?` | 100x faster for location filtering |
| `idx_orders_event_id` | `WHERE event_id = ?` | 100x faster for event orders |
| `idx_orders_date_added` | `ORDER BY date_added DESC` | 10x faster for recent orders |
| `idx_tickets_order_id` | `WHERE order_id = ?` | 100x faster for ticket lookups |
| `idx_tickets_status` | `WHERE status = ?` | 10x faster for status filtering |

### JSONB Indexing

For better JSONB query performance:

```sql
-- GIN index on ticket_quantities for containment queries
CREATE INDEX idx_orders_ticket_quantities
ON ghl_qr_orders
USING GIN (ticket_quantities);
```

This enables fast queries like:
```sql
-- Find orders with specific ticket types
SELECT * FROM ghl_qr_orders
WHERE ticket_quantities ? 'VIP';
```

---

## Database Migrations

### Initial Setup

Run these SQL statements in Supabase SQL Editor to set up the database:

```sql
-- 1. Create ghl_qr_orders table
CREATE TABLE ghl_qr_orders (
  order_id TEXT PRIMARY KEY,
  location_id TEXT,
  total_paid NUMERIC,
  payment_status TEXT,
  payment_currency TEXT,
  order_status TEXT,
  contact_id TEXT,
  contact_firstname TEXT,
  contact_lastname TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  date_added TIMESTAMPTZ,
  event_id TEXT,
  event_name TEXT,
  event_image TEXT,
  event_ticket_price NUMERIC,
  event_ticket_currency TEXT,
  event_available_qty INTEGER,
  event_ticket_qty INTEGER,
  event_ticket_type TEXT,
  qr_code_image TEXT,
  ticket_quantities JSONB,
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create ghl_qr_tickets table
CREATE TABLE ghl_qr_tickets (
  ticket_id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES ghl_qr_orders(order_id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL,
  status TEXT DEFAULT 'live'
);

-- 3. Create ghl_qr_users table
CREATE TABLE ghl_qr_users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create ghl_qr_fields table
CREATE TABLE ghl_qr_fields (
  id SERIAL PRIMARY KEY,
  product_id TEXT UNIQUE,
  field_id TEXT,
  field_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes
CREATE INDEX idx_orders_location_id ON ghl_qr_orders(location_id);
CREATE INDEX idx_orders_contact_id ON ghl_qr_orders(contact_id);
CREATE INDEX idx_orders_event_id ON ghl_qr_orders(event_id);
CREATE INDEX idx_orders_date_added ON ghl_qr_orders(date_added DESC);
CREATE INDEX idx_tickets_order_id ON ghl_qr_tickets(order_id);
CREATE INDEX idx_tickets_status ON ghl_qr_tickets(status);
CREATE INDEX idx_users_email ON ghl_qr_users(email);

-- 6. Enable RLS
ALTER TABLE ghl_qr_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_qr_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_qr_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_qr_fields ENABLE ROW LEVEL SECURITY;
```

### Future Migrations

When adding new columns:

```sql
-- Example: Add new column
ALTER TABLE ghl_qr_orders
ADD COLUMN discount_code TEXT;

-- Example: Add index on new column
CREATE INDEX idx_orders_discount_code
ON ghl_qr_orders(discount_code);
```

---

## Database Size and Scaling

### Current Estimates

| Table | Avg Row Size | 1000 Orders | 10,000 Orders |
|-------|-------------|-------------|---------------|
| ghl_qr_orders | ~2 KB | 2 MB | 20 MB |
| ghl_qr_tickets | ~100 bytes | 500 KB | 5 MB |
| ghl_qr_users | ~200 bytes | 20 KB | 200 KB |
| ghl_qr_fields | ~150 bytes | 15 KB | 150 KB |
| **Total** | - | **~3 MB** | **~25 MB** |

### Supabase Free Tier

- **Database Size:** 500 MB
- **Can Handle:** ~200,000 orders comfortably

### Scaling Strategies

1. **Archive Old Orders** - Move orders older than 1 year to archive table
2. **Partition Tables** - Partition by date for very large datasets
3. **Upgrade Supabase Plan** - Pro plan offers 8 GB database
4. **Connection Pooling** - Already handled by Supabase

---

## Backup and Recovery

### Automatic Backups (Supabase)

- **Daily Backups:** Enabled by default
- **Retention:** 7 days (free tier), 30 days (pro tier)
- **Point-in-Time Recovery:** Available on pro tier

### Manual Backup

```bash
# Export via Supabase dashboard
# Database → Backups → Download

# Or use pg_dump (requires database credentials)
pg_dump -h db.project-ref.supabase.co \
        -U postgres \
        -d postgres \
        > backup.sql
```

### Restore

```bash
# Via Supabase dashboard
# Database → Backups → Restore

# Or use psql
psql -h db.project-ref.supabase.co \
     -U postgres \
     -d postgres \
     < backup.sql
```

---

## Common Queries

### Get Order with Tickets

```sql
SELECT
  o.*,
  json_agg(t.*) as tickets
FROM ghl_qr_orders o
LEFT JOIN ghl_qr_tickets t ON t.order_id = o.order_id
WHERE o.order_id = 'ORDER_ID'
GROUP BY o.order_id;
```

### Get Orders by Event

```sql
SELECT * FROM ghl_qr_orders
WHERE event_id = 'EVENT_ID'
ORDER BY date_added DESC;
```

### Count Tickets by Status

```sql
SELECT
  status,
  COUNT(*) as count
FROM ghl_qr_tickets
GROUP BY status;
```

### Get Recent Orders

```sql
SELECT * FROM ghl_qr_orders
ORDER BY date_added DESC
LIMIT 10;
```

---

## Quick Reference

### Table Summary

| Table | Primary Key | Foreign Keys | Indexes | Purpose |
|-------|------------|--------------|---------|---------|
| ghl_qr_orders | order_id | None | 4 | Order master data |
| ghl_qr_tickets | ticket_id | order_id → orders | 2 | Individual tickets |
| ghl_qr_users | id (UUID) | None | 1 | User data |
| ghl_qr_fields | id (SERIAL) | None | 0 | Field mappings |

### Column Counts

- **ghl_qr_orders:** 23 columns
- **ghl_qr_tickets:** 4 columns
- **ghl_qr_users:** 5 columns
- **ghl_qr_fields:** 5 columns

---

## Related Documentation

- [Tables Reference](/docs/database/tables-reference.md) - Detailed column documentation
- [Data Relationships](/docs/database/data-relationships.md) - Foreign keys and relationships
- [Data Flow](/docs/architecture/data-flow.md) - How data moves through the system
- [Getting Started](/docs/guides/getting-started.md) - Database setup instructions

---

**Last Updated:** December 31, 2025
